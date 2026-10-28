// Cardmarket's language sprite icon only exposes a human-readable English
// label (see the `aria-label` fixtures in parse-offers.spec.ts, e.g.
// "Italian"), not an ISO code - so match it against Scryfall's own language
// names to get the code needed for print-specific lookups, per
// https://scryfall.com/docs/api/languages.
const CARDMARKET_LANGUAGE_LABEL_TO_SCRYFALL_CODE: Record<string, string> = {
  english: 'en',
  spanish: 'es',
  french: 'fr',
  german: 'de',
  italian: 'it',
  portuguese: 'pt',
  japanese: 'ja',
  korean: 'ko',
  russian: 'ru',
  'chinese simplified': 'zhs',
  'chinese traditional': 'zht',
  hebrew: 'he',
  latin: 'la',
  'ancient greek': 'grc',
  arabic: 'ar',
  sanskrit: 'sa',
  phyrexian: 'ph',
};

/**
 * Maps a Cardmarket language label (the language sprite icon's `aria-label`,
 * e.g. `"German"`) to the matching Scryfall language code (e.g. `"de"`).
 * Returns `null` for an empty/unrecognized label.
 */
export function mapCardmarketLanguageToScryfallCode(
  label: string | null | undefined,
): string | null {
  if (!label) return null;
  const normalized = label
    .trim()
    .toLowerCase()
    .replace(/[().]/g, '')
    .replace(/\s+/g, ' ');
  return CARDMARKET_LANGUAGE_LABEL_TO_SCRYFALL_CODE[normalized] ?? null;
}
