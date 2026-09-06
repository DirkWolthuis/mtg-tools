import { useState } from 'preact/hooks';

export interface CubeDiffFormValues {
  cube: string;
  date: string;
}

export interface CubeDiffFormProps {
  initialValues: CubeDiffFormValues;
  loading: boolean;
  onSubmit: (values: CubeDiffFormValues) => void;
}

/** Today's date in `YYYY-MM-DD` form, used as the max selectable comparison date. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Form for entering a CubeCobra cube link/ID and a comparison date. */
export function CubeDiffForm({
  initialValues,
  loading,
  onSubmit,
}: CubeDiffFormProps) {
  const [cube, setCube] = useState(initialValues.cube);
  const [date, setDate] = useState(initialValues.date);

  return (
    <form
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ cube: cube.trim(), date });
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
        <input
          type="date"
          required
          value={date}
          max={today()}
          onInput={(event) => setDate(event.currentTarget.value)}
          className="rounded border border-gray-300 px-3 py-2"
          data-testid="date-input"
        />
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
