import { describe, expect, it } from 'vitest';
import { mapCardmarketLanguageToScryfallCode } from './scryfall-language.js';

describe('mapCardmarketLanguageToScryfallCode', () => {
  it('returns null for a missing label', () => {
    expect(mapCardmarketLanguageToScryfallCode(null)).toBeNull();
    expect(mapCardmarketLanguageToScryfallCode(undefined)).toBeNull();
    expect(mapCardmarketLanguageToScryfallCode('')).toBeNull();
  });

  it('returns null for an unrecognized label', () => {
    expect(mapCardmarketLanguageToScryfallCode('Klingon')).toBeNull();
  });

  it('maps known Cardmarket language labels to Scryfall codes', () => {
    expect(mapCardmarketLanguageToScryfallCode('English')).toBe('en');
    expect(mapCardmarketLanguageToScryfallCode('German')).toBe('de');
    expect(mapCardmarketLanguageToScryfallCode('Italian')).toBe('it');
    expect(mapCardmarketLanguageToScryfallCode('Japanese')).toBe('ja');
    expect(mapCardmarketLanguageToScryfallCode('Chinese Simplified')).toBe(
      'zhs',
    );
  });

  it('is case-insensitive and tolerant of extra whitespace/punctuation', () => {
    expect(mapCardmarketLanguageToScryfallCode('  german ')).toBe('de');
    expect(mapCardmarketLanguageToScryfallCode('CHINESE   TRADITIONAL')).toBe(
      'zht',
    );
  });
});
