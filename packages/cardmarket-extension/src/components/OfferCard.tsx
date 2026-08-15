import type { Offer } from '../lib/parse-offers.js';

export interface OfferCardProps {
  offer: Offer;
}

/** Placeholder single-offer card - structural layout only, no visual design. */
export function OfferCard({ offer }: OfferCardProps) {
  return (
    <div
      className="flex flex-col border border-gray-300 p-2"
      data-testid="offer-card"
    >
      <div className="mb-2 flex aspect-[5/7] items-center justify-center bg-gray-100">
        {offer.imageUrl ? (
          <img
            src={offer.imageUrl}
            alt={offer.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-xs text-gray-400">No image</span>
        )}
      </div>
      <span className="font-medium">{offer.name}</span>
      {offer.quantity && (
        <span className="text-sm text-gray-500">{offer.quantity}</span>
      )}
      {offer.priceText && <span className="text-sm">{offer.priceText}</span>}
    </div>
  );
}
