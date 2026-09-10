import { useEffect, useState } from 'preact/hooks';
import type { Offer } from '../lib/parse-offers.js';
import { OffersGrid } from './OffersGrid.js';
import { OffersGridHeader, type OffersView } from './OffersGridHeader.js';

const VIEW_STORAGE_KEY = 'cardmarket-offers-grid:view';
const COLUMNS_STORAGE_KEY = 'cardmarket-offers-grid:columns';

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

export interface OffersAppProps {
  offers: Offer[];
  isLoading?: boolean;
  /** Called whenever the active view changes (including on mount) so the host page can show/hide its own layout accordingly. */
  onViewChange?: (view: OffersView) => void;
}

/** Top-level offers UI: layout tabs (grid/table) + column override, wrapping the card grid itself. */
export function OffersApp({ offers, isLoading, onViewChange }: OffersAppProps) {
  const [view, setView] = useState<OffersView>(readStoredView);
  const [columns, setColumns] = useState<number | undefined>(
    readStoredColumns,
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

  return (
    <div data-testid="offers-app">
      <OffersGridHeader
        view={view}
        onViewChange={setView}
        columns={columns}
        onColumnsChange={setColumns}
        isLoading={isLoading}
      />
      {view === 'grid' && (
        <OffersGrid offers={offers} isLoading={isLoading} columns={columns} />
      )}
    </div>
  );
}
