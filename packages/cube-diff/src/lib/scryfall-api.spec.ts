import { describe, expect, it, vi } from 'vitest';
import {
  fetchScryfallCardsByIds,
  pickImageUris,
  type ScryfallCardImage,
} from './scryfall-api.js';

describe('fetchScryfallCardsByIds', () => {
  it('posts unique ids as identifiers to the collection endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ id: 'id-1', name: 'Card One' }],
          not_found: [],
        }),
      ),
    );

    await fetchScryfallCardsByIds(['id-1', 'id-1'], fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.scryfall.com/cards/collection');
    expect(JSON.parse(options.body)).toEqual({
      identifiers: [{ id: 'id-1' }],
    });
  });

  it('returns a map keyed by card id', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { id: 'id-1', name: 'Card One' },
            { id: 'id-2', name: 'Card Two' },
          ],
          not_found: [],
        }),
      ),
    );

    const result = await fetchScryfallCardsByIds(['id-1', 'id-2'], fetchImpl);

    expect(result.get('id-1')).toEqual({ id: 'id-1', name: 'Card One' });
    expect(result.get('id-2')).toEqual({ id: 'id-2', name: 'Card Two' });
  });

  it('throws a descriptive error on a non-ok response', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response('error', { status: 500 }));

    await expect(
      fetchScryfallCardsByIds(['id-1'], fetchImpl),
    ).rejects.toThrow(/500/);
  });

  it('batches requests in groups of 75 ids', async () => {
    const fetchImpl = vi
      .fn()
      .mockImplementation(
        async () =>
          new Response(JSON.stringify({ data: [], not_found: [] })),
      );
    const ids = Array.from({ length: 80 }, (_, i) => `id-${i}`);

    await fetchScryfallCardsByIds(ids, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('pickImageUris', () => {
  it('uses image_uris when present', () => {
    const card: ScryfallCardImage = {
      id: 'id-1',
      name: 'Card One',
      image_uris: { normal: 'normal.jpg', small: 'small.jpg' },
    };
    expect(pickImageUris(card)).toEqual({
      normal: 'normal.jpg',
      small: 'small.jpg',
    });
  });

  it('falls back to the first card face for double-faced cards', () => {
    const card: ScryfallCardImage = {
      id: 'id-1',
      name: 'Card One // Card Two',
      card_faces: [
        { image_uris: { normal: 'front.jpg', small: 'front-small.jpg' } },
        { image_uris: { normal: 'back.jpg', small: 'back-small.jpg' } },
      ],
    };
    expect(pickImageUris(card)).toEqual({
      normal: 'front.jpg',
      small: 'front-small.jpg',
    });
  });

  it('returns an empty object when no images are available', () => {
    const card: ScryfallCardImage = { id: 'id-1', name: 'Card One' };
    expect(pickImageUris(card)).toEqual({});
  });
});
