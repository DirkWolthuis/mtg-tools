import { describe, expect, it } from 'vitest';
import { buildCalendarMonth, nextMonth, previousMonth } from './calendar.js';

describe('buildCalendarMonth', () => {
  it('returns a 42-day (6-week) grid', () => {
    expect(buildCalendarMonth(2024, 1)).toHaveLength(42);
  });

  it('starts the week on Monday, padding with the previous month where needed', () => {
    // 2024-01-01 is a Monday, so there should be no leading padding days.
    const days = buildCalendarMonth(2024, 1);
    expect(days[0]).toEqual({ iso: '2024-01-01', day: 1, inCurrentMonth: true });
  });

  it('pads leading days from the previous month when the 1st is not a Monday', () => {
    // 2024-02-01 is a Thursday, so the 3 preceding days (Jan 29-31) pad the grid.
    const days = buildCalendarMonth(2024, 2);
    expect(days.slice(0, 3)).toEqual([
      { iso: '2024-01-29', day: 29, inCurrentMonth: false },
      { iso: '2024-01-30', day: 30, inCurrentMonth: false },
      { iso: '2024-01-31', day: 31, inCurrentMonth: false },
    ]);
    expect(days[3]).toEqual({ iso: '2024-02-01', day: 1, inCurrentMonth: true });
  });

  it('pads trailing days from the next month to fill out the grid', () => {
    const days = buildCalendarMonth(2024, 1);
    const last = days[days.length - 1];
    expect(last.inCurrentMonth).toBe(false);
    expect(last.iso.startsWith('2024-02')).toBe(true);
  });

  it('rolls over correctly across a year boundary (December)', () => {
    const days = buildCalendarMonth(2024, 12);
    const last = days[days.length - 1];
    expect(last.iso.startsWith('2025-01')).toBe(true);
  });
});

describe('previousMonth', () => {
  it('decrements the month within a year', () => {
    expect(previousMonth({ year: 2024, month: 6 })).toEqual({
      year: 2024,
      month: 5,
    });
  });

  it('rolls back into December of the previous year from January', () => {
    expect(previousMonth({ year: 2024, month: 1 })).toEqual({
      year: 2023,
      month: 12,
    });
  });
});

describe('nextMonth', () => {
  it('increments the month within a year', () => {
    expect(nextMonth({ year: 2024, month: 6 })).toEqual({
      year: 2024,
      month: 7,
    });
  });

  it('rolls forward into January of the next year from December', () => {
    expect(nextMonth({ year: 2024, month: 12 })).toEqual({
      year: 2025,
      month: 1,
    });
  });
});
