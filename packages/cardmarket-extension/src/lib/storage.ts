import type { OfferRow, SellerCapture } from './types.js';

function captureKey(seller: string, wantslistId: string): string {
  return `capture:${seller}:${wantslistId}`;
}

export async function mergeOffers(
  seller: string,
  wantslistId: string,
  newOffers: OfferRow[],
): Promise<SellerCapture> {
  const key = captureKey(seller, wantslistId);
  const existing = (await chrome.storage.local.get(key))[key] as
    SellerCapture | undefined;

  const byId = new Map(
    (existing?.offers ?? []).map((offer) => [offer.id, offer]),
  );
  for (const offer of newOffers) byId.set(offer.id, offer);

  const capture: SellerCapture = {
    seller,
    wantslistId,
    capturedAt: new Date().toISOString(),
    offers: Array.from(byId.values()),
  };

  await chrome.storage.local.set({ [key]: capture });
  return capture;
}

export async function getCapture(
  seller: string,
  wantslistId: string,
): Promise<SellerCapture | null> {
  const key = captureKey(seller, wantslistId);
  return (
    ((await chrome.storage.local.get(key))[key] as SellerCapture | undefined) ??
    null
  );
}

export async function clearCapture(
  seller: string,
  wantslistId: string,
): Promise<void> {
  await chrome.storage.local.remove(captureKey(seller, wantslistId));
}
