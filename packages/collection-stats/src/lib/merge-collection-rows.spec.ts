import { describe, expect, it } from 'vitest';
import { mergeEnrichedCards } from './merge-collection-rows.js';

describe('mergeEnrichedCards', () => {
  it('appends stat columns for rows with a matching enriched card', () => {
    const rows = [{ Name: 'Ancient Tomb', Edition: 'uma' }];
    const enrichedCards = [
      {
        name: 'Ancient Tomb',
        scryfallId: 'card-id',
        elo: 1500,
        popularity: 0.5,
        cubeCount: 100,
      },
    ];

    expect(mergeEnrichedCards(rows, enrichedCards)).toEqual([
      {
        Name: 'Ancient Tomb',
        Edition: 'uma',
        'Scryfall Id': 'card-id',
        Elo: '1500',
        Popularity: '0.5',
        'Cube Count': '100',
      },
    ]);
  });

  it('fills empty strings for rows without a matching enriched card', () => {
    const rows = [{ Name: 'Not On Scryfall', Edition: 'uma' }];

    expect(mergeEnrichedCards(rows, [])).toEqual([
      {
        Name: 'Not On Scryfall',
        Edition: 'uma',
        'Scryfall Id': '',
        Elo: '',
        Popularity: '',
        'Cube Count': '',
      },
    ]);
  });
});
