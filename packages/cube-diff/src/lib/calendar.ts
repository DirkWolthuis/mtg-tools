/** One day cell in a rendered calendar month grid. */
export interface CalendarDay {
  /** ISO (`YYYY-MM-DD`) date for this cell. */
  iso: string;
  /** Day-of-month number to display. */
  day: number;
  /** Whether this day belongs to the displayed month (vs. a leading/trailing adjacent-month filler). */
  inCurrentMonth: boolean;
}

/** Returns the 0-based Monday-first weekday (Monday=0..Sunday=6) for the 1st of the given month. */
function mondayFirstWeekday(year: number, month: number): number {
  const jsWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=Sun..6=Sat
  return (jsWeekday + 6) % 7;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Builds a 6-week (42-day) Monday-first calendar grid for the given month (1-12), padded out with
 * the trailing days of the previous month and leading days of the next month so every week is full.
 */
export function buildCalendarMonth(year: number, month: number): CalendarDay[] {
  const firstWeekday = mondayFirstWeekday(year, month);
  const totalDays = daysInMonth(year, month);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthDays = daysInMonth(prevYear, prevMonth);

  const days: CalendarDay[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    const day = prevMonthDays - firstWeekday + i + 1;
    days.push({
      iso: toIso(prevYear, prevMonth, day),
      day,
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= totalDays; day++) {
    days.push({ iso: toIso(year, month, day), day, inCurrentMonth: true });
  }

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let day = 1; days.length < 42; day++) {
    days.push({ iso: toIso(nextYear, nextMonth, day), day, inCurrentMonth: false });
  }

  return days;
}

export interface YearMonth {
  year: number;
  month: number;
}

/** Returns the previous calendar month, rolling over into the prior year from January. */
export function previousMonth({ year, month }: YearMonth): YearMonth {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

/** Returns the next calendar month, rolling over into the following year from December. */
export function nextMonth({ year, month }: YearMonth): YearMonth {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}
