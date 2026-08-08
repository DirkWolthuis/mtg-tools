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

describe('findOffersTable', () => {
  it('finds a table that has body rows', () => {
    const doc = buildDocument(`
      <table class="table">
        <thead><tr><th>Product</th><th>Price</th></tr></thead>
        <tbody><tr><td>Llanowar Elves</td><td>0.20 &euro;</td></tr></tbody>
      </table>
    `);

    expect(findOffersTable(doc)).not.toBeNull();
  });

  it('returns null when no table has body rows', () => {
    const doc = buildDocument(
      `<table class="table"><thead><tr><th>Product</th></tr></thead></table>`,
    );

    expect(findOffersTable(doc)).toBeNull();
  });
});

describe('addAveragePriceColumn', () => {
  it('appends a header cell and one body cell per row', () => {
    const doc = buildDocument(`
      <table class="table">
        <thead><tr><th>Product</th><th>Price</th></tr></thead>
        <tbody>
          <tr><td>Llanowar Elves</td><td>0.20 &euro;</td></tr>
          <tr><td>Counterspell</td><td>3.00 &euro;</td></tr>
        </tbody>
      </table>
    `);
    const table = findOffersTable(doc);
    if (!table) throw new Error('expected to find the offers table');

    addAveragePriceColumn(table);

    const headerCells = table.querySelectorAll('thead tr th');
    const bodyRows = table.querySelectorAll('tbody tr');

    expect(headerCells).toHaveLength(3);
    expect(headerCells[2].textContent).toBe('Avg. Price');
    expect(bodyRows[0].querySelectorAll('td')).toHaveLength(3);
    expect(bodyRows[1].querySelectorAll('td')).toHaveLength(3);
  });

  it('does not add a duplicate column when called twice', () => {
    const doc = buildDocument(`
      <table class="table">
        <thead><tr><th>Product</th></tr></thead>
        <tbody><tr><td>Llanowar Elves</td></tr></tbody>
      </table>
    `);
    const table = findOffersTable(doc);
    if (!table) throw new Error('expected to find the offers table');

    addAveragePriceColumn(table);
    addAveragePriceColumn(table);

    expect(
      table.querySelectorAll(`.${AVERAGE_PRICE_COLUMN_CLASS}`),
    ).toHaveLength(2);
  });
});
