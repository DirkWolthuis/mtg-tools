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
2. Add real extension icons and reference them from both
   `public/manifest.json` and `manifests/manifest.firefox.json` (an `icons`
   map keyed by size, e.g. `16`/`32`/`48`/`128`, pointing at bundled PNGs).
   Neither manifest currently declares any.
3. Because the build output is minified/bundled, AMO requires the
   unminified source plus build steps to be submitted for review alongside
   the package (Developer Hub → submission → "Source Code").
4. Create/verify a Firefox Developer (AMO) account with 2FA, and fill in the
   store listing (description, screenshots, privacy policy disclosing the
   `api.scryfall.com` network request, and permission justifications).
5. Mozilla's `data_collection_permissions` manifest key isn't required yet
   (Firefox 140+ only) — `web-ext lint` surfaces it as a notice, not an
   error. Add it once it becomes mandatory, bumping
   `strict_min_version` accordingly if you do.
6. `web-ext lint` also reports an `UNSAFE_VAR_ASSIGNMENT` ("Unsafe
   assignment to innerHTML") warning on the bundled content script. This is
   **not** our code — it's Preact's own reconciler internals (the
   `dangerouslySetInnerHTML` support in its `diff/props` logic), which is a
   single, non-tree-shakable code path present in every Preact build. This
   app never uses `dangerouslySetInnerHTML` anywhere in its own JSX (verified:
   no matches in `src/`), so the branch is dead code here. Mozilla's own
   `addons-linter` registers this rule (`no-unsanitized/property`) at
   *warning*, not *error*, severity precisely because virtually every
   React/Preact/Vue-based extension trips it — it does not block AMO
   validation or review (confirmed: `errors: 0` in `lint:firefox` output).
   The only way to remove it entirely would be to patch Preact's compiled
   dist files (e.g. via `patch-package`) to strip that branch, which was
   deliberately not done here: it would add a repo-wide postinstall step
   that needs manual re-verification on every Preact upgrade, just to
   silence a warning that has no functional or security impact and is a
   well-understood false positive to AMO reviewers.

### cube-stats data is sharded, not one big file

`public/cube-stats/<prefix>.json` holds ~258 small shards (one per
lowercased 2-character Scryfall id prefix, ~50-60KB each) instead of a single
~13MB `cube-stats.json`. This is required for Firefox: `web-ext lint`/AMO's
addons-linter treats any non-binary file over 5MB as `FILE_TOO_LARGE` and
refuses to parse it. The background service worker
(`cube-stats-cache.ts`) fetches and caches only the shard a given lookup
needs, so this also avoids loading/parsing the whole dataset on every cold
start. Regenerate all shards with
`node --max-old-space-size=8192 scripts/generate-cube-stats.mjs` whenever
`data/cards/carddict.json` is updated upstream.

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
