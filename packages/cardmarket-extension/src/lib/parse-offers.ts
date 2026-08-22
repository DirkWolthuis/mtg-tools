const BODY_ROW_SELECTOR = '.table-body .article-row';
const NAME_SELECTOR = '.col-sellerProductInfo .col-seller a';
const PRICE_SELECTOR = '.col-offer .price-container .color-primary';
const IMAGE_SELECTOR = 'img[src], img[data-src], [data-image]';
// The thumbnail is a plain icon whose real <img> markup is stashed in a tooltip attribute.
const THUMBNAIL_TOOLTIP_SELECTOR = '.col-thumbnail [data-bs-title]';
// Not yet confirmed against a live page - update once real row markup is available.
const QUANTITY_SELECTOR = '.item-count, .amount-container, [data-amount]';

export interface Offer {
  name: string;
  cardUrl: string;
  priceText: string | null;
  imageUrl: string | null;
  quantity: string | null;
}

function readImageUrlFromTooltip(row: Element): string | null {
  const tooltip = row
    .querySelector(THUMBNAIL_TOOLTIP_SELECTOR)
    ?.getAttribute('data-bs-title');
  if (!tooltip) return null;
  return tooltip.match(/src="([^"]+)"/)?.[1] ?? null;
}

function readImageUrl(row: Element): string | null {
  const img = row.querySelector(IMAGE_SELECTOR);
  if (img) {
    return (
      img.getAttribute('src') ??
      img.getAttribute('data-src') ??
      img.getAttribute('data-image')
    );
  }
  return readImageUrlFromTooltip(row);
}

function readText(row: Element, selector: string): string | null {
  const text = row.querySelector(selector)?.textContent?.trim();
  return text ? text : null;
}

function readLink(row: Element, selector: string): string | null {
  const link = row.querySelector(selector)?.getAttribute('href')?.trim();
  return link ? link : null;
}

/** Parses each offer row of a seller's offers grid (see `findOffersTable`) into structured data. */
export function parseOffers(table: HTMLElement): Offer[] {
  return Array.from(table.querySelectorAll(BODY_ROW_SELECTOR)).map((row) => ({
    name: readText(row, NAME_SELECTOR) ?? '',
    cardUrl: readLink(row, NAME_SELECTOR) ?? '',
    priceText: readText(row, PRICE_SELECTOR),
    imageUrl: readImageUrl(row),
    quantity: readText(row, QUANTITY_SELECTOR),
  }));
}
