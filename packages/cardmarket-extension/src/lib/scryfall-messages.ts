import type { CubeStats } from '@org/cubecobra-stats';
import type { ScryfallCard } from './scryfall.js';

// Content scripts can't reliably call external APIs directly - fetches made
// from a content script are subject to the host page's CSP (connect-src),
// which Cardmarket doesn't allow-list for api.scryfall.com. So the actual
// fetch runs in the background service worker; the content script sends one
// of these messages and gets a response back. Kept as `import type` only so
// this stays a type-only (erased) dependency for whichever bundle imports it.
export interface FetchScryfallCardMessage {
  type: 'fetch-scryfall-card';
  cardmarketId: string;
  /** The offer's language sprite label (e.g. `"German"`), if any - used to fetch
   * that specific language's print image instead of the card's default one. */
  language: string | null;
}

export interface FetchScryfallCardResponse {
  card: ScryfallCard | null;
  cubeStats: CubeStats | null;
  /** Best-available grid image for the offer: the requested language's print
   * image when found, otherwise `card`'s own image, otherwise `null`. */
  imageUrl: string | null;
}
