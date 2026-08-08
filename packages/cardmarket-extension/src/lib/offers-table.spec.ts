import { describe, expect, it } from 'vitest';
import {
  addAveragePriceColumn,
  AVERAGE_PRICE_COLUMN_CLASS,
  findOffersTable,
} from './offers-table.js';

function buildDocument(tableHtml: string): Document {
  return new DOMParser().parseFromString(
    `<html><body>${tableHtml}</body></html>`,
    'text/html',
  );
}

function buildOffersTableHtml(): string {
  return `
    <div class="article-table">
      <div class="table-header d-none d-lg-flex">
        <div class="row g-0 flex-nowrap">
          <div class="col-sellerProductInfo col">Name</div>
          <div class="col-offer col-auto">Offer</div>
        </div>
      </div>
      <div class="table-body">
        <div class="row g-0 article-row">
          <div class="col-sellerProductInfo col">Llanowar Elves</div>
          <div class="col-offer col-auto">0,20 &euro;</div>
        </div>
        <div class="row g-0 article-row">
          <div class="col-sellerProductInfo col">Counterspell</div>
          <div class="col-offer col-auto">3,00 &euro;</div>
        </div>
      </div>
    </div>
  `;
}

describe('findOffersTable', () => {
  it('finds the offers grid that has article rows', () => {
    const doc = buildDocument(buildOffersTableHtml());

    expect(findOffersTable(doc)).not.toBeNull();
  });

  it('returns null when no element has article rows', () => {
    const doc = buildDocument(
      `<div class="article-table"><div class="table-header"><div class="row"><div class="col">Name</div></div></div></div>`,
    );

    expect(findOffersTable(doc)).toBeNull();
  });
});

describe('addAveragePriceColumn', () => {
  it('appends a header cell and one body cell per row', () => {
    const doc = buildDocument(buildOffersTableHtml());
    const table = findOffersTable(doc);
    if (!table) throw new Error('expected to find the offers table');

    addAveragePriceColumn(table);

    const headerCells = table.querySelectorAll('.table-header .row > div');
    const rows = table.querySelectorAll('.table-body .article-row');

    expect(headerCells).toHaveLength(3);
    expect(headerCells[2].textContent).toBe('Avg. Price');
    expect(
      rows[0].querySelectorAll(`.${AVERAGE_PRICE_COLUMN_CLASS}`),
    ).toHaveLength(1);
    expect(
      rows[1].querySelectorAll(`.${AVERAGE_PRICE_COLUMN_CLASS}`),
    ).toHaveLength(1);
  });

  it('does not add a duplicate column when called twice', () => {
    const doc = buildDocument(buildOffersTableHtml());
    const table = findOffersTable(doc);
    if (!table) throw new Error('expected to find the offers table');

    addAveragePriceColumn(table);
    addAveragePriceColumn(table);

    // 1 header cell + 2 body cells (one per article row in the fixture)
    expect(
      table.querySelectorAll(`.${AVERAGE_PRICE_COLUMN_CLASS}`),
    ).toHaveLength(3);
  });
});
