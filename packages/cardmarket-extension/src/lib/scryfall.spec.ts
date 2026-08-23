import { describe, expect, it, vi, afterEach } from 'vitest';
import { fetchScryfallCardByCardmarketId } from './scryfall.js';

describe('fetchScryfallCardByCardmarketId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the parsed JSON body on a successful response', async () => {
    const card = {
      object: 'card',
      cardmarket_id: 379041,
      name: 'Embodiment of Agonies',
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(card),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchScryfallCardByCardmarketId('379041');

    expect(result).toEqual(card);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.scryfall.com/cards/cardmarket/379041',
    );
  });

  it('returns null when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) }),
    );

    const result = await fetchScryfallCardByCardmarketId('0');

    expect(result).toBeNull();
  });
});
