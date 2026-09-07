/**
 * Scores the regex-based classifier against the disruption tags already
 * present in `sharp-simple.json`. Run with:
 *
 *   npx tsx scripts/score.ts
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { classifyOracleText } from '../src/classify.js';

const DISRUPTION_TAG = /^(c|s|cs)?(hh|si|r):/;

interface CardDetails {
  name: string;
  type_line?: string;
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

interface TagStats {
  tp: number;
  fp: number;
  fn: number;
}
const stats = new Map<string, TagStats>();
function bump(tag: string, key: keyof TagStats) {
  const s = stats.get(tag) ?? { tp: 0, fp: 0, fn: 0 };
  s[key] += 1;
  stats.set(tag, s);
}

interface Mismatch {
  name: string;
  falsePositives: string[];
  falseNegatives: string[];
}
const mismatches: Mismatch[] = [];

for (const card of allCards) {
  const actual = new Set((card.tags ?? []).filter((t) => DISRUPTION_TAG.test(t)));
  const predicted = new Set(classifyOracleText(card.details.oracle_text));

  const falsePositives: string[] = [];
  const falseNegatives: string[] = [];

  for (const tag of predicted) {
    if (actual.has(tag)) bump(tag, 'tp');
    else {
      bump(tag, 'fp');
      falsePositives.push(tag);
    }
  }
  for (const tag of actual) {
    if (!predicted.has(tag)) {
      bump(tag, 'fn');
      falseNegatives.push(tag);
    }
  }

  if (falsePositives.length > 0 || falseNegatives.length > 0) {
    mismatches.push({ name: card.details.name, falsePositives, falseNegatives });
  }
}

let totalTp = 0;
let totalFp = 0;
let totalFn = 0;

console.log('Per-tag precision / recall / F1:\n');
console.log('tag'.padEnd(24), 'tp'.padStart(4), 'fp'.padStart(4), 'fn'.padStart(4), 'precision'.padStart(10), 'recall'.padStart(8), 'f1'.padStart(6));
for (const [tag, s] of [...stats.entries()].sort()) {
  totalTp += s.tp;
  totalFp += s.fp;
  totalFn += s.fn;
  const precision = s.tp + s.fp === 0 ? 1 : s.tp / (s.tp + s.fp);
  const recall = s.tp + s.fn === 0 ? 1 : s.tp / (s.tp + s.fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  console.log(
    tag.padEnd(24),
    String(s.tp).padStart(4),
    String(s.fp).padStart(4),
    String(s.fn).padStart(4),
    precision.toFixed(2).padStart(10),
    recall.toFixed(2).padStart(8),
    f1.toFixed(2).padStart(6),
  );
}

const overallPrecision = totalTp + totalFp === 0 ? 1 : totalTp / (totalTp + totalFp);
const overallRecall = totalTp + totalFn === 0 ? 1 : totalTp / (totalTp + totalFn);
const overallF1 =
  overallPrecision + overallRecall === 0 ? 0 : (2 * overallPrecision * overallRecall) / (overallPrecision + overallRecall);

console.log(
  `\nOverall: tp=${totalTp} fp=${totalFp} fn=${totalFn} precision=${overallPrecision.toFixed(3)} recall=${overallRecall.toFixed(3)} f1=${overallF1.toFixed(3)}`,
);

console.log(`\nMismatched cards (${mismatches.length}):\n`);
for (const m of mismatches) {
  console.log(`- ${m.name}`);
  if (m.falsePositives.length) console.log(`    + predicted, not tagged: ${m.falsePositives.join(', ')}`);
  if (m.falseNegatives.length) console.log(`    - tagged, not predicted: ${m.falseNegatives.join(', ')}`);
}
