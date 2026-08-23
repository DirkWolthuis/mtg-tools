import { fetchScryfallCardByCardmarketId } from '../lib/scryfall.js';
import type {
  FetchScryfallCardMessage,
  FetchScryfallCardResponse,
} from '../lib/scryfall-messages.js';

const LOG_PREFIX = '[cardmarket-offers-grid:background]';

console.debug(LOG_PREFIX, 'service worker started');

chrome.runtime.onMessage.addListener(
  (message: FetchScryfallCardMessage, _sender, sendResponse) => {
    console.debug(LOG_PREFIX, 'received message', message);
    if (message?.type !== 'fetch-scryfall-card') return undefined;

    fetchScryfallCardByCardmarketId(message.cardmarketId)
      .then((card) => {
        console.debug(
          LOG_PREFIX,
          'resolved card for',
          message.cardmarketId,
          card,
        );
        sendResponse({ card } satisfies FetchScryfallCardResponse);
      })
      .catch((error: unknown) => {
        console.debug(LOG_PREFIX, 'scryfall lookup failed', error);
        sendResponse({ card: null } satisfies FetchScryfallCardResponse);
      });

    return true; // keep the message channel open for the async sendResponse above
  },
);
