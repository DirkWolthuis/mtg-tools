/// <reference types='vitest' />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/cube-diff',
  plugins: [preact(), tailwindcss()],
  build: {
    outDir: './dist',
    reportCompressedSize: true,
    emptyOutDir: true,
  },
}));
