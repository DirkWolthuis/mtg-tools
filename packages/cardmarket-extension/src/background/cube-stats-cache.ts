import type { CubeStats, CubeStatsMap } from '@org/cubecobra-stats';
import { getCubeStats } from '@org/cubecobra-stats';

// cube-stats data is bundled as small per-shard files under
// cube-stats/<prefix>.json (one per lowercased 2-character scryfallId
// prefix) rather than one ~13MB cube-stats.json. A single large JSON file
// trips Firefox's addons-linter FILE_TOO_LARGE check (files over 5MB aren't
// parsed during AMO review), and since lookups are always for one scryfallId
// at a time, fetching just the relevant shard also avoids loading/parsing
// the whole dataset on every service worker cold start.
const shardPromises = new Map<string, Promise<CubeStatsMap>>();

function shardPrefix(scryfallId: string): string {
  return scryfallId.slice(0, 2).toLowerCase();
}

async function loadShard(prefix: string): Promise<CubeStatsMap> {
  const response = await fetch(
    chrome.runtime.getURL(`cube-stats/${prefix}.json`),
  );
  return (await response.json()) as CubeStatsMap;
}

function getShard(prefix: string): Promise<CubeStatsMap> {
  let promise = shardPromises.get(prefix);
  if (!promise) {
    promise = loadShard(prefix);
    shardPromises.set(prefix, promise);
  }
  return promise;
}

/** Looks up `scryfallId`'s CubeCobra stats, lazily fetching (and caching) only the shard it lives in. */
export async function getCubeStatsForId(
  scryfallId: string | null | undefined,
): Promise<CubeStats | null> {
  if (!scryfallId) return null;
  const shard = await getShard(shardPrefix(scryfallId));
  return getCubeStats(scryfallId, shard);
}
