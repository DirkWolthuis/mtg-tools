import { findOffersTable } from '../lib/offers-table.js';
import { parseOffers } from '../lib/parse-offers.js';
import { enrichOffersWithScryfallData } from '../lib/enrich-offers.js';
import { renderOffersGrid } from '../lib/render-offers-grid.js';

const LOG_PREFIX = '[cardmarket-offers-grid]';
const GRID_ROOT_ID = 'cardmarket-offers-grid-root';

async function run(): Promise<void> {
  console.debug(LOG_PREFIX, 'content script injected on', window.location.href);

  if (document.getElementById(GRID_ROOT_ID)) return; // already rendered

  const table = findOffersTable(document);
  if (!table) {
    console.debug(
      LOG_PREFIX,
      'no offers table found - the selector may need updating for this page, see src/lib/offers-table.ts',
    );
    return;
  }

  const parsedOffers = parseOffers(table);
  console.debug(
    LOG_PREFIX,
    `parsed ${parsedOffers.length} offer(s), ${parsedOffers.filter((offer) => offer.cardmarketId).length} with a cardmarketId`,
  );
  const offers = await enrichOffersWithScryfallData(parsedOffers);

  const gridRoot = document.createElement('div');
  gridRoot.id = GRID_ROOT_ID;
  table.replaceWith(gridRoot);

  renderOffersGrid(gridRoot, offers);
  console.debug(LOG_PREFIX, `rendered ${offers.length} offer(s)`);
}

void run();
