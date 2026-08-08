import { clearCapture, getCapture, mergeOffers } from './lib/storage.js';
import { getReferencePriceEur } from './lib/pricing.js';
import type { Message } from './lib/messages.js';

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse);
    return true; // keep the message channel open for the async response
  },
);

async function handleMessage(message: Message): Promise<unknown> {
  switch (message.type) {
    case 'CAPTURE_OFFERS':
      return mergeOffers(message.seller, message.wantslistId, message.offers);
    case 'GET_CAPTURE':
      return getCapture(message.seller, message.wantslistId);
    case 'CLEAR_CAPTURE':
      await clearCapture(message.seller, message.wantslistId);
      return null;
    case 'GET_REFERENCE_PRICE':
      return getReferencePriceEur(message.cardName);
  }
}
