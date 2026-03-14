/**
 * Tier 2 field generation module.
 *
 * Generates the logistical follow-on fields that depend on Tier 1 values for
 * cross-tier correlation. Reads Tier1Fields to apply B4→C2 co-variance and
 * B6/B7→C5 post-production scaling.
 *
 * PRNG contract: generateTier2() consumes exactly 17 rand() calls per project,
 * regardless of which branch any field takes. Breakdown:
 *   B1  hasStudioLease         — rand() #1
 *   B5  regionalPercent        — rand() #2, #3
 *   B6/B7 picturePostPercent,
 *         soundPostPercent     — rand() #4–#8  (5 calls)
 *   B8  vfxPercent             — rand() #9
 *   B9  conceptPhysicalPercent — rand() #10
 *   C1  castPercent            — rand() #11, #12
 *   C2  crewPercent            — rand() #13, #14
 *   C5  btlKeyCount
 *   C6  btlAdditionalCount     — rand() #15, #16
 *   C8  supportingCastCount    — rand() #17
 *
 * Fields generated (mapped to ProjectInputs):
 *   B1  hasStudioLease          — 10% base probability
 *   B5  regionalPercent         — bimodal: high (25-75%) or low (0-24%)
 *   B6  picturePostPercent      — bimodal 0-5% or 85-100% (DIST-01)
 *   B7  soundPostPercent        — bimodal, coupled with B6 (DIST-01)
 *   B8  vfxPercent              — uniform 0-100 independent (DIST-02)
 *   B9  conceptPhysicalPercent  — uniform 0-100 independent (DIST-02)
 *   C1  castPercent             — budget-inverse high-pass (DIST-05)
 *   C2  crewPercent             — shooting-correlated high-pass (DIST-04)
 *   C5  btlKeyCount             — post-production and budget scaled (DIST-03)
 *   C6  btlAdditionalCount      — >= C5 always (DIST-03)
 *   C8  supportingCastCount     — budget-inverse weighted (DIST-05)
 */

import type { BudgetTierConfig } from './types';
import {
  POST_PRODUCTION_CONFIG,
  B4_C2_COVARIANCE,
  BTL_CONFIG,
  BUDGET_INVERSE_SUPPORTING_CAST_WEIGHTS,
} from './correlations';
import { type Tier1Fields, weightedSelect } from './tier1';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Subset of ProjectInputs produced by the Tier 2 generation pass.
 * Combined with Tier1Fields and Tier3Fields to form a complete ProjectInputs.
 */
export type Tier2Fields = {
  hasStudioLease: boolean;           // B1
  regionalPercent: number;           // B5
  picturePostPercent: number;        // B6 (DIST-01: bimodal)
  soundPostPercent: number;          // B7 (DIST-01: bimodal, coupled with B6)
  vfxPercent: number;                // B8 (DIST-02: independent)
  conceptPhysicalPercent: number;    // B9 (DIST-02: independent)
  castPercent: number;               // C1 (DIST-05: budget-inverse)
  crewPercent: number;               // C2 (DIST-04: correlated with B4)
  btlKeyCount: number;               // C5 (deferred from Tier 1 — needs B6/B7 context)
  btlAdditionalCount: number;        // C6 (DIST-03: >= C5 always)
  supportingCastCount: number;       // C8 (DIST-05: budget-inverse)
};

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Budget-inverse cast probability thresholds for castPercent high-pass. */
const CAST_HIGH_PASS_PROB: Record<string, number> = {
  small:    0.80,
  mid:      0.70,
  large:    0.55,
  tentpole: 0.40,
};

// ── Generator ─────────────────────────────────────────────────────────────────

/**
 * Generate Tier 2 fields for a single project.
 *
 * Cross-tier correlations applied:
 *   DIST-01: B6/B7 bimodal post-production — coin flip for high/low cluster,
 *            10% chance each field independently diverges from the cluster.
 *   DIST-02: B8/B9 fully independent, uniform 0-100.
 *   DIST-03: C5 scaled by post-production presence (B6) and budget tier;
 *            C6 always >= C5; C5=0 forces C6=0.
 *   DIST-04: C2 pass probability driven by tier1.shootingNZPercent.
 *   DIST-05: C1 budget-inverse high-pass; C8 budget-inverse weighted selection.
 *
 * @param rand       - PRNG function producing values in [0, 1). Must be stateful.
 * @param tier1      - Tier 1 output for this project (provides B4 for DIST-04).
 * @param tierConfig - Budget tier for this project.
 * @returns          - Tier2Fields object; exactly 17 rand() calls consumed.
 */
export function generateTier2(
  rand: () => number,
  tier1: Tier1Fields,
  tierConfig: BudgetTierConfig,
): Tier2Fields {
  // ── rand() #1 — B1: hasStudioLease ─────────────────────────────────────────
  const hasStudioLease = rand() < 0.10;

  // ── rand() #2, #3 — B5: regionalPercent ────────────────────────────────────
  // Always consume 2 rand() calls regardless of which branch is taken.
  const r1 = rand();
  const r2 = rand();
  // High regional: 25-75%. Low regional: 0-24%.
  const regionalPercent = r1 < 0.5
    ? 25 + Math.round(r2 * 50)
    : Math.round(r2 * 24);

  // ── rand() #4–#8 — B6/B7: picturePostPercent, soundPostPercent (DIST-01) ───
  // 5 rand() calls consumed deterministically.
  const clusterRoll       = rand(); // #4 — high vs. low cluster for this project
  const pictureSplitRoll  = rand(); // #5 — picture may diverge from cluster
  const soundSplitRoll    = rand(); // #6 — sound may diverge from cluster
  const pictureValueRoll  = rand(); // #7 — value within cluster for picture
  const soundValueRoll    = rand(); // #8 — value within cluster for sound

  const {
    highLowSplitProb,
    splitProb,
    highRange,
    lowRange,
  } = POST_PRODUCTION_CONFIG;

  const isHighCluster = clusterRoll < highLowSplitProb;

  // Each field can independently flip to the opposite cluster (10% chance).
  const pictureHigh = (pictureSplitRoll < splitProb) ? !isHighCluster : isHighCluster;
  const soundHigh   = (soundSplitRoll   < splitProb) ? !isHighCluster : isHighCluster;

  const picturePostPercent = pictureHigh
    ? highRange.min + Math.round(pictureValueRoll * (highRange.max - highRange.min))
    : lowRange.min  + Math.round(pictureValueRoll * (lowRange.max  - lowRange.min));

  const soundPostPercent = soundHigh
    ? highRange.min + Math.round(soundValueRoll * (highRange.max - highRange.min))
    : lowRange.min  + Math.round(soundValueRoll * (lowRange.max  - lowRange.min));

  // ── rand() #9 — B8: vfxPercent (DIST-02, fully independent) ────────────────
  const vfxPercent = Math.round(rand() * 100);

  // ── rand() #10 — B9: conceptPhysicalPercent (DIST-02, fully independent) ───
  const conceptPhysicalPercent = Math.round(rand() * 100);

  // ── rand() #11, #12 — C1: castPercent (DIST-05, budget-inverse high-pass) ──
  // Always consume 2 rand() calls regardless of which branch is taken.
  const castProb  = CAST_HIGH_PASS_PROB[tierConfig.tier];
  const castR1    = rand(); // #11 — pass/fail threshold
  const castR2    = rand(); // #12 — value within range
  const castPercent = castR1 < castProb
    ? 80 + Math.round(castR2 * 20)   // high: 80-100
    : Math.round(castR2 * 79);        // low: 0-79

  // ── rand() #13, #14 — C2: crewPercent (DIST-04, shooting-correlated) ───────
  // High NZ shooting → higher probability of local crew pass.
  const passProb = tier1.shootingNZPercent >= B4_C2_COVARIANCE.highShootingThreshold
    ? B4_C2_COVARIANCE.highShootingCrewPassProb
    : B4_C2_COVARIANCE.lowShootingCrewPassProb;
  const crewR1 = rand(); // #13 — pass/fail threshold
  const crewR2 = rand(); // #14 — value within range
  const crewPercent = crewR1 < passProb
    ? 80 + Math.round(crewR2 * 20)   // high: 80-100
    : Math.round(crewR2 * 79);        // low: 0-79

  // ── rand() #15, #16 — C5/C6: btlKeyCount, btlAdditionalCount (DIST-03) ────
  // C5 range expands when picturePostPercent >= 75 (NZ post-production present).
  const isHighPost = picturePostPercent >= 75;
  const c5Max = isHighPost ? BTL_CONFIG.c5MaxWithPost : BTL_CONFIG.c5MaxWithoutPost;
  const effectiveMax = Math.max(1, Math.round(c5Max * BTL_CONFIG.budgetC5Bias[tierConfig.tier]));

  const c5Roll = rand(); // #15
  const btlKeyCount = Math.floor(c5Roll * (effectiveMax + 1));

  let btlAdditionalCount: number;
  if (btlKeyCount === 0) {
    // C5 = 0 → C6 must also be 0 (DIST-03 hard constraint).
    // Consume the c6 rand() call anyway to keep PRNG sequence deterministic.
    rand();  // #16 — consumed and discarded
    btlAdditionalCount = 0;
  } else {
    const c6Roll = rand(); // #16
    // C6 >= C5: sample from [C5, c6Max].
    btlAdditionalCount = btlKeyCount + Math.floor(c6Roll * (BTL_CONFIG.c6Max - btlKeyCount + 1));
  }

  // ── rand() #17 — C8: supportingCastCount (DIST-05, budget-inverse weights) ─
  const supportingCastCount = weightedSelect(
    rand(),
    BUDGET_INVERSE_SUPPORTING_CAST_WEIGHTS[tierConfig.tier],
  );

  return {
    hasStudioLease,
    regionalPercent,
    picturePostPercent,
    soundPostPercent,
    vfxPercent,
    conceptPhysicalPercent,
    castPercent,
    crewPercent,
    btlKeyCount,
    btlAdditionalCount,
    supportingCastCount,
  };
}
