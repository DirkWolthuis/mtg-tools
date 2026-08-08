export interface OfferRow {
  /** Stable id used to de-duplicate offers captured across multiple page visits. */
  id: string;
  cardName: string;
  expansion: string;
  condition: string;
  priceEur: number;
}

export interface SellerCapture {
  seller: string;
  wantslistId: string;
  capturedAt: string;
  offers: OfferRow[];
}

export interface CardSummary {
  cardName: string;
  offerCount: number;
  cheapestPriceEur: number;
  cheapestExpansion: string;
  referencePriceEur: number | null;
  deltaEur: number | null;
}
