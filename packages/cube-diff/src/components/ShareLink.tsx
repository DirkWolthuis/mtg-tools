import { useState } from 'preact/hooks';

export interface ShareLinkProps {
  url: string;
}

/** Read-only share URL field with a "Copy" button. */
export function ShareLink({ url }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) - the user can still select & copy manually.
    }
  }

  return (
    <div className="flex items-center gap-2" data-testid="share-link">
      <input
        type="text"
        readOnly
        value={url}
        onClick={(event) => event.currentTarget.select()}
        className="flex-1 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={copy}
        className="rounded border border-gray-300 px-3 py-2 text-sm font-medium"
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}
