import type { Offer } from '../lib/parse-offers.js';
import { OfferCard } from './OfferCard.js';
import { OfferCardSkeleton } from './OfferCardSkeleton.js';

export interface OffersGridProps {
  offers: Offer[];
  /** Shows skeleton placeholders (one per offer) instead of real cards while enrichment is in flight. */
  isLoading?: boolean;
  /** Fixed number of cards per row; omit for a responsive auto-fit layout. */
  columns?: number;
  /** Gap between cards in pixels. */
  gap?: number;
  /** Whether to show each card's cube stats (elo/popularity), when available. */
  showCubeStats?: boolean;
}

/** CSS Grid based offers grid. Column count and gap are overwriteable via CSS custom properties (see styles/grid.css). */
export function OffersGrid({
  offers,
  isLoading,
  columns,
  gap,
  showCubeStats,
}: OffersGridProps) {
  console.debug(
    '[cardmarket-offers-grid] rendering offers grid with',
    offers,
    'offer(s)',
    isLoading ? '(loading)' : '',
  );

  if (!isLoading && offers.length === 0) {
    return <p data-testid="offers-grid-empty">No offers found.</p>;
  }

  return (
    <div
      className="offers-grid"
      style={{
        ...(columns ? { '--offers-grid-columns': columns } : undefined),
        ...(gap !== undefined
          ? { '--offers-grid-gap': `${gap * 1.2}px ${gap}px` }
          : undefined),
      }}
      data-testid="offers-grid"
      aria-busy={isLoading || undefined}
    >
      {isLoading
        ? offers.map((_, index) => <OfferCardSkeleton key={index} />)
        : offers.map((offer, index) => (
            <OfferCard
              key={index}
              offer={offer}
              showCubeStats={showCubeStats}
            />
          ))}
    </div>
  );
}
