import { describe, expect, it } from 'vitest';
import {
  computePriceDiffFromAverage,
  getCubeStats,
  parsePrice,
} from './post-process-scryfall-card.js';
import type { ScryfallCard } from './scryfall.js';

function buildCard(prices: Partial<ScryfallCard['prices']> = {}): ScryfallCard {
  return {
    object: 'card',
    prices: {
      usd: null,
      usd_foil: null,
      usd_etched: null,
      eur: null,
      eur_foil: null,
      tix: null,
      ...prices,
    },
  } as ScryfallCard;
}

describe('parsePrice', () => {
  it('parses simple decimal-comma prices', () => {
    expect(parsePrice('0,20 €')).toBe(0.2);
  });

  it('parses prices with a thousands separator', () => {
    expect(parsePrice('1.234,56 €')).toBe(1234.56);
  });

  it('returns null for null input', () => {
    expect(parsePrice(null)).toBeNull();
  });

  it('returns null for unparseable input', () => {
    expect(parsePrice('n/a')).toBeNull();
  });
});

describe('computePriceDiffFromAverage', () => {
  it('returns null when there is no scryfallCard', () => {
    expect(
      computePriceDiffFromAverage({ priceText: '1,00 €', foil: null }, null),
    ).toBeNull();
  });

  it('returns null when priceText is missing', () => {
    expect(
      computePriceDiffFromAverage(
        { priceText: null, foil: null },
        buildCard({ eur: '1.00' }),
      ),
    ).toBeNull();
  });

  it('returns null when the eur average price is missing', () => {
    expect(
      computePriceDiffFromAverage(
        { priceText: '1,00 €', foil: null },
        buildCard(),
      ),
    ).toBeNull();
  });

  it('computes absolute and percentage diff using eur for non-foil offers', () => {
    const result = computePriceDiffFromAverage(
      { priceText: '1,50 €', foil: null },
      buildCard({ eur: '1.00' }),
    );

    expect(result).toEqual({ absolute: 0.5, percentage: 0.5 });
  });

  it('uses eur_foil for foil offers', () => {
    const result = computePriceDiffFromAverage(
      {
        priceText: '3,00 €',
        foil: {
          imageUrl: '',
          position: '',
          width: '',
          height: '',
          label: 'Foil',
        },
      },
      buildCard({ eur: '1.00', eur_foil: '2.00' }),
    );

    expect(result).toEqual({ absolute: 1, percentage: 0.5 });
  });
});

describe('getCubeStats', () => {
  const stats = { elo: 1500, popularity: 0.5, cubeCount: 100 };

  it('returns null when there is no scryfallCard', () => {
    expect(getCubeStats(null, { 'card-id': stats })).toBeNull();
  });

  it('returns null when the card id has no entry in the map', () => {
    expect(
      getCubeStats({ id: 'other-id' } as ScryfallCard, { 'card-id': stats }),
    ).toBeNull();
  });

  it('returns the stats for the matching scryfall id', () => {
    expect(
      getCubeStats({ id: 'card-id' } as ScryfallCard, { 'card-id': stats }),
    ).toEqual(stats);
  });
});
