import type { CubeDiff, DiffCard } from './diff-cube.js';

/** One line per physical copy, so a 2-copy add/cut lists the card name on two separate lines. */
function cardLines(cards: DiffCard[]): string[] {
  const lines: string[] = [];
  for (const card of cards) {
    for (let i = 0; i < card.count; i++) {
      lines.push(card.name);
    }
  }
  return lines;
}

/**
 * Builds the plain-text export for a cube diff, e.g.:
 *
 * ```
 * Adds:
 * Card name
 *
 * Cuts:
 * Card name
 * Card name 2
 * ```
 */
export function buildDiffExportText(diff: CubeDiff): string {
  return [
    'Adds:',
    ...cardLines(diff.added),
    '',
    'Cuts:',
    ...cardLines(diff.cut),
    '',
  ].join('\n');
}

/** Sanitizes a string (e.g. a cube name) into a filesystem-safe filename fragment. */
function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'cube'
  );
}

/** Builds a descriptive filename for a diff export, e.g. `my-cube-diff-2024-01-01.txt`. */
export function buildDiffExportFilename(cubeName: string, date: string): string {
  return `${slugify(cubeName)}-diff-${date}.txt`;
}
