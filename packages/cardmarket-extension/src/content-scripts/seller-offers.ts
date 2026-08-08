import { addAveragePriceColumn, findOffersTable } from '../lib/offers-table.js';

const LOG_PREFIX = '[cardmarket-avg-price]';

function run(): void {
  console.debug(LOG_PREFIX, 'content script injected on', window.location.href);

  const table = findOffersTable(document);
  if (!table) {
    console.debug(
      LOG_PREFIX,
      'no offers table found - the selector may need updating for this page, see src/lib/offers-table.ts',
    );
    return;
  }

  addAveragePriceColumn(table);
  console.debug(LOG_PREFIX, 'average price column added');
}

run();
