import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrichCardsWithCubeStats } from './lib/enrich-with-cube-stats.js';
import { loadCubeStatsMap } from './lib/load-cube-stats.js';
import { parseCollectionCsv } from './lib/parse-collection-csv.js';
import { fetchScryfallCollection } from './lib/scryfall-collection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CSV_PATH = path.join(
  __dirname,
  '../../../data/moxfield/collection.csv',
);
// Reuses the pre-generated bundled asset from the cardmarket-extension package
// rather than re-deriving it from CubeCobra's ~215MB carddict.json source.
const CUBE_STATS_PATH = path.join(
  __dirname,
  '../../cardmarket-extension/public/cube-stats.json',
);

async function main(): Promise<void> {
  const csvPath = process.argv[2] ?? DEFAULT_CSV_PATH;

  console.log(`Reading collection from ${csvPath}`);
  const csvText = await readFile(csvPath, 'utf8');
  const names = parseCollectionCsv(csvText);
  console.log(`Found ${names.length} unique card name(s)`);

  console.log('Fetching cards from Scryfall...');
  const { cards, notFound } = await fetchScryfallCollection(names);
  console.log(
    `Resolved ${cards.length} card(s) on Scryfall, ${notFound.length} not found`,
  );
  if (notFound.length) console.warn('Not found on Scryfall:', notFound);

  const cubeStats = await loadCubeStatsMap(CUBE_STATS_PATH);
  const enriched = enrichCardsWithCubeStats(cards, cubeStats).sort(
    (a, b) => (b.elo ?? -Infinity) - (a.elo ?? -Infinity),
  );

  console.table(enriched);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
