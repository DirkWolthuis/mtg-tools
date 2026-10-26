import type { CubeDiff } from '../lib/diff-cube.js';
import { buildDiffExportFilename, buildDiffExportText } from '../lib/export-diff.js';

export interface ExportButtonProps {
  diff: CubeDiff;
  cubeName: string;
  date: string;
}

/** Downloads the diff as a plain-text file listing added/cut card names. */
function downloadExport(diff: CubeDiff, cubeName: string, date: string): void {
  const text = buildDiffExportText(diff);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildDiffExportFilename(cubeName, date);
  link.click();
  URL.revokeObjectURL(url);
}

/** Button that exports the current diff as a downloadable `.txt` file of added/cut card names. */
export function ExportButton({ diff, cubeName, date }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={() => downloadExport(diff, cubeName, date)}
      className="rounded border border-gray-300 px-3 py-2 text-sm font-medium"
      data-testid="export-button"
    >
      Export as text
    </button>
  );
}
