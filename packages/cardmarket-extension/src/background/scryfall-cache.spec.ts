import { describe, expect, it } from 'vitest';
import {
  getCachedScryfallCard,
  setCachedScryfallCard,
} from './scryfall-cache.js';

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

describe('scryfall-cache', () => {
  it('is a miss when nothing has been cached', () => {
    expect(getCachedScryfallCard('unset-id')).toBeUndefined();
  });

  it('returns a fresh cached card', () => {
    const card = { object: 'card', cardmarket_id: 1 } as any;
    setCachedScryfallCard('fresh-id', card, 1000);

    expect(getCachedScryfallCard('fresh-id', 1000 + 60_000)).toBe(card);
  });

  it('caches and returns a null result', () => {
    setCachedScryfallCard('null-id', null, 1000);

    expect(getCachedScryfallCard('null-id', 1000 + 60_000)).toBeNull();
  });

  it('treats an entry exactly at the 2-day TTL as expired', () => {
    setCachedScryfallCard('boundary-id', {} as any, 1000);

    expect(
      getCachedScryfallCard('boundary-id', 1000 + TWO_DAYS_MS),
    ).toBeUndefined();
  });

  it('treats an entry just under the 2-day TTL as fresh', () => {
    const card = { object: 'card' } as any;
    setCachedScryfallCard('under-ttl-id', card, 1000);

    expect(getCachedScryfallCard('under-ttl-id', 1000 + TWO_DAYS_MS - 1)).toBe(
      card,
    );
  });

  it('keys entries independently per cardmarketId', () => {
    setCachedScryfallCard('id-a', { object: 'a' } as any, 1000);
    setCachedScryfallCard('id-b', { object: 'b' } as any, 1000);

    expect(getCachedScryfallCard('id-a', 1000)).toEqual({ object: 'a' });
    expect(getCachedScryfallCard('id-b', 1000)).toEqual({ object: 'b' });
  });
});
