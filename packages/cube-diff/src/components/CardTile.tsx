import { cubeCobraCardLink } from '../lib/cubecobra-api.js';
import type { DiffCard } from '../lib/diff-cube.js';

export interface CardTileProps {
  card: DiffCard;
}

/** One face of a card image, used standalone for single-faced cards and twice (side-by-side) for DFCs. */
function CardFace({
  image,
  name,
  className,
}: {
  image: string | undefined;
  name: string;
  className?: string;
}) {
  return (
    <div className={`aspect-5/7 w-full ${className ?? ''}`}>
      {image ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-gray-500">
          {name}
        </div>
      )}
    </div>
  );
}

/**
 * One card image tile, showing its copy-count badge when more than one copy changed. Links out to
 * the card's CubeCobra page, and enlarges slightly on hover so the art/text is easier to read
 * without being too obtrusive. Cards with a back face (transform/modal-DFC) show only the front
 * face normally, swapping to both faces side by side on hover (alongside the rest of the tile).
 *
 * `self-start` opts the tile out of the grid's default row-stretch so its height always matches
 * its own content - otherwise a hovered DFC tile (shorter, since its two faces sit side by side)
 * would get stretched back up to the row's full height, leaving blank space below the images.
 */
export function CardTile({ card }: CardTileProps) {
  const image = card.imageNormal ?? card.imageSmall;
  const hasBackFace = card.imageFlip != null;

  return (
    <a
      href={cubeCobraCardLink(card.name)}
      target="_blank"
      rel="noreferrer"
      className="group relative z-0 flex flex-col self-start overflow-hidden rounded-lg bg-gray-100 shadow transition duration-100 ease-out hover:z-20 hover:scale-[1.7] hover:shadow-lg"
      data-testid="card-tile"
    >
      <CardFace
        image={image}
        name={card.name}
        className={hasBackFace ? 'group-hover:hidden' : undefined}
      />
      {hasBackFace && (
        <div className="hidden w-full group-hover:flex">
          <CardFace image={image} name={card.name} />
          <CardFace image={card.imageFlip} name={`${card.name} (back)`} />
        </div>
      )}
      {card.count > 1 && (
        <span className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
          ×{card.count}
        </span>
      )}
    </a>
  );
}
