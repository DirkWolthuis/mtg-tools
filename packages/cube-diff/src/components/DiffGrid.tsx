import type { DiffCard } from '../lib/diff-cube.js';
import { CardTile } from './CardTile.js';

/** `'auto'` uses the responsive column count below; a number fixes the grid to that many columns. */
export type CardsPerRow = 'auto' | number;

const AUTO_GRID_CLASSES =
  'grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';

export interface DiffSectionProps {
  title: string;
  cards: DiffCard[];
  emptyLabel: string;
  cardsPerRow: CardsPerRow;
}

/** A titled grid of card image tiles for one side of the diff (added or cut). */
export function DiffSection({
  title,
  cards,
  emptyLabel,
  cardsPerRow,
}: DiffSectionProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">
        {title}{' '}
        <span className="font-normal text-gray-500">({cards.length})</span>
      </h2>
      {cards.length === 0 ? (
        <p className="text-sm text-gray-500" data-testid="diff-section-empty">
          {emptyLabel}
        </p>
      ) : (
        <div
          className={`grid gap-4 ${cardsPerRow === 'auto' ? AUTO_GRID_CLASSES : ''}`}
          style={
            cardsPerRow === 'auto'
              ? undefined
              : { gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))` }
          }
        >
          {cards.map((card) => (
            <CardTile key={card.key} card={card} />
          ))}
        </div>
      )}
    </section>
  );
}

export interface DiffGridProps {
  added: DiffCard[];
  cut: DiffCard[];
  cardsPerRow: CardsPerRow;
}

/** Renders the two-part (added / cut) diff result as image grids. */
export function DiffGrid({ added, cut, cardsPerRow }: DiffGridProps) {
  return (
    <div className="flex flex-col gap-8" data-testid="diff-grid">
      <DiffSection
        title="Added"
        cards={added}
        emptyLabel="No cards were added in this period."
        cardsPerRow={cardsPerRow}
      />
      <DiffSection
        title="Cut"
        cards={cut}
        emptyLabel="No cards were cut in this period."
        cardsPerRow={cardsPerRow}
      />
    </div>
  );
}
