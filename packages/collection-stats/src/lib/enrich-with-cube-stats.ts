import { getCubeStats, type CubeStatsMap } from '@org/cubecobra-stats';
import type { ScryfallCard } from './scryfall-collection.js';

export interface EnrichedCard {
  name: string;
  scryfallId: string;
  elo: number | null;
  popularity: number | null;
  cubeCount: number | null;
}

/** Joins Scryfall `cards` with CubeCobra popularity stats, keyed by Scryfall id. */
export function enrichCardsWithCubeStats(
  cards: ScryfallCard[],
  cubeStats: CubeStatsMap,
): EnrichedCard[] {
  return cards.map((card) => {
    const stats = getCubeStats(card.id, cubeStats);
    return {
      name: card.name,
      scryfallId: card.id,
      elo: stats?.elo ?? null,
      popularity: stats?.popularity ?? null,
      cubeCount: stats?.cubeCount ?? null,
    };
  });
}
