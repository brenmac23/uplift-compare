/**
 * Tier 1 field generation module.
 *
 * Generates the "organic" production fundamentals that drive all downstream
 * correlations. These are the fields most directly shaped by budget tier and
 * represent the core NZ Production Activity criteria.
 *
 * PRNG contract: generateTier1() consumes exactly 6 rand() calls per project,
 * regardless of which branch any field takes. This keeps the PRNG sequence
 * deterministic so Tier 2 and Tier 3 see consistent offsets.
 *
 * Fields generated (mapped to ProjectInputs):
 *   A1  hasSustainabilityPlan   — always true (mandatory), no rand() consumed
 *   B2  hasPreviousQNZPE        — rand() #1
 *   B3  hasAssociatedContent    — rand() #2
 *   B4  shootingNZPercent       — rand() #3 (budget-tier-aware range)
 *   C4  atlCount                — rand() #4 (DIST-05: budget-inverse weights)
 *   C7  hasLeadCast             — rand() #5 (DIST-05: budget-inverse probability)
 *   C9  castingLevel            — rand() #6 (DIST-05: budget-inverse cumulative)
 */

import type { BudgetTierConfig, ProductionType } from './types';
import {
  BUDGET_INVERSE_ATL_WEIGHTS,
  BUDGET_INVERSE_CAST_WEIGHTS,
  CASTING_LEVEL_WEIGHTS,
} from './correlations';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Subset of ProjectInputs produced by the Tier 1 generation pass.
 * These values are passed to generateTier2() for cross-tier correlations.
 */
export type Tier1Fields = {
  hasSustainabilityPlan: true;                           // A1: mandatory, always true
  hasPreviousQNZPE: boolean;                             // B2
  hasAssociatedContent: boolean;                         // B3
  shootingNZPercent: number;                             // B4
  atlCount: number;                                      // C4 (DIST-05: budget-inverse)
  hasLeadCast: boolean;                                  // C7 (DIST-05: budget-inverse)
  castingLevel: 'none' | 'associate' | 'director';       // C9 (DIST-05: budget-inverse)
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Weighted random selection from a discrete distribution.
 *
 * Treats `weights` as an array of probabilities summing to 1.
 * Returns the index of the selected weight bucket.
 *
 * Example: weightedSelect(0.62, [0.10, 0.25, 0.35, 0.30]) → 2
 *
 * Exported so Tier 2 can reuse it for supporting cast selection.
 *
 * @param u       - Uniform random variate in [0, 1).
 * @param weights - Array of probabilities; must sum to ~1.
 * @returns       - Selected index (0-based).
 */
export function weightedSelect(u: number, weights: number[]): number {
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (u < cumulative) return i;
  }
  // Floating-point safety: return last index if u rounds above 1.
  return weights.length - 1;
}

// ── Generator ─────────────────────────────────────────────────────────────────

/**
 * Generate Tier 1 fields for a single project.
 *
 * Budget-inverse correlations (DIST-05):
 *   - `atlCount`:     small productions favour 2-3 local ATL roles; tentpole favour 0-1.
 *   - `hasLeadCast`:  probability of local lead cast decreases with budget.
 *   - `castingLevel`: local casting director more likely on smaller budgets.
 *
 * Shooting percentage (drives DIST-04 downstream):
 *   - small/mid: 70-100% (primarily NZ-based shoots)
 *   - large:     50-100% (more flexibility)
 *   - tentpole:  40-100% (international shoots common)
 *
 * @param rand         - PRNG function producing values in [0, 1). Must be stateful.
 * @param tierConfig   - Budget tier for this project.
 * @param productionType - 'film' | 'tv' (reserved for future tier differentiation).
 * @returns            - Tier1Fields object; exactly 6 rand() calls consumed.
 */
export function generateTier1(
  rand: () => number,
  tierConfig: BudgetTierConfig,
  _productionType: ProductionType,
): Tier1Fields {
  // rand() #1 — B2: hasPreviousQNZPE
  const hasPreviousQNZPE = rand() < 0.55;

  // rand() #2 — B3: hasAssociatedContent
  const hasAssociatedContent = rand() < 0.35;

  // rand() #3 — B4: shootingNZPercent (budget-tier-aware range)
  const shootingRoll = rand();
  let shootingNZPercent: number;
  switch (tierConfig.tier) {
    case 'small':
    case 'mid':
      // Small/mid productions predominantly shoot in NZ.
      shootingNZPercent = 70 + Math.round(shootingRoll * 30);
      break;
    case 'large':
      // Larger productions have more flexibility.
      shootingNZPercent = 50 + Math.round(shootingRoll * 50);
      break;
    case 'tentpole':
      // Tentpoles sometimes shoot primarily overseas.
      shootingNZPercent = 40 + Math.round(shootingRoll * 60);
      break;
  }

  // rand() #4 — C4: atlCount (DIST-05, budget-inverse, index = value 0-3)
  const atlCount = weightedSelect(rand(), BUDGET_INVERSE_ATL_WEIGHTS[tierConfig.tier]);

  // rand() #5 — C7: hasLeadCast (DIST-05, budget-inverse probability)
  const hasLeadCast = rand() < BUDGET_INVERSE_CAST_WEIGHTS[tierConfig.tier];

  // rand() #6 — C9: castingLevel (DIST-05, budget-inverse cumulative thresholds)
  const castingRoll = rand();
  const castWeights = CASTING_LEVEL_WEIGHTS[tierConfig.tier];
  let castingLevel: 'none' | 'associate' | 'director';
  if (castingRoll < castWeights.director) {
    castingLevel = 'director';
  } else if (castingRoll < castWeights.associate) {
    castingLevel = 'associate';
  } else {
    castingLevel = 'none';
  }

  return {
    hasSustainabilityPlan: true,
    hasPreviousQNZPE,
    hasAssociatedContent,
    shootingNZPercent,
    atlCount,
    hasLeadCast,
    castingLevel,
  };
}
