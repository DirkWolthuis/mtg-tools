import { readFile } from 'node:fs/promises';
import type { CubeStatsMap } from '@org/cubecobra-stats';

/** Reads and parses a bundled `cube-stats.json` asset (Scryfall id -> CubeCobra stats) from disk. */
export async function loadCubeStatsMap(
  filePath: string,
): Promise<CubeStatsMap> {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as CubeStatsMap;
}
