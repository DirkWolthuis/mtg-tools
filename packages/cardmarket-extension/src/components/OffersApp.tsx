import { useEffect, useState } from 'preact/hooks';
import type { Offer } from '../lib/parse-offers.js';
import { OffersGrid } from './OffersGrid.js';
import { OffersGridHeader, type OffersView } from './OffersGridHeader.js';

const VIEW_STORAGE_KEY = 'cardmarket-offers-grid:view';
const COLUMNS_STORAGE_KEY = 'cardmarket-offers-grid:columns';
const GAP_STORAGE_KEY = 'cardmarket-offers-grid:gap';
const CUBE_STATS_STORAGE_KEY = 'cardmarket-offers-grid:show-cube-stats';

function readStoredView(): OffersView {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === 'table'
      ? 'table'
      : 'grid';
  } catch {
    return 'grid';
  }
}

function readStoredColumns(): number | undefined {
  try {
    const stored = localStorage.getItem(COLUMNS_STORAGE_KEY);
    if (!stored) return undefined;
    const parsed = Number(stored);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function readStoredGap(): number | undefined {
  try {
    const stored = localStorage.getItem(GAP_STORAGE_KEY);
    if (!stored) return undefined;
    const parsed = Number(stored);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function readStoredShowCubeStats(): boolean {
  try {
    return localStorage.getItem(CUBE_STATS_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export interface OffersAppProps {
  offers: Offer[];
  isLoading?: boolean;
  /** Called whenever the active view changes (including on mount) so the host page can show/hide its own layout accordingly. */
  onViewChange?: (view: OffersView) => void;
}

/** Top-level offers UI: layout tabs (grid/table) + settings (columns, gap, cube stats), wrapping the card grid itself. */
export function OffersApp({ offers, isLoading, onViewChange }: OffersAppProps) {
  const [view, setView] = useState<OffersView>(readStoredView);
  const [columns, setColumns] = useState<number | undefined>(readStoredColumns);
  const [gap, setGap] = useState<number | undefined>(readStoredGap);
  const [showCubeStats, setShowCubeStats] = useState<boolean>(
    readStoredShowCubeStats,
  );

  useEffect(() => {
    onViewChange?.(view);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // localStorage may be unavailable (e.g. disabled by the page/browser); the in-memory state still works.
    }
  }, [view, onViewChange]);

  useEffect(() => {
    try {
      if (columns) {
        localStorage.setItem(COLUMNS_STORAGE_KEY, String(columns));
      } else {
        localStorage.removeItem(COLUMNS_STORAGE_KEY);
      }
    } catch {
      // see above
    }
  }, [columns]);

  useEffect(() => {
    try {
      if (gap !== undefined) {
        localStorage.setItem(GAP_STORAGE_KEY, String(gap));
      } else {
        localStorage.removeItem(GAP_STORAGE_KEY);
      }
    } catch {
      // see above
    }
  }, [gap]);

  useEffect(() => {
    try {
      localStorage.setItem(CUBE_STATS_STORAGE_KEY, String(showCubeStats));
    } catch {
      // see above
    }
  }, [showCubeStats]);

  return (
    <div data-testid="offers-app">
      <OffersGridHeader
        view={view}
        onViewChange={setView}
        columns={columns}
        onColumnsChange={setColumns}
        gap={gap}
        onGapChange={setGap}
        showCubeStats={showCubeStats}
        onShowCubeStatsChange={setShowCubeStats}
        isLoading={isLoading}
      />
      {view === 'grid' && (
        <OffersGrid
          offers={offers}
          isLoading={isLoading}
          columns={columns}
          gap={gap}
          showCubeStats={showCubeStats}
        />
      )}
    </div>
  );
}
