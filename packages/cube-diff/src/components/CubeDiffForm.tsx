import { useState } from 'preact/hooks';
import { DatePicker } from './DatePicker.js';
import { dutchDateToIso, isoToDutchDate } from '../lib/dutch-date.js';

export interface CubeDiffFormValues {
  /** The comparison date, in ISO (`YYYY-MM-DD`) form - matches the URL/share state format. */
  cube: string;
  date: string;
}

export interface CubeDiffFormProps {
  initialValues: CubeDiffFormValues;
  loading: boolean;
  onSubmit: (values: CubeDiffFormValues) => void;
}

/** Today's date in ISO (`YYYY-MM-DD`) form, used to reject comparison dates in the future. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Form for entering a CubeCobra cube link/ID and a comparison date. The date is entered/displayed
 * in Dutch `dd-mm-yyyy` order (with a calendar popup for picking it visually), but is converted
 * to/from ISO (`YYYY-MM-DD`) at the form's edges so the rest of the app (URL state, sharing,
 * exports) keeps using the unambiguous ISO format.
 */
export function CubeDiffForm({
  initialValues,
  loading,
  onSubmit,
}: CubeDiffFormProps) {
  const [cube, setCube] = useState(initialValues.cube);
  const [dateText, setDateText] = useState(isoToDutchDate(initialValues.date));
  const [dateError, setDateError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();

        const isoDate = dutchDateToIso(dateText);
        if (!isoDate) {
          setDateError('Enter a valid date as dd-mm-yyyy.');
          return;
        }
        if (isoDate > today()) {
          setDateError('Date cannot be in the future.');
          return;
        }

        setDateError(null);
        onSubmit({ cube: cube.trim(), date: isoDate });
      }}
    >
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-medium">CubeCobra cube link or ID</span>
        <input
          type="text"
          required
          value={cube}
          onInput={(event) => setCube(event.currentTarget.value)}
          placeholder="https://cubecobra.com/cube/list/my-cube"
          className="rounded border border-gray-300 px-3 py-2"
          data-testid="cube-input"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Compare against date</span>
        <DatePicker
          value={dateText}
          onChange={(text) => {
            setDateText(text);
            setDateError(null);
          }}
          max={today()}
          placeholder="dd-mm-yyyy"
          inputTestId="date-input"
        />
        {dateError && (
          <span className="text-xs text-red-600" role="alert">
            {dateError}
          </span>
        )}
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        data-testid="submit-button"
      >
        {loading ? 'Loading…' : 'Compare'}
      </button>
    </form>
  );
}
