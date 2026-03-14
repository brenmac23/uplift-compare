/**
 * Tier 3 field generation module.
 *
 * Generates point-chasing fields using a score-gap greedy algorithm.
 * Each project samples a personal "ambition target" (40-45 pts), computes
 * how far short it falls after Tier 1+2, then greedily picks cheap criteria
 * to close the gap. Section E (expensive) is a last resort for high-budget
 * projects only.
 *
 * PRNG contract: generateTier3() consumes a FIXED total per project:
 *   1  rand()  — ambition target (AMBITION_TARGET_WEIGHTS)
 *   14 rand()  — 1 per TIER3_FIELD_COSTS entry (14 entries), regardless of branch
 *    4 rand()  — 1 per entry needing a value: attachmentCount, internshipCount,
 *                commercialAgreementPercent, infrastructureInvestment
 *    4 rand()  — proposed-only fields (hasIndustrySeminars, hasNZPremiere,
 *                hasIntlPromotion, hasLocationAnnouncement)
 *
 * Total: 23 rand() calls per project, deterministic regardless of branch paths.
 *
 * Fields generated (mapped to ProjectInputs):
 *   A2  hasSustainabilityOfficer  — D1 cheap greedy
 *   A3  hasCarbonReview           — D2 cheap greedy
 *   D1  hasMasterclass            — D3 cheap greedy
 *   D2  hasEdSeminars             — D4 cheap greedy
 *   D3  attachmentCount           — D5 cheap greedy
 *   D4  internshipCount           — D6 cheap greedy
 *   F1  premiereType              — M1/M2 medium greedy
 *   F2  hasFilmMarketing          — M3 medium greedy
 *   F3  hasTourismMarketing       — M4 medium greedy
 *   F4  hasTourismPartnership     — M5 medium greedy
 *   E1  hasKnowledgeTransfer      — X1 expensive (last resort)
 *   E2  commercialAgreementPercent — X2 expensive (last resort)
 *   E3  infrastructureInvestment  — X3 expensive (last resort)
 *   proposed: hasIndustrySeminars, hasNZPremiere, hasIntlPromotion, hasLocationAnnouncement
 */

import type { BudgetTierConfig } from './types';
import type { ProjectInputs } from '../../src/scoring/types';
import { scoreExisting } from '../../src/scoring/scoreExisting';
import { AMBITION_TARGET_WEIGHTS, TIER3_FIELD_COSTS } from './correlations';
import { type Tier1Fields, weightedSelect } from './tier1';
import { type Tier2Fields } from './tier2';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Subset of ProjectInputs produced by the Tier 3 generation pass.
 * Combined with Tier1Fields and Tier2Fields to form complete ProjectInputs.
 */
export type Tier3Fields = {
  hasSustainabilityOfficer: boolean;    // A2
  hasCarbonReview: boolean;             // A3
  hasMasterclass: boolean;              // D1
  hasEdSeminars: boolean;               // D2
  attachmentCount: number;              // D3
  internshipCount: number;              // D4
  hasKnowledgeTransfer: boolean;        // E1
  commercialAgreementPercent: number;   // E2
  infrastructureInvestment: number;     // E3
  premiereType: 'none' | 'nz' | 'world'; // F1
  hasFilmMarketing: boolean;            // F2
  hasTourismMarketing: boolean;         // F3
  hasTourismPartnership: boolean;       // F4
  // Proposed-only fields (not scored by existing, must be populated)
  hasIndustrySeminars: boolean;
  hasNZPremiere: boolean;
  hasIntlPromotion: boolean;
  hasLocationAnnouncement: boolean;
};

// ── Selection probabilities ───────────────────────────────────────────────────

/** Probability a producer "bothers" with each cost tier criterion. */
const SELECTION_PROBS: Record<'cheap' | 'medium' | 'expensive', number> = {
  cheap:     0.85,
  medium:    0.55,
  expensive: 0.40,
};

/** Ambition target value array — index maps from weightedSelect() result. */
const AMBITION_VALUES = [40, 41, 42, 43, 44, 45] as const;

// ── Generator ─────────────────────────────────────────────────────────────────

/**
 * Generate Tier 3 fields for a single project.
 *
 * The greedy algorithm:
 *   1. Sample ambition target (40-45) from AMBITION_TARGET_WEIGHTS.
 *   2. Score Tier 1+2 baseline (Tier 3 defaults: false/0/none).
 *   3. Compute gap = ambitionTarget - currentScore.
 *   4. If gap <= 0: project already meets its target; skip greedy loop.
 *   5. Iterate TIER3_FIELD_COSTS cheapest-first:
 *      - Skip expensive fields until first pass is exhausted.
 *      - Apply rand() probability per cost tier.
 *      - If selected and gap > 0: activate field, recompute score, update gap.
 *   6. If gap > 0 after cheap+medium pass and qnzpe >= $100m: second pass over
 *      expensive fields only (Section E last resort).
 *   7. Proposed-only fields: 4 fixed rand() calls.
 *
 * PRNG consumption: exactly 23 rand() calls per project, regardless of branches.
 *
 * @param rand       - PRNG function producing values in [0, 1). Must be stateful.
 * @param tier1      - Tier 1 output for this project.
 * @param tier2      - Tier 2 output for this project.
 * @param tierConfig - Budget tier for this project.
 * @param qnzpe      - Qualifying NZ Production Expenditure in whole NZD.
 * @returns          - Tier3Fields object; exactly 23 rand() calls consumed.
 */
export function generateTier3(
  rand: () => number,
  tier1: Tier1Fields,
  tier2: Tier2Fields,
  tierConfig: BudgetTierConfig,
  qnzpe: number,
): Tier3Fields {
  const isHighBudget = qnzpe >= 100_000_000;

  // ── rand() #1 — ambition target ────────────────────────────────────────────
  const ambitionIndex = weightedSelect(rand(), AMBITION_TARGET_WEIGHTS);
  const ambitionTarget = AMBITION_VALUES[ambitionIndex];

  // ── Default (inactive) Tier 3 fields for baseline scoring ─────────────────
  let hasSustainabilityOfficer = false;
  let hasCarbonReview = false;
  let hasMasterclass = false;
  let hasEdSeminars = false;
  // Attachment/internship defaults: 0 counts ensure scoring threshold is not met.
  const attachmentThreshold = qnzpe > 100_000_000 ? 4 : 2;
  const internshipThreshold = qnzpe > 150_000_000 ? 10 : qnzpe > 50_000_000 ? 8 : 4;
  let attachmentCount = 0;
  let internshipCount = 0;
  let hasKnowledgeTransfer = false;
  let commercialAgreementPercent = 0;
  let infrastructureInvestment = 0;
  let premiereType: 'none' | 'nz' | 'world' = 'none';
  let hasFilmMarketing = false;
  let hasTourismMarketing = false;
  let hasTourismPartnership = false;

  // ── Build partial inputs for scoring baseline ──────────────────────────────
  function buildInputsSnapshot(): ProjectInputs {
    return {
      projectName: '',
      productionType: 'film',
      qnzpe,
      // Tier 1
      hasSustainabilityPlan: tier1.hasSustainabilityPlan,
      hasPreviousQNZPE: tier1.hasPreviousQNZPE,
      hasAssociatedContent: tier1.hasAssociatedContent,
      shootingNZPercent: tier1.shootingNZPercent,
      atlCount: tier1.atlCount,
      hasLeadCast: tier1.hasLeadCast,
      castingLevel: tier1.castingLevel,
      // Tier 2
      hasStudioLease: tier2.hasStudioLease,
      regionalPercent: tier2.regionalPercent,
      picturePostPercent: tier2.picturePostPercent,
      soundPostPercent: tier2.soundPostPercent,
      vfxPercent: tier2.vfxPercent,
      conceptPhysicalPercent: tier2.conceptPhysicalPercent,
      castPercent: tier2.castPercent,
      crewPercent: tier2.crewPercent,
      btlKeyCount: tier2.btlKeyCount,
      btlAdditionalCount: tier2.btlAdditionalCount,
      supportingCastCount: tier2.supportingCastCount,
      // Tier 3 (current state — updated as greedy loop progresses)
      hasSustainabilityOfficer,
      hasCarbonReview,
      hasMasterclass,
      hasEdSeminars,
      attachmentCount,
      internshipCount,
      hasKnowledgeTransfer,
      commercialAgreementPercent,
      infrastructureInvestment,
      premiereType,
      hasFilmMarketing,
      hasTourismMarketing,
      hasTourismPartnership,
      // Proposed-only (not scored by existing)
      hasIndustrySeminars: false,
      hasNZPremiere: false,
      hasIntlPromotion: false,
      hasLocationAnnouncement: false,
      // Maori fields — Phase 7 handles the special scenario
      maoriCrewPercent: 0,
      hasLeadCastMaori: false,
    };
  }

  // ── Compute baseline score (Tier 1+2 only, Tier 3 at defaults) ────────────
  let currentScore = scoreExisting(buildInputsSnapshot()).totalPoints;
  let gap = ambitionTarget - currentScore;

  // ── Pre-read all PRNG values for greedy loop (fixed consumption) ───────────
  // CRITICAL: consume exactly 1 rand() per TIER3_FIELD_COSTS entry (14 calls)
  // plus 1 extra rand() for the 4 entries that need value sampling.
  // Total: 14 + 4 = 18 rand() calls pre-consumed here (rand() #2 through #19).
  //
  // The 4 value-sampling entries (in TIER3_FIELD_COSTS order):
  //   attachmentCount (index 4): pre-read attachmentValueRoll
  //   internshipCount (index 5): pre-read internshipValueRoll
  //   commercialAgreementPercent (index 12): pre-read caValueRoll
  //   infrastructureInvestment (index 13): pre-read infraValueRoll

  // Read all 14 selection rolls + 4 value rolls upfront.
  const selectionRolls: number[] = [];
  for (let i = 0; i < TIER3_FIELD_COSTS.length; i++) {
    selectionRolls.push(rand()); // #2 through #15 (14 calls)
  }
  // rand() #16 — attachmentCount value roll
  const attachmentValueRoll = rand();
  // rand() #17 — internshipCount value roll
  const internshipValueRoll = rand();
  // rand() #18 — commercialAgreementPercent value roll
  const caValueRoll = rand();
  // rand() #19 — infrastructureInvestment value roll
  const infraValueRoll = rand();

  // ── Helper: activate a field and update score/gap ──────────────────────────
  function activateField(field: keyof ProjectInputs, _value: unknown): void {
    switch (field) {
      case 'hasSustainabilityOfficer': hasSustainabilityOfficer = true; break;
      case 'hasCarbonReview':          hasCarbonReview = true; break;
      case 'hasMasterclass':           hasMasterclass = true; break;
      case 'hasEdSeminars':            hasEdSeminars = true; break;
      case 'attachmentCount':
        attachmentCount = isHighBudget
          ? 4 + Math.floor(attachmentValueRoll * 4)
          : 2 + Math.floor(attachmentValueRoll * 4);
        break;
      case 'internshipCount':
        internshipCount = internshipThreshold + Math.floor(internshipValueRoll * 5);
        break;
      case 'premiereType':
        // Can upgrade from 'nz' to 'world' — apply the highest value.
        if (_value === 'world') premiereType = 'world';
        else if (_value === 'nz' && premiereType === 'none') premiereType = 'nz';
        break;
      case 'hasFilmMarketing':     hasFilmMarketing = true; break;
      case 'hasTourismMarketing':  hasTourismMarketing = true; break;
      case 'hasTourismPartnership': hasTourismPartnership = true; break;
      case 'hasKnowledgeTransfer': hasKnowledgeTransfer = true; break;
      case 'commercialAgreementPercent':
        commercialAgreementPercent = [0.25, 0.5, 1][Math.floor(caValueRoll * 3)] as number;
        break;
      case 'infrastructureInvestment':
        infrastructureInvestment = [500_000, 1_000_000, 2_000_000][Math.floor(infraValueRoll * 3)] as number;
        break;
    }
    currentScore = scoreExisting(buildInputsSnapshot()).totalPoints;
    gap = ambitionTarget - currentScore;
  }

  // ── Greedy loop: cheap and medium fields (skip expensive in first pass) ────
  // Entries 0-10: cheap and medium fields.
  // Entries 11-13: expensive (Section E) — skipped in first pass.
  const EXPENSIVE_START = TIER3_FIELD_COSTS.findIndex(e => e.cost === 'expensive');

  for (let i = 0; i < EXPENSIVE_START; i++) {
    const entry = TIER3_FIELD_COSTS[i];
    const roll = selectionRolls[i];

    // Skip if gap already closed.
    if (gap <= 0) continue;

    // Skip if this premiere upgrade can't add points (already 'world').
    if (entry.field === 'premiereType' && premiereType === 'world') continue;
    // Skip 'nz' premiere if already set to 'world'.
    if (entry.field === 'premiereType' && entry.value === 'nz' && premiereType !== 'none') continue;

    const prob = SELECTION_PROBS[entry.cost];
    if (roll < prob) {
      activateField(entry.field, entry.value);
    }
  }

  // ── Section E last resort: only for high-budget projects with remaining gap ─
  if (gap > 0 && isHighBudget) {
    for (let i = EXPENSIVE_START; i < TIER3_FIELD_COSTS.length; i++) {
      if (gap <= 0) break;
      const entry = TIER3_FIELD_COSTS[i];
      const roll = selectionRolls[i];
      const prob = SELECTION_PROBS[entry.cost];
      if (roll < prob) {
        activateField(entry.field, entry.value);
      }
    }
  }

  // ── rand() #20–#23 — proposed-only fields (always consume 4 calls) ─────────
  const hasIndustrySeminars    = rand() < 0.5; // #20
  const hasNZPremiere          = rand() < 0.4; // #21
  const hasIntlPromotion       = rand() < 0.4; // #22
  const hasLocationAnnouncement = rand() < 0.5; // #23

  return {
    hasSustainabilityOfficer,
    hasCarbonReview,
    hasMasterclass,
    hasEdSeminars,
    attachmentCount,
    internshipCount,
    hasKnowledgeTransfer,
    commercialAgreementPercent,
    infrastructureInvestment,
    premiereType,
    hasFilmMarketing,
    hasTourismMarketing,
    hasTourismPartnership,
    hasIndustrySeminars,
    hasNZPremiere,
    hasIntlPromotion,
    hasLocationAnnouncement,
  };
}
