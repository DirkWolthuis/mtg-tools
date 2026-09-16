import type { CardSet, Offer, SpriteIcon } from '../lib/parse-offers.js';
import { parsePrice } from '../lib/parse-offers.js';

// Real Cardmarket sprite sheets - language/foil icons are confirmed slices of
// `ssMain2.png`, and set icons are confirmed slices of `expicons.png`, so use
// them directly to load correctly.
const CARDMARKET_SPRITE_SHEET_URL =
  '//static.cardmarket.com/img/0fa565750d09bba2fc85059ebf12e9ac/spriteSheets/ssMain2.png';
const CARDMARKET_EXPANSION_ICONS_URL =
  '//static.cardmarket.com/img/a48eb0e4cb94c5b23d24ceb6214535c8/expansionicons/expicons.png';

function cardmarketSpriteIcon(label: string, position: string): SpriteIcon {
  return {
    imageUrl: CARDMARKET_SPRITE_SHEET_URL,
    position,
    width: '16px',
    height: '16px',
    label,
  };
}

/** A real set icon slice from Cardmarket's expansion icon sprite sheet, e.g. `<span ... style="background-image: url(expicons.png); background-position: -105px -2037px;">`. */
function cardmarketSetIcon(label: string, position: string, code: string): CardSet {
  return {
    imageUrl: CARDMARKET_EXPANSION_ICONS_URL,
    position,
    width: '21px',
    height: '21px',
    label,
    code,
  };
}

const SET_ICON = cardmarketSetIcon(
  'Wilds of Eldraine: Extras',
  '-105px -2037px',
  'WOE',
);
const LANGUAGE_ICON = cardmarketSpriteIcon('English', '-16px 0px');
const FOIL_ICON = cardmarketSpriteIcon('Foil', '-16px -16px');

function baseOffer(overrides: Partial<Offer>): Offer {
  return {
    name: 'Unnamed Card',
    cardUrl: '#',
    price: null,
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
      price: parsePrice('0,20 €'),
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
      price: parsePrice('1,50 €'),
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
      price: parsePrice('25.000,00 €'),
      actionsElement: document.createElement('div'),
      imageUrl:
        'https://cards.scryfall.io/display/front/e/a/ea1feac0-d3a7-45eb-9719-1cdaf51ea0b6.webp?1783939328',
    }),
    baseOffer({
      name: 'Mox Sapphire',
      cardUrl: '#',
      price: parsePrice('8.000,00 €'),
      imageUrl:
        'https://cards.scryfall.io/display/front/9/1/91fdb56b-54d5-4272-8319-505ff987fe9b.webp?1783903215',
      condition: { abbreviation: 'PO', label: 'Poor' },
      actionsElement: document.createElement('div'),
    }),
    baseOffer({
      name: 'Sol Ring',
      cardUrl: '#',
      price: parsePrice('2,00 €'),

      quantity: '10x',
      condition: { abbreviation: 'GD', label: 'Good' },
      language: LANGUAGE_ICON,
      actionsElement: document.createElement('div'),
    }),
    baseOffer({
      name: 'Ragavan, Nimble Pilferer',
      cardUrl: '#',
      price: parsePrice('45,00 €'),
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
      price: parsePrice('0,05 €'),
      imageUrl:
        'https://cards.scryfall.io/display/front/1/2/12345678-1234-1234-1234-123456789012.webp?1783926839',
      condition: { abbreviation: 'LP', label: 'Lightly Played' },
      actionsElement: document.createElement('div'),
    }),
    baseOffer({
      name: 'Lightning Bolt',
      cardUrl: '#',
      price: parsePrice('0,50 €'),
      imageUrl:
        'https://cards.scryfall.io/display/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.webp?1783903008',
      quantity: '99x',
      set: SET_ICON,
      condition: { abbreviation: 'PL', label: 'Played' },
      actionsElement: document.createElement('div'),
    }),
  ];
}
