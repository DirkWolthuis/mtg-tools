import type { Offer, SpriteIcon } from '../lib/parse-offers.js';
import { findBuyButton } from '../lib/parse-offers.js';

export interface OfferCardProps {
  offer: Offer;
}

// Background colors per Cardmarket's official condition scale (see
// https://help.cardmarket.com/en/CardCondition), badge text is always white.
const CONDITION_COLORS: Record<string, string> = {
  MT: '#17a2b8',
  NM: '#3caf56',
  EX: '#82891e',
  GD: '#ffc107',
  LP: '#fd8b2b',
  PL: '#e56874',
  PO: '#dc3545',
};
const FALLBACK_CONDITION_COLOR = '#6c757d';

/** Renders one Cardmarket sprite-sheet icon (set, language or foil) via its original background-image/position. */
function OfferIcon({ icon, invert }: { icon: SpriteIcon; invert?: boolean }) {
  return (
    <span
      title={icon.label}
      aria-label={icon.label}
      className={`inline-block shrink-0 bg-no-repeat ${invert ? 'invert' : ''}`}
      style={{
        width: icon.width,
        height: icon.height,
        backgroundImage: `url(${icon.imageUrl})`,
        backgroundPosition: icon.position,
      }}
    />
  );
}

export function Price({ offer }: OfferCardProps) {
  const diff = offer.priceDiffFromAverage;
  return (
    <span className="text-sm">
      {offer.priceText}
      {diff &&
        ` (${diff.absolute >= 0 ? '+' : ''}${diff.absolute.toFixed(2)} €, ${(diff.percentage * 100).toFixed(0)}%)`}
    </span>
  );
}

function CubeStats({ offer }: OfferCardProps) {
  const stats = offer.cubeStats;
  if (!stats) return null;
  return (
    <span className="text-xs text-gray-500">
      Elo {stats.elo.toFixed(0)} · in {stats.popularity.toFixed(1)}% cubes · (
      {stats.cubeCount})
    </span>
  );
}

/** Clicks the original (untouched, still in-page) buy button - moving/cloning it made Cardmarket's own add-to-cart request get rejected (403). */
function Actions({ offer }: OfferCardProps) {
  if (!offer.actionsElement) return null;
  return (
    <button
      type="button"
      className="mt-2 rounded bg-blue-600 px-2 py-1 text-sm text-white"
      data-testid="offer-card-actions"
      onClick={() => findBuyButton(offer.actionsElement!)?.click()}
    >
      Add
    </button>
  );
}

/** Placeholder single-offer card - structural layout only, no visual design. */
export function OfferCard({ offer }: OfferCardProps) {
  return (
    <div
      className="flex flex-col border border-gray-300 p-2"
      data-testid="offer-card"
    >
      <a
        href={offer.cardUrl}
        className="cursor-pointer mb-2 flex aspect-5/7 items-center justify-center bg-gray-100"
      >
        {offer.imageUrl ? (
          <img
            src={offer.imageUrl}
            alt={offer.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-xs text-gray-400">No image</span>
        )}
      </a>
      <a href={offer.cardUrl} className="font-medium">
        {offer.name}
      </a>
      {offer.set && (
        <span className="flex items-center gap-1 text-sm text-gray-600">
          <OfferIcon icon={offer.set} invert />
          {offer.set.label}
        </span>
      )}
      <div className="mt-1 flex items-center gap-1">
        {offer.language && <OfferIcon icon={offer.language} />}
        {offer.condition && (
          <span
            title={offer.condition.label}
            className="rounded px-1 text-xs font-semibold text-white"
            style={{
              backgroundColor:
                CONDITION_COLORS[offer.condition.abbreviation] ??
                FALLBACK_CONDITION_COLOR,
            }}
          >
            {offer.condition.abbreviation}
          </span>
        )}
        {offer.foil && <OfferIcon icon={offer.foil} />}
      </div>
      {offer.quantity && (
        <span className="text-sm text-gray-500">{offer.quantity}</span>
      )}
      {offer.priceText && <Price offer={offer} />}
      <CubeStats offer={offer} />
      <Actions offer={offer} />
    </div>
  );
}
