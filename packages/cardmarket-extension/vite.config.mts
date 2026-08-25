/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

// Chrome MV3 bundle: content scripts must be classic scripts (no import/export),
// so each entry is built as a standalone IIFE via its own rollup input/build.
// Rollup/rolldown don't support code-splitting (shared chunks) with the iife
// format across multiple inputs, so we run one build per entry instead.
const entries = {
  'content-scripts/seller-offers': 'src/content-scripts/seller-offers.ts',
  'background/service-worker': 'src/background/service-worker.ts',
};
const entryName = process.env.BUILD_ENTRY;

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/cardmarket-extension',
  plugins: [preact(), tailwindcss()],
  build: {
    outDir: './dist',
    emptyOutDir: !entryName || entryName === Object.keys(entries)[0],
    reportCompressedSize: true,
    rolldownOptions: {
      input: entryName
        ? {
            [entryName]: path.join(
              import.meta.dirname,
              entries[entryName as keyof typeof entries],
            ),
          }
        : Object.fromEntries(
            Object.entries(entries).map(([name, file]) => [
              name,
              path.join(import.meta.dirname, file),
            ]),
          ),
      output: {
        // Fixed (unhashed) file names so manifest.json can reference them directly.
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
        // Content scripts can't be loaded as ES modules; bundle each entry
        // as a self-contained IIFE with no shared external chunks.
        format: 'iife' as const,
        inlineDynamicImports: true,
      },
    },
  },
  test: {
    name: 'cardmarket-extension',
    watch: false,
    globals: true,
    environment: 'jsdom',
    css: true, // needed so ?inline CSS imports get the real (Tailwind-compiled) output in tests
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
