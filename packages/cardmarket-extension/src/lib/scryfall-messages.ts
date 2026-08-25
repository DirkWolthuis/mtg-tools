import type { CubeStats } from './post-process-scryfall-card.js';
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
}

export interface FetchScryfallCardResponse {
  card: ScryfallCard | null;
  cubeStats: CubeStats | null;
}
