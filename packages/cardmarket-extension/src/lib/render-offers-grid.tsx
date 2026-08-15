import { render } from 'preact';
import gridCss from '../styles/grid.css?inline';
import { OffersGrid } from '../components/OffersGrid.js';
import type { Offer } from './parse-offers.js';

/** Mounts the offers grid into a Shadow DOM on `host`, isolating Tailwind's styles from the page's own CSS. */
export function renderOffersGrid(host: HTMLElement, offers: Offer[]): void {
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

  render(<OffersGrid offers={offers} />, mount);
}
