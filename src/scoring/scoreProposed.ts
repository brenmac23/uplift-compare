import type { ProjectInputs, ScoringResult, SectionResult, CriterionResult } from './types';
import { scoreHighestTier, scoreCountCapped } from './helpers';
import { PROPOSED_SPEC } from './spec';

/**
 * Scores a production against the proposed NZ Screen Production Rebate 5% Uplift Points Test.
 *
 * Returns a pure ScoringResult with no side effects. All numeric constants come from
 * PROPOSED_SPEC — no magic numbers inline.
 *
 * Pass logic (QNZPE-tiered):
 *   - QNZPE < $100m → passThreshold = 20
 *   - QNZPE >= $100m → passThreshold = 30
 *   - mandatoryMet always true (no mandatory criteria in proposed)
 *   - maxPoints always 70
 *
 * Sections: A (20pts), B (32pts), C (6pts), D (12pts)
 */
export function scoreProposed(inputs: ProjectInputs): ScoringResult {
  // ── Section A: NZ Production Activity (20pts max) ──────────────────────────

  const a1: CriterionResult = {
    id: PROPOSED_SPEC.sectionA.a1.id,
    label: PROPOSED_SPEC.sectionA.a1.label,
    score: inputs.hasPreviousQNZPE ? PROPOSED_SPEC.sectionA.a1.points : 0,
    maxScore: PROPOSED_SPEC.sectionA.a1.points,
  };

  const a2: CriterionResult = {
    id: PROPOSED_SPEC.sectionA.a2.id,
    label: PROPOSED_SPEC.sectionA.a2.label,
    score: inputs.hasAssociatedContent ? PROPOSED_SPEC.sectionA.a2.points : 0,
    maxScore: PROPOSED_SPEC.sectionA.a2.points,
  };

  const a3: CriterionResult = {
    id: PROPOSED_SPEC.sectionA.a3.id,
    label: PROPOSED_SPEC.sectionA.a3.label,
    score: scoreHighestTier(PROPOSED_SPEC.sectionA.a3.tiers as Array<[number, number]>, inputs.shootingNZPercent),
    maxScore: PROPOSED_SPEC.sectionA.a3.maxPoints,
  };

  const a4: CriterionResult = {
    id: PROPOSED_SPEC.sectionA.a4.id,
    label: PROPOSED_SPEC.sectionA.a4.label,
    score: scoreHighestTier(PROPOSED_SPEC.sectionA.a4.tiers as Array<[number, number]>, inputs.regionalPercent),
    maxScore: PROPOSED_SPEC.sectionA.a4.maxPoints,
  };

  const a5: CriterionResult = {
    id: PROPOSED_SPEC.sectionA.a5.id,
    label: PROPOSED_SPEC.sectionA.a5.label,
    score: scoreHighestTier(PROPOSED_SPEC.sectionA.a5.tiers as Array<[number, number]>, inputs.picturePostPercent),
    maxScore: PROPOSED_SPEC.sectionA.a5.maxPoints,
  };

  const a6: CriterionResult = {
    id: PROPOSED_SPEC.sectionA.a6.id,
    label: PROPOSED_SPEC.sectionA.a6.label,
    score: scoreHighestTier(PROPOSED_SPEC.sectionA.a6.tiers as Array<[number, number]>, inputs.soundPostPercent),
    maxScore: PROPOSED_SPEC.sectionA.a6.maxPoints,
  };

  const a7: CriterionResult = {
    id: PROPOSED_SPEC.sectionA.a7.id,
    label: PROPOSED_SPEC.sectionA.a7.label,
    score: scoreHighestTier(PROPOSED_SPEC.sectionA.a7.tiers as Array<[number, number]>, inputs.vfxPercent),
    maxScore: PROPOSED_SPEC.sectionA.a7.maxPoints,
  };

  const a8: CriterionResult = {
    id: PROPOSED_SPEC.sectionA.a8.id,
    label: PROPOSED_SPEC.sectionA.a8.label,
    score: scoreHighestTier(PROPOSED_SPEC.sectionA.a8.tiers as Array<[number, number]>, inputs.conceptPhysicalPercent),
    maxScore: PROPOSED_SPEC.sectionA.a8.maxPoints,
  };

  const sectionACriteria = [a1, a2, a3, a4, a5, a6, a7, a8];
  const sectionAPoints = sumNumericScores(sectionACriteria);

  const sectionA: SectionResult = {
    id: 'A',
    label: PROPOSED_SPEC.sectionA.label,
    totalPoints: sectionAPoints,
    maxPoints: PROPOSED_SPEC.sectionA.maxPoints,
    criteria: sectionACriteria,
  };

  // ── Section B: NZ Personnel (32pts max) ────────────────────────────────────

  const b1: CriterionResult = {
    id: PROPOSED_SPEC.sectionB.b1.id,
    label: PROPOSED_SPEC.sectionB.b1.label,
    score: scoreHighestTier(PROPOSED_SPEC.sectionB.b1.tiers as Array<[number, number]>, inputs.castPercent),
    maxScore: PROPOSED_SPEC.sectionB.b1.maxPoints,
  };

  const b2: CriterionResult = {
    id: PROPOSED_SPEC.sectionB.b2.id,
    label: PROPOSED_SPEC.sectionB.b2.label,
    score: inputs.crewPercent >= PROPOSED_SPEC.sectionB.b2.threshold ? PROPOSED_SPEC.sectionB.b2.points : 0,
    maxScore: PROPOSED_SPEC.sectionB.b2.points,
  };

  const b3: CriterionResult = {
    id: PROPOSED_SPEC.sectionB.b3.id,
    label: PROPOSED_SPEC.sectionB.b3.label,
    score: scoreCountCapped(inputs.atlCount, PROPOSED_SPEC.sectionB.b3.pointsEach, PROPOSED_SPEC.sectionB.b3.maxPoints),
    maxScore: PROPOSED_SPEC.sectionB.b3.maxPoints,
  };

  const b4: CriterionResult = {
    id: PROPOSED_SPEC.sectionB.b4.id,
    label: PROPOSED_SPEC.sectionB.b4.label,
    score: scoreCountCapped(inputs.btlKeyCount, PROPOSED_SPEC.sectionB.b4.pointsEach, PROPOSED_SPEC.sectionB.b4.cap),
    maxScore: PROPOSED_SPEC.sectionB.b4.maxPoints,
  };

  const b5: CriterionResult = {
    id: PROPOSED_SPEC.sectionB.b5.id,
    label: PROPOSED_SPEC.sectionB.b5.label,
    score: scoreCountCapped(inputs.btlAdditionalCount, PROPOSED_SPEC.sectionB.b5.pointsEach, PROPOSED_SPEC.sectionB.b5.cap),
    maxScore: PROPOSED_SPEC.sectionB.b5.maxPoints,
  };

  const b6: CriterionResult = {
    id: PROPOSED_SPEC.sectionB.b6.id,
    label: PROPOSED_SPEC.sectionB.b6.label,
    score: inputs.hasLeadCast ? PROPOSED_SPEC.sectionB.b6.points : 0,
    maxScore: PROPOSED_SPEC.sectionB.b6.points,
  };

  const b7: CriterionResult = {
    id: PROPOSED_SPEC.sectionB.b7.id,
    label: PROPOSED_SPEC.sectionB.b7.label,
    score: scoreCountCapped(inputs.supportingCastCount, PROPOSED_SPEC.sectionB.b7.pointsEach, PROPOSED_SPEC.sectionB.b7.maxPoints),
    maxScore: PROPOSED_SPEC.sectionB.b7.maxPoints,
  };

  const b8: CriterionResult = {
    id: PROPOSED_SPEC.sectionB.b8.id,
    label: PROPOSED_SPEC.sectionB.b8.label,
    score:
      inputs.castingLevel === 'director'
        ? PROPOSED_SPEC.sectionB.b8.directorPoints
        : inputs.castingLevel === 'associate'
          ? PROPOSED_SPEC.sectionB.b8.associatePoints
          : 0,
    maxScore: PROPOSED_SPEC.sectionB.b8.maxPoints,
  };

  const sectionBCriteria = [b1, b2, b3, b4, b5, b6, b7, b8];
  const sectionBPoints = sumNumericScores(sectionBCriteria);

  const sectionB: SectionResult = {
    id: 'B',
    label: PROPOSED_SPEC.sectionB.label,
    totalPoints: sectionBPoints,
    maxPoints: PROPOSED_SPEC.sectionB.maxPoints,
    criteria: sectionBCriteria,
  };

  // ── Section C: Skills & Talent Development (6pts max) ─────────────────────

  const c1: CriterionResult = {
    id: PROPOSED_SPEC.sectionC.c1.id,
    label: PROPOSED_SPEC.sectionC.c1.label,
    score: inputs.hasIndustrySeminars ? PROPOSED_SPEC.sectionC.c1.points : 0,
    maxScore: PROPOSED_SPEC.sectionC.c1.points,
  };

  const c2: CriterionResult = {
    id: PROPOSED_SPEC.sectionC.c2.id,
    label: PROPOSED_SPEC.sectionC.c2.label,
    score: inputs.hasEdSeminars ? PROPOSED_SPEC.sectionC.c2.points : 0,
    maxScore: PROPOSED_SPEC.sectionC.c2.points,
  };

  // C3: Attachments — binary threshold based on QNZPE
  const attachmentThreshold =
    inputs.qnzpe > PROPOSED_SPEC.qnzpeThreshold
      ? PROPOSED_SPEC.sectionC.c3.thresholds.over100m
      : PROPOSED_SPEC.sectionC.c3.thresholds.under100m;

  const c3: CriterionResult = {
    id: PROPOSED_SPEC.sectionC.c3.id,
    label: PROPOSED_SPEC.sectionC.c3.label,
    score: inputs.attachmentCount >= attachmentThreshold ? PROPOSED_SPEC.sectionC.c3.points : 0,
    maxScore: PROPOSED_SPEC.sectionC.c3.points,
  };

  // C4: Internships — binary threshold based on QNZPE
  const internshipThreshold =
    inputs.qnzpe > PROPOSED_SPEC.qnzpeThreshold
      ? PROPOSED_SPEC.sectionC.c4.thresholds.over100m
      : PROPOSED_SPEC.sectionC.c4.thresholds.under100m;

  const c4: CriterionResult = {
    id: PROPOSED_SPEC.sectionC.c4.id,
    label: PROPOSED_SPEC.sectionC.c4.label,
    score: inputs.internshipCount >= internshipThreshold ? PROPOSED_SPEC.sectionC.c4.points : 0,
    maxScore: PROPOSED_SPEC.sectionC.c4.points,
  };

  const sectionCCriteria = [c1, c2, c3, c4];
  const sectionCPoints = sumNumericScores(sectionCCriteria);

  const sectionC: SectionResult = {
    id: 'C',
    label: PROPOSED_SPEC.sectionC.label,
    totalPoints: sectionCPoints,
    maxPoints: PROPOSED_SPEC.sectionC.maxPoints,
    criteria: sectionCCriteria,
  };

  // ── Section D: Marketing (12pts max) ───────────────────────────────────────

  // D1: Two independent binaries — both can be earned simultaneously
  const d1Score =
    (inputs.hasNZPremiere ? PROPOSED_SPEC.sectionD.d1.nzPremierePoints : 0) +
    (inputs.hasIntlPromotion ? PROPOSED_SPEC.sectionD.d1.intlPromotionPoints : 0);

  const d1: CriterionResult = {
    id: PROPOSED_SPEC.sectionD.d1.id,
    label: PROPOSED_SPEC.sectionD.d1.label,
    score: d1Score,
    maxScore: PROPOSED_SPEC.sectionD.d1.maxPoints,
  };

  const d2: CriterionResult = {
    id: PROPOSED_SPEC.sectionD.d2.id,
    label: PROPOSED_SPEC.sectionD.d2.label,
    score: inputs.hasFilmMarketing ? PROPOSED_SPEC.sectionD.d2.points : 0,
    maxScore: PROPOSED_SPEC.sectionD.d2.points,
  };

  const d3: CriterionResult = {
    id: PROPOSED_SPEC.sectionD.d3.id,
    label: PROPOSED_SPEC.sectionD.d3.label,
    score: inputs.hasLocationAnnouncement ? PROPOSED_SPEC.sectionD.d3.points : 0,
    maxScore: PROPOSED_SPEC.sectionD.d3.points,
  };

  const d4: CriterionResult = {
    id: PROPOSED_SPEC.sectionD.d4.id,
    label: PROPOSED_SPEC.sectionD.d4.label,
    score: inputs.hasTourismPartnership ? PROPOSED_SPEC.sectionD.d4.points : 0,
    maxScore: PROPOSED_SPEC.sectionD.d4.points,
  };

  const sectionDCriteria = [d1, d2, d3, d4];
  const sectionDPoints = sumNumericScores(sectionDCriteria);

  const sectionD: SectionResult = {
    id: 'D',
    label: PROPOSED_SPEC.sectionD.label,
    totalPoints: sectionDPoints,
    maxPoints: PROPOSED_SPEC.sectionD.maxPoints,
    criteria: sectionDCriteria,
  };

  // ── Aggregate ───────────────────────────────────────────────────────────────

  const sections = [sectionA, sectionB, sectionC, sectionD];
  const totalPoints = sectionAPoints + sectionBPoints + sectionCPoints + sectionDPoints;
  const criteria = sections.flatMap((s) => s.criteria);

  const passThreshold =
    inputs.qnzpe >= PROPOSED_SPEC.qnzpeThreshold
      ? PROPOSED_SPEC.passThresholdOver100m
      : PROPOSED_SPEC.passThresholdUnder100m;

  return {
    totalPoints,
    maxPoints: PROPOSED_SPEC.maxPoints,
    passed: totalPoints >= passThreshold,
    mandatoryMet: true,
    passThreshold,
    sections,
    criteria,
  };
}

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Sums numeric scores from a criterion list, skipping 'N/A' entries.
 * (No criteria in proposed return N/A, but this is defensive.)
 */
function sumNumericScores(criteria: CriterionResult[]): number {
  return criteria.reduce<number>((total, c) => {
    return typeof c.score === 'number' ? total + c.score : total;
  }, 0);
}
