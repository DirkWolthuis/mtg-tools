import { describe, expect, it } from 'vitest';
import { parseOffers } from './parse-offers.js';

function buildTable(rowsHtml: string): HTMLElement {
  const doc = new DOMParser().parseFromString(
    `<html><body>
      <div class="article-table">
        <div class="table-body">${rowsHtml}</div>
      </div>
    </body></html>`,
    'text/html',
  );
  const table = doc.querySelector<HTMLElement>('.article-table');
  if (!table) throw new Error('expected fixture to contain .article-table');
  return table;
}

describe('parseOffers', () => {
  it('extracts name, price, image and quantity from a row', () => {
    const table = buildTable(`
      <div class="row g-0 article-row">
        <div class="col-sellerProductInfo col">Llanowar Elves</div>
        <div class="item-count">3x</div>
        <div class="col-offer col-auto">
          <img src="https://example.com/llanowar-elves.jpg" />
          <div class="price-container"><span class="color-primary">0,20 &euro;</span></div>
        </div>
      </div>
    `);

    expect(parseOffers(table)).toEqual([
      {
        name: 'Llanowar Elves',
        priceText: '0,20 €',
        imageUrl: 'https://example.com/llanowar-elves.jpg',
        quantity: '3x',
      },
    ]);
  });

  it('falls back to null for missing price, image and quantity', () => {
    const table = buildTable(`
      <div class="row g-0 article-row">
        <div class="col-sellerProductInfo col">Counterspell</div>
        <div class="col-offer col-auto"></div>
      </div>
    `);

    expect(parseOffers(table)).toEqual([
      {
        name: 'Counterspell',
        priceText: null,
        imageUrl: null,
        quantity: null,
      },
    ]);
  });

  it('returns an empty array when there are no offer rows', () => {
    const table = buildTable('');

    expect(parseOffers(table)).toEqual([]);
  });
});
