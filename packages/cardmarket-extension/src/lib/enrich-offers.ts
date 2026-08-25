import type { Offer } from './parse-offers.js';
import {
  computePriceDiffFromAverage,
  type CubeStats,
} from './post-process-scryfall-card.js';
import type { ScryfallCard } from './scryfall.js';
import type {
  FetchScryfallCardMessage,
  FetchScryfallCardResponse,
} from './scryfall-messages.js';

const LOG_PREFIX = '[cardmarket-offers-grid:enrich]';

interface ScryfallCardLookup {
  card: ScryfallCard | null;
  cubeStats: CubeStats | null;
}

function requestScryfallCard(
  cardmarketId: string,
): Promise<ScryfallCardLookup> {
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
          resolve({ card: null, cubeStats: null });
          return;
        }
        resolve({
          card: response?.card ?? null,
          cubeStats: response?.cubeStats ?? null,
        });
      },
    );
  });
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
    const { card: scryfallCard, cubeStats } = await requestScryfallCard(
      offer.cardmarketId,
    );
    console.debug(
      LOG_PREFIX,
      'received scryfall card for cardmarketId',
      offer.cardmarketId,
      scryfallCard,
    );
    const priceDiffFromAverage = computePriceDiffFromAverage(
      offer,
      scryfallCard,
    );
    enriched.push({ ...offer, scryfallCard, priceDiffFromAverage, cubeStats });
  }
  return enriched;
}
