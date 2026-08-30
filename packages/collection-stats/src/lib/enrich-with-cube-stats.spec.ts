import { describe, expect, it } from 'vitest';
import { enrichCardsWithCubeStats } from './enrich-with-cube-stats.js';
import type { ScryfallCard } from './scryfall-collection.js';

function buildCard(id: string, name: string): ScryfallCard {
  return { object: 'card', id, name } as ScryfallCard;
}

describe('enrichCardsWithCubeStats', () => {
  it('attaches cube stats for cards present in the map', () => {
    const card = buildCard('card-id', 'Ancient Tomb');
    const cubeStats = {
      'card-id': { elo: 1500, popularity: 0.5, cubeCount: 100 },
    };

    expect(enrichCardsWithCubeStats([card], cubeStats)).toEqual([
      {
        name: 'Ancient Tomb',
        scryfallId: 'card-id',
        elo: 1500,
        popularity: 0.5,
        cubeCount: 100,
      },
    ]);
  });

  it('fills nulls for cards missing from the map', () => {
    const card = buildCard('other-id', 'Chalice of the Void');

    expect(enrichCardsWithCubeStats([card], {})).toEqual([
      {
        name: 'Chalice of the Void',
        scryfallId: 'other-id',
        elo: null,
        popularity: null,
        cubeCount: null,
      },
    ]);
  });
});
