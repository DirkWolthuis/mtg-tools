function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Scryfall')
    .addItem('Fill selected card row', 'fillSelectedRow')
    .addItem('Fill all rows', 'fillAllRows')
    .addItem('Set headers', 'setHeaders')
    .addToUi();
}

function setHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  Object.keys(HEADER_LABELS).forEach((key) => {
    sheet.getRange(1, COLUMNS[key]).setValue(HEADER_LABELS[key]);
  });
}

function fillSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  const cardName = sheet.getRange(row, COLUMNS.NAME).getValue(); // assumes name is in column A
  if (!cardName) return;
  fillCardData(cardName, row, sheet);
}

function fillAllRows() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  for (let row = 2; row <= lastRow; row++) {
    // assumes row 1 is a header
    const cardName = sheet.getRange(row, COLUMNS.NAME).getValue();
    if (!cardName) continue;
    fillCardData(cardName, row, sheet);
    Utilities.sleep(100); // be polite to Scryfall's API
  }
}

// Column layout (1-indexed). Column A (name) is the input; everything else is
// written by fillCardData. Only fields relevant to managing a cube are copied.
const COLUMNS = {
  NAME: 1,
  SCRYFALL_ID: 2,
  ORACLE_ID: 3,
  MANA_COST: 4,
  CMC: 5,
  COLORS: 6,
  COLOR_IDENTITY: 7,
  ORACLE_TEXT: 8,
  TYPE_LINE: 9,
  POWER: 10,
  TOUGHNESS: 11,
  LOYALTY: 12,
  KEYWORDS: 13,
  SCRYFALL_URI: 14,
  IMAGE_URI: 15,
  DEBUG: 16,
};

// Human-readable labels for the header row, keyed the same as COLUMNS so
// they can never drift out of sync with the actual column numbers.
const HEADER_LABELS = {
  NAME: 'Name',
  SCRYFALL_ID: 'Scryfall ID',
  ORACLE_ID: 'Oracle ID',
  MANA_COST: 'Mana Cost',
  CMC: 'CMC',
  COLORS: 'Colors',
  COLOR_IDENTITY: 'Color Identity',
  ORACLE_TEXT: 'Oracle Text',
  TYPE_LINE: 'Type Line',
  POWER: 'Power',
  TOUGHNESS: 'Toughness',
  LOYALTY: 'Loyalty',
  KEYWORDS: 'Keywords',
  SCRYFALL_URI: 'Scryfall URI',
  IMAGE_URI: 'Image URI',
  DEBUG: 'Debug',
};

// Some fields (mana cost, colors, oracle text, type line, P/T, loyalty) live
// on the top-level card for single-faced cards, but are only present per-face
// for multi-faced cards (split, flip, transform, modal DFC). These helpers
// fall back to the card_faces array and join the per-face values so cards
// like "Fire // Ice" or transform cards still get useful data in one cell.
function getFaceField(card, field, joiner) {
  if (card[field] !== undefined && card[field] !== null && card[field] !== '') {
    return card[field];
  }
  if (card.card_faces) {
    return card.card_faces
      .map((face) => face[field])
      .filter((value) => value !== undefined && value !== null)
      .join(joiner);
  }
  return '';
}

function getColors(card) {
  if (card.colors) return card.colors.join('');
  if (card.card_faces) {
    const unique = Array.from(
      new Set(card.card_faces.flatMap((face) => face.colors || [])),
    );
    return unique.join('');
  }
  return '';
}

function getImageUri(card) {
  if (card.image_uris) return card.image_uris.normal || '';
  if (card.card_faces && card.card_faces[0] && card.card_faces[0].image_uris) {
    return card.card_faces[0].image_uris.normal || '';
  }
  return '';
}

function fillCardData(cardName, row, sheet) {
  const trimmedName = String(cardName).trim();
  const url =
    'https://api.scryfall.com/cards/named?fuzzy=' +
    encodeURIComponent(trimmedName);

  Logger.log('Row %s: name="%s" url=%s', row, trimmedName, url);

  const res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: {
      'User-Agent': 'GoogleSheetsPlugin/1.0',
      Accept: '*/*',
    },
  });

  const code = res.getResponseCode();
  const body = res.getContentText();

  Logger.log('Row %s: responseCode=%s body=%s', row, code, body);

  if (code !== 200) {
    let message = 'Not found: ' + trimmedName;
    try {
      const err = JSON.parse(body);
      // Scryfall error objects look like: { object: "error", code: "not_found", details: "..." }
      message = 'Error (' + code + '): ' + (err.details || err.code || body);
    } catch (e) {
      message = 'Error (' + code + '), unparseable body: ' + body;
    }
    sheet.getRange(row, COLUMNS.SCRYFALL_ID).setValue(message);
    sheet.getRange(row, COLUMNS.DEBUG).setValue(body); // debug column: raw response
    return null;
  }

  const card = JSON.parse(body);

  sheet.getRange(row, COLUMNS.SCRYFALL_ID).setValue(card.id);
  sheet
    .getRange(row, COLUMNS.ORACLE_ID)
    .setValue(getFaceField(card, 'oracle_id', ' // '));
  sheet
    .getRange(row, COLUMNS.MANA_COST)
    .setValue(getFaceField(card, 'mana_cost', ' // '));
  sheet.getRange(row, COLUMNS.CMC).setValue(card.cmc);
  sheet.getRange(row, COLUMNS.COLORS).setValue(getColors(card));
  sheet
    .getRange(row, COLUMNS.COLOR_IDENTITY)
    .setValue((card.color_identity || []).join(''));
  sheet
    .getRange(row, COLUMNS.ORACLE_TEXT)
    .setValue(getFaceField(card, 'oracle_text', '\n // \n'));
  sheet
    .getRange(row, COLUMNS.TYPE_LINE)
    .setValue(getFaceField(card, 'type_line', ' // '));
  sheet
    .getRange(row, COLUMNS.POWER)
    .setValue(getFaceField(card, 'power', ' // '));
  sheet
    .getRange(row, COLUMNS.TOUGHNESS)
    .setValue(getFaceField(card, 'toughness', ' // '));
  sheet
    .getRange(row, COLUMNS.LOYALTY)
    .setValue(getFaceField(card, 'loyalty', ' // '));
  sheet
    .getRange(row, COLUMNS.KEYWORDS)
    .setValue((card.keywords || []).join(', '));
  sheet.getRange(row, COLUMNS.SCRYFALL_URI).setValue(card.scryfall_uri || '');
  sheet.getRange(row, COLUMNS.IMAGE_URI).setValue(getImageUri(card));
  sheet.getRange(row, COLUMNS.DEBUG).setValue(''); // clear old debug info on success
  return card;
}
