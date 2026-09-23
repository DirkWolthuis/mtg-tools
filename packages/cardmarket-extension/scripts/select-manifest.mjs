// Overwrites the just-built dist/manifest.json with a browser-specific
// variant. `vite build` copies `public/manifest.json` (the Chrome/MV3
// default) into dist/ automatically via its public-dir handling; this script
// swaps in `manifests/manifest.<target>.json` when building for another
// browser (e.g. Firefox, which needs `background.scripts` instead of
// `background.service_worker` plus `browser_specific_settings.gecko`).
// Kept outside `public/` so it never gets copied into the Chrome build too.
import { copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

const target = process.argv[2];

if (!target) {
  console.error('Usage: node scripts/select-manifest.mjs <target>');
  process.exit(1);
}

const root = import.meta.dirname
  ? path.join(import.meta.dirname, '..')
  : path.join(new URL('.', import.meta.url).pathname, '..');

const source = path.join(root, 'manifests', `manifest.${target}.json`);
const dest = path.join(root, 'dist', 'manifest.json');

if (!existsSync(source)) {
  console.error(`No manifest override found at ${source}`);
  process.exit(1);
}

await copyFile(source, dest);
console.log(`Applied ${path.relative(root, source)} -> ${path.relative(root, dest)}`);
