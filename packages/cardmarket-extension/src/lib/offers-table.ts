// Cardmarket has no public DOM contract and blocks automated fetches, so this
// selector is a best-effort match for a seller's offer listing table. If it
// stops finding rows, inspect the live page and adjust it.
const TABLE_SELECTOR = 'table.table';
const HEADER_ROW_SELECTOR = 'thead tr';
const BODY_ROW_SELECTOR = 'tbody tr';

export const AVERAGE_PRICE_COLUMN_CLASS = 'cardmarket-avg-price-column';

/** Finds the first table on the page that looks like a user/vendor's offer listing. */
export function findOffersTable(doc: Document): HTMLTableElement | null {
  for (const table of Array.from(
    doc.querySelectorAll<HTMLTableElement>(TABLE_SELECTOR),
  )) {
    if (table.querySelector(BODY_ROW_SELECTOR)) return table;
  }
  return null;
}

/** Adds an empty "average price" column to the table header and every body row, unless already added. */
export function addAveragePriceColumn(
  table: HTMLTableElement,
  headerLabel = 'Avg. Price',
): void {
  if (table.querySelector(`.${AVERAGE_PRICE_COLUMN_CLASS}`)) return;

  const headerRow = table.querySelector(HEADER_ROW_SELECTOR);
  if (headerRow) {
    const th = table.ownerDocument.createElement('th');
    th.className = AVERAGE_PRICE_COLUMN_CLASS;
    th.textContent = headerLabel;
    headerRow.appendChild(th);
  }

  for (const row of Array.from(table.querySelectorAll(BODY_ROW_SELECTOR))) {
    const td = table.ownerDocument.createElement('td');
    td.className = AVERAGE_PRICE_COLUMN_CLASS;
    row.appendChild(td); // left empty for now - filled in once average-price lookup is implemented
  }
}
