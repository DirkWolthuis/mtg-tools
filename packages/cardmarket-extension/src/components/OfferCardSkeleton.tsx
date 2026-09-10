/** Placeholder shown in place of an OfferCard while Scryfall enrichment is in flight. */
export function OfferCardSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col border border-gray-300 p-2"
      data-testid="offer-card-skeleton"
      aria-hidden="true"
    >
      <div className="mb-2 aspect-5/7 bg-gray-200" />
      <div className="mb-1 h-4 w-3/4 bg-gray-200" />
      <div className="mb-1 h-3 w-1/2 bg-gray-200" />
      <div className="h-3 w-1/3 bg-gray-200" />
    </div>
  );
}
