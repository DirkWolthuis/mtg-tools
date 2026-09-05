import { describe, expect, it, vi } from 'vitest';
import { extractCubeId, fetchCubeJson } from './cubecobra-api.js';

describe('extractCubeId', () => {
  it('extracts the id from a /cube/list/ URL', () => {
    expect(extractCubeId('https://cubecobra.com/cube/list/my-cube')).toBe(
      'my-cube',
    );
  });

  it('extracts the id from a /cube/overview/ URL', () => {
    expect(
      extractCubeId('https://cubecobra.com/cube/overview/vintagecube'),
    ).toBe('vintagecube');
  });

  it('extracts the id from a bare /cube/:id URL', () => {
    expect(extractCubeId('https://cubecobra.com/cube/vintagecube')).toBe(
      'vintagecube',
    );
  });

  it('strips query params and trailing slashes', () => {
    expect(extractCubeId('https://cubecobra.com/cube/list/my-cube?tab=1')).toBe(
      'my-cube',
    );
  });

  it('treats a bare id/short id as-is', () => {
    expect(extractCubeId('vintagecube')).toBe('vintagecube');
  });

  it('trims surrounding whitespace', () => {
    expect(extractCubeId('  vintagecube  ')).toBe('vintagecube');
  });

  it('returns null for empty input', () => {
    expect(extractCubeId('')).toBeNull();
    expect(extractCubeId('   ')).toBeNull();
  });
});

describe('fetchCubeJson', () => {
  it('requests the cube JSON endpoint without a date query param by default', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ name: 'Test' })));

    await fetchCubeJson('my-cube', undefined, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://cubecobra.com/cube/api/cubeJSON/my-cube',
    );
  });

  it('appends the date query param when provided', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ name: 'Test' })));

    await fetchCubeJson('my-cube', 1700000000000, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://cubecobra.com/cube/api/cubeJSON/my-cube?date=1700000000000',
    );
  });

  it('throws a descriptive error on a non-ok response', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response('not found', { status: 404 }));

    await expect(
      fetchCubeJson('missing-cube', undefined, fetchImpl),
    ).rejects.toThrow(/missing-cube.*404/);
  });
});
