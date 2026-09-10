import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Dev-only server for rendering the offers grid against mock data
 * (`src/dev/mock-offers.ts`) for quick visual/UI feedback, without needing a
 * real Cardmarket page or the Chrome extension loaded. Run with `nx dev
 * cardmarket-extension` and open the printed local URL - it serves `dev.html`.
 *
 * Kept separate from `vite.config.mts`, which is dedicated to producing the
 * IIFE bundles for the actual extension (content script + service worker).
 */
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/cardmarket-extension-dev',
  plugins: [preact(), tailwindcss()],
  server: {
    open: '/dev.html',
  },
});
