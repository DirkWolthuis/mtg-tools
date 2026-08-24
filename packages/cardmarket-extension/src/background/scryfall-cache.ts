import type { ScryfallCard } from '../lib/scryfall.js';

const TTL_MS = 2 * 24 * 60 * 60 * 1000;

interface CacheEntry {
  card: ScryfallCard | null;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

/** Returns the cached card for `cardmarketId`, or `undefined` if there's no entry or it has expired. */
export function getCachedScryfallCard(
  cardmarketId: string,
  now = Date.now(),
): ScryfallCard | null | undefined {
  const entry = cache.get(cardmarketId);
  if (!entry) return undefined;
  if (now - entry.fetchedAt >= TTL_MS) {
    cache.delete(cardmarketId);
    return undefined;
  }
  return entry.card;
}

export function setCachedScryfallCard(
  cardmarketId: string,
  card: ScryfallCard | null,
  now = Date.now(),
): void {
  cache.set(cardmarketId, { card, fetchedAt: now });
}
