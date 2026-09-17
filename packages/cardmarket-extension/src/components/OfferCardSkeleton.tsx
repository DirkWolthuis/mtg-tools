/** Placeholder shown in place of an OfferCard while Scryfall enrichment is in flight. */
export function OfferCardSkeleton() {
  return (
    <div class="flex flex-col gap-4" data-testid="offer-card-skeleton">
      <div class="skeleton h-32 w-full"></div>
      <div class="skeleton h-4 w-28"></div>
      <div class="skeleton h-4 w-full"></div>
      <div class="skeleton h-4 w-full"></div>
    </div>
  );
}
