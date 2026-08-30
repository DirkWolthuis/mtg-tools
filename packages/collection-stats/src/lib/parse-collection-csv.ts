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

/** Parses a Moxfield collection CSV export, returning its card names deduplicated in first-seen order. */
export function parseCollectionCsv(csvText: string): string[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.length > 0);
  if (!lines.length) return [];

  const nameIndex = parseCsvLine(lines[0]).indexOf(NAME_COLUMN);
  if (nameIndex === -1) return [];

  const names = new Set<string>();
  for (const line of lines.slice(1)) {
    const name = parseCsvLine(line)[nameIndex];
    if (name) names.add(name);
  }
  return [...names];
}
