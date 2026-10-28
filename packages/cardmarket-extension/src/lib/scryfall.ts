import type { ScryfallCard as ScryfallCardTypes } from '@scryfall/api-types';

/** Full JSON response for a single card, see https://scryfall.com/docs/api/cards. */
export type ScryfallCard = ScryfallCardTypes.Any;

const CARDMARKET_LOOKUP_URL = 'https://api.scryfall.com/cards/cardmarket/';
const CARDS_URL = 'https://api.scryfall.com/cards';
const LOG_PREFIX = '[cardmarket-offers-grid:scryfall]';

/**
 * Looks up a card by its Cardmarket product id (`idProduct`), per
 * https://scryfall.com/docs/api/cards/cardmarket. Returns `null` if Scryfall
 * has no card for that id.
 */
export async function fetchScryfallCardByCardmarketId(
  cardmarketId: string,
): Promise<ScryfallCard | null> {
  const url = `${CARDMARKET_LOOKUP_URL}${encodeURIComponent(cardmarketId)}`;
  console.debug(LOG_PREFIX, 'fetching', url);
  const response = await fetch(url);
  console.debug(LOG_PREFIX, 'response status', response.status, 'for', url);
  if (!response.ok) return null;
  return (await response.json()) as ScryfallCard;
}

/**
 * Looks up the printing of a card in a specific language, by set code and
 * collector number, per https://scryfall.com/docs/api/cards/collector.
 * Returns `null` if Scryfall has no print in that language for this
 * set/number (most non-English languages only exist for a subset of sets).
 */
export async function fetchScryfallCardPrint(
  set: string,
  collectorNumber: string,
  lang: string,
): Promise<ScryfallCard | null> {
  const url = `${CARDS_URL}/${encodeURIComponent(set)}/${encodeURIComponent(collectorNumber)}/${encodeURIComponent(lang)}`;
  console.debug(LOG_PREFIX, 'fetching', url);
  const response = await fetch(url);
  console.debug(LOG_PREFIX, 'response status', response.status, 'for', url);
  if (!response.ok) return null;
  return (await response.json()) as ScryfallCard;
}
