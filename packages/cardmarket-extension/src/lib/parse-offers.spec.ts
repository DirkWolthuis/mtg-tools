import { describe, expect, it } from 'vitest';
import { parseOffers } from './parse-offers.js';

function buildTable(rowsHtml: string): HTMLElement {
  const doc = new DOMParser().parseFromString(
    `<html><body>
      <div class="article-table">
        <div class="table-body">${rowsHtml}</div>
      </div>
    </body></html>`,
    'text/html',
  );
  const table = doc.querySelector<HTMLElement>('.article-table');
  if (!table) throw new Error('expected fixture to contain .article-table');
  return table;
}

describe('parseOffers', () => {
  it('extracts name, cardUrl, price, image and quantity from a row', () => {
    const table = buildTable(`
      <div class="row g-0 article-row">
        <div class="col-sellerProductInfo col">
          <div class="col-seller"><a href="/en/Magic/Products/Singles/Dominaria/Llanowar-Elves">Llanowar Elves</a></div>
        </div>
        <div class="item-count">3x</div>
        <div class="col-offer col-auto">
          <img src="https://example.com/llanowar-elves.jpg" />
          <div class="price-container"><span class="color-primary">0,20 &euro;</span></div>
        </div>
      </div>
    `);

    expect(parseOffers(table)).toEqual([
      {
        name: 'Llanowar Elves',
        cardUrl: '/en/Magic/Products/Singles/Dominaria/Llanowar-Elves',
        priceText: '0,20 €',
        imageUrl: 'https://example.com/llanowar-elves.jpg',
        quantity: '3x',
        set: null,
        language: null,
        condition: null,
        foil: null,
      },
    ]);
  });

  it('falls back to null for missing price, image, quantity and product attributes', () => {
    const table = buildTable(`
      <div class="row g-0 article-row">
        <div class="col-sellerProductInfo col">
          <div class="col-seller"><a href="/en/Magic/Products/Singles/Alpha/Counterspell">Counterspell</a></div>
        </div>
        <div class="col-offer col-auto"></div>
      </div>
    `);

    expect(parseOffers(table)).toEqual([
      {
        name: 'Counterspell',
        cardUrl: '/en/Magic/Products/Singles/Alpha/Counterspell',
        priceText: null,
        imageUrl: null,
        quantity: null,
        set: null,
        language: null,
        condition: null,
        foil: null,
      },
    ]);
  });

  it('extracts the set, language and condition from the nested product attributes', () => {
    const table = buildTable(`
      <div class="row g-0 article-row">
        <div class="col-sellerProductInfo col">
          <div class="col-seller"><a href="/en/Magic/Products/Singles/Breaking-News/Abrupt-Decay">Abrupt Decay</a></div>
          <div class="col-product col-12 col-lg">
            <div class="product-attributes col">
              <a href="/en/Magic/Expansions/Breaking-News" class="expansion-symbol is-magic icon is-24x24 d-flex me-1" aria-label="Breaking News">
                <span style="display: inline-block; width: 21px; height: 21px; background-image: url('//static.cardmarket.com/img/expicons.png'); background-position: -189px -2163px;"></span>
              </a>
              <a href="https://help.cardmarket.com/en/CardCondition" class="article-condition condition-nm me-1" data-bs-original-title="Near Mint">
                <span class="badge">NM</span>
              </a>
              <span style="display: inline-block; width: 16px; height: 16px; background-image: url('//static.cardmarket.com/img/ssMain2.png'); background-position: -80px -0px;" class="icon me-2" aria-label="Italian"></span>
            </div>
          </div>
        </div>
        <div class="col-offer col-auto">
          <div class="price-container"><span class="color-primary">0,45 &euro;</span></div>
        </div>
      </div>
    `);

    expect(parseOffers(table)).toEqual([
      {
        name: 'Abrupt Decay',
        cardUrl: '/en/Magic/Products/Singles/Breaking-News/Abrupt-Decay',
        priceText: '0,45 €',
        imageUrl: null,
        quantity: null,
        set: {
          imageUrl: '//static.cardmarket.com/img/expicons.png',
          position: '-189px -2163px',
          width: '21px',
          height: '21px',
          label: 'Breaking News',
        },
        language: {
          imageUrl: '//static.cardmarket.com/img/ssMain2.png',
          position: '-80px -0px',
          width: '16px',
          height: '16px',
          label: 'Italian',
        },
        condition: { abbreviation: 'NM', label: 'Near Mint' },
        foil: null,
      },
    ]);
  });

  it('extracts the foil sprite icon when present', () => {
    const table = buildTable(`
      <div class="row g-0 article-row">
        <div class="col-sellerProductInfo col">
          <div class="col-seller"><a href="/en/Magic/Products/Singles/Set/Admiral-Brass">Admiral Brass, Unsinkable</a></div>
          <div class="col-product col-12 col-lg">
            <div class="product-attributes col">
              <span style="display: inline-block; width: 16px; height: 16px; background-image: url('//static.cardmarket.com/img/ssMain2.png'); background-position: -16px -16px;" class="icon st_SpecialIcon mr-1" aria-label="Foil"></span>
            </div>
          </div>
        </div>
        <div class="col-offer col-auto"></div>
      </div>
    `);

    expect(parseOffers(table)[0]?.foil).toEqual({
      imageUrl: '//static.cardmarket.com/img/ssMain2.png',
      position: '-16px -16px',
      width: '16px',
      height: '16px',
      label: 'Foil',
    });
  });

  it('extracts the image from a thumbnail tooltip when there is no <img> tag', () => {
    const table = buildTable(`
      <div class="row g-0 article-row">
        <div class="col-thumbnail col-icon">
          <span data-bs-title="&lt;img src=&quot;https://product-images.s3.cardmarket.com/1/XUNF/676516/676516.jpg&quot; alt=&quot;Brims&quot;&gt;" class="thumbnail-icon icon"></span>
        </div>
        <div class="col-sellerProductInfo col">
          <div class="col-seller"><a href="/en/Magic/Products/Singles/Unfinity/Brims-Barone">Brims Barone</a></div>
        </div>
        <div class="item-count">1</div>
        <div class="col-offer col-auto">
          <div class="price-container"><span class="color-primary">1,00 &euro;</span></div>
        </div>
      </div>
    `);

    expect(parseOffers(table)).toEqual([
      {
        name: 'Brims Barone',
        cardUrl: '/en/Magic/Products/Singles/Unfinity/Brims-Barone',
        priceText: '1,00 €',
        imageUrl:
          'https://product-images.s3.cardmarket.com/1/XUNF/676516/676516.jpg',
        quantity: '1',
        set: null,
        language: null,
        condition: null,
        foil: null,
      },
    ]);
  });

  it('returns an empty array when there are no offer rows', () => {
    const table = buildTable('');

    expect(parseOffers(table)).toEqual([]);
  });
});
