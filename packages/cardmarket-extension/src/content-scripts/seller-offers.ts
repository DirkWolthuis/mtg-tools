import { addAveragePriceColumn, findOffersTable } from '../lib/offers-table.js';

function run(): void {
  const table = findOffersTable(document);
  if (!table) return;
  addAveragePriceColumn(table);
}

run();
