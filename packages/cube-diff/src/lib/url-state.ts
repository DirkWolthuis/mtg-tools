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

/** One card entry (by Scryfall id) in a shared, read-only diff link. */
export interface ShareDiffCard {
  scryfallId: string;
  count: number;
}

/**
 * A diff result encoded into a self-contained, read-only shareable URL: the cube's name/link plus
 * the Scryfall ids (and copy counts) of the cards added and cut, so opening the link only needs
 * Scryfall to render images - no CubeCobra fetch/diff required.
 */
export interface ShareDiffState {
  cubeName: string;
  cubeLink: string;
  added: ShareDiffCard[];
  cut: ShareDiffCard[];
}

const SHARE_PARAM = 'share';

/** Encodes a UTF-8 string as URL-safe, unpadded base64. */
function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Decodes a URL-safe base64 string (as produced by {@link base64UrlEncode}) back to UTF-8 text. */
function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Compact wire format for a share payload: card lists as `[scryfallId, count]` tuples. */
interface ShareDiffPayload {
  n: string;
  l: string;
  a: [string, number][];
  c: [string, number][];
}

/** Builds a `?share=...` query string encoding a diff result as a self-contained, read-only link. */
export function buildShareQueryString(state: ShareDiffState): string {
  const payload: ShareDiffPayload = {
    n: state.cubeName,
    l: state.cubeLink,
    a: state.added.map((card) => [card.scryfallId, card.count]),
    c: state.cut.map((card) => [card.scryfallId, card.count]),
  };
  const params = new URLSearchParams();
  params.set(SHARE_PARAM, base64UrlEncode(JSON.stringify(payload)));
  return `?${params.toString()}`;
}

/** Reads a `?share=...` query string back into a {@link ShareDiffState}, or `null` if absent/invalid. */
export function parseShareUrlState(search: string): ShareDiffState | null {
  const params = new URLSearchParams(search);
  const encoded = params.get(SHARE_PARAM);
  if (!encoded) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as ShareDiffPayload;
    const toCards = (entries: [string, number][]): ShareDiffCard[] =>
      entries.map(([scryfallId, count]) => ({ scryfallId, count }));
    return {
      cubeName: payload.n,
      cubeLink: payload.l,
      added: toCards(payload.a),
      cut: toCards(payload.c),
    };
  } catch {
    return null;
  }
}
