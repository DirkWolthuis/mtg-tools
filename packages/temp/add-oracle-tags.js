#!/usr/bin/env node
'use strict';

// Fetches each card's oracle id from Scryfall and merges matching Scryfall
// Tagger oracle tags (from oracle-tags-*.jsonl) into the CSV's "tags" column.
//
// Usage: node add-oracle-tags.js

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'TheBulkCommunityCubeWIP.csv');
const TAGS_JSONL_PATH = path.join(
  __dirname,
  'oracle-tags-20260726090038.jsonl',
);
// Columns Moxfield always wraps in quotes, even when empty; everything else
// is only quoted when it actually needs to be (comma/quote/newline present).
const ALWAYS_QUOTED_COLUMNS = new Set([
  'name',
  'Type',
  'Set',
  'Collector Number',
  'tags',
  'Notes',
  'Artist',
]);
const REQUEST_DELAY_MS = 100; // be polite to Scryfall's API

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\r') {
      // skip, \n handles the line break
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvField(value, header) {
  const str = value == null ? '' : String(value);
  const needsQuoting =
    ALWAYS_QUOTED_COLUMNS.has(header) ||
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n');
  return needsQuoting ? '"' + str.replace(/"/g, '""') + '"' : str;
}

function stringifyCsv(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      headers.map((header) => csvField(row[header], header)).join(','),
    );
  }
  return lines.join('\n') + '\n';
}

// Builds oracle_id -> Set<tag slug> by inverting the tag-centric jsonl file
// (each line lists a tag and all the oracle ids it applies to).
function loadOracleTagIndex(jsonlPath) {
  const index = new Map();
  const lines = fs.readFileSync(jsonlPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const tag = JSON.parse(trimmed);
    if (tag.type !== 'oracle' || !Array.isArray(tag.taggings)) continue;
    for (const tagging of tag.taggings) {
      if (!tagging.oracle_id) continue;
      let slugs = index.get(tagging.oracle_id);
      if (!slugs) {
        slugs = new Set();
        index.set(tagging.oracle_id, slugs);
      }
      slugs.add(tag.slug);
    }
  }
  return index;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCardByCollectorNumber(set, collectorNumber) {
  const url = `https://api.scryfall.com/cards/${encodeURIComponent(
    set.toLowerCase(),
  )}/${encodeURIComponent(collectorNumber)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'mtg-tools-oracle-tagger/1.0',
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Scryfall ${res.status} for ${set}/${collectorNumber}`);
  }
  return res.json();
}

function getOracleIds(card) {
  if (card.oracle_id) return [card.oracle_id];
  if (Array.isArray(card.card_faces)) {
    return card.card_faces.map((face) => face.oracle_id).filter(Boolean);
  }
  return [];
}

function mergeTags(existing, additions) {
  const seen = new Set();
  const merged = [];
  const add = (value) => {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    merged.push(trimmed);
  };
  existing.split(',').forEach(add);
  additions.forEach(add);
  return merged.join(', ');
}

async function main() {
  const oracleTagIndex = loadOracleTagIndex(TAGS_JSONL_PATH);
  console.log(`Loaded tags for ${oracleTagIndex.size} oracle ids.`);

  const csvText = fs.readFileSync(CSV_PATH, 'utf8');
  const rawRows = parseCsv(csvText).filter(
    (row) => !(row.length === 1 && row[0] === ''),
  );
  const [headers, ...dataRows] = rawRows;
  const rows = dataRows.map((values) => {
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? '';
    });
    return row;
  });

  const cardCache = new Map(); // "set/collectorNumber" -> oracle ids
  let apiCalls = 0;
  let taggedCount = 0;

  for (const row of rows) {
    const set = row['Set'];
    const collectorNumber = row['Collector Number'];
    const cacheKey = `${set}/${collectorNumber}`.toLowerCase();

    let oracleIds = cardCache.get(cacheKey);
    if (oracleIds === undefined) {
      try {
        const card = await fetchCardByCollectorNumber(set, collectorNumber);
        oracleIds = getOracleIds(card);
        apiCalls++;
        await sleep(REQUEST_DELAY_MS);
      } catch (err) {
        console.warn(
          `Skipping "${row['name']}" (${set}/${collectorNumber}): ${err.message}`,
        );
        oracleIds = [];
      }
      cardCache.set(cacheKey, oracleIds);
    }

    const newTags = new Set();
    for (const oracleId of oracleIds) {
      const slugs = oracleTagIndex.get(oracleId);
      if (slugs) for (const slug of slugs) newTags.add(slug);
    }

    if (newTags.size > 0) {
      row['tags'] = mergeTags(row['tags'] || '', Array.from(newTags).sort());
      taggedCount++;
    }
  }

  fs.writeFileSync(CSV_PATH, stringifyCsv(headers, rows), 'utf8');
  console.log(
    `Done. ${apiCalls} Scryfall requests, ${taggedCount}/${rows.length} rows got new tags.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
