/**
 * Disruption type and modifier regexes.
 *
 * Each type pattern is tagged with a `scope` strategy telling the classifier
 * where, relative to the match, the affected object's noun phrase lives:
 *
 * - `'from-match'` — the object follows the verb ("destroy **target creature**",
 *   "counter **target spell**", "deals damage to **any target**"). The scope
 *   used for target extraction runs from the start of the match to the end
 *   of that sentence, deliberately *excluding* anything before the verb —
 *   this keeps activated-ability costs ("Sacrifice this creature: Destroy
 *   target artifact.") from leaking their own noun into the target search.
 * - `'sentence'` — the object typically *precedes* the matched phrase
 *   ("**target creature** gets -X/-X", "Enchanted creature loses all
 *   abilities"). The scope used is the whole sentence containing the match.
 *
 * These are also composed into standalone per-tag regexes in `buildTagRegex`
 * (useful for e.g. a Cube Cobra custom filter), which is coarser than the
 * clause-scoped classifier: it tests "does this text mention X anywhere"
 * rather than "is this single clause about X".
 */

export type DisruptionType = 'r' | 'si' | 'hh';
export type Modifier = 'conditional' | 'soft';
export type ScopeMode = 'from-match' | 'sentence';

/** A -X/-X or -1/-1-counter effect only counts as removal when it's actually
 * targeted or a mass effect ("target", "each", "all") — as opposed to a
 * self-referential stat on the card itself ("This creature enters with six
 * -1/-1 counters on it."). */
const TARGETED_OR_MASS = /\b(?:target|each|all)\b/i;

export interface TypePattern {
  pattern: RegExp;
  scope: ScopeMode;
  /** If set, skip the noun search entirely and always use this target. */
  forceTarget?: string;
  /** If set, the *whole clause* must also match this before the type counts. */
  requires?: RegExp;
}

/**
 * `r` — removal: interacts with permanents on the battlefield (destroy,
 * exile, edict-sacrifice, damage/-X-X/-1-1-counter based removal, fight,
 * bounce to hand, or an ability/type-stripping Aura).
 */
export const REMOVAL_PATTERNS: TypePattern[] = [
  { pattern: /\bdestroys?\b/i, scope: 'from-match' },
  { pattern: /\bexiles?\s+(?:target|up to|any number of target|all)\b/i, scope: 'from-match' },
  {
    pattern: /\bexiles?\b[^.]*\buntil\b[^.]*\bleaves the battlefield\b/i,
    scope: 'from-match',
  },
  { pattern: /\b(?:each|target) player sacrifices\b/i, scope: 'from-match' },
  {
    pattern: /-[1-9]\d*\/-[1-9]\d*|-[xX]\/-[xX]/,
    scope: 'sentence',
    requires: TARGETED_OR_MASS,
  },
  { pattern: /-1\/-1 counters?\b/i, scope: 'sentence', requires: TARGETED_OR_MASS },
  { pattern: /\bfights? (?:up to|target)\b/i, scope: 'from-match' },
  // Damage-based removal ("deals 3 damage", "deals X damage", "damage
  // equal to ...", "damage divided as you choose", "that much damage").
  { pattern: /\bdeals?\s+(?:\d+|x|that much|any number of)\s*damage\b/i, scope: 'from-match' },
  { pattern: /\bdamage equal to\b/i, scope: 'from-match' },
  { pattern: /\bdamage divided as you choose\b/i, scope: 'from-match' },
  // Bounce to hand/library targeting a permanent (soft removal).
  {
    pattern:
      /\breturns? [^.]*?\b(?:creature|artifact|enchantment|permanent|planeswalker|battle)s?\b[^.]*? to (?:its|their|his|her) (?:owner's|owners') (?:hand|library)s?\b/i,
    scope: 'from-match',
  },
  // Ability/type-stripping Auras neutralize a creature instead of removing it.
  {
    pattern: /\bloses all (?:other )?abilities\b/i,
    scope: 'sentence',
    forceTarget: 'creature',
  },
];

/**
 * `si` — stack interaction: counters or bounces a spell, or redirects one.
 */
export const STACK_INTERACTION_PATTERNS: TypePattern[] = [
  { pattern: /\bcounters?\s+target\b/i, scope: 'from-match' },
  { pattern: /\breturn target spell\b/i, scope: 'from-match' },
  { pattern: /\bchange the target of target spell\b/i, scope: 'from-match' },
];

/**
 * `hh` — hand hate: forces a discard with no replacement draw. Excludes
 * discard paid as your own additional cost (cycling, escalate, etc.) because
 * those never mention an opponent/target player as the discarder.
 */
export const HAND_HATE_PATTERNS: TypePattern[] = [
  {
    pattern: /\b(?:target opponent|target player|that player) reveals (?:their|his|her) hand\b/i,
    scope: 'sentence',
  },
  { pattern: /\b(?:target opponent|target player|that player) discards\b/i, scope: 'sentence' },
];

/** Discard effects that replace the card (draw), which are not hand hate. */
export const HAND_HATE_EXCLUSIONS: RegExp[] = [/\bthen draws?\b/i, /\bdraws that many\b/i];

/** Captures the restricted card type(s) in "you choose a(n) X card" (Duress-style). */
export const HAND_HATE_RESTRICTION = /\bchoose (?:a|an) ([a-z][\w\s,'/-]*?) card\b/i;

export const TYPE_PATTERNS: Record<DisruptionType, TypePattern[]> = {
  r: REMOVAL_PATTERNS,
  si: STACK_INTERACTION_PATTERNS,
  hh: HAND_HATE_PATTERNS,
};

/** Only these canonical targets are valid for each disruption type. */
export const ALLOWED_TARGETS: Record<DisruptionType, string[]> = {
  r: [
    'creature',
    'artifact',
    'enchantment',
    'permanent',
    'nl-permanent',
    'nb-land',
    'land',
    'graveyard',
    'planeswalker',
    'battle',
    'token',
  ],
  si: ['spell', 'creature', 'noncreature', 'sorcery', 'instant', 'artifact', 'enchantment'],
  hh: [
    'card',
    'noncreature-nonland',
    'instant',
    'sorcery',
    'creature',
    'artifact',
    'enchantment',
    'planeswalker',
    'land',
  ],
};

/**
 * `c` — conditional: the effect can fail, or only applies to a restricted
 * subset (color/type restriction, a *targeted* stat/mana-value threshold —
 * as opposed to a mass "destroy all creatures with mv N or less" sweeper,
 * which stays unconditional — "unless...pays", edict "of their choice",
 * fight, "with a single target", or any damage/-X-X-based removal).
 */
export const CONDITIONAL_PATTERNS: RegExp[] = [
  /\bunless\b/i,
  /\btarget\b[^.]{0,80}\b(?:power|toughness|mana value)\s+\d+\s+or\s+(?:greater|less)\b/i,
  /\b(?:power|toughness|mana value)\s+\d+\s+or\s+(?:greater|less)\b[^.]{0,80}\btarget\b/i,
  /\bnon(?:black|blue|white|red|green|artifact|token|legendary|human|creature)\b/i,
  /\bof (?:their|his|her) choice\b/i,
  /\bfights?\b/i,
  /\bwith a single target\b/i,
  /\bdeals?\s+(?:\d+|x|that much|any number of)\s*damage\b/i,
  /\bdamage equal to\b/i,
  /\bdamage divided as you choose\b/i,
  /-[1-9]\d*\/-[1-9]\d*|-[xX]\/-[xX]/,
  /-1\/-1 counters?\b/i,
];

/**
 * `s` — soft: the disruption is temporary (return to hand/library instead of
 * destroying/exiling/countering permanently, or an Aura that merely
 * neutralizes a creature rather than removing it).
 */
export const SOFT_PATTERNS: RegExp[] = [
  // Tempered-dot exclusion: a self-bounce ("return a creature you control")
  // is a cost/setup, not the disruptive effect, and shouldn't mark an
  // unrelated destroy/exile effect in the same clause as merely "soft"
  // (Time Wipe: "Return a creature you control to hand, then destroy all
  // creatures." is still full removal, not soft removal).
  /\breturns?\b(?:(?!you control)[\s\S])*? to (?:its|their|his|her) (?:owner's|owners') (?:hand|library)s?\b/i,
  /\bloses all (?:other )?abilities\b/i,
];

export const MODIFIER_PATTERNS: Record<Modifier, RegExp[]> = {
  conditional: CONDITIONAL_PATTERNS,
  soft: SOFT_PATTERNS,
};

function altSource(patterns: RegExp[]): string {
  return patterns.map((p) => `(?:${p.source})`).join('|');
}

/**
 * Builds a single standalone regex for a full tag (e.g. `cr:creature`) by
 * requiring, via lookaheads, that the text contain a type match, every
 * requested modifier's match, and a target match — in any order. Coarser
 * than the clause-scoped classifier: it doesn't confirm the type/modifier/
 * target all come from the *same* clause.
 */
export function buildTagRegex(
  type: DisruptionType,
  modifiers: Modifier[],
  target: string,
  targetPatterns: Record<string, RegExp[]>,
): RegExp {
  const lookaheads = [
    `(?=.*(?:${altSource(TYPE_PATTERNS[type].map((t) => t.pattern))}))`,
    ...modifiers.map((m) => `(?=.*(?:${altSource(MODIFIER_PATTERNS[m])}))`),
    `(?=.*(?:${altSource(targetPatterns[target] ?? [])}))`,
  ];
  return new RegExp(lookaheads.join(''), 'is');
}
