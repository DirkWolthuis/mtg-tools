const NAME_COLUMN = 'Name';

/** Splits one CSV line into fields, honoring double-quoted fields (`""` is an escaped quote). */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

/** One CSV data row, keyed by its column header. */
export type CollectionRow = Record<string, string>;

/** Returns the column headers of a Moxfield collection CSV export, in file order. */
export function parseCollectionCsvHeader(csvText: string): string[] {
  const [firstLine] = csvText.split(/\r?\n/);
  return firstLine ? parseCsvLine(firstLine) : [];
}

/** Parses a Moxfield collection CSV export into row objects keyed by column header. */
export function parseCollectionCsvRows(csvText: string): CollectionRow[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.length > 0);
  if (!lines.length) return [];

  const header = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const fields = parseCsvLine(line);
    const row: CollectionRow = {};
    header.forEach((column, i) => {
      row[column] = fields[i] ?? '';
    });
    return row;
  });
}

/** Parses a Moxfield collection CSV export, returning its card names deduplicated in first-seen order. */
export function parseCollectionCsv(csvText: string): string[] {
  const names = new Set<string>();
  for (const row of parseCollectionCsvRows(csvText)) {
    if (row[NAME_COLUMN]) names.add(row[NAME_COLUMN]);
  }
  return [...names];
}
