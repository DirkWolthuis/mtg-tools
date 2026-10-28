import type { CubeStats } from '@org/cubecobra-stats';
import type { Offer } from './parse-offers.js';
import { computePriceDiffFromAverage } from './post-process-scryfall-card.js';
import type { ScryfallCard } from './scryfall.js';
import type {
  FetchScryfallCardMessage,
  FetchScryfallCardResponse,
} from './scryfall-messages.js';

const LOG_PREFIX = '[cardmarket-offers-grid:enrich]';

interface ScryfallCardLookup {
  card: ScryfallCard | null;
  cubeStats: CubeStats | null;
  imageUrl: string | null;
}

function requestScryfallCard(
  cardmarketId: string,
  language: string | null,
): Promise<ScryfallCardLookup> {
  const message: FetchScryfallCardMessage = {
    type: 'fetch-scryfall-card',
    cardmarketId,
    language,
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
          resolve({ card: null, cubeStats: null, imageUrl: null });
          return;
        }
        resolve({
          card: response?.card ?? null,
          cubeStats: response?.cubeStats ?? null,
          imageUrl: response?.imageUrl ?? null,
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
    const { card: scryfallCard, cubeStats, imageUrl } =
      await requestScryfallCard(offer.cardmarketId, offer.language?.label ?? null);
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
    // Cardmarket's page doesn't expose the set's official abbreviation, only
    // its full name - fill it in from Scryfall's set code once available.
    const set =
      offer.set && scryfallCard?.set
        ? { ...offer.set, code: scryfallCard.set.toUpperCase() }
        : offer.set;
    enriched.push({
      ...offer,
      set,
      // Scryfall's own (language-matched) image replaces Cardmarket's low-res
      // thumbnail; fall back to that thumbnail if Scryfall has no image.
      imageUrl: imageUrl ?? offer.imageUrl,
      scryfallCard,
      priceDiffFromAverage,
      cubeStats,
    });
  }
  return enriched;
}
