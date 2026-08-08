import type { OfferRow } from './types.js';

// Type-only, shared between background/content-script/popup - erased at build time
// so importing it does not pull the content script into a shared runtime chunk.
export type Message =
  | {
      type: 'CAPTURE_OFFERS';
      seller: string;
      wantslistId: string;
      offers: OfferRow[];
    }
  | { type: 'GET_CAPTURE'; seller: string; wantslistId: string }
  | { type: 'CLEAR_CAPTURE'; seller: string; wantslistId: string }
  | { type: 'GET_REFERENCE_PRICE'; cardName: string };
