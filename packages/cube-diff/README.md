# @org/cube-diff

A small web app for comparing a [CubeCobra](https://cubecobra.com) cube's current mainboard against how it looked on
a past date - showing the cards that were added and cut as an image grid, with a shareable URL.

## How it works

- Uses CubeCobra's public [`GET /cube/api/cubeJSON/:id`](https://cubecobra.com/help/apidocs#cube-json) endpoint, which
  supports an optional `date` query parameter (`date` = a Unix ms timestamp) to return the cube as it existed at the
  nearest changelog on or before that date. The endpoint is CORS-enabled, so this app calls it directly from the
  browser - no backend required.
- Fetches the cube twice: once for the given date, once for "now", then diffs the two `mainboard` card lists by
  Scryfall oracle ID (so a reprint of the same card isn't shown as both a cut and an add).
- The cube link/ID and date are mirrored into the page URL (`?cube=...&date=...`) so the comparison can be bookmarked
  or shared; opening a shared link re-runs the diff automatically.

## Development

```sh
npx nx dev cube-diff      # start the Vite dev server
npx nx build cube-diff    # production build
npx nx test cube-diff     # unit tests (diffing/URL/API-parsing logic)
npx nx lint cube-diff
```
