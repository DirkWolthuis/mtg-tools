import { describe, expect, it } from 'vitest';
import { diffCubes } from './diff-cube.js';
import type { CubeJsonCard } from './cubecobra-api.js';

let nextIndex = 0;

function card(
  name: string,
  oracleId = name.toLowerCase(),
  index = nextIndex++,
): CubeJsonCard {
  return {
    cardID: `${oracleId}-printing`,
    index,
    details: {
      name,
      name_lower: name.toLowerCase(),
      oracle_id: oracleId,
      scryfall_id: `${oracleId}-scryfall`,
      image_normal: `https://example.com/${oracleId}.jpg`,
    },
  };
}

describe('diffCubes', () => {
  it('reports cards present only in the new snapshot as added', () => {
    const result = diffCubes(
      [card('Ancestral Recall')],
      [card('Ancestral Recall'), card('Black Lotus')],
    );

    expect(result.added).toEqual([
      expect.objectContaining({ name: 'Black Lotus', count: 1 }),
    ]);
    expect(result.cut).toEqual([]);
  });

  it('reports cards present only in the old snapshot as cut', () => {
    const result = diffCubes(
      [card('Ancestral Recall'), card('Time Walk')],
      [card('Ancestral Recall')],
    );

    expect(result.cut).toEqual([
      expect.objectContaining({ name: 'Time Walk', count: 1 }),
    ]);
    expect(result.added).toEqual([]);
  });

  it('ignores cards unchanged between snapshots', () => {
    const result = diffCubes([card('Mox Sapphire')], [card('Mox Sapphire')]);
    expect(result.added).toEqual([]);
    expect(result.cut).toEqual([]);
  });

  it('treats a quantity increase of the same card as an add sized to the delta', () => {
    const result = diffCubes(
      [card('Wastes')],
      [card('Wastes'), card('Wastes')],
    );
    expect(result.added).toEqual([
      expect.objectContaining({ name: 'Wastes', count: 1 }),
    ]);
    expect(result.cut).toEqual([]);
  });

  it('treats a quantity decrease of the same card as a cut sized to the delta', () => {
    const result = diffCubes(
      [card('Wastes'), card('Wastes'), card('Wastes')],
      [card('Wastes')],
    );
    expect(result.cut).toEqual([
      expect.objectContaining({ name: 'Wastes', count: 2 }),
    ]);
    expect(result.added).toEqual([]);
  });

  it('does not treat a reprint (same oracle id, different printing) as a cut+add', () => {
    const oldPrinting: CubeJsonCard = {
      cardID: 'printing-a',
      details: {
        name: 'Dauntless Bodyguard',
        oracle_id: 'shared-oracle-id',
        image_normal: 'https://example.com/old.jpg',
      },
    };
    const newPrinting: CubeJsonCard = {
      cardID: 'printing-b',
      details: {
        name: 'Dauntless Bodyguard',
        oracle_id: 'shared-oracle-id',
        image_normal: 'https://example.com/new.jpg',
      },
    };

    const result = diffCubes([oldPrinting], [newPrinting]);
    expect(result.added).toEqual([]);
    expect(result.cut).toEqual([]);
  });

  it('sorts results alphabetically by name', () => {
    const result = diffCubes(
      [],
      [card('Zombie Infestation'), card('Ambush Viper')],
    );
    expect(result.added.map((c) => c.name)).toEqual([
      'Ambush Viper',
      'Zombie Infestation',
    ]);
  });

  it('does not double-count a compound-type card duplicated by the same board slot index', () => {
    // CubeCobra's cubeJSON response emits one entry per matching type category for cards with a
    // compound type line (e.g. "Enchantment Creature"), so the same physical card can appear twice
    // in the raw mainboard array while sharing the same `index`.
    const slot = card('Spirited Companion', 'spirited-companion', 42);
    const duplicateEntryForSameSlot = { ...slot };

    const result = diffCubes([], [slot, duplicateEntryForSameSlot]);

    expect(result.added).toEqual([
      expect.objectContaining({ name: 'Spirited Companion', count: 1 }),
    ]);
  });

  it('still counts two genuinely different slots of the same card', () => {
    const result = diffCubes(
      [],
      [card('Plains', 'plains', 1), card('Plains', 'plains', 2)],
    );

    expect(result.added).toEqual([
      expect.objectContaining({ name: 'Plains', count: 2 }),
    ]);
  });
});
