import type { Offer, SpriteIcon } from '../lib/parse-offers.js';

/**
 * A generic 16x11 sprite icon shared by mock offers that don't have a
 * confirmed real sprite position (currently just the set icon).
 *
 * Cardmarket's real icons are positioned slices of a hosted sprite sheet
 * that isn't reachable from a local dev server, so instead we point every
 * one of these at the same small inline SVG data URI (a flat colored
 * rectangle). `label`/`position` still vary per icon so the surrounding
 * markup (tooltips, layout, etc.) can be reviewed like it would with real
 * data.
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

// Real Cardmarket sprite sheet - language/foil icons are confirmed slices of
// this sheet (unlike the set icon above), so use it directly to load correctly.
const CARDMARKET_SPRITE_SHEET_URL =
  '//static.cardmarket.com/img/0fa565750d09bba2fc85059ebf12e9ac/spriteSheets/ssMain2.png';

function cardmarketSpriteIcon(label: string, position: string): SpriteIcon {
  return {
    imageUrl: CARDMARKET_SPRITE_SHEET_URL,
    position,
    width: '16px',
    height: '16px',
    label,
  };
}

const SET_ICON = mockIcon('Dominaria', '#8a7c5a');
const LANGUAGE_ICON = cardmarketSpriteIcon('English', '-16px 0px');
const FOIL_ICON = cardmarketSpriteIcon('Foil', '-16px -16px');

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
      imageUrl:
        'https://cards.scryfall.io/display/front/6/a/6a0b230b-d391-4998-a3f7-7b158a0ec2cd.webp?1783909057',
      quantity: '4x',
      set: SET_ICON,
      language: LANGUAGE_ICON,
      condition: { abbreviation: 'NM', label: 'Near Mint' },
      cardmarketId: '676516',
      cubeStats: { elo: 1244.6, popularity: 3.26, cubeCount: 11910 },
      priceDiffFromAverage: { absolute: -0.05, percentage: -0.2 },
      actionsElement: document.createElement('div'),
    }),
    baseOffer({
      name: 'Counterspell',
      cardUrl: '/en/Magic/Products/Singles/Masters-25/Counterspell',
      priceText: '1,50 €',
      imageUrl:
        'https://cards.scryfall.io/display/front/4/f/4f616706-ec97-4923-bb1e-11a69fbaa1f8.webp?1783909630',
      quantity: '1x',
      set: SET_ICON,
      language: LANGUAGE_ICON,
      condition: { abbreviation: 'EX', label: 'Excellent' },
      foil: FOIL_ICON,
      priceDiffFromAverage: { absolute: 0.3, percentage: 0.25 },
      actionsElement: document.createElement('div'),
    }),
    baseOffer({
      name: 'Black Lotus (no image, minimal data)',
      cardUrl: '#',
      priceText: '25.000,00 €',
      actionsElement: document.createElement('div'),
      imageUrl:
        'https://cards.scryfall.io/display/front/e/a/ea1feac0-d3a7-45eb-9719-1cdaf51ea0b6.webp?1783939328',
    }),
    baseOffer({
      name: 'Mox Sapphire',
      cardUrl: '#',
      priceText: '8.000,00 €',
      imageUrl:
        'https://cards.scryfall.io/display/front/9/1/91fdb56b-54d5-4272-8319-505ff987fe9b.webp?1783903215',
      condition: { abbreviation: 'PO', label: 'Poor' },
      actionsElement: document.createElement('div'),
    }),
    baseOffer({
      name: 'Sol Ring',
      cardUrl: '#',
      priceText: '2,00 €',

      quantity: '10x',
      condition: { abbreviation: 'GD', label: 'Good' },
      language: LANGUAGE_ICON,
      actionsElement: document.createElement('div'),
    }),
    baseOffer({
      name: 'Ragavan, Nimble Pilferer',
      cardUrl: '#',
      priceText: '45,00 €',
      imageUrl:
        'https://cards.scryfall.io/display/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.webp?1783926839',
      set: SET_ICON,
      language: LANGUAGE_ICON,
      condition: { abbreviation: 'MT', label: 'Mint' },
      foil: FOIL_ICON,
      cubeStats: { elo: 1620.2, popularity: 22.4, cubeCount: 5400 },
      actionsElement: document.createElement('div'),
    }),
    baseOffer({
      name: 'Very Long Card Name That Should Wrap Or Truncate Gracefully',
      cardUrl: '#',
      priceText: '0,05 €',
      imageUrl:
        'https://cards.scryfall.io/display/front/1/2/12345678-1234-1234-1234-123456789012.webp?1783926839',
      condition: { abbreviation: 'LP', label: 'Lightly Played' },
      actionsElement: document.createElement('div'),
    }),
    baseOffer({
      name: 'Lightning Bolt',
      cardUrl: '#',
      priceText: '0,50 €',
      imageUrl:
        'https://cards.scryfall.io/display/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.webp?1783903008',
      quantity: '99x',
      set: SET_ICON,
      condition: { abbreviation: 'PL', label: 'Played' },
      actionsElement: document.createElement('div'),
    }),
  ];
}
