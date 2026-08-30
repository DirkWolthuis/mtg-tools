import { describe, expect, it } from 'vitest';
import { parseCollectionCsv } from './parse-collection-csv.js';

describe('parseCollectionCsv', () => {
  it('extracts the Name column, deduplicated in first-seen order', () => {
    const csv = [
      '"Count","Tradelist Count","Name","Edition","Condition"',
      '"1","1","Ancient Tomb","uma","Near Mint"',
      '"2","2","Chalice of the Void","mrd","Near Mint"',
      '"1","1","Ancient Tomb","mrd","Near Mint"',
    ].join('\n');

    expect(parseCollectionCsv(csv)).toEqual([
      'Ancient Tomb',
      'Chalice of the Void',
    ]);
  });

  it('handles names containing commas via quoted fields', () => {
    const csv = [
      '"Count","Name","Edition"',
      '"1","Aang, at the Crossroads // Aang, Destined Savior","tla"',
    ].join('\n');

    expect(parseCollectionCsv(csv)).toEqual([
      'Aang, at the Crossroads // Aang, Destined Savior',
    ]);
  });

  it('ignores blank lines and a trailing newline', () => {
    const csv = '"Name"\n"Ancient Tomb"\n\n';

    expect(parseCollectionCsv(csv)).toEqual(['Ancient Tomb']);
  });

  it('returns an empty array when there is no Name column', () => {
    const csv = '"Edition"\n"uma"';

    expect(parseCollectionCsv(csv)).toEqual([]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseCollectionCsv('')).toEqual([]);
  });
});
