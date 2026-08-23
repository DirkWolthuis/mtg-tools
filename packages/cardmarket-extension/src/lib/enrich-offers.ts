import type { Offer } from './parse-offers.js';
import type { ScryfallCard } from './scryfall.js';
import type {
  FetchScryfallCardMessage,
  FetchScryfallCardResponse,
} from './scryfall-messages.js';

// Scryfall asks integrations to leave ~50-100ms between sequential requests,
// see https://scryfall.com/docs/api/rate-limits.
const REQUEST_DELAY_MS = 100;
const LOG_PREFIX = '[cardmarket-offers-grid:enrich]';

function requestScryfallCard(
  cardmarketId: string,
): Promise<ScryfallCard | null> {
  const message: FetchScryfallCardMessage = {
    type: 'fetch-scryfall-card',
    cardmarketId,
  };
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      message,
      (response: FetchScryfallCardResponse | undefined) => {
        // lastError is set (instead of throwing) when there's no listener on the
        // other end, e.g. the background service worker isn't registered/loaded.
        if (chrome.runtime.lastError) {
          console.debug(
            LOG_PREFIX,
            'sendMessage failed',
            chrome.runtime.lastError.message,
          );
          resolve(null);
          return;
        }
        resolve(response?.card ?? null);
      },
    );
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Looks up each offer's Scryfall card by its Cardmarket `cardmarketId` and
 * returns new offers with the full response stored on `scryfallCard`. Offers
 * without a `cardmarketId` are returned unchanged. Requests run sequentially
 * (with a small delay) to respect Scryfall's rate limit.
 */
export async function enrichOffersWithScryfallData(
  offers: Offer[],
): Promise<Offer[]> {
  const enriched: Offer[] = [];
  for (const offer of offers) {
    if (!offer.cardmarketId) {
      console.debug(
        LOG_PREFIX,
        'skipping offer, no cardmarketId parsed',
        offer.name,
      );
      enriched.push(offer);
      continue;
    }
    console.debug(
      LOG_PREFIX,
      'requesting scryfall card for cardmarketId',
      offer.cardmarketId,
    );
    const scryfallCard = await requestScryfallCard(offer.cardmarketId);
    console.debug(
      LOG_PREFIX,
      'received scryfall card for cardmarketId',
      offer.cardmarketId,
      scryfallCard,
    );
    enriched.push({ ...offer, scryfallCard });
    await delay(REQUEST_DELAY_MS);
  }
  return enriched;
}
