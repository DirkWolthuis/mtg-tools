import { describe, expect, it } from 'vitest';
import { renderOffersGrid } from './render-offers-grid.js';
import type { Offer } from './parse-offers.js';

function buildOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    name: 'Llanowar Elves',
    cardUrl: '/en/Magic/Products/Singles/Dominaria/Llanowar-Elves',
    priceText: '0,20 €',
    imageUrl: null,
    quantity: null,
    set: null,
    language: null,
    condition: null,
    foil: null,
    cardmarketId: null,
    scryfallCard: null,
    priceDiffFromAverage: null,
    cubeStats: null,
    ...overrides,
  };
}

describe('renderOffersGrid', () => {
  it('mounts a shadow root with injected styles and one card per offer', () => {
    const host = document.createElement('div');

    renderOffersGrid(host, [
      buildOffer(),
      buildOffer({ name: 'Counterspell' }),
    ]);

    const shadowRoot = host.shadowRoot;
    expect(shadowRoot).not.toBeNull();
    expect(shadowRoot?.querySelector('style')?.textContent).toBeTruthy();
    expect(
      shadowRoot?.querySelectorAll('[data-testid="offer-card"]'),
    ).toHaveLength(2);
  });

  it('renders an empty state when there are no offers', () => {
    const host = document.createElement('div');

    renderOffersGrid(host, []);

    expect(
      host.shadowRoot?.querySelector('[data-testid="offers-grid-empty"]'),
    ).not.toBeNull();
  });

  it('re-renders into the same shadow root when called again', () => {
    const host = document.createElement('div');

    renderOffersGrid(host, [buildOffer()]);
    renderOffersGrid(host, [
      buildOffer(),
      buildOffer({ name: 'Counterspell' }),
    ]);

    expect(host.shadowRoot?.querySelectorAll('style')).toHaveLength(1);
    expect(
      host.shadowRoot?.querySelectorAll('[data-testid="offer-card"]'),
    ).toHaveLength(2);
  });
});
