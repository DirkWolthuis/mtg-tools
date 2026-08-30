import type { Offer } from './parse-offers.js';
import type { ScryfallCard } from './scryfall.js';

export interface PriceDiffFromAverage {
  /** Offer price minus average price, in EUR. */
  absolute: number;
  /** Offer price relative to average price, e.g. 0.15 means 15% above average. */
  percentage: number;
}

/** Parses Cardmarket's `"1.234,56 €"` format (dot thousands separator, comma decimal separator) into a number. */
export function parsePrice(priceText: string | null): number | null {
  if (!priceText) return null;
  const normalized = priceText
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const value = parseFloat(normalized);
  return Number.isNaN(value) ? null : value;
}

/**
 * Diffs an offer's price against Scryfall's average EUR price for that
 * printing (using the foil price when the offer itself is foil). Returns
 * `null` when either price is missing or unparseable.
 */
export function computePriceDiffFromAverage(
  offer: Pick<Offer, 'priceText' | 'foil'>,
  scryfallCard: ScryfallCard | null,
): PriceDiffFromAverage | null {
  if (!scryfallCard) return null;
  const offerPrice = parsePrice(offer.priceText);
  if (offerPrice === null) return null;
  // Scryfall's `prices` values are already plain decimal strings (dot separator, no thousands grouping).
  const averagePriceText = offer.foil
    ? scryfallCard.prices?.eur_foil
    : scryfallCard.prices?.eur;
  if (!averagePriceText) return null;
  const averagePrice = parseFloat(averagePriceText);
  if (Number.isNaN(averagePrice)) return null;
  return {
    absolute: offerPrice - averagePrice,
    percentage: (offerPrice - averagePrice) / averagePrice,
  };
}
