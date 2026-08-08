/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';

// Chrome MV3 bundle: a single content script entry. manifest.json is static
// and copied as-is from `public/` (Vite's default publicDir).
export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/cardmarket-extension',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    rolldownOptions: {
      input: {
        'content-scripts/seller-offers': path.join(
          import.meta.dirname,
          'src/content-scripts/seller-offers.ts',
        ),
      },
      output: {
        // Fixed (unhashed) file names so manifest.json can reference them directly.
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  test: {
    name: 'cardmarket-extension',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
