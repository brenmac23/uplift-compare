/**
 * Shared scoring helper functions used by both scoring engines.
 * All functions are pure — no side effects, no module-level state.
 */

/**
 * Returns points for the highest qualifying tier.
 *
 * Tiers must be ordered highest-threshold-first. The function returns the points
 * for the first tier whose threshold the value meets or exceeds. Returns 0 if no
 * tier is met.
 *
 * This implements the "highest-qualifying-tier-wins" rule that applies to all tiered
 * criteria in both scoring systems. Never sums multiple tiers.
 *
 * @example
 * // Existing B8 VFX: 50%→1pt, 75%→2pts, 90%→3pts (highest-first ordering)
 * scoreHighestTier([[90, 3], [75, 2], [50, 1]], 80) // → 2 (hits 75%, not 90%)
 * scoreHighestTier([[90, 3], [75, 2], [50, 1]], 90) // → 3 (hits top tier)
 * scoreHighestTier([[90, 3], [75, 2], [50, 1]], 49) // → 0 (no tier met)
 */
export function scoreHighestTier(
  tiers: Array<[number, number]>,
  value: number
): number {
  for (const [threshold, points] of tiers) {
    if (value >= threshold) return points;
  }
  return 0;
}

/**
 * Returns points for a counted-role criterion, capped at a maximum.
 *
 * Multiplies a qualifying person count by the points awarded per person, then
 * caps the result at the maximum allowed. Handles fractional points-per-person
 * (e.g. proposed B5 at 0.5pts each).
 *
 * This implements the "count × points-per-person, capped" pattern used for
 * ATL crew (C4/B3), BTL key crew (C5/B4), BTL additional crew (C6/B5),
 * and supporting cast (C8/B7).
 *
 * @example
 * scoreCountCapped(3, 3, 9)   // → 9  (ATL: 3 persons × 3pts, cap 9)
 * scoreCountCapped(5, 1, 4)   // → 4  (BTL key: capped at 4)
 * scoreCountCapped(8, 0.5, 4) // → 4  (proposed B5: 8 × 0.5 = 4, cap 4)
 * scoreCountCapped(3, 0.5, 4) // → 1.5 (proposed B5: 3 × 0.5 = 1.5, under cap)
 */
export function scoreCountCapped(
  count: number,
  pointsEach: number,
  cap: number
): number {
  return Math.min(count * pointsEach, cap);
}
