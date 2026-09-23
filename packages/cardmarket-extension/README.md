# cardmarket-extension

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build cardmarket-extension` to build the extension for Chrome
(Manifest V3, `background.service_worker`).

Run `npm run build:firefox` (inside this package) to build for Firefox
instead. Firefox's MV3 implementation doesn't support
`background.service_worker`, so this swaps in
`manifests/manifest.firefox.json` (which uses `background.scripts` and adds
`browser_specific_settings.gecko`) over the default `public/manifest.json`
after the Vite build completes.

## Packaging & publishing to browser stores

- `npm run package:chrome` — builds and zips a clean Chrome package into
  `dist-packages/`.
- `npm run package:firefox` — builds and zips a clean Firefox package into
  `dist-packages/`, using [`web-ext`](https://github.com/mozilla/web-ext) so
  no OS-specific junk (e.g. `__MACOSX/`, `.DS_Store`) ends up in the archive.
- `npm run lint:firefox` — runs `web-ext lint` against the Firefox build,
  which mirrors Mozilla's automated AMO validation.

Remaining manual steps before submitting to
[addons.mozilla.org](https://addons.mozilla.org/developers/):

1. Replace the placeholder `browser_specific_settings.gecko.id` in
   `manifests/manifest.firefox.json` with an ID you actually own (a domain
   you control, or a generated UUID in `{...}` form).
2. Replace the placeholder icons in `public/icons/` with real branded
   artwork (currently simple generated placeholders).
3. `public/cube-stats.json` is ~13MB, which trips `web-ext lint`'s
   `FILE_TOO_LARGE` check (Mozilla's linter can't parse files over 5MB).
   This doesn't necessarily block submission, but consider slimming the
   dataset, compressing it, or serving it from a remote endpoint instead of
   bundling it, before submitting for review.
4. Because the build output is minified/bundled, AMO requires the
   unminified source plus build steps to be submitted for review alongside
   the package (Developer Hub → submission → "Source Code").
5. Create/verify a Firefox Developer (AMO) account with 2FA, and fill in the
   store listing (description, screenshots, privacy policy disclosing the
   `api.scryfall.com` network request, and permission justifications).

## Running unit tests

Run `nx test cardmarket-extension` to execute the unit tests via [Vitest](https://vitest.dev/).

## Local UI dev server

Run `nx dev cardmarket-extension` to start a Vite dev server that renders the
offers grid against mock data (`src/dev/mock-offers.ts`), for quick UI
feedback without needing a real Cardmarket page or a loaded extension. It
opens `dev.html`; edit the mock offers file to try out different data.

## Feature ideas

- Show price of cheapest print
- Show art of other prints
- Scryfall button -> all prints
