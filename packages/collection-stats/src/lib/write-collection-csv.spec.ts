import { describe, expect, it } from 'vitest';
import { toCsv } from './write-collection-csv.js';

describe('toCsv', () => {
  it('serializes columns and rows as quoted CSV', () => {
    const csv = toCsv(
      ['Name', 'Elo'],
      [
        { Name: 'Ancient Tomb', Elo: '1500' },
        { Name: 'Chalice of the Void', Elo: '' },
      ],
    );

    expect(csv).toBe(
      '"Name","Elo"\r\n' +
        '"Ancient Tomb","1500"\r\n' +
        '"Chalice of the Void",""\r\n',
    );
  });

  it('escapes embedded quotes and preserves embedded commas', () => {
    const csv = toCsv(
      ['Name'],
      [{ Name: 'Aang, at the Crossroads // Aang, Destined Savior' }],
    );

    expect(csv).toBe(
      '"Name"\r\n"Aang, at the Crossroads // Aang, Destined Savior"\r\n',
    );
  });

  it('fills missing fields with an empty string', () => {
    const csv = toCsv(['Name', 'Elo'], [{ Name: 'Ancient Tomb' }]);

    expect(csv).toBe('"Name","Elo"\r\n"Ancient Tomb",""\r\n');
  });
});
