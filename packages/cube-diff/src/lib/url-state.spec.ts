import { describe, expect, it } from 'vitest';
import {
  buildDiffQueryString,
  buildShareQueryString,
  dateStringToTimestamp,
  parseDiffUrlState,
  parseShareUrlState,
  type ShareDiffState,
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

describe('parseShareUrlState', () => {
  it('returns null when no share param is present', () => {
    expect(parseShareUrlState('')).toBeNull();
    expect(parseShareUrlState('?cube=my-cube&date=2024-01-01')).toBeNull();
  });

  it('returns null for an invalid/corrupt share param', () => {
    expect(parseShareUrlState('?share=not-valid-base64!!!')).toBeNull();
  });

  it('round-trips with buildShareQueryString', () => {
    const state: ShareDiffState = {
      cubeName: 'My Cube',
      cubeLink: 'https://cubecobra.com/cube/overview/my-cube',
      added: [{ scryfallId: 'aaaa-1111', count: 2 }],
      cut: [{ scryfallId: 'bbbb-2222', count: 1 }],
    };
    const search = buildShareQueryString(state);
    expect(parseShareUrlState(search)).toEqual(state);
  });

  it('preserves unicode cube names', () => {
    const state: ShareDiffState = {
      cubeName: 'Cübe Ñame 🃏',
      cubeLink: 'https://cubecobra.com/cube/overview/my-cube',
      added: [],
      cut: [],
    };
    const search = buildShareQueryString(state);
    expect(parseShareUrlState(search)).toEqual(state);
  });
});

describe('buildShareQueryString', () => {
  it('encodes state into a single share query param', () => {
    const search = buildShareQueryString({
      cubeName: 'My Cube',
      cubeLink: 'https://cubecobra.com/cube/overview/my-cube',
      added: [],
      cut: [],
    });
    const params = new URLSearchParams(search);
    expect([...params.keys()]).toEqual(['share']);
    expect(params.get('share')).not.toContain('=');
  });
});
