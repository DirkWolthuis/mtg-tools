const BODY_ROW_SELECTOR = '.table-body .article-row';
const NAME_SELECTOR = '.col-sellerProductInfo';
const PRICE_SELECTOR = '.col-offer .price-container .color-primary';
const IMAGE_SELECTOR = 'img[src], img[data-src], [data-image]';
// Not yet confirmed against a live page - update once real row markup is available.
const QUANTITY_SELECTOR = '.item-count, .amount-container, [data-amount]';

export interface Offer {
  name: string;
  priceText: string | null;
  imageUrl: string | null;
  quantity: string | null;
}

function readImageUrl(row: Element): string | null {
  const img = row.querySelector(IMAGE_SELECTOR);
  if (!img) return null;
  return (
    img.getAttribute('src') ??
    img.getAttribute('data-src') ??
    img.getAttribute('data-image')
  );
}

function readText(row: Element, selector: string): string | null {
  const text = row.querySelector(selector)?.textContent?.trim();
  return text ? text : null;
}

/** Parses each offer row of a seller's offers grid (see `findOffersTable`) into structured data. */
export function parseOffers(table: HTMLElement): Offer[] {
  return Array.from(table.querySelectorAll(BODY_ROW_SELECTOR)).map((row) => ({
    name: readText(row, NAME_SELECTOR) ?? '',
    priceText: readText(row, PRICE_SELECTOR),
    imageUrl: readImageUrl(row),
    quantity: readText(row, QUANTITY_SELECTOR),
  }));
}
