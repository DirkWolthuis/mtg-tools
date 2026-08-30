import type { ScryfallCard as ScryfallCardTypes } from '@scryfall/api-types';

/** Full JSON response for a single card, see https://scryfall.com/docs/api/cards. */
export type ScryfallCard = ScryfallCardTypes.Any;

const COLLECTION_URL = 'https://api.scryfall.com/cards/collection';
// https://scryfall.com/docs/api/cards/collection - max 75 identifiers per request.
const BATCH_SIZE = 75;
// https://scryfall.com/docs/api/cards/collection - documented rate limit is 2 requests/second.
const REQUEST_DELAY_MS = 500;

export interface ScryfallCollectionResult {
  cards: ScryfallCard[];
  notFound: string[];
}

interface ScryfallCollectionResponse {
  data: ScryfallCard[];
  not_found: Array<{ name?: string }>;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Looks up `names` via Scryfall's bulk `/cards/collection` endpoint, batching and rate-limiting requests. */
export async function fetchScryfallCollection(
  names: string[],
): Promise<ScryfallCollectionResult> {
  const cards: ScryfallCard[] = [];
  const notFound: string[] = [];
  const batches = chunk(names, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    if (i > 0) await delay(REQUEST_DELAY_MS);

    const response = await fetch(COLLECTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Scryfall rejects requests with a default HTTP-library User-Agent.
        // https://scryfall.com/docs/api/rate-limits
        'User-Agent': '@org/collection-stats (mtg-tools)',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        identifiers: batches[i].map((name) => ({ name })),
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Scryfall collection request failed with status ${response.status}`,
      );
    }

    const body = (await response.json()) as ScryfallCollectionResponse;
    cards.push(...body.data);
    notFound.push(
      ...body.not_found.map((identifier) => identifier.name ?? '(unknown)'),
    );
  }

  return { cards, notFound };
}
