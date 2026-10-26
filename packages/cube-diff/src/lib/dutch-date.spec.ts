import { describe, expect, it } from 'vitest';
import { dutchDateToIso, isoToDutchDate } from './dutch-date.js';

describe('isoToDutchDate', () => {
  it('reorders an ISO date into dd-mm-yyyy', () => {
    expect(isoToDutchDate('2024-01-31')).toBe('31-01-2024');
  });

  it('returns an empty string for an empty/invalid input', () => {
    expect(isoToDutchDate('')).toBe('');
    expect(isoToDutchDate('not-a-date')).toBe('');
  });
});

describe('dutchDateToIso', () => {
  it('reorders a dd-mm-yyyy date into ISO form', () => {
    expect(dutchDateToIso('31-01-2024')).toBe('2024-01-31');
  });

  it('round-trips with isoToDutchDate', () => {
    expect(dutchDateToIso(isoToDutchDate('2024-06-15'))).toBe('2024-06-15');
  });

  it('returns null for a malformed string', () => {
    expect(dutchDateToIso('2024-01-31')).toBeNull();
    expect(dutchDateToIso('31/01/2024')).toBeNull();
    expect(dutchDateToIso('')).toBeNull();
  });

  it('returns null for a day/month out of range (e.g. 31 February)', () => {
    expect(dutchDateToIso('31-02-2024')).toBeNull();
  });

  it('returns null for month 13', () => {
    expect(dutchDateToIso('01-13-2024')).toBeNull();
  });
});
