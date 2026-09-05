import { describe, expect, it } from 'vitest';
import {
  buildDiffQueryString,
  dateStringToTimestamp,
  parseDiffUrlState,
} from './url-state.js';

describe('parseDiffUrlState', () => {
  it('reads cube and date from the query string', () => {
    expect(parseDiffUrlState('?cube=my-cube&date=2024-01-01')).toEqual({
      cube: 'my-cube',
      date: '2024-01-01',
    });
  });

  it('omits missing params', () => {
    expect(parseDiffUrlState('?cube=my-cube')).toEqual({ cube: 'my-cube' });
    expect(parseDiffUrlState('')).toEqual({});
  });
});

describe('buildDiffQueryString', () => {
  it('builds a query string from state', () => {
    expect(buildDiffQueryString({ cube: 'my-cube', date: '2024-01-01' })).toBe(
      '?cube=my-cube&date=2024-01-01',
    );
  });

  it('is round-trippable with parseDiffUrlState', () => {
    const state = {
      cube: 'https://cubecobra.com/cube/list/x',
      date: '2023-06-15',
    };
    expect(parseDiffUrlState(buildDiffQueryString(state))).toEqual(state);
  });
});

describe('dateStringToTimestamp', () => {
  it('converts a YYYY-MM-DD date to a UTC midnight timestamp', () => {
    expect(dateStringToTimestamp('2024-01-01')).toBe(
      Date.UTC(2024, 0, 1, 0, 0, 0, 0),
    );
  });
});
