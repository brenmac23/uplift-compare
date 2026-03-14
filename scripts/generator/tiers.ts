/**
 * Budget tier definitions and QNZPE clustering logic.
 *
 * Four tiers encode the user-specified budget ranges:
 *   small    $20m–$49.9m
 *   mid      $50m–$99.9m
 *   large    $100m–$199.9m
 *   tentpole $200m–$250m
 *
 * QNZPE values within a tier are sampled from a triangular distribution
 * so that projects cluster around realistic budget points rather than
 * spreading uniformly across the range.
 */

import type { BudgetTierConfig } from './types';

/**
 * Four budget tier configurations.
 *
 * Tier weights used by pickBudgetTier():
 *   small=25%, mid=25%, large=30%, tentpole=20%
 * → ~50% of projects land at $100m+, satisfying the test's 20-30 projects constraint.
 */
export const BUDGET_TIERS: BudgetTierConfig[] = [
  { tier: 'small',    minQnzpe:  20_000_000, maxQnzpe:  49_999_999, clusterCenter: 0.4  },
  { tier: 'mid',      minQnzpe:  50_000_000, maxQnzpe:  99_999_999, clusterCenter: 0.35 },
  { tier: 'large',    minQnzpe: 100_000_000, maxQnzpe: 199_999_999, clusterCenter: 0.3  },
  { tier: 'tentpole', minQnzpe: 200_000_000, maxQnzpe: 250_000_000, clusterCenter: 0.4  },
];

/**
 * Triangular distribution inverse CDF.
 *
 * Produces a sample from a triangular distribution with the given parameters.
 *
 * @param min  - Minimum value of the distribution.
 * @param max  - Maximum value of the distribution.
 * @param mode - Most likely value (peak of the triangle).
 * @param u    - Uniform random variate in [0, 1).
 * @returns    - Sample from the triangular distribution.
 */
export function triangular(min: number, max: number, mode: number, u: number): number {
  const fc = (mode - min) / (max - min);
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

/**
 * Sample a QNZPE value from a budget tier using the triangular distribution.
 *
 * The mode is derived from `tier.clusterCenter`, which represents the fraction
 * of the tier's range at which projects should cluster.
 * Result is rounded to the nearest $1m for plausibility.
 *
 * @param tier - Budget tier configuration.
 * @param rand - PRNG function producing values in [0, 1).
 * @returns    - QNZPE value in NZD, rounded to the nearest $1,000,000.
 */
export function sampleQnzpe(tier: BudgetTierConfig, rand: () => number): number {
  const { minQnzpe, maxQnzpe, clusterCenter } = tier;
  const mode = minQnzpe + clusterCenter * (maxQnzpe - minQnzpe);
  const raw = triangular(minQnzpe, maxQnzpe, mode, rand());
  return Math.round(raw / 1_000_000) * 1_000_000;
}

/**
 * Pick a budget tier using weighted random selection.
 *
 * Weights: small=25%, mid=25%, large=30%, tentpole=20%.
 * These weights produce ~50% of projects at $100m+ (large + tentpole),
 * which keeps the generated set inside the test's 20-30 projects constraint.
 *
 * @param rand - PRNG function producing values in [0, 1).
 * @returns    - One of the four BudgetTierConfig entries.
 */
export function pickBudgetTier(rand: () => number): BudgetTierConfig {
  const u = rand();
  // Cumulative thresholds: 0.25 | 0.50 | 0.80 | 1.00
  if (u < 0.25) return BUDGET_TIERS[0]; // small
  if (u < 0.50) return BUDGET_TIERS[1]; // mid
  if (u < 0.80) return BUDGET_TIERS[2]; // large
  return BUDGET_TIERS[3];               // tentpole
}
