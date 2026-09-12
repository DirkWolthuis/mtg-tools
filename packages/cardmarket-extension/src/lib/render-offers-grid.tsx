import { render } from 'preact';
import gridCss from '../styles/grid.css?inline';
import { OffersApp } from '../components/OffersApp.js';
import type { OffersView } from '../components/OffersGridHeader.js';
import type { Offer } from './parse-offers.js';

export type { OffersView } from '../components/OffersGridHeader.js';

export interface RenderOffersGridOptions {
  /** Shows loading skeletons instead of real cards, e.g. while Scryfall enrichment is in flight. */
  isLoading?: boolean;
  /** Called whenever the user switches between the card grid and Cardmarket's default table (including on mount). */
  onViewChange?: (view: OffersView) => void;
}

const PROPERTY_REGISTRATIONS_STYLE_ID =
  'cardmarket-ext-tw-property-registrations';

/**
 * Tailwind v4's compiled CSS declares its internal tokens (`--tw-shadow`,
 * `--tw-inset-shadow`, `--tw-rotate-x`, ...) with `@property`, which gives
 * them typed initial values so utilities can compose them safely (e.g.
 * `shadow-md` referencing `--tw-inset-shadow` even when nothing else sets
 * it). Browsers only honor `@property` rules declared in the top-level
 * document - a `<style>` living inside a shadow root is silently ignored -
 * so without this, every composed utility (shadow-*, ring-*, ...) resolves
 * to an invalid value and the whole declaration drops to `none` inside our
 * shadow-DOM-isolated grid. `@property` registrations are otherwise inert
 * (they don't set any visible styling), so registering them once on the
 * host page is safe and lets those initial values apply inside the shadow
 * tree too.
 */
function ensurePropertyRegistrations(doc: Document, css: string): void {
  if (doc.getElementById(PROPERTY_REGISTRATIONS_STYLE_ID)) return;
  const propertyRules = css.match(/@property\s+--[\w-]+\s*\{[^}]*\}/g);
  if (!propertyRules?.length) return;
  const style = doc.createElement('style');
  style.id = PROPERTY_REGISTRATIONS_STYLE_ID;
  style.textContent = propertyRules.join('\n');
  doc.head.appendChild(style);
}

/** Mounts the offers grid into a Shadow DOM on `host`, isolating Tailwind's styles from the page's own CSS. */
export function renderOffersGrid(
  host: HTMLElement,
  offers: Offer[],
  options: RenderOffersGridOptions = {},
): void {
  const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: 'open' });

  ensurePropertyRegistrations(host.ownerDocument, gridCss);

  let style = shadowRoot.querySelector('style');
  if (!style) {
    style = host.ownerDocument.createElement('style');
    shadowRoot.appendChild(style);
  }
  style.textContent = gridCss;

  let mount = shadowRoot.querySelector<HTMLElement>('[data-offers-grid-mount]');
  if (!mount) {
    mount = host.ownerDocument.createElement('div');
    mount.setAttribute('data-offers-grid-mount', '');
    // DaisyUI's theme CSS variables are keyed off `:root`/`[data-theme]`
    // selectors; `:root` never matches inside a shadow tree, so without this
    // attribute none of daisyUI's color variables would resolve here.
    mount.setAttribute('data-theme', 'dracula');
    shadowRoot.appendChild(mount);
  }

  render(
    <OffersApp
      offers={offers}
      isLoading={options.isLoading}
      onViewChange={options.onViewChange}
    />,
    mount,
  );
}
