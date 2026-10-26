const DUTCH_DATE_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Formats an ISO (`YYYY-MM-DD`) date string in Dutch day-month-year order (`DD-MM-YYYY`). */
export function isoToDutchDate(iso: string): string {
  const match = iso.match(ISO_DATE_PATTERN);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}

/**
 * Parses a Dutch-style `DD-MM-YYYY` date string into ISO (`YYYY-MM-DD`) form, or `null` if it's
 * not a well-formed or real calendar date (e.g. `31-02-2024`).
 */
export function dutchDateToIso(dutch: string): string | null {
  const match = dutch.match(DUTCH_DATE_PATTERN);
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;

  // Reject out-of-range values the regex alone wouldn't catch (e.g. month 13, day 32) by
  // round-tripping through Date and checking the parts survived unchanged.
  const date = new Date(`${iso}T00:00:00.000Z`);
  const roundTrips =
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() + 1 === Number(month) &&
    date.getUTCDate() === Number(day);

  return roundTrips ? iso : null;
}
