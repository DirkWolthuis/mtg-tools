import { useEffect, useState } from 'preact/hooks';
import {
  CubeDiffForm,
  type CubeDiffFormValues,
} from './components/CubeDiffForm.js';
import { DiffGrid } from './components/DiffGrid.js';
import { ShareLink } from './components/ShareLink.js';
import { extractCubeId, fetchCubeJson } from './lib/cubecobra-api.js';
import { diffCubes, type CubeDiff } from './lib/diff-cube.js';
import {
  buildDiffQueryString,
  dateStringToTimestamp,
  parseDiffUrlState,
} from './lib/url-state.js';

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; diff: CubeDiff; cubeName: string };

function initialFormValues(): CubeDiffFormValues {
  const fromUrl = parseDiffUrlState(window.location.search);
  return { cube: fromUrl.cube ?? '', date: fromUrl.date ?? '' };
}

export function App() {
  const [formValues, setFormValues] =
    useState<CubeDiffFormValues>(initialFormValues);
  const [state, setState] = useState<LoadState>({ status: 'idle' });

  async function runDiff(values: CubeDiffFormValues) {
    const cubeId = extractCubeId(values.cube);
    if (!cubeId || !values.date) {
      setState({
        status: 'error',
        message: 'Please provide a valid CubeCobra cube link/ID and a date.',
      });
      return;
    }

    setState({ status: 'loading' });

    const shareUrl = new URL(window.location.href);
    shareUrl.search = buildDiffQueryString(values);
    window.history.replaceState(null, '', shareUrl.toString());

    try {
      const timestamp = dateStringToTimestamp(values.date);
      const [oldCube, newCube] = await Promise.all([
        fetchCubeJson(cubeId, timestamp),
        fetchCubeJson(cubeId),
      ]);
      const diff = diffCubes(oldCube.cards.mainboard, newCube.cards.mainboard);
      setState({ status: 'success', diff, cubeName: newCube.name });
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Something went wrong.',
      });
    }
  }

  // Auto-run the diff if the page was loaded with cube/date already in the URL (e.g. a shared link).
  // Intentionally runs once on mount only - re-running is driven by the form's onSubmit instead.
  useEffect(() => {
    if (formValues.cube && formValues.date) {
      void runDiff(formValues);
    }
  }, []);

  const shareUrl = new URL(window.location.href);
  shareUrl.search = buildDiffQueryString(formValues);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">CubeCobra Cube Diff</h1>
        <p className="text-gray-600">
          Compare a CubeCobra cube's current mainboard against how it looked on
          a past date, and see the cards added and cut as an image grid.
        </p>
      </header>

      <CubeDiffForm
        initialValues={formValues}
        loading={state.status === 'loading'}
        onSubmit={(values) => {
          setFormValues(values);
          void runDiff(values);
        }}
      />

      {formValues.cube && formValues.date && (
        <ShareLink url={shareUrl.toString()} />
      )}

      {state.status === 'error' && (
        <p className="rounded bg-red-50 p-3 text-red-700" role="alert">
          {state.message}
        </p>
      )}

      {state.status === 'success' && (
        <>
          <h2 className="text-xl font-semibold">{state.cubeName}</h2>
          <DiffGrid added={state.diff.added} cut={state.diff.cut} />
        </>
      )}
    </div>
  );
}
