import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { enrichOffersWithScryfallData } from './enrich-offers.js';
import type { Offer } from './parse-offers.js';
import type { ScryfallCard } from './scryfall.js';

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
    actionsElement: null,
    ...overrides,
  };
}

describe('enrichOffersWithScryfallData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('leaves offers without a cardmarketId unchanged', async () => {
    const offer = buildOffer();
    const sendMessage = vi.fn();
    vi.stubGlobal('chrome', { runtime: { sendMessage } });

    const result = await enrichOffersWithScryfallData([offer]);

    expect(result).toEqual([offer]);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('requests and stores the Scryfall card for offers with a cardmarketId', async () => {
    const card = {
      object: 'card',
      cardmarket_id: 379041,
      prices: { eur: '0.10' },
    } as unknown as ScryfallCard;
    const sendMessage = vi.fn(
      (
        _message: unknown,
        callback: (response: { card: unknown; cubeStats: unknown }) => void,
      ) => {
        callback({ card, cubeStats: null });
      },
    );
    vi.stubGlobal('chrome', { runtime: { sendMessage } });

    const promise = enrichOffersWithScryfallData([
      buildOffer({ cardmarketId: '379041' }),
    ]);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toEqual([
      buildOffer({
        cardmarketId: '379041',
        scryfallCard: card,
        priceDiffFromAverage: { absolute: 0.1, percentage: 1 },
      }),
    ]);
    expect(sendMessage).toHaveBeenCalledWith(
      { type: 'fetch-scryfall-card', cardmarketId: '379041' },
      expect.any(Function),
    );
  });

  it('attaches cubeStats from the background response', async () => {
    const card = { object: 'card', id: 'abc-123' } as unknown as ScryfallCard;
    const cubeStats = { elo: 1500, popularity: 0.5, cubeCount: 100 };
    const sendMessage = vi.fn(
      (
        _message: unknown,
        callback: (response: { card: unknown; cubeStats: unknown }) => void,
      ) => {
        callback({ card, cubeStats });
      },
    );
    vi.stubGlobal('chrome', { runtime: { sendMessage } });

    const promise = enrichOffersWithScryfallData([
      buildOffer({ cardmarketId: '379041', priceText: null }),
    ]);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result[0]?.cubeStats).toEqual(cubeStats);
  });
});
