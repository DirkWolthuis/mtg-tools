import { describe, expect, it } from 'vitest';
import { summarizeOffers } from './aggregate.js';
import type { OfferRow } from './types.js';

describe('summarizeOffers', () => {
  it('picks the cheapest offer per card and computes the delta vs. the reference price', () => {
    const offers: OfferRow[] = [
      {
        id: '1',
        cardName: 'Llanowar Elves',
        expansion: 'Dominaria',
        condition: 'NM',
        priceEur: 0.5,
      },
      {
        id: '2',
        cardName: 'Llanowar Elves',
        expansion: 'M19',
        condition: 'NM',
        priceEur: 0.2,
      },
      {
        id: '3',
        cardName: 'Counterspell',
        expansion: 'MH2',
        condition: 'NM',
        priceEur: 3,
      },
    ];

    const summaries = summarizeOffers(
      offers,
      new Map([
        ['Llanowar Elves', 0.1],
        ['Counterspell', 3.5],
      ]),
    );

    expect(summaries).toEqual([
      {
        cardName: 'Counterspell',
        offerCount: 1,
        cheapestPriceEur: 3,
        cheapestExpansion: 'MH2',
        referencePriceEur: 3.5,
        deltaEur: -0.5,
      },
      {
        cardName: 'Llanowar Elves',
        offerCount: 2,
        cheapestPriceEur: 0.2,
        cheapestExpansion: 'M19',
        referencePriceEur: 0.1,
        deltaEur: 0.1,
      },
    ]);
  });

  it('leaves the reference price and delta null when no reference price is known', () => {
    const offers: OfferRow[] = [
      {
        id: '1',
        cardName: 'Obscure Card',
        expansion: 'Set',
        condition: 'NM',
        priceEur: 1,
      },
    ];

    const [summary] = summarizeOffers(offers, new Map());

    expect(summary.referencePriceEur).toBeNull();
    expect(summary.deltaEur).toBeNull();
  });
});
