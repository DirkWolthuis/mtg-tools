import { useEffect, useState } from 'preact/hooks';
import {
  CubeDiffForm,
  type CubeDiffFormValues,
} from './components/CubeDiffForm.js';
import { DiffGrid } from './components/DiffGrid.js';
import { ShareLink } from './components/ShareLink.js';
import { extractCubeId, fetchCubeJson } from './lib/cubecobra-api.js';
import { diffCubes, type CubeDiff, type DiffCard } from './lib/diff-cube.js';
import { fetchScryfallCardsByIds, pickImageUris } from './lib/scryfall-api.js';
import {
  buildDiffQueryString,
  buildShareQueryString,
  dateStringToTimestamp,
  parseDiffUrlState,
  parseShareUrlState,
  type ShareDiffCard,
  type ShareDiffState,
} from './lib/url-state.js';

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; diff: CubeDiff; cubeName: string; cubeLink: string };

/** Canonical CubeCobra overview URL for a cube id, used as the "link to cube" in shared diffs. */
function cubeCobraLink(cubeId: string): string {
  return `https://cubecobra.com/cube/overview/${encodeURIComponent(cubeId)}`;
}

function initialFormValues(): CubeDiffFormValues {
  const fromUrl = parseDiffUrlState(window.location.search);
  return { cube: fromUrl.cube ?? '', date: fromUrl.date ?? '' };
}

/** Rebuilds diff card entries (added/cut) from a shared link's Scryfall ids by fetching card data. */
async function buildDiffFromShareState(
  share: ShareDiffState,
): Promise<CubeDiff> {
  const ids = [...share.added, ...share.cut].map((entry) => entry.scryfallId);
  const cardsById = await fetchScryfallCardsByIds(ids);

  const toDiffCard = (entry: ShareDiffCard): DiffCard => {
    const card = cardsById.get(entry.scryfallId);
    const images = card ? pickImageUris(card) : undefined;
    return {
      key: entry.scryfallId,
      name: card?.name ?? entry.scryfallId,
      count: entry.count,
      imageNormal: images?.normal,
      imageSmall: images?.small,
      scryfallId: entry.scryfallId,
    };
  };

  return {
    added: share.added.map(toDiffCard),
    cut: share.cut.map(toDiffCard),
  };
}

export function App() {
  const [formValues, setFormValues] =
    useState<CubeDiffFormValues>(initialFormValues);
  const [state, setState] = useState<LoadState>({ status: 'idle' });
  // A `?share=...` link is a self-contained, read-only snapshot - it takes priority over any
  // `cube`/`date` params and is re-derived from the URL on every render (no need for state).
  const shareState = parseShareUrlState(window.location.search);

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
      setState({
        status: 'success',
        diff,
        cubeName: newCube.name,
        cubeLink: cubeCobraLink(cubeId),
      });
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Something went wrong.',
      });
    }
  }

  async function runShareView(share: ShareDiffState) {
    setState({ status: 'loading' });
    try {
      const diff = await buildDiffFromShareState(share);
      setState({
        status: 'success',
        diff,
        cubeName: share.cubeName,
        cubeLink: share.cubeLink,
      });
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Something went wrong.',
      });
    }
  }

  /** Clears the URL and returns to the interactive form (leaving a shared read-only view). */
  function startNewDiff() {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState(null, '', url.toString());
    setFormValues({ cube: '', date: '' });
    setState({ status: 'idle' });
  }

  // Auto-run on mount: a shared read-only link takes priority, otherwise re-run the diff if the
  // page was loaded with cube/date already in the URL. Intentionally runs once on mount only -
  // re-running is driven by the form's onSubmit instead.
  useEffect(() => {
    if (shareState) {
      void runShareView(shareState);
    } else if (formValues.cube && formValues.date) {
      void runDiff(formValues);
    }
  }, []);

  const shareUrl =
    state.status === 'success'
      ? (() => {
          const url = new URL(window.location.href);
          url.search = buildShareQueryString({
            cubeName: state.cubeName,
            cubeLink: state.cubeLink,
            added: state.diff.added.map((card) => ({
              scryfallId: card.scryfallId ?? card.key,
              count: card.count,
            })),
            cut: state.diff.cut.map((card) => ({
              scryfallId: card.scryfallId ?? card.key,
              count: card.count,
            })),
          });
          return url.toString();
        })()
      : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">CubeCobra Cube Diff</h1>
        <p className="text-gray-600">
          Compare a CubeCobra cube's current mainboard against how it looked on
          a past date, and see the cards added and cut as an image grid.
        </p>
      </header>

      {shareState ? (
        <p className="text-sm text-gray-600" data-testid="shared-view-banner">
          Viewing a shared, read-only diff.{' '}
          <button
            type="button"
            onClick={startNewDiff}
            className="font-medium text-blue-600 underline"
          >
            Start a new diff
          </button>
        </p>
      ) : (
        <CubeDiffForm
          initialValues={formValues}
          loading={state.status === 'loading'}
          onSubmit={(values) => {
            setFormValues(values);
            void runDiff(values);
          }}
        />
      )}

      {shareUrl && <ShareLink url={shareUrl} />}

      {state.status === 'error' && (
        <p className="rounded bg-red-50 p-3 text-red-700" role="alert">
          {state.message}
        </p>
      )}

      {state.status === 'success' && (
        <>
          <h2 className="text-xl font-semibold">
            <a
              href={state.cubeLink}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              {state.cubeName}
            </a>
          </h2>
          <DiffGrid added={state.diff.added} cut={state.diff.cut} />
        </>
      )}
    </div>
  );
}
