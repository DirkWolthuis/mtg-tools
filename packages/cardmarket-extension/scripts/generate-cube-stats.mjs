#!/usr/bin/env node
// One-off transform: extracts { elo, popularity, cubeCount } per scryfallId from
// data/cards/carddict.json (~215MB, minified single line) into a small static
// asset bundled with the extension. Re-run whenever carddict.json is updated
// upstream (e.g. `node --max-old-space-size=8192 scripts/generate-cube-stats.mjs`).
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(__dirname, '../../../data/cards/carddict.json');
const DEST = path.join(__dirname, '../public/cube-stats.json');

async function main() {
  const raw = await readFile(SOURCE, 'utf8');
  const carddict = JSON.parse(raw);

  const cubeStats = {};
  for (const [scryfallId, card] of Object.entries(carddict)) {
    cubeStats[scryfallId] = {
      elo: card.elo,
      popularity: card.popularity,
      cubeCount: card.cubeCount,
    };
  }

  await writeFile(DEST, JSON.stringify(cubeStats));
  console.log(`Wrote ${Object.keys(cubeStats).length} entries to ${DEST}`);
}

main();
