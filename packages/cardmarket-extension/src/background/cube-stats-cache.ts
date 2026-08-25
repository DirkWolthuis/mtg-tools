import type { CubeStats } from '../lib/post-process-scryfall-card.js';

let cubeStatsPromise: Promise<Record<string, CubeStats>> | null = null;

async function loadCubeStats(): Promise<Record<string, CubeStats>> {
  const response = await fetch(chrome.runtime.getURL('cube-stats.json'));
  return (await response.json()) as Record<string, CubeStats>;
}

/** Lazily fetches the bundled `cube-stats.json` asset once, caching it for the service worker's lifetime. */
export function getCubeStatsMap(): Promise<Record<string, CubeStats>> {
  if (!cubeStatsPromise) cubeStatsPromise = loadCubeStats();
  return cubeStatsPromise;
}
