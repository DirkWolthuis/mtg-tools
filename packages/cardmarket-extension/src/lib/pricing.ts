const CACHE_PREFIX = 'reference-price:';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CachedPrice {
  priceEur: number | null;
  fetchedAt: number;
}

async function readCache(cardName: string): Promise<CachedPrice | null> {
  const key = CACHE_PREFIX + cardName;
  const cached = (await chrome.storage.local.get(key))[key] as
    CachedPrice | undefined;
  if (!cached || Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
  return cached;
}

async function writeCache(
  cardName: string,
  priceEur: number | null,
): Promise<void> {
  const key = CACHE_PREFIX + cardName;
  const value: CachedPrice = { priceEur, fetchedAt: Date.now() };
  await chrome.storage.local.set({ [key]: value });
}

/** Cheapest known printing price in EUR for a card, from Scryfall's Cardmarket-derived price data. */
export async function getReferencePriceEur(
  cardName: string,
): Promise<number | null> {
  const cached = await readCache(cardName);
  if (cached) return cached.priceEur;

  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`!"${cardName}"`)}&unique=prints&order=eur`;
  const response = await fetch(url);
  if (!response.ok) {
    await writeCache(cardName, null);
    return null;
  }

  const data = (await response.json()) as {
    data?: Array<{ prices?: { eur?: string | null } }>;
  };
  const priceEur = data.data?.[0]?.prices?.eur
    ? Number.parseFloat(data.data[0].prices.eur)
    : null;
  await writeCache(cardName, priceEur);
  return priceEur;
}
