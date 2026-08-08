import { summarizeOffers } from '../lib/aggregate.js';
import type { Message } from '../lib/messages.js';
import type { CardSummary, SellerCapture } from '../lib/types.js';

interface Context {
  seller: string;
  wantslistId: string;
}

function getSellerFromUrl(url: URL): string | null {
  const match = url.pathname.match(/\/Magic\/Users\/([^/]+)\/Offers\/Singles/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function getActiveContext(): Promise<Context | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;

  const url = new URL(tab.url);
  const wantslistId = url.searchParams.get('idWantslist');
  const seller = getSellerFromUrl(url);
  return wantslistId && seller ? { seller, wantslistId } : null;
}

function renderEmpty(message: string): void {
  const app = document.getElementById('app');
  if (app) app.innerHTML = `<p class="empty">${message}</p>`;
}

function formatEur(value: number | null): string {
  return value === null ? '-' : `€${value.toFixed(2)}`;
}

function renderSummaries(context: Context, summaries: CardSummary[]): void {
  const app = document.getElementById('app');
  if (!app) return;

  const totalOffers = summaries.reduce(
    (sum, summary) => sum + summary.offerCount,
    0,
  );
  const rows = summaries
    .map((summary) => {
      const deltaClass =
        summary.deltaEur !== null && summary.deltaEur > 0
          ? 'delta-negative'
          : 'delta-positive';
      const deltaText =
        summary.deltaEur === null
          ? '-'
          : `${summary.deltaEur >= 0 ? '+' : ''}${formatEur(summary.deltaEur)}`;
      return `<tr>
        <td>${summary.cardName}</td>
        <td>${summary.offerCount}</td>
        <td>${summary.cheapestExpansion}</td>
        <td>${formatEur(summary.cheapestPriceEur)}</td>
        <td>${formatEur(summary.referencePriceEur)}</td>
        <td class="${deltaClass}">${deltaText}</td>
      </tr>`;
    })
    .join('');

  app.innerHTML = `
    <header>
      <strong>${context.seller}</strong>
      <span>${summaries.length} card(s) / ${totalOffers} offer(s) captured</span>
      <button id="clear">Clear</button>
    </header>
    <table>
      <thead>
        <tr><th>Card</th><th>#</th><th>Set</th><th>Cheapest</th><th>Reference</th><th>Delta</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  document.getElementById('clear')?.addEventListener('click', async () => {
    const message: Message = {
      type: 'CLEAR_CAPTURE',
      seller: context.seller,
      wantslistId: context.wantslistId,
    };
    await chrome.runtime.sendMessage(message);
    renderEmpty(
      "Capture cleared. Revisit the seller's wishlist-filtered offers page to recapture.",
    );
  });
}

async function init(): Promise<void> {
  const context = await getActiveContext();
  if (!context) {
    renderEmpty(
      'Open a Cardmarket seller\u2019s Offers/Singles page filtered by your wishlist (URL contains "idWantslist") to see an overview here.',
    );
    return;
  }

  const getCaptureMessage: Message = {
    type: 'GET_CAPTURE',
    seller: context.seller,
    wantslistId: context.wantslistId,
  };
  const capture = (await chrome.runtime.sendMessage(
    getCaptureMessage,
  )) as SellerCapture | null;

  if (!capture || capture.offers.length === 0) {
    renderEmpty(
      'No offers captured yet for this seller. Browse their wishlist-filtered pages to capture data.',
    );
    return;
  }

  const uniqueCardNames = Array.from(
    new Set(capture.offers.map((offer) => offer.cardName)),
  );
  const referencePrices = new Map<string, number>();
  await Promise.all(
    uniqueCardNames.map(async (cardName) => {
      const message: Message = { type: 'GET_REFERENCE_PRICE', cardName };
      const price = (await chrome.runtime.sendMessage(message)) as
        number | null;
      if (price !== null) referencePrices.set(cardName, price);
    }),
  );

  renderSummaries(context, summarizeOffers(capture.offers, referencePrices));
}

void init();
