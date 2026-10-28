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

// Separate from `cache` above since prints are keyed by set/collector number/language
// instead of a cardmarketId.
const printCache = new Map<string, CacheEntry>();

function printCacheKey(set: string, collectorNumber: string, lang: string): string {
  return `${set}/${collectorNumber}/${lang}`;
}

/** Returns the cached print for `set`/`collectorNumber`/`lang`, or `undefined` if there's no entry or it has expired. */
export function getCachedScryfallPrint(
  set: string,
  collectorNumber: string,
  lang: string,
  now = Date.now(),
): ScryfallCard | null | undefined {
  const key = printCacheKey(set, collectorNumber, lang);
  const entry = printCache.get(key);
  if (!entry) return undefined;
  if (now - entry.fetchedAt >= TTL_MS) {
    printCache.delete(key);
    return undefined;
  }
  return entry.card;
}

export function setCachedScryfallPrint(
  set: string,
  collectorNumber: string,
  lang: string,
  card: ScryfallCard | null,
  now = Date.now(),
): void {
  printCache.set(printCacheKey(set, collectorNumber, lang), {
    card,
    fetchedAt: now,
  });
}
