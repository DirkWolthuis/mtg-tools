import { extractTargets } from './targets.js';
import {
  ALLOWED_TARGETS,
  CONDITIONAL_PATTERNS,
  HAND_HATE_EXCLUSIONS,
  HAND_HATE_RESTRICTION,
  SOFT_PATTERNS,
  TYPE_PATTERNS,
  type DisruptionType,
  type ScopeMode,
  type TypePattern,
} from './patterns.js';

/**
 * Damage/edict removal effects often say "any target"/"any other target"
 * rather than naming a noun (Lightning Bolt, Fire // Ice, Traumatic
 * Critique, ...). By convention in this cube such effects are treated as
 * creature removal even though they can also hit players/planeswalkers.
 */
const GENERIC_ANY_TARGET =
  /\bany (?:other )?targets?\b|\b(?:among|each of) (?:one|two|three|1|2|3)[\w,\s]*targets\b/i;

/**
 * A "target/a/an/all X you control" object is a friendly permanent (blink
 * effects like Cloudshift/Restoration Angel, or "return a permanent you
 * control" self-bounce like Kor Skyfisher) — not disruption, even though the
 * verb (exile/return) and noun (creature) otherwise look like removal.
 * Requires a determiner directly introducing the noun so it doesn't also
 * match an unrelated "of creatures you control" counting sub-clause
 * (Thraben Charm's "damage equal to twice the number of creatures you
 * control to target creature").
 */
const FRIENDLY_TARGET =
  /\b(?:target|a|an|all)\s+(?:[\w-]+\s+){0,2}(?:creature|permanent|artifact|enchantment|planeswalker|battle)s? you control\b/i;

/** Strips self-referential mentions ("this creature", "this enchantment", ...) that name the source permanent, not an actual target. Stops at ':'/';' so it doesn't bleed across an activated-ability cost into the effect (e.g. "Sacrifice this creature: Target creature ..."). */
const SELF_REFERENCE = /\bthis (?:creature|enchantment|artifact|permanent|land|equipment)\b[^,.:;]{0,40}/gi;

/** Strips reminder text in parentheses, which never affects classification. */
function stripReminderText(text: string): string {
  return text.replace(/\([^)]*\)/g, ' ');
}

/** Splits oracle text into independently-classifiable clauses. */
export function splitClauses(oracleText: string): string[] {
  return stripReminderText(oracleText)
    .split('\n')
    .map((line) => line.replace(/^\s*[•]\s*/, '').trim())
    .filter((line) => line.length > 0);
}

/** Extracts, for one regex match, the substring used to search for the target noun. */
function getScope(clause: string, matchIndex: number, mode: ScopeMode): string {
  const nextPeriod = clause.indexOf('.', matchIndex);
  const end = nextPeriod === -1 ? clause.length : nextPeriod + 1;
  if (mode === 'from-match') return clause.slice(matchIndex, end);

  const prevPeriod = clause.lastIndexOf('.', Math.max(matchIndex - 1, 0));
  const start = prevPeriod === -1 ? 0 : prevPeriod + 1;
  return clause.slice(start, end);
}

/** Cuts off a trailing qualifier clause ("... , where X is ...") that can smuggle in unrelated nouns. */
function truncateQualifier(scope: string): string {
  return scope.split(/,\s*where\b/i)[0];
}

function cleanScope(clause: string, matchIndex: number, mode: ScopeMode): string {
  const scope = truncateQualifier(getScope(clause, matchIndex, mode));
  return scope.replace(SELF_REFERENCE, ' ');
}

function targetsForType(type: DisruptionType, clause: string, scope: string): string[] {
  if (FRIENDLY_TARGET.test(scope)) return [];

  if (type === 'hh') {
    const restriction = HAND_HATE_RESTRICTION.exec(clause);
    if (restriction) {
      const targets = extractTargets(`${restriction[1]} card`).filter((t) =>
        ALLOWED_TARGETS.hh.includes(t),
      );
      if (targets.length > 0) return targets;
    }
    return ['card'];
  }

  const found = extractTargets(scope).filter((t) => ALLOWED_TARGETS[type].includes(t));
  if (found.length > 0) return found;
  if (type === 'r' && GENERIC_ANY_TARGET.test(scope)) return ['creature'];
  if (type === 'si') return ['spell'];
  return [];
}

function matchAllIndices(pattern: RegExp, clause: string): number[] {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const global = new RegExp(pattern.source, flags);
  return [...clause.matchAll(global)].map((m) => m.index ?? 0);
}

/** Classifies a single clause, returning zero or more `type:target` tags (no modifier prefix). */
export function classifyClause(clause: string): { type: DisruptionType; target: string }[] {
  const results: { type: DisruptionType; target: string }[] = [];

  for (const type of ['r', 'si', 'hh'] as const) {
    if (type === 'hh' && HAND_HATE_EXCLUSIONS.some((p) => p.test(clause))) continue;

    const targets = new Set<string>();
    for (const { pattern, scope: scopeMode, forceTarget, requires } of TYPE_PATTERNS[
      type
    ] as TypePattern[]) {
      if (requires && !requires.test(clause)) continue;
      for (const index of matchAllIndices(pattern, clause)) {
        if (forceTarget) {
          targets.add(forceTarget);
          continue;
        }
        const scope = cleanScope(clause, index, scopeMode);
        for (const target of targetsForType(type, clause, scope)) targets.add(target);
      }
    }
    for (const target of targets) results.push({ type, target });
  }

  return results;
}

function modifierPrefix(clause: string, type: DisruptionType): string {
  if (type === 'hh') return '';
  let prefix = '';
  if (CONDITIONAL_PATTERNS.some((p) => p.test(clause))) prefix += 'c';
  if (SOFT_PATTERNS.some((p) => p.test(clause))) prefix += 's';
  return prefix;
}

/**
 * Classifies full oracle text into disruption tags (`{modifier}{type}:{target}`),
 * matching the convention documented in `tag-logic.md`. Splits on clauses so
 * modal/charm cards can yield multiple tags, one per mode.
 */
export function classifyOracleText(oracleText: string | null | undefined): string[] {
  if (!oracleText) return [];
  const tags = new Set<string>();

  for (const clause of splitClauses(oracleText)) {
    for (const { type, target } of classifyClause(clause)) {
      const prefix = modifierPrefix(clause, type);
      tags.add(`${prefix}${type}:${target}`);
    }
  }

  return [...tags].sort();
}
