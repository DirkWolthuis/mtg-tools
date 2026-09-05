/** A single card entry as returned within a cube's board (e.g. `mainboard`) by the CubeCobra cube JSON API. */
export interface CubeJsonCard {
  cardID: string;
  board?: string;
  details?: {
    name: string;
    name_lower?: string;
    oracle_id?: string;
    scryfall_id?: string;
    image_normal?: string;
    image_small?: string;
    type_line?: string;
  };
}

/** Response shape of `GET /cube/api/cubeJSON/:id`, trimmed to the fields this app uses. */
export interface CubeJsonResponse {
  name: string;
  shortId?: string;
  cards: {
    mainboard: CubeJsonCard[];
    maybeboard?: CubeJsonCard[];
  };
  /** Only present when the `date` query param was used; identifies the resolved changelog. */
  changelog?: {
    id: string;
    date: number;
  };
}

const CUBEJSON_BASE_URL = 'https://cubecobra.com/cube/api/cubeJSON';

/**
 * Extracts a CubeCobra cube ID / short ID from either a bare ID or a full CubeCobra URL,
 * e.g. `https://cubecobra.com/cube/list/my-cube` or `https://cubecobra.com/cube/overview/my-cube`.
 */
export function extractCubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /cubecobra\.com\/cube\/(?:[a-z]+\/)?([^/?#\s]+)/i,
  );
  if (urlMatch) return urlMatch[1];

  // Not a recognizable CubeCobra URL - treat the whole (single-token) input as an ID.
  if (/^[^\s/]+$/.test(trimmed)) return trimmed;

  return null;
}

/** Fetches a cube's full JSON from CubeCobra, optionally as it existed at the nearest changelog on or before `date`. */
export async function fetchCubeJson(
  cubeId: string,
  date?: number,
  fetchImpl: typeof fetch = fetch,
): Promise<CubeJsonResponse> {
  const url = new URL(`${CUBEJSON_BASE_URL}/${encodeURIComponent(cubeId)}`);
  if (date != null) url.searchParams.set('date', String(date));

  const response = await fetchImpl(url.toString());
  if (!response.ok) {
    throw new Error(
      `Failed to fetch cube "${cubeId}" from CubeCobra (${response.status})`,
    );
  }
  return (await response.json()) as CubeJsonResponse;
}
