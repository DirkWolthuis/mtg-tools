import { describe, expect, it } from 'vitest';
import { getCubeStats } from './cubecobra-stats.js';

describe('getCubeStats', () => {
  const stats = { elo: 1500, popularity: 0.5, cubeCount: 100 };

  it('returns null when there is no scryfallId', () => {
    expect(getCubeStats(null, { 'card-id': stats })).toBeNull();
  });

  it('returns null when the id has no entry in the map', () => {
    expect(getCubeStats('other-id', { 'card-id': stats })).toBeNull();
  });

  it('returns the stats for the matching scryfall id', () => {
    expect(getCubeStats('card-id', { 'card-id': stats })).toEqual(stats);
  });
});
