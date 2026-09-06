/** Minimal shape of a Scryfall card needed to render an image tile, covering both single- and multi-faced cards. */
export interface ScryfallCardImage {
  id: string;
  name: string;
  image_uris?: { normal?: string; small?: string };
  card_faces?: Array<{ image_uris?: { normal?: string; small?: string } }>;
}

interface ScryfallCollectionResponse {
  data: ScryfallCardImage[];
  not_found: Array<{ id?: string }>;
}

const COLLECTION_URL = 'https://api.scryfall.com/cards/collection';
// https://scryfall.com/docs/api/cards/collection - max 75 identifiers per request.
const BATCH_SIZE = 75;
// https://scryfall.com/docs/api/cards/collection - documented rate limit is 2 requests/second.
const REQUEST_DELAY_MS = 500;

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

/**
 * Looks up cards by Scryfall id via the bulk `/cards/collection` endpoint, batching and
 * rate-limiting requests. Used to rehydrate a shared diff link's card ids into images/names
 * without needing to re-fetch anything from CubeCobra.
 */
export async function fetchScryfallCardsByIds(
  ids: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<Map<string, ScryfallCardImage>> {
  const uniqueIds = [...new Set(ids)];
  const cardsById = new Map<string, ScryfallCardImage>();
  const batches = chunk(uniqueIds, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    if (i > 0) await delay(REQUEST_DELAY_MS);

    const response = await fetchImpl(COLLECTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        identifiers: batches[i].map((id) => ({ id })),
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Scryfall collection request failed with status ${response.status}`,
      );
    }

    const body = (await response.json()) as ScryfallCollectionResponse;
    for (const card of body.data) {
      cardsById.set(card.id, card);
    }
  }

  return cardsById;
}

/** Picks the best available image URIs for a card, falling back to its first face for double-faced cards. */
export function pickImageUris(card: ScryfallCardImage): {
  normal?: string;
  small?: string;
} {
  return card.image_uris ?? card.card_faces?.[0]?.image_uris ?? {};
}
