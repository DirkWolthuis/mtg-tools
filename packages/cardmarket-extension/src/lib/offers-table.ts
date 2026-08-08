// Cardmarket renders a seller/user's offer listing as a Bootstrap-style div
// grid, not a literal <table>: a `.article-table` container (id
// `#UserOffersTable`) with a `.table-header` column row and a `.table-body`
// of `.article-row` divs. Verified against a live seller Offers/Singles page.
const TABLE_SELECTOR = '.article-table';
const HEADER_ROW_SELECTOR = '.table-header .row';
const BODY_ROW_SELECTOR = '.table-body .article-row';

export const AVERAGE_PRICE_COLUMN_CLASS = 'cardmarket-avg-price-column';

/** Finds the first element on the page that looks like a user/vendor's offer listing grid. */
export function findOffersTable(doc: Document): HTMLElement | null {
  for (const table of Array.from(
    doc.querySelectorAll<HTMLElement>(TABLE_SELECTOR),
  )) {
    if (table.querySelector(BODY_ROW_SELECTOR)) return table;
  }
  return null;
}

/** Adds an empty "average price" column to the header row and every offer row, unless already added. */
export function addAveragePriceColumn(
  table: HTMLElement,
  headerLabel = 'Avg. Price',
): void {
  if (table.querySelector(`.${AVERAGE_PRICE_COLUMN_CLASS}`)) return;

  const headerRow = table.querySelector(HEADER_ROW_SELECTOR);
  if (headerRow) {
    const headerCell = table.ownerDocument.createElement('div');
    headerCell.className = `col-offer col-auto ${AVERAGE_PRICE_COLUMN_CLASS}`;
    headerCell.textContent = headerLabel;
    headerRow.appendChild(headerCell);
  }

  for (const row of Array.from(table.querySelectorAll(BODY_ROW_SELECTOR))) {
    const cell = table.ownerDocument.createElement('div');
    cell.className = `col-offer col-auto ${AVERAGE_PRICE_COLUMN_CLASS}`;
    row.appendChild(cell); // left empty for now - filled in once average-price lookup is implemented
  }
}
