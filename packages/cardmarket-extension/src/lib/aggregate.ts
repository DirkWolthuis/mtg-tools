import type { CardSummary, OfferRow } from './types.js';

export function summarizeOffers(
  offers: OfferRow[],
  referencePrices: ReadonlyMap<string, number>,
): CardSummary[] {
  const byCard = new Map<string, OfferRow[]>();
  for (const offer of offers) {
    const existing = byCard.get(offer.cardName);
    if (existing) existing.push(offer);
    else byCard.set(offer.cardName, [offer]);
  }

  const summaries: CardSummary[] = [];
  for (const [cardName, cardOffers] of byCard) {
    const cheapest = cardOffers.reduce((min, offer) =>
      offer.priceEur < min.priceEur ? offer : min,
    );
    const referencePriceEur = referencePrices.get(cardName) ?? null;

    summaries.push({
      cardName,
      offerCount: cardOffers.length,
      cheapestPriceEur: cheapest.priceEur,
      cheapestExpansion: cheapest.expansion,
      referencePriceEur,
      deltaEur:
        referencePriceEur === null
          ? null
          : cheapest.priceEur - referencePriceEur,
    });
  }

  return summaries.sort((a, b) => a.cardName.localeCompare(b.cardName));
}
