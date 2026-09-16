import { describe, expect, it } from 'vitest';
import { computePriceDiffFromAverage } from './post-process-scryfall-card.js';
import { parsePrice } from './parse-offers.js';
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

describe('computePriceDiffFromAverage', () => {
  it('returns null when there is no scryfallCard', () => {
    expect(
      computePriceDiffFromAverage(
        { price: parsePrice('1,00 €'), foil: null },
        null,
      ),
    ).toBeNull();
  });

  it('returns null when price is missing', () => {
    expect(
      computePriceDiffFromAverage(
        { price: null, foil: null },
        buildCard({ eur: '1.00' }),
      ),
    ).toBeNull();
  });

  it('returns null when the offer is not priced in EUR', () => {
    expect(
      computePriceDiffFromAverage(
        { price: { amount: 1, currency: 'USD' }, foil: null },
        buildCard({ eur: '1.00' }),
      ),
    ).toBeNull();
  });

  it('returns null when the eur average price is missing', () => {
    expect(
      computePriceDiffFromAverage(
        { price: parsePrice('1,00 €'), foil: null },
        buildCard(),
      ),
    ).toBeNull();
  });

  it('computes absolute and percentage diff using eur for non-foil offers', () => {
    const result = computePriceDiffFromAverage(
      { price: parsePrice('1,50 €'), foil: null },
      buildCard({ eur: '1.00' }),
    );

    expect(result).toEqual({ absolute: 0.5, percentage: 0.5 });
  });

  it('uses eur_foil for foil offers', () => {
    const result = computePriceDiffFromAverage(
      {
        price: parsePrice('3,00 €'),
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
