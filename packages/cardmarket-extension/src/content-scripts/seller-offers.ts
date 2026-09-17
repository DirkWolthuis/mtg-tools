import { findOffersTable } from '../lib/offers-table.js';
import { parseOffers } from '../lib/parse-offers.js';
import { enrichOffersWithScryfallData } from '../lib/enrich-offers.js';
import {
  renderOffersGrid,
  type OffersView,
} from '../lib/render-offers-grid.js';

const LOG_PREFIX = '[cardmarket-offers-grid]';
const GRID_ROOT_ID = 'cardmarket-offers-grid-root';

async function run(): Promise<void> {
  console.debug(LOG_PREFIX, 'content script injected on', window.location.href);

  const isMagicSeller = window.location.href.includes('/Magic/Users/');

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

  const gridRoot = document.createElement('div');
  gridRoot.id = GRID_ROOT_ID;
  // Placed before the table (not after) so the layout tabs stay above it when
  // the "default table" view is active and the table becomes visible again.
  table.insertAdjacentElement('beforebegin', gridRoot);
  // Hidden, not removed/moved: Cardmarket's add-to-cart request gets rejected (403) if its buy
  // button is cloned or re-parented elsewhere, so the original table (and its buttons) stay in place.
  // The grid UI can switch back to this default table on demand (see onViewChange below).
  table.style.display = 'none';

  const onViewChange = (view: OffersView): void => {
    table.style.display = view === 'table' ? '' : 'none';
  };

  renderOffersGrid(gridRoot, parsedOffers, { isLoading: true, onViewChange });

  if (isMagicSeller) {
    console.debug(
      LOG_PREFIX,
      'Magic seller page, starting Scryfall enrichment',
    );
    const offers = await enrichOffersWithScryfallData(parsedOffers);

    renderOffersGrid(gridRoot, offers, { isLoading: false, onViewChange });
    console.debug(LOG_PREFIX, `rendered ${offers.length} offer(s)`);
    return;
  }
  console.debug(
    LOG_PREFIX,
    'NON Magic seller page, skipping Scryfall enrichment',
  );
  renderOffersGrid(gridRoot, parsedOffers, { isLoading: false, onViewChange });
}

void run();
