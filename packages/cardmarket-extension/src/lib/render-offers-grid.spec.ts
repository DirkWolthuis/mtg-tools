import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'preact/test-utils';
import { renderOffersGrid } from './render-offers-grid.js';
import type { Offer } from './parse-offers.js';

function buildOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    name: 'Llanowar Elves',
    cardUrl: '/en/Magic/Products/Singles/Dominaria/Llanowar-Elves',
    priceText: '0,20 €',
    imageUrl: null,
    quantity: null,
    set: null,
    language: null,
    condition: null,
    foil: null,
    cardmarketId: null,
    scryfallCard: null,
    priceDiffFromAverage: null,
    cubeStats: null,
    actionsElement: null,
    ...overrides,
  };
}

describe('renderOffersGrid', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mounts a shadow root with injected styles and one card per offer', () => {
    const host = document.createElement('div');

    renderOffersGrid(host, [
      buildOffer(),
      buildOffer({ name: 'Counterspell' }),
    ]);

    const shadowRoot = host.shadowRoot;
    expect(shadowRoot).not.toBeNull();
    expect(shadowRoot?.querySelector('style')?.textContent).toBeTruthy();
    expect(
      shadowRoot?.querySelectorAll('[data-testid="offer-card"]'),
    ).toHaveLength(2);
  });

  it('renders an empty state when there are no offers', () => {
    const host = document.createElement('div');

    renderOffersGrid(host, []);

    expect(
      host.shadowRoot?.querySelector('[data-testid="offers-grid-empty"]'),
    ).not.toBeNull();
  });

  it('re-renders into the same shadow root when called again', () => {
    const host = document.createElement('div');

    renderOffersGrid(host, [buildOffer()]);
    renderOffersGrid(host, [
      buildOffer(),
      buildOffer({ name: 'Counterspell' }),
    ]);

    expect(host.shadowRoot?.querySelectorAll('style')).toHaveLength(1);
    expect(
      host.shadowRoot?.querySelectorAll('[data-testid="offer-card"]'),
    ).toHaveLength(2);
  });

  it('shows one skeleton per offer instead of cards while isLoading is true', () => {
    const host = document.createElement('div');

    renderOffersGrid(host, [buildOffer(), buildOffer()], {
      isLoading: true,
    });

    const shadowRoot = host.shadowRoot;
    expect(
      shadowRoot?.querySelectorAll('[data-testid="offer-card-skeleton"]'),
    ).toHaveLength(2);
    expect(
      shadowRoot?.querySelectorAll('[data-testid="offer-card"]'),
    ).toHaveLength(0);
  });

  it('replaces skeletons with real cards once loading finishes', () => {
    const host = document.createElement('div');

    renderOffersGrid(host, [buildOffer()], { isLoading: true });
    renderOffersGrid(host, [buildOffer()], { isLoading: false });

    const shadowRoot = host.shadowRoot;
    expect(
      shadowRoot?.querySelectorAll('[data-testid="offer-card-skeleton"]'),
    ).toHaveLength(0);
    expect(
      shadowRoot?.querySelectorAll('[data-testid="offer-card"]'),
    ).toHaveLength(1);
  });

  it('renders layout tabs and calls onViewChange with the initial view on mount', () => {
    const host = document.createElement('div');
    const onViewChange = vi.fn();

    act(() => {
      renderOffersGrid(host, [buildOffer()], { onViewChange });
    });

    expect(onViewChange).toHaveBeenCalledWith('grid');
    expect(
      host.shadowRoot?.querySelector('[data-testid="offers-grid-tab-grid"]'),
    ).not.toBeNull();
    expect(
      host.shadowRoot?.querySelector('[data-testid="offers-grid-tab-table"]'),
    ).not.toBeNull();
  });

  it('switches to the table view and notifies onViewChange when the table tab is clicked', () => {
    const host = document.createElement('div');
    const onViewChange = vi.fn();

    act(() => {
      renderOffersGrid(host, [buildOffer()], { onViewChange });
    });
    const tableTab = host.shadowRoot?.querySelector<HTMLButtonElement>(
      '[data-testid="offers-grid-tab-table"]',
    );
    act(() => {
      tableTab?.click();
    });

    expect(onViewChange).toHaveBeenLastCalledWith('table');
    expect(
      host.shadowRoot?.querySelector('[data-testid="offers-grid"]'),
    ).toBeNull();
  });

  it('applies a user-selected column count as a CSS custom property on the grid', () => {
    const host = document.createElement('div');

    act(() => {
      renderOffersGrid(host, [buildOffer()]);
    });
    const input = host.shadowRoot?.querySelector<HTMLInputElement>(
      '[data-testid="offers-grid-columns-input"]',
    );
    expect(input).not.toBeNull();

    act(() => {
      input!.value = '3';
      input!.dispatchEvent(new Event('change'));
    });

    const grid = host.shadowRoot?.querySelector<HTMLElement>(
      '[data-testid="offers-grid"]',
    );
    expect(grid?.style.getPropertyValue('--offers-grid-columns')).toBe('3');
  });
});
