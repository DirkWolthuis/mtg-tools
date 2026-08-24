import type { PriceDiffFromAverage } from './post-process-scryfall-card.js';
import type { ScryfallCard } from './scryfall.js';

const BODY_ROW_SELECTOR = '.table-body .article-row';
const NAME_SELECTOR = '.col-sellerProductInfo .col-seller a';
const PRICE_SELECTOR = '.col-offer .price-container .color-primary';
const IMAGE_SELECTOR = 'img[src], img[data-src], [data-image]';
// The thumbnail is a plain icon whose real <img> markup is stashed in a tooltip attribute.
const THUMBNAIL_TOOLTIP_SELECTOR = '.col-thumbnail [data-bs-title]';
// Not yet confirmed against a live page - update once real row markup is available.
const QUANTITY_SELECTOR = '.item-count, .amount-container, [data-amount]';
// Set, language and foil are all sprite icons (background-image + position); condition is a plain text badge.
const PRODUCT_ATTRIBUTES_SELECTOR = '.product-attributes';
const SET_LINK_SELECTOR = '.expansion-symbol';
const CONDITION_SELECTOR = '.article-condition';
const LANGUAGE_ICON_SELECTOR = '.icon.me-2';
const FOIL_ICON_SELECTOR = '.st_SpecialIcon';
// Cardmarket's product image CDN path repeats the numeric cardmarket id (`idProduct`)
// as both a directory segment and the filename, e.g. `.../676516/676516.jpg`.
const CARDMARKET_ID_FROM_IMAGE_URL = /\/(\d+)\.\w+(?:\?.*)?$/;

/** A single sprite-sheet icon (set, language or foil), as rendered on Cardmarket via inline `background-image`/`background-position`. */
export interface SpriteIcon {
  imageUrl: string;
  position: string;
  width: string;
  height: string;
  label: string;
}

export interface Condition {
  abbreviation: string;
  label: string;
}

export interface Offer {
  name: string;
  cardUrl: string;
  priceText: string | null;
  imageUrl: string | null;
  quantity: string | null;
  set: SpriteIcon | null;
  language: SpriteIcon | null;
  condition: Condition | null;
  foil: SpriteIcon | null;
  /** Cardmarket's numeric product id (`idProduct`), used to look up the card on Scryfall. */
  cardmarketId: string | null;
  /** Full Scryfall card response for `cardmarketId`, filled in later by `enrichOffersWithScryfallData`. */
  scryfallCard: ScryfallCard | null;
  /** Offer price diffed against Scryfall's average price, filled in later by `enrichOffersWithScryfallData`. */
  priceDiffFromAverage: PriceDiffFromAverage | null;
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

function readSpriteStyle(el: Element | null): Omit<SpriteIcon, 'label'> | null {
  const style = el?.getAttribute('style');
  if (!style) return null;
  const imageUrl = style.match(
    /background-image:\s*url\(['"]?([^'")]+)['"]?\)/,
  )?.[1];
  const position = style.match(/background-position:\s*([^;]+)/)?.[1]?.trim();
  const width = style.match(/(?<!min-)width:\s*([^;]+)/)?.[1]?.trim();
  const height = style.match(/(?<!min-)height:\s*([^;]+)/)?.[1]?.trim();
  if (!imageUrl || !position || !width || !height) return null;
  return { imageUrl, position, width, height };
}

function readSpriteIcon(el: Element | null): SpriteIcon | null {
  const style = readSpriteStyle(el);
  const label = el?.getAttribute('aria-label')?.trim();
  if (!style || !label) return null;
  return { ...style, label };
}

function readSetIcon(attributes: Element | null): SpriteIcon | null {
  const link = attributes?.querySelector(SET_LINK_SELECTOR) ?? null;
  // The label lives on the wrapping <a>, the sprite style on its nested <span>.
  const style = readSpriteStyle(link?.querySelector('span') ?? null);
  const label = link?.getAttribute('aria-label')?.trim();
  if (!style || !label) return null;
  return { ...style, label };
}

function readCondition(attributes: Element | null): Condition | null {
  const link = attributes?.querySelector(CONDITION_SELECTOR) ?? null;
  const abbreviation = link?.querySelector('.badge')?.textContent?.trim();
  const label = link?.getAttribute('data-bs-original-title')?.trim();
  if (!abbreviation || !label) return null;
  return { abbreviation, label };
}

function readCardmarketId(imageUrl: string | null): string | null {
  return imageUrl?.match(CARDMARKET_ID_FROM_IMAGE_URL)?.[1] ?? null;
}

/** Parses each offer row of a seller's offers grid (see `findOffersTable`) into structured data. */
export function parseOffers(table: HTMLElement): Offer[] {
  return Array.from(table.querySelectorAll(BODY_ROW_SELECTOR)).map((row) => {
    const attributes = row.querySelector(PRODUCT_ATTRIBUTES_SELECTOR);
    const imageUrl = readImageUrl(row);
    return {
      name: readText(row, NAME_SELECTOR) ?? '',
      cardUrl: readLink(row, NAME_SELECTOR) ?? '',
      priceText: readText(row, PRICE_SELECTOR),
      imageUrl,
      quantity: readText(row, QUANTITY_SELECTOR),
      set: readSetIcon(attributes),
      language: readSpriteIcon(
        attributes?.querySelector(LANGUAGE_ICON_SELECTOR) ?? null,
      ),
      condition: readCondition(attributes),
      foil: readSpriteIcon(
        attributes?.querySelector(FOIL_ICON_SELECTOR) ?? null,
      ),
      cardmarketId: readCardmarketId(imageUrl),
      scryfallCard: null,
      priceDiffFromAverage: null,
    };
  });
}
