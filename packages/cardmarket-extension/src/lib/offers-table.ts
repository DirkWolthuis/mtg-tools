// Cardmarket renders a seller/user's offer listing as a Bootstrap-style div
// grid, not a literal <table>: a `.article-table` container (id
// `#UserOffersTable`) with a `.table-header` column row and a `.table-body`
// of `.article-row` divs. Verified against a live seller Offers/Singles page.
const TABLE_SELECTOR = '.article-table';
const BODY_ROW_SELECTOR = '.table-body .article-row';

/** Finds the first element on the page that looks like a user/vendor's offer listing grid. */
export function findOffersTable(doc: Document): HTMLElement | null {
  for (const table of Array.from(
    doc.querySelectorAll<HTMLElement>(TABLE_SELECTOR),
  )) {
    if (table.querySelector(BODY_ROW_SELECTOR)) return table;
  }
  return null;
}
