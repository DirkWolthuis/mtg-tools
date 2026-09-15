import { useEffect, useState } from 'preact/hooks';
import {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_GRID_GAP,
  MAX_GRID_COLUMNS,
  MAX_GRID_GAP,
  MIN_GRID_COLUMNS,
  MIN_GRID_GAP,
} from './grid-settings.js';

export {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_GRID_GAP,
  MAX_GRID_COLUMNS,
  MAX_GRID_GAP,
  MIN_GRID_COLUMNS,
  MIN_GRID_GAP,
} from './grid-settings.js';

export interface OffersSettingsMenuProps {
  /** Whether the column/gap sliders apply right now (they only affect the card grid, not Cardmarket's table). */
  gridControlsEnabled: boolean;
  /** Fixed number of cards per row; `undefined` means "Auto" (responsive auto-fit layout). */
  columns: number | undefined;
  onColumnsChange: (columns: number | undefined) => void;
  /** Gap between cards in pixels; `undefined` means "Auto" (the grid's default gap). */
  gap: number | undefined;
  onGapChange: (gap: number | undefined) => void;
  showCubeStats: boolean;
  onShowCubeStatsChange: (showCubeStats: boolean) => void;
}

/** Right-aligned dropdown with sliders for the grid layout (cards per row, gap, both with an "Auto" option) and a toggle for cube stats. */
export function OffersSettingsMenu({
  gridControlsEnabled,
  columns,
  onColumnsChange,
  gap,
  onGapChange,
  showCubeStats,
  onShowCubeStatsChange,
}: OffersSettingsMenuProps) {
  // Remember the last manually-picked value so re-disabling "Auto" restores it instead of resetting to a default.
  const [lastColumns, setLastColumns] = useState(
    columns ?? DEFAULT_GRID_COLUMNS,
  );
  useEffect(() => {
    if (columns !== undefined) setLastColumns(columns);
  }, [columns]);

  const [lastGap, setLastGap] = useState(gap ?? DEFAULT_GRID_GAP);
  useEffect(() => {
    if (gap !== undefined) setLastGap(gap);
  }, [gap]);

  const columnsAuto = columns === undefined;
  const gapAuto = gap === undefined;

  return (
    <div className="dropdown dropdown-end" data-testid="offers-settings-menu">
      <div
        tabIndex={0}
        role="button"
        className="btn"
        data-testid="offers-settings-menu-trigger"
        aria-label="Grid settings"
      >
        Settings
      </div>
      <div
        tabIndex={0}
        className="dropdown-content card card-sm z-10 w-72 bg-base-100 shadow-md"
      >
        <div className="card-body">
          <fieldset
            className="fieldset"
            data-testid="offers-grid-columns-control"
          >
            <legend className="fieldset-legend flex w-full items-center justify-between">
              <span>Cards per row</span>
              <span className="text-base-content/60">
                {columnsAuto ? 'Auto' : columns}
              </span>
            </legend>
            <input
              type="range"
              min={MIN_GRID_COLUMNS}
              max={MAX_GRID_COLUMNS}
              value={columnsAuto ? lastColumns : columns}
              disabled={!gridControlsEnabled || columnsAuto}
              className="range range-xs"
              data-testid="offers-grid-columns-input"
              onChange={(event) => {
                const parsed = Number(event.currentTarget.value);
                if (!Number.isFinite(parsed)) return;
                onColumnsChange(parsed);
              }}
            />
            <label className="label mt-1 cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="toggle toggle-xs"
                checked={columnsAuto}
                disabled={!gridControlsEnabled}
                data-testid="offers-grid-columns-auto-toggle"
                onChange={(event) =>
                  onColumnsChange(
                    event.currentTarget.checked ? undefined : lastColumns,
                  )
                }
              />
              Auto
            </label>
          </fieldset>
          <div className="divider" />
          <fieldset className="fieldset" data-testid="offers-grid-gap-control">
            <legend className="fieldset-legend flex w-full items-center justify-between">
              <span>Gap</span>
              <span className="text-base-content/60">
                {gapAuto ? 'Auto' : `${gap}px`}
              </span>
            </legend>
            <input
              type="range"
              min={MIN_GRID_GAP}
              max={MAX_GRID_GAP}
              step={2}
              value={gapAuto ? lastGap : gap}
              disabled={!gridControlsEnabled || gapAuto}
              className="range range-xs"
              data-testid="offers-grid-gap-input"
              onChange={(event) => {
                const parsed = Number(event.currentTarget.value);
                if (!Number.isFinite(parsed)) return;
                onGapChange(parsed);
              }}
            />
            <label className="label mt-1 cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="toggle toggle-xs"
                checked={gapAuto}
                disabled={!gridControlsEnabled}
                data-testid="offers-grid-gap-auto-toggle"
                onChange={(event) =>
                  onGapChange(event.currentTarget.checked ? undefined : lastGap)
                }
              />
              Auto
            </label>
          </fieldset>
          <div className="divider" />
          <label
            className="label cursor-pointer justify-between"
            data-testid="offers-cube-stats-control"
          >
            <span>Show cube stats</span>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={showCubeStats}
              data-testid="offers-cube-stats-toggle"
              onChange={(event) =>
                onShowCubeStatsChange(event.currentTarget.checked)
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
}
