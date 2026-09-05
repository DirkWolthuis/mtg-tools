import type { CubeJsonCard } from './cubecobra-api.js';

/** One card whose copy count changed between two cube snapshots, with enough detail to render an image tile. */
export interface DiffCard {
  key: string;
  name: string;
  count: number;
  imageNormal?: string;
  imageSmall?: string;
  scryfallId?: string;
}

export interface CubeDiff {
  added: DiffCard[];
  cut: DiffCard[];
}

/** Groups a board's cards by identity (oracle id, falling back to lowercased name) and counts copies. */
function groupByIdentity(
  cards: CubeJsonCard[],
): Map<string, { card: CubeJsonCard; count: number }> {
  const groups = new Map<string, { card: CubeJsonCard; count: number }>();
  for (const card of cards) {
    const key =
      card.details?.oracle_id ??
      card.details?.name_lower ??
      card.details?.name?.toLowerCase() ??
      card.cardID;
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      groups.set(key, { card, count: 1 });
    }
  }
  return groups;
}

function toDiffCard(key: string, card: CubeJsonCard, count: number): DiffCard {
  return {
    key,
    name: card.details?.name ?? card.cardID,
    count,
    imageNormal: card.details?.image_normal,
    imageSmall: card.details?.image_small,
    scryfallId: card.details?.scryfall_id,
  };
}

/**
 * Diffs the mainboard of two CubeCobra cube snapshots (e.g. the same cube at two different dates).
 * Cards are matched by Scryfall oracle id (falling back to name) so reprints of the same card
 * don't show up as both a cut and an add. Quantity changes for the same card produce a single
 * entry sized to the delta (e.g. going from 2 to 1 copies is one "cut" of count 1).
 */
export function diffCubes(
  oldCards: CubeJsonCard[],
  newCards: CubeJsonCard[],
): CubeDiff {
  const oldGroups = groupByIdentity(oldCards);
  const newGroups = groupByIdentity(newCards);

  const added: DiffCard[] = [];
  const cut: DiffCard[] = [];

  const keys = new Set([...oldGroups.keys(), ...newGroups.keys()]);
  for (const key of keys) {
    const oldEntry = oldGroups.get(key);
    const newEntry = newGroups.get(key);
    const oldCount = oldEntry?.count ?? 0;
    const newCount = newEntry?.count ?? 0;

    if (newCount > oldCount && newEntry) {
      added.push(toDiffCard(key, newEntry.card, newCount - oldCount));
    } else if (oldCount > newCount && oldEntry) {
      cut.push(toDiffCard(key, oldEntry.card, oldCount - newCount));
    }
  }

  const byName = (a: DiffCard, b: DiffCard) => a.name.localeCompare(b.name);
  added.sort(byName);
  cut.sort(byName);

  return { added, cut };
}
