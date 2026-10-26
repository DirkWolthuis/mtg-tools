import { useEffect, useRef, useState } from 'preact/hooks';
import { buildCalendarMonth, nextMonth, previousMonth, type YearMonth } from '../lib/calendar.js';
import { dutchDateToIso, isoToDutchDate } from '../lib/dutch-date.js';

export interface DatePickerProps {
  /** Dutch `dd-mm-yyyy` text, as typed by the user - may be partial or invalid while editing. */
  value: string;
  onChange: (value: string) => void;
  /** Inclusive ISO (`YYYY-MM-DD`) upper bound; later days are shown disabled in the calendar. */
  max?: string;
  placeholder?: string;
  /** Forwarded to the underlying text input, so callers can still target it in tests. */
  inputTestId?: string;
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Picks the month the calendar should open on: the typed date if valid, else `max`, else today. */
function viewMonthFor(value: string, max?: string): YearMonth {
  const iso = dutchDateToIso(value) ?? max ?? new Date().toISOString().slice(0, 10);
  const [year, month] = iso.split('-').map(Number);
  return { year, month };
}

function monthLabel({ year, month }: YearMonth): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('nl-NL', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * A `dd-mm-yyyy` text field paired with a small popup calendar, so the date can be either typed
 * directly (in Dutch day-month-year order) or picked visually - unlike a native `<input
 * type="date">`, whose typed/displayed order follows the browser's locale rather than ours.
 */
export function DatePicker({
  value,
  onChange,
  max,
  placeholder,
  inputTestId,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<YearMonth>(() => viewMonthFor(value, max));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  function openCalendar() {
    setView(viewMonthFor(value, max));
    setOpen(true);
  }

  function selectDay(iso: string) {
    onChange(isoToDutchDate(iso));
    setOpen(false);
  }

  const selectedIso = dutchDateToIso(value);
  const days = buildCalendarMonth(view.year, view.month);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-1">
        <input
          type="text"
          required
          inputMode="numeric"
          pattern="\d{2}-\d{2}-\d{4}"
          placeholder={placeholder}
          value={value}
          onInput={(event) => onChange(event.currentTarget.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
          data-testid={inputTestId}
        />
        <button
          type="button"
          aria-label="Open calendar"
          onClick={() => (open ? setOpen(false) : openCalendar())}
          className="rounded border border-gray-300 px-2 text-sm"
          data-testid="date-picker-toggle"
        >
          📅
        </button>
      </div>

      {open && (
        <div
          className="absolute z-30 mt-1 w-64 rounded border border-gray-300 bg-white p-2 shadow-lg"
          data-testid="date-picker-popup"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setView((current) => previousMonth(current))}
              className="px-2"
            >
              ‹
            </button>
            <span className="text-sm font-medium capitalize">
              {monthLabel(view)}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setView((current) => nextMonth(current))}
              className="px-2"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {days.map((calendarDay) => {
              const disabled = max != null && calendarDay.iso > max;
              const selected = calendarDay.iso === selectedIso;
              return (
                <button
                  key={calendarDay.iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(calendarDay.iso)}
                  className={[
                    'rounded py-1',
                    calendarDay.inCurrentMonth ? '' : 'text-gray-300',
                    selected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100',
                    disabled ? 'cursor-not-allowed opacity-40 hover:bg-transparent' : '',
                  ].join(' ')}
                >
                  {calendarDay.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
