export type OffersView = 'grid' | 'table';

export const MIN_GRID_COLUMNS = 1;
export const MAX_GRID_COLUMNS = 8;

export interface OffersGridHeaderProps {
  view: OffersView;
  onViewChange: (view: OffersView) => void;
  columns: number | undefined;
  onColumnsChange: (columns: number | undefined) => void;
  isLoading?: boolean;
}

/** Tabs to switch between the new card grid and Cardmarket's default table, plus a "cards per row" override shown while the grid is active. */
export function OffersGridHeader({
  view,
  onViewChange,
  columns,
  onColumnsChange,
  isLoading,
}: OffersGridHeaderProps) {
  return (
    <div
      className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-300 pb-2"
      data-testid="offers-grid-header"
    >
      <div
        role="tablist"
        aria-label="Offers layout"
        className="flex gap-1"
        data-testid="offers-grid-tabs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === 'grid'}
          data-testid="offers-grid-tab-grid"
          className={`cursor-pointer rounded px-3 py-1 text-sm ${
            view === 'grid'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => onViewChange('grid')}
        >
          Card grid
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'table'}
          data-testid="offers-grid-tab-table"
          className={`cursor-pointer rounded px-3 py-1 text-sm ${
            view === 'table'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => onViewChange('table')}
        >
          Default table
        </button>
      </div>
      {view === 'grid' && (
        <label
          className="flex items-center gap-2 text-sm text-gray-600"
          data-testid="offers-grid-columns-control"
        >
          Cards per row
          <input
            type="number"
            min={MIN_GRID_COLUMNS}
            max={MAX_GRID_COLUMNS}
            value={columns ?? ''}
            placeholder="Auto"
            className="w-16 rounded border border-gray-300 px-1 py-0.5"
            data-testid="offers-grid-columns-input"
            onChange={(event) => {
              const raw = event.currentTarget.value;
              if (raw === '') {
                onColumnsChange(undefined);
                return;
              }
              const parsed = Number(raw);
              if (!Number.isFinite(parsed)) return;
              const clamped = Math.min(
                MAX_GRID_COLUMNS,
                Math.max(MIN_GRID_COLUMNS, Math.round(parsed)),
              );
              onColumnsChange(clamped);
            }}
          />
        </label>
      )}
      {isLoading && (
        <span
          className="text-xs text-gray-500"
          data-testid="offers-grid-loading-indicator"
        >
          Fetching card details…
        </span>
      )}
    </div>
  );
}
