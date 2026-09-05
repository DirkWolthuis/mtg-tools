/** Parsed shareable state for the cube diff page, mirrored to/from the URL's query string. */
export interface DiffUrlState {
  cube: string;
  /** Date in `YYYY-MM-DD` form, as used by `<input type="date">`. */
  date: string;
}

/** Reads `cube` and `date` from a query string (e.g. `location.search`), returning only the params present. */
export function parseDiffUrlState(search: string): Partial<DiffUrlState> {
  const params = new URLSearchParams(search);
  const cube = params.get('cube');
  const date = params.get('date');
  const state: Partial<DiffUrlState> = {};
  if (cube) state.cube = cube;
  if (date) state.date = date;
  return state;
}

/** Builds a `?cube=...&date=...` query string for sharing a specific cube diff. */
export function buildDiffQueryString(state: DiffUrlState): string {
  const params = new URLSearchParams();
  params.set('cube', state.cube);
  params.set('date', state.date);
  return `?${params.toString()}`;
}

/** Converts a `YYYY-MM-DD` date string (interpreted as UTC midnight) into a Unix ms timestamp for the CubeCobra API. */
export function dateStringToTimestamp(date: string): number {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return parsed.getTime();
}
