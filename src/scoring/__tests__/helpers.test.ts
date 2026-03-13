import { describe, it, expect } from 'vitest';
import { scoreHighestTier, scoreCountCapped } from '../helpers';

describe('scoreHighestTier', () => {
  const tiers: Array<[number, number]> = [[90, 3], [75, 2], [50, 1]];

  it('returns 2 for value 80 (hits 75% tier, not 90%)', () => {
    expect(scoreHighestTier(tiers, 80)).toBe(2);
  });

  it('returns 3 for value exactly 90 (hits top tier)', () => {
    expect(scoreHighestTier(tiers, 90)).toBe(3);
  });

  it('returns 0 for value 49 (below all tiers)', () => {
    expect(scoreHighestTier(tiers, 49)).toBe(0);
  });

  it('returns 1 for value exactly 50 (hits lowest tier)', () => {
    expect(scoreHighestTier(tiers, 50)).toBe(1);
  });

  it('returns 3 for value above top tier (100)', () => {
    expect(scoreHighestTier(tiers, 100)).toBe(3);
  });

  it('returns 0 for value 0 (no tier met)', () => {
    expect(scoreHighestTier(tiers, 0)).toBe(0);
  });
});

describe('scoreCountCapped', () => {
  it('returns 9 for 3 persons x 3pts (ATL: 3 persons, cap 9)', () => {
    expect(scoreCountCapped(3, 3, 9)).toBe(9);
  });

  it('returns 4 for 5 persons x 1pt capped at 4 (BTL key crew cap)', () => {
    expect(scoreCountCapped(5, 1, 4)).toBe(4);
  });

  it('returns 0 for 0 persons', () => {
    expect(scoreCountCapped(0, 1, 4)).toBe(0);
  });

  it('returns 4 for 8 persons x 0.5pt capped at 4 (proposed B5 full cap)', () => {
    expect(scoreCountCapped(8, 0.5, 4)).toBe(4);
  });

  it('returns 1.5 for 3 persons x 0.5pt partial (proposed B5 partial)', () => {
    expect(scoreCountCapped(3, 0.5, 4)).toBe(1.5);
  });

  it('returns exact count * points when under cap', () => {
    expect(scoreCountCapped(2, 3, 9)).toBe(6);
  });

  it('returns cap when count * points exceeds cap', () => {
    expect(scoreCountCapped(10, 1, 4)).toBe(4);
  });
});
