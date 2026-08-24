/** Full JSON response for a single card, see https://scryfall.com/docs/api/cards. Deliberately untyped field-by-field - we store the whole response as-is. */
export type ScryfallCard = Record<string, any>;

const CARDMARKET_LOOKUP_URL = 'https://api.scryfall.com/cards/cardmarket/';
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
