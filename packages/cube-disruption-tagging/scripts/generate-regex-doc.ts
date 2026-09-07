/**
 * Generates `REGEX.md`: one standalone regex per disruption tag actually
 * used in `sharp-simple.json`, each with 1-3 example cube cards. Run with:
 *
 *   npx tsx scripts/generate-regex-doc.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildTagRegex, type DisruptionType, type Modifier } from '../src/patterns.js';
import { TARGET_PATTERNS } from '../src/targets.js';

const DISRUPTION_TAG = /^(c|s|cs)?(hh|si|r):(.+)$/;

interface CardDetails {
  name: string;
  oracle_text?: string;
}
interface Card {
  tags?: string[];
  details: CardDetails;
}
interface CubeFile {
  cards: { mainboard: Card[]; maybeboard: Card[]; cuts?: Card[] };
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const cubePath = path.join(dir, '..', 'sharp-simple.json');
const cube: CubeFile = JSON.parse(readFileSync(cubePath, 'utf8'));
const allCards = [...cube.cards.mainboard, ...cube.cards.maybeboard, ...(cube.cards.cuts ?? [])];

// Group TARGET_PATTERNS (one entry per noun-phrase pattern) into one array
// of patterns per canonical target name, for buildTagRegex's lookahead.
const targetPatternsMap: Record<string, RegExp[]> = {};
for (const { target, pattern } of TARGET_PATTERNS) {
  (targetPatternsMap[target] ??= []).push(pattern);
}

function parseTag(tag: string): { type: DisruptionType; modifiers: Modifier[]; target: string } {
  const match = DISRUPTION_TAG.exec(tag);
  if (!match) throw new Error(`Not a disruption tag: ${tag}`);
  const [, prefix, type, target] = match;
  const modifiers: Modifier[] = [];
  if (prefix?.includes('c')) modifiers.push('conditional');
  if (prefix?.includes('s')) modifiers.push('soft');
  return { type: type as DisruptionType, modifiers, target };
}

// Collect every distinct disruption tag actually present in the cube.
const usedTags = new Set<string>();
for (const card of allCards) {
  for (const tag of card.tags ?? []) {
    if (DISRUPTION_TAG.test(tag)) usedTags.add(tag);
  }
}

const rows: { tag: string; regex: RegExp; examples: string[] }[] = [];
for (const tag of [...usedTags].sort()) {
  const { type, modifiers, target } = parseTag(tag);
  const regex = buildTagRegex(type, modifiers, target, targetPatternsMap);
  const examples = allCards
    .filter((c) => (c.tags ?? []).includes(tag) && regex.test(c.details.oracle_text ?? ''))
    .map((c) => c.details.name)
    .slice(0, 3);
  rows.push({ tag, regex, examples });
}

const lines: string[] = [
  '# Disruption tag regexes',
  '',
  'One standalone regex per disruption tag actually used in `sharp-simple.json`,',
  'generated from `src/patterns.ts`/`src/targets.ts` via `buildTagRegex`.',
  '',
  'These are **coarser** than the clause-scoped classifier in `src/classify.ts`:',
  'each one tests "does this oracle text mention a type-match, every modifier',
  'match, and a target match, *anywhere*" via lookaheads, rather than confirming',
  'they all come from the same clause. Good for a quick filter (e.g. a Cube',
  'Cobra custom search); prefer `classifyOracleText()` for programmatic tagging.',
  '',
  'Regenerate with `npx tsx scripts/generate-regex-doc.ts`.',
  '',
  '| Tag | Regex | Example cards |',
  '| --- | --- | --- |',
];
for (const { tag, regex, examples } of rows) {
  const escaped = regex.source.replace(/\|/g, '\\|');
  lines.push(`| \`${tag}\` | \`/${escaped}/${regex.flags}\` | ${examples.join(', ') || '_none_'} |`);
}
lines.push('');

writeFileSync(path.join(dir, '..', 'REGEX.md'), lines.join('\n'));
console.log(`Wrote REGEX.md with ${rows.length} tags.`);
