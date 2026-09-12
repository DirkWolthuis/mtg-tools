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
    <div className="flex flex-col gap-1">
      <span className="text-lg">{offer.priceText}</span>
      {diff && (
        <span className="text-sm text-base-content/60">
          {` (${diff.absolute >= 0 ? '+' : ''}${diff.absolute.toFixed(2)} €, ${(diff.percentage * 100).toFixed(0)}%)`}
        </span>
      )}
    </div>
  );
}

function CubeStats({ offer }: OfferCardProps) {
  const stats = offer.cubeStats;
  if (!stats) return null;
  return (
    <span className="text-xs text-base-content/60">
      Elo {stats.elo.toFixed(0)} · in {stats.popularity.toFixed(1)}% cubes · (
      {stats.cubeCount})
    </span>
  );
}

/** Clicks the original (untouched, still in-page) buy button - moving/cloning it made Cardmarket's own add-to-cart request get rejected (403). */
function Actions({ offer }: OfferCardProps) {
  const element = offer.actionsElement;
  if (!element) return null;
  return (
    <button
      type="button"
      className="btn btn-primary"
      data-testid="offer-card-actions"
      onClick={() => findBuyButton(element)?.click()}
    >
      Add
    </button>
  );
}

/** Placeholder single-offer card - structural layout only, no visual design. */
export function OfferCard({ offer }: OfferCardProps) {
  const card = (
    <div className="card bg-base-300 shadow-sm" data-testid="offer-card">
      <figure>
        <img src={offer.imageUrl ?? ''} alt={offer.name} />
      </figure>

      <div className="card-body">
        <h2 className="card-title"> {offer.name}</h2>
        {offer.priceText && <Price offer={offer} />}

        {offer.set && (
          <span className="flex items-center gap-1 text-sm text-base-content/60">
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
          <span className="text-sm text-base-content/60">{offer.quantity}</span>
        )}
        <CubeStats offer={offer} />
        <Actions offer={offer} />
      </div>
    </div>
  );

  const cardLess = (
    <div>
      <figure>
        <img src={offer.imageUrl ?? ''} alt={offer.name} />
      </figure>

      <div className="flex flex-col">
        <h2 className="card-title"> {offer.name}</h2>
        {offer.priceText && <Price offer={offer} />}

        {offer.set && (
          <span className="flex items-center gap-1 text-sm text-base-content/60">
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
          <span className="text-sm text-base-content/60">{offer.quantity}</span>
        )}
        <CubeStats offer={offer} />
        <Actions offer={offer} />
      </div>
    </div>
  );

  return cardLess;
}
