// Shared grid layout constants, kept in their own module (not on OffersGridHeader/OffersSettingsMenu)
// to avoid a circular import between those two components.

export const MIN_GRID_COLUMNS = 1;
export const MAX_GRID_COLUMNS = 8;
export const DEFAULT_GRID_COLUMNS = Math.round(
  (MIN_GRID_COLUMNS + MAX_GRID_COLUMNS) / 2,
);

export const MIN_GRID_GAP = 0;
export const MAX_GRID_GAP = 48;
export const DEFAULT_GRID_GAP = 24;
