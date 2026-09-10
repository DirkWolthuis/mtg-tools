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

/** Mounts the offers grid into a Shadow DOM on `host`, isolating Tailwind's styles from the page's own CSS. */
export function renderOffersGrid(
  host: HTMLElement,
  offers: Offer[],
  options: RenderOffersGridOptions = {},
): void {
  const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: 'open' });

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
