import type { EnrichedCard } from './enrich-with-cube-stats.js';
import type { CollectionRow } from './parse-collection-csv.js';

/** Extra columns appended to each row by `mergeEnrichedCards`, in output order. */
export const EXTRA_COLUMNS = [
  'Scryfall Id',
  'Elo',
  'Popularity',
  'Cube Count',
] as const;

const NAME_COLUMN = 'Name';

/** Adds Scryfall id + CubeCobra stat columns to each original CSV `row`, matched by its Name column. */
export function mergeEnrichedCards(
  rows: CollectionRow[],
  enrichedCards: EnrichedCard[],
): CollectionRow[] {
  const byName = new Map(enrichedCards.map((card) => [card.name, card]));

  return rows.map((row) => {
    const enriched = byName.get(row[NAME_COLUMN]);
    return {
      ...row,
      'Scryfall Id': enriched?.scryfallId ?? '',
      Elo: enriched?.elo?.toString() ?? '',
      Popularity: enriched?.popularity?.toString() ?? '',
      'Cube Count': enriched?.cubeCount?.toString() ?? '',
    };
  });
}
