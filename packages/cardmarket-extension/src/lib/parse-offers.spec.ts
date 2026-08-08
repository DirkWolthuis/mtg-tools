import { describe, expect, it } from 'vitest';
import { parseOffersFromDocument } from './parse-offers.js';

function buildDocument(rowsHtml: string): Document {
  return new DOMParser().parseFromString(
    `<html><body>${rowsHtml}</body></html>`,
    'text/html',
  );
}

describe('parseOffersFromDocument', () => {
  it('extracts card name, expansion, condition and price from article rows', () => {
    const doc = buildDocument(`
      <div class="article-row">
        <div class="col-product">
          <a class="expand-link" href="#">Lightning Bolt</a>
          <span class="expansion-symbol" data-original-title="Revised Edition"></span>
        </div>
        <div class="article-condition">NM</div>
        <div class="col-price"><span class="price-container">1,25 &euro;</span></div>
      </div>
    `);

    expect(parseOffersFromDocument(doc)).toEqual([
      {
        id: 'Lightning Bolt|Revised Edition|NM|1.25',
        cardName: 'Lightning Bolt',
        expansion: 'Revised Edition',
        condition: 'NM',
        priceEur: 1.25,
      },
    ]);
  });

  it('skips rows without a parseable price', () => {
    const doc = buildDocument(`
      <div class="article-row">
        <div class="col-product"><a class="expand-link" href="#">Unpriced Card</a></div>
        <div class="col-price"></div>
      </div>
    `);

    expect(parseOffersFromDocument(doc)).toEqual([]);
  });
});
