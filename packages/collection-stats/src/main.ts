import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrichCardsWithCubeStats } from './lib/enrich-with-cube-stats.js';
import { loadCubeStatsMap } from './lib/load-cube-stats.js';
import {
  EXTRA_COLUMNS,
  mergeEnrichedCards,
} from './lib/merge-collection-rows.js';
import {
  parseCollectionCsvHeader,
  parseCollectionCsvRows,
} from './lib/parse-collection-csv.js';
import { fetchScryfallCollection } from './lib/scryfall-collection.js';
import { toCsv } from './lib/write-collection-csv.js';

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

function defaultOutputPath(csvPath: string): string {
  const extension = path.extname(csvPath);
  return path.join(
    path.dirname(csvPath),
    `${path.basename(csvPath, extension)}.enriched.csv`,
  );
}

async function main(): Promise<void> {
  const csvPath = process.argv[2] ?? DEFAULT_CSV_PATH;
  const outputPath = process.argv[3] ?? defaultOutputPath(csvPath);

  console.log(`Reading collection from ${csvPath}`);
  const csvText = await readFile(csvPath, 'utf8');
  const rows = parseCollectionCsvRows(csvText);
  const names = [...new Set(rows.map((row) => row['Name']).filter(Boolean))];
  console.log(`Found ${names.length} unique card name(s)`);

  console.log('Fetching cards from Scryfall...');
  const { cards, notFound } = await fetchScryfallCollection(names);
  console.log(
    `Resolved ${cards.length} card(s) on Scryfall, ${notFound.length} not found`,
  );
  if (notFound.length) console.warn('Not found on Scryfall:', notFound);

  const cubeStats = await loadCubeStatsMap(CUBE_STATS_PATH);
  const enriched = enrichCardsWithCubeStats(cards, cubeStats);
  console.table(
    [...enriched].sort((a, b) => (b.elo ?? -Infinity) - (a.elo ?? -Infinity)),
  );

  const columns = [...parseCollectionCsvHeader(csvText), ...EXTRA_COLUMNS];
  const mergedRows = mergeEnrichedCards(rows, enriched);
  await writeFile(outputPath, toCsv(columns, mergedRows), 'utf8');
  console.log(`Wrote enriched collection to ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
