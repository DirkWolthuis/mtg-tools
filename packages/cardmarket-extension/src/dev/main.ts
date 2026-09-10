import { renderOffersGrid } from '../lib/render-offers-grid.js';
import { createMockOffers } from './mock-offers.js';

// Mirrors how the content script mounts the grid (see seller-offers.ts): a
// host element gets a shadow root so Tailwind's styles stay isolated.
const host = document.getElementById('offers-grid-host');
if (!host) throw new Error('#offers-grid-host not found in dev.html');

renderOffersGrid(host, createMockOffers());
