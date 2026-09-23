#!/usr/bin/env node
// One-off transform: extracts { elo, popularity, cubeCount } per scryfallId from
// data/cards/carddict.json (~215MB, minified single line) into small static
// assets bundled with the extension. Re-run whenever carddict.json is updated
// upstream (e.g. `node --max-old-space-size=8192 scripts/generate-cube-stats.mjs`).
//
// Output is sharded into public/cube-stats/<prefix>.json, one file per
// lowercased 2-character prefix of the scryfallId, instead of one monolithic
// public/cube-stats.json. Two reasons:
//   - a single ~13MB JSON file trips Firefox's addons-linter FILE_TOO_LARGE
//     check (files over 5MB aren't parsed during AMO review);
//   - the background service worker only ever needs stats for one card at a
//     time (see cube-stats-cache.ts), so shipping ~258 small (~50-60KB)
//     shards lets it fetch just the shard it needs instead of loading and
//     parsing the whole dataset on every cold start.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(__dirname, '../../../data/cards/carddict.json');
const DEST_DIR = path.join(__dirname, '../public/cube-stats');

function shardPrefix(scryfallId) {
  return scryfallId.slice(0, 2).toLowerCase();
}

async function main() {
  const raw = await readFile(SOURCE, 'utf8');
  const carddict = JSON.parse(raw);

  const shards = new Map();
  for (const [scryfallId, card] of Object.entries(carddict)) {
    const prefix = shardPrefix(scryfallId);
    let shard = shards.get(prefix);
    if (!shard) shards.set(prefix, (shard = {}));
    shard[scryfallId] = {
      elo: card.elo,
      popularity: card.popularity,
      cubeCount: card.cubeCount,
    };
  }

  await rm(DEST_DIR, { recursive: true, force: true });
  await mkdir(DEST_DIR, { recursive: true });

  let totalEntries = 0;
  for (const [prefix, shard] of shards) {
    await writeFile(
      path.join(DEST_DIR, `${prefix}.json`),
      JSON.stringify(shard),
    );
    totalEntries += Object.keys(shard).length;
  }

  console.log(
    `Wrote ${totalEntries} entries across ${shards.size} shards to ${DEST_DIR}`,
  );
}

main();
