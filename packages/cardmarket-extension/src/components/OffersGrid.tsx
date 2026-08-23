import type { Offer } from '../lib/parse-offers.js';
import { OfferCard } from './OfferCard.js';

export interface OffersGridProps {
  offers: Offer[];
}

/** Placeholder offers grid - structural layout only, no visual design. */
export function OffersGrid({ offers }: OffersGridProps) {
  console.debug(
    '[cardmarket-offers-grid] rendering offers grid with',
    offers,
    'offer(s)',
  );
  if (offers.length === 0) {
    return <p data-testid="offers-grid-empty">No offers found.</p>;
  }

  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      data-testid="offers-grid"
    >
      {offers.map((offer, index) => (
        <OfferCard key={index} offer={offer} />
      ))}
    </div>
  );
}
