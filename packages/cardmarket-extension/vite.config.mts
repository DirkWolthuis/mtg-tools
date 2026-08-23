/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

// Chrome MV3 bundle: a single content script entry. manifest.json is static
// and copied as-is from `public/` (Vite's default publicDir).
export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/cardmarket-extension',
  plugins: [preact(), tailwindcss()],
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
        'background/service-worker': path.join(
          import.meta.dirname,
          'src/background/service-worker.ts',
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
    css: true, // needed so ?inline CSS imports get the real (Tailwind-compiled) output in tests
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
