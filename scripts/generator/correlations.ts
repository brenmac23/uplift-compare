/**
 * Cross-field correlation tables for the seed data generator.
 *
 * Phase 6 populates cross-field correlation tables keyed by BudgetTier and ProductionType.
 * Tier 1, 2, and 3 generation modules import these constants directly.
 */

import type { BudgetTier } from './types';
import type { ProjectInputs } from '../../src/scoring/types';

/** Budget-inverse ATL weights for atlCount values [0, 1, 2, 3]: smaller budgets favour higher counts. */
export const BUDGET_INVERSE_ATL_WEIGHTS: Record<BudgetTier, number[]> = {
  small:    [0.10, 0.25, 0.35, 0.30],
  mid:      [0.15, 0.30, 0.35, 0.20],
  large:    [0.25, 0.35, 0.25, 0.15],
  tentpole: [0.40, 0.35, 0.15, 0.10],
};

/** Probability of hasLeadCast being true per tier: higher budget = lower probability of local lead cast. */
export const BUDGET_INVERSE_CAST_WEIGHTS: Record<BudgetTier, number> = {
  small:    0.85,
  mid:      0.75,
  large:    0.60,
  tentpole: 0.45,
};

/** Budget-inverse supporting cast weights for supportingCastCount [0, 1, 2, 3]: same inverse pattern as ATL. */
export const BUDGET_INVERSE_SUPPORTING_CAST_WEIGHTS: Record<BudgetTier, number[]> = {
  small:    [0.10, 0.20, 0.35, 0.35],
  mid:      [0.15, 0.25, 0.35, 0.25],
  large:    [0.25, 0.30, 0.30, 0.15],
  tentpole: [0.35, 0.35, 0.20, 0.10],
};

/** Cumulative thresholds for castingLevel per tier: smaller budgets more likely to use local casting director. */
export const CASTING_LEVEL_WEIGHTS: Record<BudgetTier, { director: number; associate: number }> = {
  small:    { director: 0.30, associate: 0.65 },
  mid:      { director: 0.20, associate: 0.55 },
  large:    { director: 0.15, associate: 0.45 },
  tentpole: { director: 0.10, associate: 0.35 },
};

/** Bimodal post-production sampling parameters: coin flip for high/low cluster, optional picture/sound split. */
export const POST_PRODUCTION_CONFIG = {
  highLowSplitProb: 0.5,          // coin flip determines high vs. low cluster per project
  splitProb: 0.10,                 // 10% chance picture and sound post diverge
  highRange: { min: 85, max: 100 },
  lowRange:  { min: 0,  max: 5   },
};

/** Shooting/crew co-variance thresholds: higher shootingNZPercent correlates with higher crewPercent pass rate. */
export const B4_C2_COVARIANCE = {
  highShootingThreshold:    75,
  highShootingCrewPassProb: 0.88,
  lowShootingCrewPassProb:  0.35,
};

/** BTL crew shaping rules for C5 (btlKeyCount) and C6 (btlAdditionalCount). Hard constraint: C6 >= C5. */
export const BTL_CONFIG = {
  c5MaxWithPost:    7,   // B6/B7 high expands C5 range
  c5MaxWithoutPost: 4,   // no NZ post = smaller range
  c6Max:            8,
  /** Fraction of c5Max used as effective ceiling per tier: tentpole skews low, small uses full range. */
  budgetC5Bias: {
    small:    0.9,
    mid:      0.7,
    large:    0.5,
    tentpole: 0.4,
  } as Record<BudgetTier, number>,
};

/** Probability weights for ambition targets [40, 41, 42, 43, 44, 45]. */
export const AMBITION_TARGET_WEIGHTS: number[] = [0.15, 0.15, 0.20, 0.25, 0.15, 0.10];

/** Point-chasing field menu ordered by cost ascending. Tier 3 selects greedily from cheapest. */
export const TIER3_FIELD_COSTS: Array<{
  field: keyof ProjectInputs;
  value: unknown;
  points: number;
  cost: 'cheap' | 'medium' | 'expensive';
}> = [
  // Cheap (1–2 pts)
  { field: 'hasEdSeminars',           value: true,    points: 1, cost: 'cheap'     },
  { field: 'hasMasterclass',          value: true,    points: 2, cost: 'cheap'     },
  { field: 'hasSustainabilityOfficer',value: true,    points: 2, cost: 'cheap'     },
  { field: 'hasCarbonReview',         value: true,    points: 2, cost: 'cheap'     },
  { field: 'attachmentCount',         value: 2,       points: 2, cost: 'cheap'     },
  { field: 'internshipCount',         value: 4,       points: 1, cost: 'cheap'     },
  // Medium (2–3 pts)
  { field: 'premiereType',            value: 'nz',    points: 2, cost: 'medium'    },
  { field: 'premiereType',            value: 'world', points: 3, cost: 'medium'    },
  { field: 'hasFilmMarketing',        value: true,    points: 3, cost: 'medium'    },
  { field: 'hasTourismMarketing',     value: true,    points: 3, cost: 'medium'    },
  { field: 'hasTourismPartnership',   value: true,    points: 3, cost: 'medium'    },
  // Expensive (2–3 pts, high-budget only)
  { field: 'hasKnowledgeTransfer',    value: true,    points: 2, cost: 'expensive' },
  { field: 'commercialAgreementPercent', value: 1,   points: 3, cost: 'expensive' },
  { field: 'infrastructureInvestment',   value: 2_000_000, points: 3, cost: 'expensive' },
];
