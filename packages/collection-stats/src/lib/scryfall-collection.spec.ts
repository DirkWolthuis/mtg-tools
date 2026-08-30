import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchScryfallCollection } from './scryfall-collection.js';

function buildCard(name: string) {
  return { object: 'card', id: `id-${name}`, name };
}

describe('fetchScryfallCollection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('sends a single request for up to 75 names', async () => {
    const card = buildCard('Ancient Tomb');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [card], not_found: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const resultPromise = fetchScryfallCollection(['Ancient Tomb']);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.scryfall.com/cards/collection',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': '@org/collection-stats (mtg-tools)',
          Accept: 'application/json',
        },
        body: JSON.stringify({ identifiers: [{ name: 'Ancient Tomb' }] }),
      },
    );
    expect(result).toEqual({ cards: [card], notFound: [] });
  });

  it('batches more than 75 names into multiple requests', async () => {
    const names = Array.from({ length: 80 }, (_, i) => `Card ${i}`);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], not_found: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const resultPromise = fetchScryfallCollection(names);
    await vi.runAllTimersAsync();
    await resultPromise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(firstBody.identifiers).toHaveLength(75);
    expect(secondBody.identifiers).toHaveLength(5);
  });

  it('collects not_found identifier names', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ data: [], not_found: [{ name: 'Fake Card' }] }),
      }),
    );

    const resultPromise = fetchScryfallCollection(['Fake Card']);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toEqual({ cards: [], notFound: ['Fake Card'] });
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const assertion = expect(
      fetchScryfallCollection(['Ancient Tomb']),
    ).rejects.toThrow('Scryfall collection request failed with status 500');
    await vi.runAllTimersAsync();
    await assertion;
  });
});
