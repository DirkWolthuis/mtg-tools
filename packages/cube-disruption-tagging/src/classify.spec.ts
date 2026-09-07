import { describe, expect, it } from 'vitest';
import { classifyOracleText } from './classify.js';

describe('classifyOracleText', () => {
  it('returns an empty array for missing oracle text', () => {
    expect(classifyOracleText(null)).toEqual([]);
    expect(classifyOracleText(undefined)).toEqual([]);
    expect(classifyOracleText('')).toEqual([]);
  });

  it('returns an empty array for non-disruption text', () => {
    expect(classifyOracleText('Flying, vigilance')).toEqual([]);
    expect(classifyOracleText('When this creature enters, draw a card.')).toEqual([]);
  });

  describe('r — unconditional permanent removal', () => {
    it('tags plain destroy-target-creature effects (Doom Blade)', () => {
      expect(classifyOracleText('Destroy target nonblack creature.')).toEqual([
        'cr:creature', // "nonblack" is a color restriction -> conditional
      ]);
    });

    it('tags plain destroy effects with no restriction as r, not cr', () => {
      expect(classifyOracleText('Destroy target creature.')).toEqual(['r:creature']);
    });

    it('tags mass removal as unconditional even with a stat restriction (Austere Command style)', () => {
      expect(
        classifyOracleText('Destroy all creatures with mana value 3 or less.'),
      ).toEqual(['r:creature']);
    });

    it('tags exile-based removal (Swords to Plowshares style)', () => {
      expect(
        classifyOracleText("Exile target creature. Its controller gains life equal to its power."),
      ).toEqual(['r:creature']);
    });

    it('tags edict/sacrifice effects (Diabolic Edict style)', () => {
      expect(classifyOracleText('Target player sacrifices a creature.')).toEqual(['r:creature']);
    });

    it('tags damage-based removal as conditional (fixed damage amount, cube convention)', () => {
      expect(classifyOracleText('Lightning Bolt deals 3 damage to target creature.')).toEqual([
        'cr:creature',
      ]);
    });

    it('tags "any target" damage as creature removal by cube convention', () => {
      expect(classifyOracleText('This spell deals 3 damage to any target.')).toEqual([
        'cr:creature', // damage amount qualifies as conditional per CONDITIONAL_PATTERNS
      ]);
    });

    it('tags bounce-to-hand as soft removal, not plain removal', () => {
      expect(
        classifyOracleText("Return target creature to its owner's hand."),
      ).toEqual(['sr:creature']);
    });
  });

  describe('cr — conditional removal', () => {
    it('tags "unless" cost-payment counters as conditional', () => {
      expect(
        classifyOracleText('Destroy target creature unless its controller pays {3}.'),
      ).toEqual(['cr:creature']);
    });

    it('tags stat-restricted single-target removal as conditional', () => {
      expect(
        classifyOracleText('Destroy target nonland permanent with mana value 3 or less.'),
      ).toEqual(['cr:nl-permanent']);
    });

    it('tags -X/-X effects targeting a creature as conditional removal', () => {
      expect(
        classifyOracleText('Target creature gets -4/-4 until end of turn.'),
      ).toEqual(['cr:creature']);
    });

    it('does not tag self-referential -1/-1 counters as removal', () => {
      expect(
        classifyOracleText('This creature enters with six -1/-1 counters on it.'),
      ).toEqual([]);
    });
  });

  describe('sr — soft (temporary) removal', () => {
    it('tags ability-stripping auras as soft removal on the creature, not the aura type', () => {
      expect(
        classifyOracleText(
          'Enchant creature\nEnchanted creature loses all abilities and is a green Frog creature with base power and toughness 1/1.',
        ),
      ).toEqual(['sr:creature']);
    });

    it('does not tag a self-bounce ("you control") as soft removal for an unrelated wrath', () => {
      expect(
        classifyOracleText(
          "Return a creature you control to its owner's hand, then destroy all creatures.",
        ),
      ).toEqual(['r:creature']);
    });
  });

  describe('si / csi / ssi — stack interaction', () => {
    it('tags plain counterspells', () => {
      expect(classifyOracleText('Counter target spell.')).toEqual(['si:spell']);
    });

    it('tags pay-cost counters as conditional stack interaction', () => {
      expect(
        classifyOracleText('Counter target spell unless its controller pays {3}.'),
      ).toEqual(['csi:spell']);
    });

    it('tags restricted-type counters as conditional (Spell Pierce style)', () => {
      expect(classifyOracleText('Counter target noncreature spell.')).toEqual([
        'csi:noncreature',
      ]);
    });

    it('tags bounce-a-spell-to-hand as soft stack interaction', () => {
      expect(
        classifyOracleText("Return target spell to its owner's hand."),
      ).toEqual(['ssi:spell']);
    });
  });

  describe('hh — hand hate', () => {
    it('tags plain discard effects as generic card hand hate', () => {
      expect(classifyOracleText('Target player discards a card.')).toEqual(['hh:card']);
    });

    it('tags restricted discard effects with the restriction as the target', () => {
      expect(
        classifyOracleText(
          'Target player reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.',
        ),
      ).toEqual(['hh:noncreature-nonland']);
    });

    it('does not tag discard effects that let the player redraw', () => {
      expect(
        classifyOracleText(
          'Target player discards a card, then draws a card.',
        ),
      ).toEqual([]);
    });
  });

  describe('friendly-target exclusion', () => {
    it('does not tag blink effects on your own creatures as removal', () => {
      expect(
        classifyOracleText(
          'When this creature enters, you may exile target creature you control, then return that card to the battlefield under your control.',
        ),
      ).toEqual([]);
    });

    it('does tag temporary exile of any creature (no ownership restriction) as removal', () => {
      expect(
        classifyOracleText(
          "Exile target creature. If you do, return that card to the battlefield under its owner's control at the beginning of the next end step.",
        ),
      ).toEqual(['r:creature']);
    });
  });

  describe('composite / multi-clause cards', () => {
    it('yields multiple tags for modal or multi-ability cards', () => {
      expect(
        classifyOracleText(
          'Destroy target creature.\nCounter target spell unless its controller pays {3}.',
        ),
      ).toEqual(['csi:spell', 'r:creature']);
    });
  });
});
