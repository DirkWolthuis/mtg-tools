import { getScryfallImageUrl } from '../lib/post-process-scryfall-card.js';
import { mapCardmarketLanguageToScryfallCode } from '../lib/scryfall-language.js';
import {
  fetchScryfallCardByCardmarketId,
  fetchScryfallCardPrint,
  type ScryfallCard,
} from '../lib/scryfall.js';
import type {
  FetchScryfallCardMessage,
  FetchScryfallCardResponse,
} from '../lib/scryfall-messages.js';
import { getCubeStatsForId } from './cube-stats-cache.js';
import {
  getCachedScryfallCard,
  getCachedScryfallPrint,
  setCachedScryfallCard,
  setCachedScryfallPrint,
} from './scryfall-cache.js';

const LOG_PREFIX = '[cardmarket-offers-grid:background]';

// Scryfall asks integrations to leave ~50-100ms between sequential requests,
// see https://scryfall.com/docs/api/rate-limits.
const REQUEST_DELAY_MS = 100;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolves `cardmarketId`'s Scryfall card, from cache if possible, only delaying for actual network fetches. */
async function resolveScryfallCard(
  cardmarketId: string,
): Promise<ScryfallCard | null> {
  const cached = getCachedScryfallCard(cardmarketId);
  if (cached !== undefined) {
    console.debug(LOG_PREFIX, 'cache hit for', cardmarketId, cached);
    return cached;
  }
  const card = await fetchScryfallCardByCardmarketId(cardmarketId);
  console.debug(LOG_PREFIX, 'resolved card for', cardmarketId, card);
  setCachedScryfallCard(cardmarketId, card);
  await delay(REQUEST_DELAY_MS);
  return card;
}

/**
 * Resolves the grid image to show for this offer: when `language` maps to a
 * Scryfall language code other than `card`'s own, fetches that language's
 * print and uses its image (falling back to `card`'s own image if that
 * language print/image doesn't exist).
 */
async function resolveImageUrl(
  card: ScryfallCard | null,
  language: string | null,
): Promise<string | null> {
  const lang = mapCardmarketLanguageToScryfallCode(language);
  if (!card || !lang || lang === card.lang) {
    return getScryfallImageUrl(card);
  }

  const { set, collector_number: collectorNumber } = card;
  const cached = getCachedScryfallPrint(set, collectorNumber, lang);
  let print: ScryfallCard | null;
  if (cached !== undefined) {
    console.debug(LOG_PREFIX, 'print cache hit for', set, collectorNumber, lang);
    print = cached;
  } else {
    print = await fetchScryfallCardPrint(set, collectorNumber, lang);
    console.debug(LOG_PREFIX, 'resolved print for', set, collectorNumber, lang, print);
    setCachedScryfallPrint(set, collectorNumber, lang, print);
    await delay(REQUEST_DELAY_MS);
  }
  return getScryfallImageUrl(print) ?? getScryfallImageUrl(card);
}

console.debug(LOG_PREFIX, 'service worker started');

chrome.runtime.onMessage.addListener(
  (message: FetchScryfallCardMessage, _sender, sendResponse) => {
    console.debug(LOG_PREFIX, 'received message', message);
    if (message?.type !== 'fetch-scryfall-card') return undefined;

    (async () => {
      try {
        const card = await resolveScryfallCard(message.cardmarketId);
        const [cubeStats, imageUrl] = await Promise.all([
          getCubeStatsForId(card?.id).catch((error: unknown) => {
            console.debug(LOG_PREFIX, 'cube stats lookup failed', error);
            return null;
          }),
          resolveImageUrl(card, message.language),
        ]);
        sendResponse({ card, cubeStats, imageUrl } satisfies FetchScryfallCardResponse);
      } catch (error) {
        console.debug(LOG_PREFIX, 'scryfall lookup failed', error);
        sendResponse({
          card: null,
          cubeStats: null,
          imageUrl: null,
        } satisfies FetchScryfallCardResponse);
      }
    })();

    return true; // keep the message channel open for the async sendResponse above
  },
);
