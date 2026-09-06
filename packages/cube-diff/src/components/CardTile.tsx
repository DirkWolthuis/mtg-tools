import type { DiffCard } from '../lib/diff-cube.js';

export interface CardTileProps {
  card: DiffCard;
}

/** One card image tile, showing its copy-count badge when more than one copy changed. */
export function CardTile({ card }: CardTileProps) {
  const image = card.imageNormal ?? card.imageSmall;
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-lg bg-gray-100 shadow"
      data-testid="card-tile"
    >
      <div className="aspect-5/7 w-full">
        {image ? (
          <img
            src={image}
            alt={card.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-gray-500">
            {card.name}
          </div>
        )}
      </div>
      {card.count > 1 && (
        <span className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
          ×{card.count}
        </span>
      )}
    </div>
  );
}
