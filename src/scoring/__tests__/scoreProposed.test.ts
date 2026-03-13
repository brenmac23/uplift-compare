import { describe, it, expect } from 'vitest';
import { scoreProposed } from '../scoreProposed';
import type { ProjectInputs } from '../types';

// ── Shared base inputs ────────────────────────────────────────────────────────
// These inputs produce a known result for both existing and proposed tests.
// From SCORING_SPEC.md Example 3 (Proposed Test — Known Passer, mid-budget).
const BASE_INPUTS: ProjectInputs = {
  projectName: 'Test Production',
  qnzpe: 60_000_000,

  // Existing-only fields (not scored in proposed)
  hasSustainabilityPlan: true,
  hasSustainabilityOfficer: true,
  hasCarbonReview: false,
  hasStudioLease: false,
  maoriCrewPercent: 5,
  hasLeadCastMaori: false,
  hasMasterclass: true,
  hasKnowledgeTransfer: false,
  commercialAgreementPercent: 0,
  infrastructureInvestment: 0,
  premiereType: 'nz',
  hasTourismMarketing: false,

  // Section A (proposed) / B (existing): NZ Production Activity
  hasPreviousQNZPE: false,
  hasAssociatedContent: false,
  shootingNZPercent: 85,
  regionalPercent: 30,
  picturePostPercent: 60,
  soundPostPercent: 40,
  vfxPercent: 20,
  conceptPhysicalPercent: 0,

  // Section B (proposed) / C (existing): NZ Personnel
  castPercent: 85,
  crewPercent: 90,
  atlCount: 2,
  btlKeyCount: 3,
  btlAdditionalCount: 2,
  hasLeadCast: true,
  supportingCastCount: 2,
  castingLevel: 'associate',

  // Section C (proposed) / D (existing): Skills
  hasIndustrySeminars: false,
  hasEdSeminars: true,
  attachmentCount: 2,
  internshipCount: 5,

  // Section D (proposed) / F (existing): Marketing
  hasNZPremiere: false,
  hasIntlPromotion: false,
  hasFilmMarketing: true,
  hasLocationAnnouncement: false,
  hasTourismPartnership: false,
};

// ── Example 4 inputs from SCORING_SPEC.md: Known Failer (minimal production) ─
const MINIMAL_INPUTS: ProjectInputs = {
  projectName: 'Minimal Production',
  qnzpe: 25_000_000,

  // Existing-only
  hasSustainabilityPlan: false,
  hasSustainabilityOfficer: false,
  hasCarbonReview: false,
  hasStudioLease: false,
  maoriCrewPercent: 0,
  hasLeadCastMaori: false,
  hasMasterclass: false,
  hasKnowledgeTransfer: false,
  commercialAgreementPercent: 0,
  infrastructureInvestment: 0,
  premiereType: 'none',
  hasTourismMarketing: false,

  // Section A: Production Activity
  hasPreviousQNZPE: false,
  hasAssociatedContent: false,
  shootingNZPercent: 50,
  regionalPercent: 5,
  picturePostPercent: 10,
  soundPostPercent: 10,
  vfxPercent: 0,
  conceptPhysicalPercent: 0,

  // Section B: Personnel
  castPercent: 50,
  crewPercent: 70,
  atlCount: 0,
  btlKeyCount: 0,
  btlAdditionalCount: 0,
  hasLeadCast: false,
  supportingCastCount: 0,
  castingLevel: 'none',

  // Section C: Skills
  hasIndustrySeminars: false,
  hasEdSeminars: false,
  attachmentCount: 0,
  internshipCount: 0,

  // Section D: Marketing
  hasNZPremiere: false,
  hasIntlPromotion: false,
  hasFilmMarketing: false,
  hasLocationAnnouncement: false,
  hasTourismPartnership: false,
};

// ── Top-level shape tests ─────────────────────────────────────────────────────

describe('scoreProposed — top-level shape', () => {
  it('returns a ScoringResult with all required fields', () => {
    const result = scoreProposed(BASE_INPUTS);
    expect(result).toHaveProperty('totalPoints');
    expect(result).toHaveProperty('maxPoints');
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('mandatoryMet');
    expect(result).toHaveProperty('passThreshold');
    expect(result).toHaveProperty('sections');
    expect(result).toHaveProperty('criteria');
  });

  it('returns maxPoints = 70', () => {
    expect(scoreProposed(BASE_INPUTS).maxPoints).toBe(70);
  });

  it('returns mandatoryMet: true always (no mandatory criteria in proposed)', () => {
    expect(scoreProposed(BASE_INPUTS).mandatoryMet).toBe(true);
    expect(scoreProposed(MINIMAL_INPUTS).mandatoryMet).toBe(true);
  });

  it('every criterion has id, label, score (number or N/A), and maxScore', () => {
    const result = scoreProposed(BASE_INPUTS);
    for (const criterion of result.criteria) {
      expect(criterion).toHaveProperty('id');
      expect(criterion).toHaveProperty('label');
      expect(criterion).toHaveProperty('score');
      expect(criterion).toHaveProperty('maxScore');
      // score must be number or 'N/A'
      expect(
        typeof criterion.score === 'number' || criterion.score === 'N/A'
      ).toBe(true);
    }
  });

  it('criteria flat list matches all criteria across sections', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionCriteria = result.sections.flatMap((s) => s.criteria);
    expect(result.criteria.length).toBe(sectionCriteria.length);
  });

  it('has exactly 4 sections (A, B, C, D)', () => {
    const result = scoreProposed(BASE_INPUTS);
    expect(result.sections).toHaveLength(4);
    expect(result.sections.map((s) => s.id)).toEqual(['A', 'B', 'C', 'D']);
  });
});

// ── Pass threshold — QNZPE-tiered ────────────────────────────────────────────

describe('scoreProposed — pass threshold logic', () => {
  it('applies threshold 20 when QNZPE < $100m', () => {
    const result = scoreProposed({ ...BASE_INPUTS, qnzpe: 60_000_000 });
    expect(result.passThreshold).toBe(20);
  });

  it('applies threshold 30 when QNZPE >= $100m', () => {
    const result = scoreProposed({ ...BASE_INPUTS, qnzpe: 100_000_000 });
    expect(result.passThreshold).toBe(30);
  });

  it('boundary: QNZPE = 99_999_999 → threshold 20', () => {
    const result = scoreProposed({ ...BASE_INPUTS, qnzpe: 99_999_999 });
    expect(result.passThreshold).toBe(20);
  });

  it('boundary: QNZPE = 100_000_000 → threshold 30', () => {
    const result = scoreProposed({ ...BASE_INPUTS, qnzpe: 100_000_000 });
    expect(result.passThreshold).toBe(30);
  });

  it('passes when total >= passThreshold (25pts, QNZPE $50m → threshold 20)', () => {
    // Build inputs that yield exactly 25pts with QNZPE < $100m
    const inputs: ProjectInputs = {
      ...MINIMAL_INPUTS,
      qnzpe: 50_000_000,
      hasLeadCast: true,       // B6: 4pts
      hasFilmMarketing: true,  // D2: 3pts
      hasTourismPartnership: true, // D4: 4pts
      atlCount: 3,             // B3: 9pts
      castPercent: 80,         // B1: 3pts
      crewPercent: 80,         // B2: 3pts
      // total B: 4+3+9+3 = 19, D: 3+4 = 7 → A: 0, C: 0, total = 26
      // Let's just use hasEdSeminars false, we'll have 26 pts — enough to verify pass
    };
    const result = scoreProposed(inputs);
    expect(result.passed).toBe(true);
    expect(result.totalPoints).toBeGreaterThanOrEqual(20);
  });

  it('fails when total < passThreshold (25pts with QNZPE $150m → threshold 30)', () => {
    // Build inputs that yield total < 30 with QNZPE >= $100m
    // Use MINIMAL_INPUTS with enough to get around 25pts but QNZPE $150m
    const inputs: ProjectInputs = {
      ...MINIMAL_INPUTS,
      qnzpe: 150_000_000,
      hasFilmMarketing: true,  // D2: 3pts
      hasTourismPartnership: true, // D4: 4pts
      atlCount: 1,             // B3: 3pts
      hasLeadCast: true,       // B6: 4pts
      btlKeyCount: 4,          // B4: 4pts
      // B: 4+4+3 = 11, D: 3+4 = 7, A: 0, C: 0 → total = 18, < 30 → FAIL
    };
    const result = scoreProposed(inputs);
    expect(result.passThreshold).toBe(30);
    expect(result.passed).toBe(false);
  });
});

// ── Worked Example 3: Known Passer (SCORING_SPEC.md) ─────────────────────────

describe('scoreProposed — SCORING_SPEC.md Example 3 (known passer, $60m)', () => {
  it('produces exactly 37 total points', () => {
    const result = scoreProposed(BASE_INPUTS);
    expect(result.totalPoints).toBe(37);
  });

  it('passes (37 >= 20 threshold)', () => {
    const result = scoreProposed(BASE_INPUTS);
    expect(result.passed).toBe(true);
    expect(result.passThreshold).toBe(20);
  });

  it('section A total = 6', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionA = result.sections.find((s) => s.id === 'A')!;
    expect(sectionA.totalPoints).toBe(6);
  });

  it('section B total = 23', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionB = result.sections.find((s) => s.id === 'B')!;
    expect(sectionB.totalPoints).toBe(23);
  });

  it('section C total = 5', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionC = result.sections.find((s) => s.id === 'C')!;
    expect(sectionC.totalPoints).toBe(5);
  });

  it('section D total = 3', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionD = result.sections.find((s) => s.id === 'D')!;
    expect(sectionD.totalPoints).toBe(3);
  });
});

// ── Worked Example 4: Known Failer (SCORING_SPEC.md) ─────────────────────────

describe('scoreProposed — SCORING_SPEC.md Example 4 (known failer, $25m)', () => {
  it('produces exactly 0 total points', () => {
    const result = scoreProposed(MINIMAL_INPUTS);
    expect(result.totalPoints).toBe(0);
  });

  it('fails (0 < 20 threshold)', () => {
    const result = scoreProposed(MINIMAL_INPUTS);
    expect(result.passed).toBe(false);
    expect(result.passThreshold).toBe(20);
  });
});

// ── Section A: NZ Production Activity ────────────────────────────────────────

describe('scoreProposed — Section A: NZ Production Activity', () => {
  it('A1: hasPreviousQNZPE true → 2pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasPreviousQNZPE: true });
    const a1 = result.criteria.find((c) => c.id === 'A1')!;
    expect(a1.score).toBe(2);
    expect(a1.maxScore).toBe(2);
  });

  it('A1: hasPreviousQNZPE false → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasPreviousQNZPE: false });
    const a1 = result.criteria.find((c) => c.id === 'A1')!;
    expect(a1.score).toBe(0);
  });

  it('A2: hasAssociatedContent true → 2pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasAssociatedContent: true });
    const a2 = result.criteria.find((c) => c.id === 'A2')!;
    expect(a2.score).toBe(2);
    expect(a2.maxScore).toBe(2);
  });

  it('A2: hasAssociatedContent false → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasAssociatedContent: false });
    const a2 = result.criteria.find((c) => c.id === 'A2')!;
    expect(a2.score).toBe(0);
  });

  it('A3: shootingNZPercent >= 90% → 2pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, shootingNZPercent: 90 });
    const a3 = result.criteria.find((c) => c.id === 'A3')!;
    expect(a3.score).toBe(2);
    expect(a3.maxScore).toBe(2);
  });

  it('A3: shootingNZPercent >= 75% < 90% → 1pt', () => {
    const result = scoreProposed({ ...BASE_INPUTS, shootingNZPercent: 85 });
    const a3 = result.criteria.find((c) => c.id === 'A3')!;
    expect(a3.score).toBe(1);
  });

  it('A3: shootingNZPercent < 75% → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, shootingNZPercent: 74 });
    const a3 = result.criteria.find((c) => c.id === 'A3')!;
    expect(a3.score).toBe(0);
  });

  it('A4: regionalPercent >= 25% → 2pts (top tier)', () => {
    const result = scoreProposed({ ...BASE_INPUTS, regionalPercent: 25 });
    const a4 = result.criteria.find((c) => c.id === 'A4')!;
    expect(a4.score).toBe(2);
    expect(a4.maxScore).toBe(2);
  });

  it('A4: regionalPercent >= 10% < 25% → 1pt (lower tier — proposed only)', () => {
    const result = scoreProposed({ ...BASE_INPUTS, regionalPercent: 15 });
    const a4 = result.criteria.find((c) => c.id === 'A4')!;
    expect(a4.score).toBe(1);
  });

  it('A4: regionalPercent < 10% → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, regionalPercent: 9 });
    const a4 = result.criteria.find((c) => c.id === 'A4')!;
    expect(a4.score).toBe(0);
  });

  it('A5: picturePostPercent >= 75% → 3pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, picturePostPercent: 75 });
    const a5 = result.criteria.find((c) => c.id === 'A5')!;
    expect(a5.score).toBe(3);
    expect(a5.maxScore).toBe(3);
  });

  it('A5: picturePostPercent >= 50% < 75% → 2pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, picturePostPercent: 60 });
    const a5 = result.criteria.find((c) => c.id === 'A5')!;
    expect(a5.score).toBe(2);
  });

  it('A5: picturePostPercent >= 30% < 50% → 1pt', () => {
    const result = scoreProposed({ ...BASE_INPUTS, picturePostPercent: 30 });
    const a5 = result.criteria.find((c) => c.id === 'A5')!;
    expect(a5.score).toBe(1);
  });

  it('A5: picturePostPercent < 30% → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, picturePostPercent: 20 });
    const a5 = result.criteria.find((c) => c.id === 'A5')!;
    expect(a5.score).toBe(0);
  });

  it('A6: soundPostPercent tiered like A5 (75→3, 50→2, 30→1)', () => {
    const r75 = scoreProposed({ ...BASE_INPUTS, soundPostPercent: 75 });
    const r50 = scoreProposed({ ...BASE_INPUTS, soundPostPercent: 50 });
    const r30 = scoreProposed({ ...BASE_INPUTS, soundPostPercent: 30 });
    const r29 = scoreProposed({ ...BASE_INPUTS, soundPostPercent: 29 });
    expect(r75.criteria.find((c) => c.id === 'A6')!.score).toBe(3);
    expect(r50.criteria.find((c) => c.id === 'A6')!.score).toBe(2);
    expect(r30.criteria.find((c) => c.id === 'A6')!.score).toBe(1);
    expect(r29.criteria.find((c) => c.id === 'A6')!.score).toBe(0);
  });

  it('A7: vfxPercent lower thresholds than existing (30/50/75%)', () => {
    // Proposed A7 uses 30/50/75% thresholds (existing B8 uses 50/75/90%)
    const r75 = scoreProposed({ ...BASE_INPUTS, vfxPercent: 75 });
    const r50 = scoreProposed({ ...BASE_INPUTS, vfxPercent: 50 });
    const r30 = scoreProposed({ ...BASE_INPUTS, vfxPercent: 30 });
    const r29 = scoreProposed({ ...BASE_INPUTS, vfxPercent: 29 });
    expect(r75.criteria.find((c) => c.id === 'A7')!.score).toBe(3);
    expect(r50.criteria.find((c) => c.id === 'A7')!.score).toBe(2);
    expect(r30.criteria.find((c) => c.id === 'A7')!.score).toBe(1);
    expect(r29.criteria.find((c) => c.id === 'A7')!.score).toBe(0);
  });

  it('A8: conceptPhysicalPercent lower thresholds (30/50/75%)', () => {
    const r75 = scoreProposed({ ...BASE_INPUTS, conceptPhysicalPercent: 75 });
    const r50 = scoreProposed({ ...BASE_INPUTS, conceptPhysicalPercent: 50 });
    const r30 = scoreProposed({ ...BASE_INPUTS, conceptPhysicalPercent: 30 });
    expect(r75.criteria.find((c) => c.id === 'A8')!.score).toBe(3);
    expect(r50.criteria.find((c) => c.id === 'A8')!.score).toBe(2);
    expect(r30.criteria.find((c) => c.id === 'A8')!.score).toBe(1);
  });

  it('Section A maxPoints = 20', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionA = result.sections.find((s) => s.id === 'A')!;
    expect(sectionA.maxPoints).toBe(20);
  });
});

// ── Section B: NZ Personnel ───────────────────────────────────────────────────

describe('scoreProposed — Section B: NZ Personnel', () => {
  it('B1: castPercent >= 80% → 3pts (top tier)', () => {
    const result = scoreProposed({ ...BASE_INPUTS, castPercent: 80 });
    const b1 = result.criteria.find((c) => c.id === 'B1')!;
    expect(b1.score).toBe(3);
    expect(b1.maxScore).toBe(3);
  });

  it('B1: castPercent >= 60% < 80% → 2pts (lower tier)', () => {
    const result = scoreProposed({ ...BASE_INPUTS, castPercent: 60 });
    const b1 = result.criteria.find((c) => c.id === 'B1')!;
    expect(b1.score).toBe(2);
  });

  it('B1: castPercent < 60% → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, castPercent: 59 });
    const b1 = result.criteria.find((c) => c.id === 'B1')!;
    expect(b1.score).toBe(0);
  });

  it('B2: crewPercent >= 80% → 3pts (not 1pt like existing)', () => {
    const result = scoreProposed({ ...BASE_INPUTS, crewPercent: 80 });
    const b2 = result.criteria.find((c) => c.id === 'B2')!;
    expect(b2.score).toBe(3);
    expect(b2.maxScore).toBe(3);
  });

  it('B2: crewPercent < 80% → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, crewPercent: 79 });
    const b2 = result.criteria.find((c) => c.id === 'B2')!;
    expect(b2.score).toBe(0);
  });

  it('B3: atlCount 1 → 3pts, 2 → 6pts, 3 → 9pts (capped)', () => {
    expect(scoreProposed({ ...BASE_INPUTS, atlCount: 1 }).criteria.find((c) => c.id === 'B3')!.score).toBe(3);
    expect(scoreProposed({ ...BASE_INPUTS, atlCount: 2 }).criteria.find((c) => c.id === 'B3')!.score).toBe(6);
    expect(scoreProposed({ ...BASE_INPUTS, atlCount: 3 }).criteria.find((c) => c.id === 'B3')!.score).toBe(9);
    expect(scoreProposed({ ...BASE_INPUTS, atlCount: 4 }).criteria.find((c) => c.id === 'B3')!.score).toBe(9);
  });

  it('B3: maxScore = 9', () => {
    const result = scoreProposed(BASE_INPUTS);
    const b3 = result.criteria.find((c) => c.id === 'B3')!;
    expect(b3.maxScore).toBe(9);
  });

  it('B4: btlKeyCount capped at 4pts', () => {
    expect(scoreProposed({ ...BASE_INPUTS, btlKeyCount: 0 }).criteria.find((c) => c.id === 'B4')!.score).toBe(0);
    expect(scoreProposed({ ...BASE_INPUTS, btlKeyCount: 3 }).criteria.find((c) => c.id === 'B4')!.score).toBe(3);
    expect(scoreProposed({ ...BASE_INPUTS, btlKeyCount: 4 }).criteria.find((c) => c.id === 'B4')!.score).toBe(4);
    expect(scoreProposed({ ...BASE_INPUTS, btlKeyCount: 7 }).criteria.find((c) => c.id === 'B4')!.score).toBe(4);
  });

  it('B5: btlAdditionalCount at 0.5pts each, capped at 4pts', () => {
    expect(scoreProposed({ ...BASE_INPUTS, btlAdditionalCount: 0 }).criteria.find((c) => c.id === 'B5')!.score).toBe(0);
    expect(scoreProposed({ ...BASE_INPUTS, btlAdditionalCount: 1 }).criteria.find((c) => c.id === 'B5')!.score).toBe(0.5);
    expect(scoreProposed({ ...BASE_INPUTS, btlAdditionalCount: 3 }).criteria.find((c) => c.id === 'B5')!.score).toBe(1.5);
    expect(scoreProposed({ ...BASE_INPUTS, btlAdditionalCount: 8 }).criteria.find((c) => c.id === 'B5')!.score).toBe(4);
    expect(scoreProposed({ ...BASE_INPUTS, btlAdditionalCount: 10 }).criteria.find((c) => c.id === 'B5')!.score).toBe(4);
  });

  it('B5 maxScore = 4', () => {
    const result = scoreProposed(BASE_INPUTS);
    const b5 = result.criteria.find((c) => c.id === 'B5')!;
    expect(b5.maxScore).toBe(4);
  });

  it('B6: hasLeadCast true → 4pts (not 3pts like existing)', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasLeadCast: true });
    const b6 = result.criteria.find((c) => c.id === 'B6')!;
    expect(b6.score).toBe(4);
    expect(b6.maxScore).toBe(4);
  });

  it('B6: hasLeadCast false → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasLeadCast: false });
    const b6 = result.criteria.find((c) => c.id === 'B6')!;
    expect(b6.score).toBe(0);
  });

  it('B7: supportingCastCount capped at 3pts', () => {
    expect(scoreProposed({ ...BASE_INPUTS, supportingCastCount: 0 }).criteria.find((c) => c.id === 'B7')!.score).toBe(0);
    expect(scoreProposed({ ...BASE_INPUTS, supportingCastCount: 2 }).criteria.find((c) => c.id === 'B7')!.score).toBe(2);
    expect(scoreProposed({ ...BASE_INPUTS, supportingCastCount: 3 }).criteria.find((c) => c.id === 'B7')!.score).toBe(3);
    expect(scoreProposed({ ...BASE_INPUTS, supportingCastCount: 5 }).criteria.find((c) => c.id === 'B7')!.score).toBe(3);
  });

  it('B8: castingLevel director → 2pts, associate → 1pt, none → 0', () => {
    expect(scoreProposed({ ...BASE_INPUTS, castingLevel: 'director' }).criteria.find((c) => c.id === 'B8')!.score).toBe(2);
    expect(scoreProposed({ ...BASE_INPUTS, castingLevel: 'associate' }).criteria.find((c) => c.id === 'B8')!.score).toBe(1);
    expect(scoreProposed({ ...BASE_INPUTS, castingLevel: 'none' }).criteria.find((c) => c.id === 'B8')!.score).toBe(0);
  });

  it('Section B maxPoints = 32', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionB = result.sections.find((s) => s.id === 'B')!;
    expect(sectionB.maxPoints).toBe(32);
  });
});

// ── Section C: Skills & Talent Development ────────────────────────────────────

describe('scoreProposed — Section C: Skills and Talent Development', () => {
  it('C1: hasIndustrySeminars true → 1pt', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasIndustrySeminars: true });
    const c1 = result.criteria.find((c) => c.id === 'C1')!;
    expect(c1.score).toBe(1);
    expect(c1.maxScore).toBe(1);
  });

  it('C1: hasIndustrySeminars false → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasIndustrySeminars: false });
    const c1 = result.criteria.find((c) => c.id === 'C1')!;
    expect(c1.score).toBe(0);
  });

  it('C2: hasEdSeminars true → 1pt', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasEdSeminars: true });
    const c2 = result.criteria.find((c) => c.id === 'C2')!;
    expect(c2.score).toBe(1);
    expect(c2.maxScore).toBe(1);
  });

  it('C2: hasEdSeminars false → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasEdSeminars: false });
    const c2 = result.criteria.find((c) => c.id === 'C2')!;
    expect(c2.score).toBe(0);
  });

  it('C3 attachments: threshold 2 for QNZPE <= $100m', () => {
    const inputs = { ...BASE_INPUTS, qnzpe: 60_000_000 };
    expect(scoreProposed({ ...inputs, attachmentCount: 2 }).criteria.find((c) => c.id === 'C3')!.score).toBe(2);
    expect(scoreProposed({ ...inputs, attachmentCount: 1 }).criteria.find((c) => c.id === 'C3')!.score).toBe(0);
  });

  it('C3 attachments: threshold 4 for QNZPE > $100m', () => {
    const inputs = { ...BASE_INPUTS, qnzpe: 150_000_000 };
    expect(scoreProposed({ ...inputs, attachmentCount: 4 }).criteria.find((c) => c.id === 'C3')!.score).toBe(2);
    expect(scoreProposed({ ...inputs, attachmentCount: 3 }).criteria.find((c) => c.id === 'C3')!.score).toBe(0);
  });

  it('C3 maxScore = 2', () => {
    const result = scoreProposed(BASE_INPUTS);
    const c3 = result.criteria.find((c) => c.id === 'C3')!;
    expect(c3.maxScore).toBe(2);
  });

  it('C4 internships: threshold 2 for QNZPE <= $100m, awards 2pts', () => {
    const inputs = { ...BASE_INPUTS, qnzpe: 60_000_000 };
    expect(scoreProposed({ ...inputs, internshipCount: 2 }).criteria.find((c) => c.id === 'C4')!.score).toBe(2);
    expect(scoreProposed({ ...inputs, internshipCount: 1 }).criteria.find((c) => c.id === 'C4')!.score).toBe(0);
  });

  it('C4 internships: threshold 4 for QNZPE > $100m, awards 2pts', () => {
    const inputs = { ...BASE_INPUTS, qnzpe: 150_000_000 };
    expect(scoreProposed({ ...inputs, internshipCount: 4 }).criteria.find((c) => c.id === 'C4')!.score).toBe(2);
    expect(scoreProposed({ ...inputs, internshipCount: 3 }).criteria.find((c) => c.id === 'C4')!.score).toBe(0);
  });

  it('C4 maxScore = 2', () => {
    const result = scoreProposed(BASE_INPUTS);
    const c4 = result.criteria.find((c) => c.id === 'C4')!;
    expect(c4.maxScore).toBe(2);
  });

  it('Section C maxPoints = 6', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionC = result.sections.find((s) => s.id === 'C')!;
    expect(sectionC.maxPoints).toBe(6);
  });
});

// ── Section D: Marketing ──────────────────────────────────────────────────────

describe('scoreProposed — Section D: Marketing, Promoting, and Showcasing NZ', () => {
  it('D1: hasNZPremiere true → 2pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasNZPremiere: true, hasIntlPromotion: false });
    const d1 = result.criteria.find((c) => c.id === 'D1')!;
    expect(d1.score).toBe(2);
  });

  it('D1: hasIntlPromotion true → 2pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasNZPremiere: false, hasIntlPromotion: true });
    const d1 = result.criteria.find((c) => c.id === 'D1')!;
    expect(d1.score).toBe(2);
  });

  it('D1: both hasNZPremiere and hasIntlPromotion true → 4pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasNZPremiere: true, hasIntlPromotion: true });
    const d1 = result.criteria.find((c) => c.id === 'D1')!;
    expect(d1.score).toBe(4);
    expect(d1.maxScore).toBe(4);
  });

  it('D1: neither → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasNZPremiere: false, hasIntlPromotion: false });
    const d1 = result.criteria.find((c) => c.id === 'D1')!;
    expect(d1.score).toBe(0);
  });

  it('D2: hasFilmMarketing true → 3pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasFilmMarketing: true });
    const d2 = result.criteria.find((c) => c.id === 'D2')!;
    expect(d2.score).toBe(3);
    expect(d2.maxScore).toBe(3);
  });

  it('D2: hasFilmMarketing false → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasFilmMarketing: false });
    const d2 = result.criteria.find((c) => c.id === 'D2')!;
    expect(d2.score).toBe(0);
  });

  it('D3: hasLocationAnnouncement true → 1pt', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasLocationAnnouncement: true });
    const d3 = result.criteria.find((c) => c.id === 'D3')!;
    expect(d3.score).toBe(1);
    expect(d3.maxScore).toBe(1);
  });

  it('D3: hasLocationAnnouncement false → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasLocationAnnouncement: false });
    const d3 = result.criteria.find((c) => c.id === 'D3')!;
    expect(d3.score).toBe(0);
  });

  it('D4: hasTourismPartnership true → 4pts (not 3pts like existing)', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasTourismPartnership: true });
    const d4 = result.criteria.find((c) => c.id === 'D4')!;
    expect(d4.score).toBe(4);
    expect(d4.maxScore).toBe(4);
  });

  it('D4: hasTourismPartnership false → 0pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, hasTourismPartnership: false });
    const d4 = result.criteria.find((c) => c.id === 'D4')!;
    expect(d4.score).toBe(0);
  });

  it('Section D maxPoints = 12', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionD = result.sections.find((s) => s.id === 'D')!;
    expect(sectionD.maxPoints).toBe(12);
  });
});

// ── B5 half-point arithmetic specific tests ────────────────────────────────────

describe('scoreProposed — B5 half-point arithmetic', () => {
  it('1 person → 0.5pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, btlAdditionalCount: 1 });
    expect(result.criteria.find((c) => c.id === 'B5')!.score).toBe(0.5);
  });

  it('3 persons → 1.5pts', () => {
    const result = scoreProposed({ ...BASE_INPUTS, btlAdditionalCount: 3 });
    expect(result.criteria.find((c) => c.id === 'B5')!.score).toBe(1.5);
  });

  it('8 persons → 4pts (capped)', () => {
    const result = scoreProposed({ ...BASE_INPUTS, btlAdditionalCount: 8 });
    expect(result.criteria.find((c) => c.id === 'B5')!.score).toBe(4);
  });

  it('9 persons → 4pts (still capped)', () => {
    const result = scoreProposed({ ...BASE_INPUTS, btlAdditionalCount: 9 });
    expect(result.criteria.find((c) => c.id === 'B5')!.score).toBe(4);
  });
});

// ── Section max points verification ──────────────────────────────────────────

describe('scoreProposed — maximum points achievable', () => {
  const MAX_INPUTS: ProjectInputs = {
    projectName: 'Max Score Production',
    qnzpe: 200_000_000,

    // Existing-only
    hasSustainabilityPlan: true,
    hasSustainabilityOfficer: true,
    hasCarbonReview: true,
    hasStudioLease: true,
    maoriCrewPercent: 15,
    hasLeadCastMaori: true,
    hasMasterclass: true,
    hasKnowledgeTransfer: true,
    commercialAgreementPercent: 2,
    infrastructureInvestment: 3_000_000,
    premiereType: 'world',
    hasTourismMarketing: true,

    // Section A: max all
    hasPreviousQNZPE: true,
    hasAssociatedContent: true,
    shootingNZPercent: 95,
    regionalPercent: 30,
    picturePostPercent: 80,
    soundPostPercent: 80,
    vfxPercent: 80,
    conceptPhysicalPercent: 80,

    // Section B: max all
    castPercent: 90,
    crewPercent: 90,
    atlCount: 3,
    btlKeyCount: 4,
    btlAdditionalCount: 8,
    hasLeadCast: true,
    supportingCastCount: 3,
    castingLevel: 'director',

    // Section C: max all
    hasIndustrySeminars: true,
    hasEdSeminars: true,
    attachmentCount: 5,
    internshipCount: 5,

    // Section D: max all
    hasNZPremiere: true,
    hasIntlPromotion: true,
    hasFilmMarketing: true,
    hasLocationAnnouncement: true,
    hasTourismPartnership: true,
  };

  it('Section A achieves maxPoints = 20', () => {
    const result = scoreProposed(MAX_INPUTS);
    const sectionA = result.sections.find((s) => s.id === 'A')!;
    expect(sectionA.totalPoints).toBe(20);
  });

  it('Section B achieves maxPoints = 32', () => {
    const result = scoreProposed(MAX_INPUTS);
    const sectionB = result.sections.find((s) => s.id === 'B')!;
    expect(sectionB.totalPoints).toBe(32);
  });

  it('Section C achieves maxPoints = 6', () => {
    const result = scoreProposed(MAX_INPUTS);
    const sectionC = result.sections.find((s) => s.id === 'C')!;
    expect(sectionC.totalPoints).toBe(6);
  });

  it('Section D achieves maxPoints = 12', () => {
    const result = scoreProposed(MAX_INPUTS);
    const sectionD = result.sections.find((s) => s.id === 'D')!;
    expect(sectionD.totalPoints).toBe(12);
  });

  it('total achieves maxPoints = 70', () => {
    const result = scoreProposed(MAX_INPUTS);
    expect(result.totalPoints).toBe(70);
  });
});

// ── Existing-only criteria do NOT appear ──────────────────────────────────────

describe('scoreProposed — existing-only criteria excluded', () => {
  const EXISTING_ONLY_IDS = [
    // Existing A section
    'A1', // Sustainability Plan (existing)
    'A2', // Sustainability Officer (existing)
    'A3', // Carbon Review (existing)
    // These criterion IDs from existing system should NOT appear in proposed
    // (proposed uses its own A1-A8, B1-B8, C1-C4, D1-D4 labeling)
  ];

  it('no criterion has mandatory: true (no mandatory in proposed)', () => {
    const result = scoreProposed(BASE_INPUTS);
    const mandatoryCriteria = result.criteria.filter((c) => c.mandatory === true);
    expect(mandatoryCriteria).toHaveLength(0);
  });

  it('proposed result has exactly 22 criteria (A:8, B:8, C:4, D:4)', () => {
    const result = scoreProposed(BASE_INPUTS);
    expect(result.criteria).toHaveLength(22);
  });

  it('section A has 8 criteria (A1-A8)', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionA = result.sections.find((s) => s.id === 'A')!;
    expect(sectionA.criteria).toHaveLength(8);
    expect(sectionA.criteria.map((c) => c.id)).toEqual(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']);
  });

  it('section B has 8 criteria (B1-B8)', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionB = result.sections.find((s) => s.id === 'B')!;
    expect(sectionB.criteria).toHaveLength(8);
    expect(sectionB.criteria.map((c) => c.id)).toEqual(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']);
  });

  it('section C has 4 criteria (C1-C4)', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionC = result.sections.find((s) => s.id === 'C')!;
    expect(sectionC.criteria).toHaveLength(4);
    expect(sectionC.criteria.map((c) => c.id)).toEqual(['C1', 'C2', 'C3', 'C4']);
  });

  it('section D has 4 criteria (D1-D4)', () => {
    const result = scoreProposed(BASE_INPUTS);
    const sectionD = result.sections.find((s) => s.id === 'D')!;
    expect(sectionD.criteria).toHaveLength(4);
    expect(sectionD.criteria.map((c) => c.id)).toEqual(['D1', 'D2', 'D3', 'D4']);
  });
});
