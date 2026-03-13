import type { ProjectInputs, ScoringResult, SectionResult, CriterionResult } from './types';
import { scoreHighestTier, scoreCountCapped } from './helpers';
import { EXISTING_SPEC } from './spec';

/**
 * Scores a production against the existing NZ Screen Production Rebate 5% Uplift Points Test.
 *
 * - 85 maximum points across 6 sections (A-F)
 * - Pass threshold: 40 points AND mandatory A1 criterion met
 * - A1 (Sustainability Action Plan & Report) is the only mandatory criterion
 *
 * All numeric rules come from EXISTING_SPEC — no magic numbers in this function.
 *
 * @pure No side effects, no module-level state. Same inputs always produce same output.
 */
export function scoreExisting(inputs: ProjectInputs): ScoringResult {
  const spec = EXISTING_SPEC;

  // ── Section A: Sustainability (7pts max) ───────────────────────────────────
  const a1Score = inputs.hasSustainabilityPlan ? spec.sectionA.a1.points : 0;
  const a1Mandatory = spec.sectionA.a1.mandatory;
  const a1MandatoryMet = inputs.hasSustainabilityPlan;

  const sectionACriteria: CriterionResult[] = [
    {
      id: spec.sectionA.a1.id,
      label: spec.sectionA.a1.label,
      score: a1Score,
      maxScore: spec.sectionA.a1.points,
      mandatory: a1Mandatory,
      mandatoryMet: a1MandatoryMet,
    },
    {
      id: spec.sectionA.a2.id,
      label: spec.sectionA.a2.label,
      score: inputs.hasSustainabilityOfficer ? spec.sectionA.a2.points : 0,
      maxScore: spec.sectionA.a2.points,
    },
    {
      id: spec.sectionA.a3.id,
      label: spec.sectionA.a3.label,
      score: inputs.hasCarbonReview ? spec.sectionA.a3.points : 0,
      maxScore: spec.sectionA.a3.points,
    },
  ];

  // ── Section B: NZ Production Activity (21pts max) ─────────────────────────
  const sectionBCriteria: CriterionResult[] = [
    {
      id: spec.sectionB.b1.id,
      label: spec.sectionB.b1.label,
      score: inputs.hasStudioLease ? spec.sectionB.b1.points : 0,
      maxScore: spec.sectionB.b1.points,
    },
    {
      id: spec.sectionB.b2.id,
      label: spec.sectionB.b2.label,
      score: inputs.hasPreviousQNZPE ? spec.sectionB.b2.points : 0,
      maxScore: spec.sectionB.b2.points,
    },
    {
      id: spec.sectionB.b3.id,
      label: spec.sectionB.b3.label,
      score: inputs.hasAssociatedContent ? spec.sectionB.b3.points : 0,
      maxScore: spec.sectionB.b3.points,
    },
    {
      id: spec.sectionB.b4.id,
      label: spec.sectionB.b4.label,
      score: scoreHighestTier(spec.sectionB.b4.tiers, inputs.shootingNZPercent),
      maxScore: spec.sectionB.b4.maxPoints,
    },
    {
      id: spec.sectionB.b5.id,
      label: spec.sectionB.b5.label,
      score: inputs.regionalPercent >= spec.sectionB.b5.threshold ? spec.sectionB.b5.points : 0,
      maxScore: spec.sectionB.b5.points,
    },
    {
      id: spec.sectionB.b6.id,
      label: spec.sectionB.b6.label,
      score: scoreHighestTier(spec.sectionB.b6.tiers, inputs.picturePostPercent),
      maxScore: spec.sectionB.b6.maxPoints,
    },
    {
      id: spec.sectionB.b7.id,
      label: spec.sectionB.b7.label,
      score: scoreHighestTier(spec.sectionB.b7.tiers, inputs.soundPostPercent),
      maxScore: spec.sectionB.b7.maxPoints,
    },
    {
      id: spec.sectionB.b8.id,
      label: spec.sectionB.b8.label,
      score: scoreHighestTier(spec.sectionB.b8.tiers, inputs.vfxPercent),
      maxScore: spec.sectionB.b8.maxPoints,
    },
    {
      id: spec.sectionB.b9.id,
      label: spec.sectionB.b9.label,
      score: scoreHighestTier(spec.sectionB.b9.tiers, inputs.conceptPhysicalPercent),
      maxScore: spec.sectionB.b9.maxPoints,
    },
  ];

  // ── Section C: NZ Personnel (31pts max) ───────────────────────────────────
  const castingScore =
    inputs.castingLevel === 'director'
      ? spec.sectionC.c9.directorPoints
      : inputs.castingLevel === 'associate'
        ? spec.sectionC.c9.associatePoints
        : 0;

  const sectionCCriteria: CriterionResult[] = [
    {
      id: spec.sectionC.c1.id,
      label: spec.sectionC.c1.label,
      score: inputs.castPercent >= spec.sectionC.c1.threshold ? spec.sectionC.c1.points : 0,
      maxScore: spec.sectionC.c1.points,
    },
    {
      id: spec.sectionC.c2.id,
      label: spec.sectionC.c2.label,
      score: inputs.crewPercent >= spec.sectionC.c2.threshold ? spec.sectionC.c2.points : 0,
      maxScore: spec.sectionC.c2.points,
    },
    {
      id: spec.sectionC.c3.id,
      label: spec.sectionC.c3.label,
      score: inputs.maoriCrewPercent >= spec.sectionC.c3.threshold ? spec.sectionC.c3.points : 0,
      maxScore: spec.sectionC.c3.points,
    },
    {
      id: spec.sectionC.c4.id,
      label: spec.sectionC.c4.label,
      score: scoreCountCapped(inputs.atlCount, spec.sectionC.c4.pointsEach, spec.sectionC.c4.maxPoints),
      maxScore: spec.sectionC.c4.maxPoints,
    },
    {
      id: spec.sectionC.c5.id,
      label: spec.sectionC.c5.label,
      score: scoreCountCapped(inputs.btlKeyCount, spec.sectionC.c5.pointsEach, spec.sectionC.c5.cap),
      maxScore: spec.sectionC.c5.maxPoints,
    },
    {
      id: spec.sectionC.c6.id,
      label: spec.sectionC.c6.label,
      score: scoreCountCapped(inputs.btlAdditionalCount, spec.sectionC.c6.pointsEach, spec.sectionC.c6.cap),
      maxScore: spec.sectionC.c6.maxPoints,
    },
    {
      id: spec.sectionC.c7.id,
      label: spec.sectionC.c7.label,
      score: inputs.hasLeadCast ? spec.sectionC.c7.points : 0,
      maxScore: spec.sectionC.c7.points,
    },
    {
      id: spec.sectionC.c8.id,
      label: spec.sectionC.c8.label,
      score: scoreCountCapped(inputs.supportingCastCount, spec.sectionC.c8.pointsEach, spec.sectionC.c8.maxPoints),
      maxScore: spec.sectionC.c8.maxPoints,
    },
    {
      id: spec.sectionC.c9.id,
      label: spec.sectionC.c9.label,
      score: castingScore,
      maxScore: spec.sectionC.c9.maxPoints,
    },
    {
      id: spec.sectionC.c10.id,
      label: spec.sectionC.c10.label,
      score: inputs.hasLeadCastMaori ? spec.sectionC.c10.points : 0,
      maxScore: spec.sectionC.c10.points,
    },
  ];

  // ── Section D: Skills and Talent Development (6pts max) ───────────────────
  // D3: attachment threshold depends on QNZPE band
  const d3Threshold =
    inputs.qnzpe > 100_000_000
      ? spec.sectionD.d3.thresholds.over100m
      : spec.sectionD.d3.thresholds.under100m;
  const d3Score = inputs.attachmentCount >= d3Threshold ? spec.sectionD.d3.points : 0;

  // D4: internship threshold depends on QNZPE band (3 bands)
  const d4Threshold =
    inputs.qnzpe > 150_000_000
      ? spec.sectionD.d4.thresholds.over150m
      : inputs.qnzpe > 50_000_000
        ? spec.sectionD.d4.thresholds.under150m
        : spec.sectionD.d4.thresholds.under50m;
  const d4Score = inputs.internshipCount >= d4Threshold ? spec.sectionD.d4.points : 0;

  const sectionDCriteria: CriterionResult[] = [
    {
      id: spec.sectionD.d1.id,
      label: spec.sectionD.d1.label,
      score: inputs.hasMasterclass ? spec.sectionD.d1.points : 0,
      maxScore: spec.sectionD.d1.points,
    },
    {
      id: spec.sectionD.d2.id,
      label: spec.sectionD.d2.label,
      score: inputs.hasEdSeminars ? spec.sectionD.d2.points : 0,
      maxScore: spec.sectionD.d2.points,
    },
    {
      id: spec.sectionD.d3.id,
      label: spec.sectionD.d3.label,
      score: d3Score,
      maxScore: spec.sectionD.d3.points,
    },
    {
      id: spec.sectionD.d4.id,
      label: spec.sectionD.d4.label,
      score: d4Score,
      maxScore: spec.sectionD.d4.points,
    },
  ];

  // ── Section E: Innovation and Infrastructure (8pts max) ───────────────────
  const sectionECriteria: CriterionResult[] = [
    {
      id: spec.sectionE.e1.id,
      label: spec.sectionE.e1.label,
      score: inputs.hasKnowledgeTransfer ? spec.sectionE.e1.points : 0,
      maxScore: spec.sectionE.e1.points,
    },
    {
      id: spec.sectionE.e2.id,
      label: spec.sectionE.e2.label,
      score: scoreHighestTier(spec.sectionE.e2.tiers, inputs.commercialAgreementPercent),
      maxScore: spec.sectionE.e2.maxPoints,
    },
    {
      id: spec.sectionE.e3.id,
      label: spec.sectionE.e3.label,
      score: scoreHighestTier(spec.sectionE.e3.tiers, inputs.infrastructureInvestment),
      maxScore: spec.sectionE.e3.maxPoints,
    },
  ];

  // ── Section F: Marketing, Promoting, and Showcasing NZ (12pts max) ────────
  const f1Score =
    inputs.premiereType === 'world'
      ? spec.sectionF.f1.worldPoints
      : inputs.premiereType === 'nz'
        ? spec.sectionF.f1.nzPoints
        : 0;

  const sectionFCriteria: CriterionResult[] = [
    {
      id: spec.sectionF.f1.id,
      label: spec.sectionF.f1.label,
      score: f1Score,
      maxScore: spec.sectionF.f1.maxPoints,
    },
    {
      id: spec.sectionF.f2.id,
      label: spec.sectionF.f2.label,
      score: inputs.hasFilmMarketing ? spec.sectionF.f2.points : 0,
      maxScore: spec.sectionF.f2.points,
    },
    {
      id: spec.sectionF.f3.id,
      label: spec.sectionF.f3.label,
      score: inputs.hasTourismMarketing ? spec.sectionF.f3.points : 0,
      maxScore: spec.sectionF.f3.points,
    },
    {
      id: spec.sectionF.f4.id,
      label: spec.sectionF.f4.label,
      score: inputs.hasTourismPartnership ? spec.sectionF.f4.points : 0,
      maxScore: spec.sectionF.f4.points,
    },
  ];

  // ── Build sections ─────────────────────────────────────────────────────────
  const sections: SectionResult[] = [
    buildSection('A', spec.sectionA.label, spec.sectionA.maxPoints, sectionACriteria),
    buildSection('B', spec.sectionB.label, spec.sectionB.maxPoints, sectionBCriteria),
    buildSection('C', spec.sectionC.label, spec.sectionC.maxPoints, sectionCCriteria),
    buildSection('D', spec.sectionD.label, spec.sectionD.maxPoints, sectionDCriteria),
    buildSection('E', spec.sectionE.label, spec.sectionE.maxPoints, sectionECriteria),
    buildSection('F', spec.sectionF.label, spec.sectionF.maxPoints, sectionFCriteria),
  ];

  // ── Compute totals and pass/fail ───────────────────────────────────────────
  const allCriteria = sections.flatMap(s => s.criteria);
  const totalPoints = sections.reduce((sum, s) => sum + s.totalPoints, 0);
  const mandatoryMet = a1MandatoryMet;
  const passed = totalPoints >= spec.passThreshold && mandatoryMet;

  return {
    totalPoints,
    maxPoints: spec.maxPoints,
    passed,
    mandatoryMet,
    passThreshold: spec.passThreshold,
    sections,
    criteria: allCriteria,
  };
}

// ── Private helpers ────────────────────────────────────────────────────────────

function buildSection(
  id: string,
  label: string,
  maxPoints: number,
  criteria: CriterionResult[]
): SectionResult {
  const totalPoints = criteria.reduce((sum, c) => {
    const s = c.score;
    return sum + (typeof s === 'number' ? s : 0);
  }, 0);

  return { id, label, maxPoints, totalPoints, criteria };
}
