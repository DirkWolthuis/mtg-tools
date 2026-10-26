import type { CardsPerRow } from './DiffGrid.js';

export interface GridSettingsProps {
  cardsPerRow: CardsPerRow;
  onChange: (cardsPerRow: CardsPerRow) => void;
}

const MIN_FIXED_COLUMNS = 1;
const MAX_FIXED_COLUMNS = 12;
const DEFAULT_FIXED_COLUMNS = 6;

/** Control for choosing how many card tiles appear per row: responsive ("auto") or a fixed count. */
export function GridSettings({ cardsPerRow, onChange }: GridSettingsProps) {
  const isFixed = cardsPerRow !== 'auto';

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="font-medium">Cards per row</span>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name="cards-per-row-mode"
          checked={!isFixed}
          onChange={() => onChange('auto')}
          data-testid="cards-per-row-auto"
        />
        Auto
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name="cards-per-row-mode"
          checked={isFixed}
          onChange={() =>
            onChange(isFixed ? cardsPerRow : DEFAULT_FIXED_COLUMNS)
          }
          data-testid="cards-per-row-fixed"
        />
        Fixed
      </label>
      {isFixed && (
        <input
          type="number"
          min={MIN_FIXED_COLUMNS}
          max={MAX_FIXED_COLUMNS}
          value={cardsPerRow}
          onInput={(event) => {
            const value = Number(event.currentTarget.value);
            if (!Number.isFinite(value)) return;
            const clamped = Math.min(
              MAX_FIXED_COLUMNS,
              Math.max(MIN_FIXED_COLUMNS, Math.round(value)),
            );
            onChange(clamped);
          }}
          className="w-16 rounded border border-gray-300 px-2 py-1"
          data-testid="cards-per-row-input"
        />
      )}
    </div>
  );
}
