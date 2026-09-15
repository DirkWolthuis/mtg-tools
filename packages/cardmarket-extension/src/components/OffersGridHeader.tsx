import { OffersSettingsMenu } from './OffersSettingsMenu.js';

export type OffersView = 'grid' | 'table';

export interface OffersGridHeaderProps {
  view: OffersView;
  onViewChange: (view: OffersView) => void;
  columns: number | undefined;
  onColumnsChange: (columns: number | undefined) => void;
  gap: number | undefined;
  onGapChange: (gap: number | undefined) => void;
  showCubeStats: boolean;
  onShowCubeStatsChange: (showCubeStats: boolean) => void;
  isLoading?: boolean;
}

/** Tabs to switch between the new card grid and Cardmarket's default table, plus a settings dropdown (cards per row, gap, cube stats). */
export function OffersGridHeader({
  view,
  onViewChange,
  columns,
  onColumnsChange,
  gap,
  onGapChange,
  showCubeStats,
  onShowCubeStatsChange,
  isLoading,
}: OffersGridHeaderProps) {
  return (
    <div
      className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-base-300 pb-2"
      data-testid="offers-grid-header"
    >
      <div
        role="tablist"
        aria-label="Offers layout"
        className="tabs tabs-box"
        data-testid="offers-grid-tabs"
      >
        <a
          role="tab"
          aria-selected={view === 'grid'}
          data-testid="offers-grid-tab-grid"
          className={`tab cursor-pointer ${view === 'grid' ? 'tab-active' : ''}`}
          onClick={() => onViewChange('grid')}
        >
          Card grid
        </a>
        <a
          role="tab"
          aria-selected={view === 'table'}
          data-testid="offers-grid-tab-table"
          className={`tab cursor-pointer ${view === 'table' ? 'tab-active' : ''}`}
          onClick={() => onViewChange('table')}
        >
          Default table
        </a>
      </div>
      <div className="flex items-center gap-2">
        {isLoading && (
          <span
            className="loading loading-spinner loading-xs text-base-content/60"
            data-testid="offers-grid-loading-indicator"
            aria-label="Fetching card details…"
          />
        )}
        <OffersSettingsMenu
          gridControlsEnabled={view === 'grid'}
          columns={columns}
          onColumnsChange={onColumnsChange}
          gap={gap}
          onGapChange={onGapChange}
          showCubeStats={showCubeStats}
          onShowCubeStatsChange={onShowCubeStatsChange}
        />
      </div>
    </div>
  );
}
