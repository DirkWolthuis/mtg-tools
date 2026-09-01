import type { CollectionRow } from './parse-collection-csv.js';

/** Quotes a CSV field, doubling any embedded quotes (matches Moxfield's own export format). */
function quoteCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Serializes `rows` back into CSV text, with `columns` fixing the header and per-row field order. */
export function toCsv(columns: string[], rows: CollectionRow[]): string {
  const headerLine = columns.map(quoteCsvField).join(',');
  const rowLines = rows.map((row) =>
    columns.map((column) => quoteCsvField(row[column] ?? '')).join(','),
  );
  return [headerLine, ...rowLines].map((line) => `${line}\r\n`).join('');
}
