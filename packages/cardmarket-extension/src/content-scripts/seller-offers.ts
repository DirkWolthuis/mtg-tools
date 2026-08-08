import { parseOffersFromDocument } from '../lib/parse-offers.js';
import type { Message } from '../lib/messages.js';
import type { SellerCapture } from '../lib/types.js';

function getSellerFromUrl(url: URL): string | null {
  const match = url.pathname.match(/\/Magic\/Users\/([^/]+)\/Offers\/Singles/);
  return match ? decodeURIComponent(match[1]) : null;
}

function renderOverlay(seller: string, count: number): void {
  document.getElementById('cardmarket-overlap-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'cardmarket-overlap-overlay';
  overlay.style.cssText =
    'position:fixed;bottom:16px;right:16px;z-index:2147483647;background:#111;color:#fff;' +
    'padding:10px 14px;border-radius:8px;font:13px/1.4 sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.3);';
  overlay.textContent = `Wishlist overlap captured for ${seller}: ${count} card(s). Open the extension popup for the full overview.`;
  document.body.appendChild(overlay);
}

async function run(): Promise<void> {
  const url = new URL(window.location.href);
  const wantslistId = url.searchParams.get('idWantslist');
  const seller = getSellerFromUrl(url);
  if (!wantslistId || !seller) return;

  const offers = parseOffersFromDocument(document);
  if (offers.length === 0) return;

  const message: Message = {
    type: 'CAPTURE_OFFERS',
    seller,
    wantslistId,
    offers,
  };
  const capture = (await chrome.runtime.sendMessage(message)) as
    SellerCapture | undefined;

  renderOverlay(seller, capture?.offers.length ?? offers.length);
}

void run();
