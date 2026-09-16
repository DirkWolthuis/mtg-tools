import type { Offer } from './parse-offers.js';
import type { ScryfallCard } from './scryfall.js';

export interface PriceDiffFromAverage {
  /** Offer price minus average price, in EUR. */
  absolute: number;
  /** Offer price relative to average price, e.g. 0.15 means 15% above average. */
  percentage: number;
}

/**
 * Diffs an offer's price against Scryfall's average EUR price for that
 * printing (using the foil price when the offer itself is foil). Returns
 * `null` when either price is missing/unparseable, or the offer isn't priced
 * in EUR (Scryfall's average is always EUR, so other currencies aren't comparable).
 */
export function computePriceDiffFromAverage(
  offer: Pick<Offer, 'price' | 'foil'>,
  scryfallCard: ScryfallCard | null,
): PriceDiffFromAverage | null {
  if (!scryfallCard) return null;
  if (!offer.price || offer.price.currency !== 'EUR') return null;
  // Scryfall's `prices` values are already plain decimal strings (dot separator, no thousands grouping).
  const averagePriceText = offer.foil
    ? scryfallCard.prices?.eur_foil
    : scryfallCard.prices?.eur;
  if (!averagePriceText) return null;
  const averagePrice = parseFloat(averagePriceText);
  if (Number.isNaN(averagePrice)) return null;
  return {
    absolute: offer.price.amount - averagePrice,
    percentage: (offer.price.amount - averagePrice) / averagePrice,
  };
}

