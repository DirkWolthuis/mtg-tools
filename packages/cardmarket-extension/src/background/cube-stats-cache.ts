import type { CubeStatsMap } from '@org/cubecobra-stats';

let cubeStatsPromise: Promise<CubeStatsMap> | null = null;

async function loadCubeStats(): Promise<CubeStatsMap> {
  const response = await fetch(chrome.runtime.getURL('cube-stats.json'));
  return (await response.json()) as CubeStatsMap;
}

/** Lazily fetches the bundled `cube-stats.json` asset once, caching it for the service worker's lifetime. */
export function getCubeStatsMap(): Promise<CubeStatsMap> {
  if (!cubeStatsPromise) cubeStatsPromise = loadCubeStats();
  return cubeStatsPromise;
}
