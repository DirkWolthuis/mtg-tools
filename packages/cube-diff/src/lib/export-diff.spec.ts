import { describe, expect, it } from 'vitest';
import type { CubeDiff, DiffCard } from './diff-cube.js';
import { buildDiffExportFilename, buildDiffExportText } from './export-diff.js';

function diffCard(name: string, count = 1): DiffCard {
  return { key: name.toLowerCase(), name, count };
}

describe('buildDiffExportText', () => {
  it('lists added and cut card names under their respective headings', () => {
    const diff: CubeDiff = {
      added: [diffCard('Ancestral Recall')],
      cut: [diffCard('Black Lotus'), diffCard('Time Walk')],
    };

    expect(buildDiffExportText(diff)).toBe(
      'Adds:\nAncestral Recall\n\nCuts:\nBlack Lotus\nTime Walk\n',
    );
  });

  it('repeats a card name once per copy when count is greater than one', () => {
    const diff: CubeDiff = { added: [diffCard('Wastes', 3)], cut: [] };

    expect(buildDiffExportText(diff)).toBe(
      'Adds:\nWastes\nWastes\nWastes\n\nCuts:\n',
    );
  });

  it('still renders both headings when there are no adds or cuts', () => {
    expect(buildDiffExportText({ added: [], cut: [] })).toBe(
      'Adds:\n\nCuts:\n',
    );
  });
});

describe('buildDiffExportFilename', () => {
  it('slugifies the cube name and appends the date', () => {
    expect(buildDiffExportFilename('My Cool Cube!', '2024-01-01')).toBe(
      'my-cool-cube-diff-2024-01-01.txt',
    );
  });

  it('falls back to a generic name when the cube name has no alphanumeric characters', () => {
    expect(buildDiffExportFilename('!!!', '2024-01-01')).toBe(
      'cube-diff-2024-01-01.txt',
    );
  });
});
