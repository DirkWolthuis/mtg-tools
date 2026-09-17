import type { Offer, SpriteIcon } from '../lib/parse-offers.js';
import { findBuyButton } from '../lib/parse-offers.js';
import { PriceDiffFromAverage } from '../lib/post-process-scryfall-card.js';

export interface OfferCardProps {
  offer: Offer;
  /** Whether to render the cube stats slot (elo/popularity), when available. Defaults to true. */
  showCubeStats?: boolean;
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
  const price = offer.price;
  return (
    <div className="flex gap-2">
      {price && (
        <span className="text-sm text-base-content">
          {new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: price.currency,
          }).format(price.amount)}
        </span>
      )}
      {diff && <PriceDiff priceDiffFromAverage={diff} />}
    </div>
  );
}

export function PriceDiff({
  priceDiffFromAverage,
}: {
  priceDiffFromAverage: PriceDiffFromAverage;
}) {
  const diff = priceDiffFromAverage;
  const diffPositive = diff.absolute >= 0;

  return (
    <span
      data-tip="Difference from monthly average price based on Scryfall data"
      className={`tooltip badge badge-sm ${diffPositive ? 'badge-error' : 'badge-success'}`}
    >
      €{` ${diffPositive ? '+' : '-'}${Math.abs(diff.absolute).toFixed(2)} `}
    </span>
  );
}

function CubeStats({ offer }: OfferCardProps) {
  const stats = offer.cubeStats;
  if (!stats) return null;
  return (
    <span className="text-xs text-base-content/60">
      {stats.elo.toFixed(0)} elo · {stats.popularity.toFixed(1)}% of cubes
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
      className="btn btn-soft btn-primary w-full"
      data-testid="offer-card-actions"
      onClick={() => findBuyButton(element)?.click()}
    >
      Add
    </button>
  );
}

/** Placeholder single-offer card - structural layout only, no visual design. */
export function OfferCard({ offer, showCubeStats = true }: OfferCardProps) {
  const card = (
    <div className="flex h-full flex-col space-y-4" data-testid="offer-card">
      <div className="relative">
        <figure className="aspect-5/7 overflow-hidden">
          {offer.imageUrl && (
            <img
              src={offer.imageUrl}
              alt={offer.name}
              className="h-full w-full object-cover"
            />
          )}
        </figure>
        <div className="absolute inset-x-0 bottom-0 p-4 flex flex-row-reverse flex-wrap-reverse content-end gap-1">
          {offer.set && (
            <div
              className="tooltip"
              data-tip={offer.set.label}
              data-testid="offer-card-set-tooltip"
            >
              <div className="badge badge-sm">
                <span className="flex items-center gap-1">
                  <OfferIcon icon={offer.set} invert />
                  {offer.set.code ?? ''}
                </span>
              </div>
            </div>
          )}
          {offer.condition && (
            <div
              className="tooltip"
              data-tip={offer.condition.label}
              data-testid="offer-card-condition-tooltip"
            >
              <div
                className="badge badge-sm"
                style={{
                  borderColor:
                    CONDITION_COLORS[offer.condition.abbreviation] ??
                    FALLBACK_CONDITION_COLOR,
                  backgroundColor:
                    CONDITION_COLORS[offer.condition.abbreviation] ??
                    FALLBACK_CONDITION_COLOR,
                }}
              >
                <span>{offer.condition.abbreviation}</span>
              </div>
            </div>
          )}
          {offer.language && (
            <div
              className="tooltip"
              data-tip={offer.language.label}
              data-testid="offer-card-language-tooltip"
            >
              <div className="badge badge-sm">
                <OfferIcon icon={offer.language} />
              </div>
            </div>
          )}
          {offer.foil && (
            <div className="badge badge-sm">
              <OfferIcon icon={offer.foil} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="mb-4">
          <a className="link link-hover" href={offer.cardUrl}>
            <h2 className="text-base font-title font-semibold">{offer.name}</h2>
          </a>
          {offer.price && (
            <div className="mt-2">
              <Price offer={offer} />
            </div>
          )}
        </div>

        {/* Grows to fill any leftover vertical space so the Add button lines up across cards regardless of title/price length. */}
        <div className="flex-1" />

        <Actions offer={offer} />
        {/* Fixed-height slot (present whether or not cube stats exist) so the row below Actions never shifts card-to-card. */}
        <div className="mt-2 h-4">
          {showCubeStats && <CubeStats offer={offer} />}
        </div>
      </div>
    </div>
  );

  return card;
}
