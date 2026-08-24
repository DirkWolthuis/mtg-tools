import { fetchScryfallCardByCardmarketId } from '../lib/scryfall.js';
import type {
  FetchScryfallCardMessage,
  FetchScryfallCardResponse,
} from '../lib/scryfall-messages.js';
import {
  getCachedScryfallCard,
  setCachedScryfallCard,
} from './scryfall-cache.js';

const LOG_PREFIX = '[cardmarket-offers-grid:background]';

console.debug(LOG_PREFIX, 'service worker started');

chrome.runtime.onMessage.addListener(
  (message: FetchScryfallCardMessage, _sender, sendResponse) => {
    console.debug(LOG_PREFIX, 'received message', message);
    if (message?.type !== 'fetch-scryfall-card') return undefined;

    const cached = getCachedScryfallCard(message.cardmarketId);
    if (cached !== undefined) {
      console.debug(LOG_PREFIX, 'cache hit for', message.cardmarketId, cached);
      sendResponse({ card: cached } satisfies FetchScryfallCardResponse);
      return undefined;
    }

    fetchScryfallCardByCardmarketId(message.cardmarketId)
      .then((card) => {
        console.debug(
          LOG_PREFIX,
          'resolved card for',
          message.cardmarketId,
          card,
        );
        setCachedScryfallCard(message.cardmarketId, card);
        sendResponse({ card } satisfies FetchScryfallCardResponse);
      })
      .catch((error: unknown) => {
        console.debug(LOG_PREFIX, 'scryfall lookup failed', error);
        sendResponse({ card: null } satisfies FetchScryfallCardResponse);
      });

    return true; // keep the message channel open for the async sendResponse above
  },
);
