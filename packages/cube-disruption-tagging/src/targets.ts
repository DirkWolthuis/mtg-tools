/**
 * Target extraction for disruption tags.
 *
 * A disruption tag has the shape `{modifier}{type}:{target}`. This module is
 * only concerned with the `{target}` part: given a single clause of oracle
 * text, which canonical target string(s) does it name?
 *
 * Composite targets (`nl-permanent`, `nb-land`, `noncreature-nonland`) are
 * genuine single targets — the qualifier narrows what a single noun means.
 * A disjunction of two distinct nouns ("artifact or enchantment") is instead
 * read as two separate targets, one per noun, because that's how the cube is
 * tagged (e.g. Forsake the Worldly -> `r:artifact, r:enchantment`, not a
 * single composite tag).
 *
 * `TARGET_PATTERNS` is ordered from most specific (compound) to least
 * specific (bare noun). `extractTargets` blanks out whatever a pattern
 * matched before testing the next, less specific pattern, so a phrase like
 * "nonland permanent" contributes only `nl-permanent`, not also `permanent`.
 */

export interface TargetPattern {
  /** Canonical target name, as used in existing tags (e.g. `nl-permanent`). */
  target: string;
  /** Matches the noun phrase describing this target inside a clause. */
  pattern: RegExp;
}

export const TARGET_PATTERNS: TargetPattern[] = [
  // Composite targets: a qualifier that changes the meaning of the noun.
  { target: 'nb-land', pattern: /\bnonbasic\s+lands?\b/i },
  { target: 'nl-permanent', pattern: /\bnonland\s+permanents?\b/i },
  {
    target: 'noncreature-nonland',
    pattern: /\bnoncreature,?\s+(?:and\s+)?nonland\s+cards?\b/i,
  },

  // "<restriction> spell" — the restriction replaces the generic 'spell'
  // target because the spell-ness is already implied by the counter/bounce
  // type (e.g. Spell Pierce -> csi:noncreature, not csi:noncreature-spell).
  { target: 'noncreature', pattern: /\bnoncreature\s+spells?\b/i },
  { target: 'creature', pattern: /\bcreature\s+spells?\b/i },
  { target: 'sorcery', pattern: /\bsorcery\s+spells?\b/i },
  { target: 'instant', pattern: /\binstant\s+spells?\b/i },
  { target: 'artifact', pattern: /\bartifact\s+spells?\b/i },
  { target: 'enchantment', pattern: /\benchantment\s+spells?\b/i },

  // Bare nouns.
  { target: 'creature', pattern: /\bcreatures?\b/i },
  { target: 'artifact', pattern: /\bartifacts?\b/i },
  { target: 'enchantment', pattern: /\benchantments?\b/i },
  { target: 'planeswalker', pattern: /\bplaneswalkers?\b/i },
  { target: 'battle', pattern: /\bbattles?\b/i },
  { target: 'permanent', pattern: /\bpermanents?\b/i },
  { target: 'land', pattern: /\blands?\b/i },
  { target: 'graveyard', pattern: /\bgraveyards?\b/i },
  { target: 'token', pattern: /\btokens?\b/i },
  { target: 'sorcery', pattern: /\bsorcer(?:y|ies)\b/i },
  { target: 'instant', pattern: /\binstants?\b/i },
  { target: 'spell', pattern: /\bspells?\b/i },
];

/**
 * Extracts every canonical target named in a clause, in the order the
 * underlying patterns are declared. May return duplicate/multiple targets
 * for modal or disjunctive clauses (e.g. "artifact or enchantment" yields
 * `['artifact', 'enchantment']`).
 */
export function extractTargets(clauseText: string): string[] {
  let working = clauseText;
  const found: string[] = [];

  for (const { target, pattern } of TARGET_PATTERNS) {
    const globalPattern = new RegExp(pattern.source, 'gi');
    const matches = [...working.matchAll(globalPattern)];
    if (matches.length === 0) continue;

    for (let i = 0; i < matches.length; i++) found.push(target);
    // Blank the matched spans (same length, so indices of anything not yet
    // tested stay valid) so looser patterns don't double-count this text.
    working = working.replace(globalPattern, (m) => ' '.repeat(m.length));
  }

  return found;
}
