import type { Offer, SpriteIcon } from '../lib/parse-offers.js';

/**
 * A generic 16x11 sprite icon shared by all mock offers.
 *
 * Cardmarket's real icons are positioned slices of a hosted sprite sheet
 * that isn't reachable from a local dev server, so instead we point every
 * icon at the same small inline SVG data URI (a flat colored rectangle).
 * `label`/`position` still vary per icon so the surrounding markup (tooltips,
 * layout, condition badge colors, etc.) can be reviewed like it would with
 * real data.
 */
function mockIcon(label: string, color: string): SpriteIcon {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='11'><rect width='16' height='11' fill='${color}'/></svg>`;
  return {
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    position: '0 0',
    width: '16px',
    height: '11px',
    label,
  };
}

const SET_ICON = mockIcon('Dominaria', '#8a7c5a');
const LANGUAGE_ICON = mockIcon('English', '#4a6fa5');
const FOIL_ICON = mockIcon('Foil', '#c9a635');

/** Placeholder card art so the grid has something to render besides the "No image" fallback. */
function mockImageUrl(seed: string): string {
  return `https://placehold.co/300x420/png?text=${encodeURIComponent(seed)}`;
}

function baseOffer(overrides: Partial<Offer>): Offer {
  return {
    name: 'Unnamed Card',
    cardUrl: '#',
    priceText: null,
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

/** A representative spread of offers (full/partial data, no image, enriched/un-enriched) for local UI review. */
export function createMockOffers(): Offer[] {
  return [
    baseOffer({
      name: 'Llanowar Elves',
      cardUrl: '/en/Magic/Products/Singles/Dominaria/Llanowar-Elves',
      priceText: '0,20 €',
      imageUrl: mockImageUrl('Llanowar Elves'),
      quantity: '4x',
      set: SET_ICON,
      language: LANGUAGE_ICON,
      condition: { abbreviation: 'NM', label: 'Near Mint' },
      cardmarketId: '676516',
      cubeStats: { elo: 1244.6, popularity: 3.26, cubeCount: 11910 },
      priceDiffFromAverage: { absolute: -0.05, percentage: -0.2 },
    }),
    baseOffer({
      name: 'Counterspell',
      cardUrl: '/en/Magic/Products/Singles/Masters-25/Counterspell',
      priceText: '1,50 €',
      imageUrl: mockImageUrl('Counterspell'),
      quantity: '1x',
      set: SET_ICON,
      language: LANGUAGE_ICON,
      condition: { abbreviation: 'EX', label: 'Excellent' },
      foil: FOIL_ICON,
      priceDiffFromAverage: { absolute: 0.3, percentage: 0.25 },
    }),
    baseOffer({
      name: 'Black Lotus (no image, minimal data)',
      cardUrl: '#',
      priceText: '25.000,00 €',
    }),
    baseOffer({
      name: 'Mox Sapphire',
      cardUrl: '#',
      priceText: '8.000,00 €',
      imageUrl: mockImageUrl('Mox Sapphire'),
      condition: { abbreviation: 'PO', label: 'Poor' },
    }),
    baseOffer({
      name: 'Sol Ring',
      cardUrl: '#',
      priceText: '2,00 €',
      imageUrl: mockImageUrl('Sol Ring'),
      quantity: '10x',
      condition: { abbreviation: 'GD', label: 'Good' },
      language: LANGUAGE_ICON,
    }),
    baseOffer({
      name: 'Ragavan, Nimble Pilferer',
      cardUrl: '#',
      priceText: '45,00 €',
      imageUrl: mockImageUrl('Ragavan'),
      set: SET_ICON,
      language: LANGUAGE_ICON,
      condition: { abbreviation: 'MT', label: 'Mint' },
      foil: FOIL_ICON,
      cubeStats: { elo: 1620.2, popularity: 22.4, cubeCount: 5400 },
    }),
    baseOffer({
      name: 'Very Long Card Name That Should Wrap Or Truncate Gracefully',
      cardUrl: '#',
      priceText: '0,05 €',
      imageUrl: mockImageUrl('Long Name'),
      condition: { abbreviation: 'LP', label: 'Lightly Played' },
    }),
    baseOffer({
      name: 'Lightning Bolt',
      cardUrl: '#',
      priceText: '0,50 €',
      imageUrl: mockImageUrl('Lightning Bolt'),
      quantity: '99x',
      set: SET_ICON,
      condition: { abbreviation: 'PL', label: 'Played' },
    }),
  ];
}
