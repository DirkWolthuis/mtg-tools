/** CubeCobra popularity stats for a card, keyed by Scryfall id. */
export interface CubeStats {
  elo: number;
  popularity: number;
  cubeCount: number;
}

/** A Scryfall id -> `CubeStats` lookup map, e.g. loaded from a bundled `cube-stats.json` asset. */
export type CubeStatsMap = Record<string, CubeStats>;

/** Looks up `scryfallId`'s CubeCobra stats in `cubeStats`. */
export function getCubeStats(
  scryfallId: string | null | undefined,
  cubeStats: CubeStatsMap,
): CubeStats | null {
  if (!scryfallId) return null;
  return cubeStats[scryfallId] ?? null;
}
