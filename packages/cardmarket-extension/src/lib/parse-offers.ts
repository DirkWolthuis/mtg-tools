import type { OfferRow } from './types.js';

// Cardmarket has no public DOM contract and blocks automated fetches, so these
// selectors are a best-effort match of the seller "Offers/Singles" article
// table. If capture stops finding rows, inspect the live page and adjust them.
const SELECTORS = {
  row: '.article-row',
  cardName: '.col-product a.expand-link, .col-product a',
  expansion:
    '.col-product .expansion-symbol, .col-product [data-original-title]',
  condition: '.article-condition',
  price: '.col-price .price-container, .col-price',
};

function parsePriceEur(text: string): number | null {
  const normalized = text
    .replace(/[^0-9,.-]/g, '')
    .replace(/\.(?=.*\.)/g, '') // drop thousands-separator dots, keep the last one as decimal
    .replace(',', '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

export function parseOffersFromDocument(doc: Document): OfferRow[] {
  const offers: OfferRow[] = [];

  for (const row of Array.from(doc.querySelectorAll(SELECTORS.row))) {
    const cardName = row.querySelector(SELECTORS.cardName)?.textContent?.trim();
    const expansionEl = row.querySelector(SELECTORS.expansion);
    const expansion =
      expansionEl?.getAttribute('data-original-title')?.trim() ??
      expansionEl?.textContent?.trim() ??
      '';
    const condition =
      row.querySelector(SELECTORS.condition)?.textContent?.trim() ?? '';
    const priceEur = parsePriceEur(
      row.querySelector(SELECTORS.price)?.textContent ?? '',
    );

    if (!cardName || priceEur === null) continue;

    offers.push({
      id: `${cardName}|${expansion}|${condition}|${priceEur}`,
      cardName,
      expansion,
      condition,
      priceEur,
    });
  }

  return offers;
}
