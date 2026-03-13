import { describe, it, expect } from 'vitest';
import { scoreExisting } from '../scoreExisting';
import type { ProjectInputs } from '../types';

// ── Shared baseline inputs ─────────────────────────────────────────────────────
// This is the "known passer" from SCORING_SPEC.md Example 1 (40pts, passes)
const passerInputs: ProjectInputs = {
  projectName: 'Test Production',
  qnzpe: 60_000_000,
  // Section A
  hasSustainabilityPlan: true,
  hasSustainabilityOfficer: true,
  hasCarbonReview: false,
  // Section B
  hasStudioLease: false,
  hasPreviousQNZPE: false,
  hasAssociatedContent: false,
  shootingNZPercent: 85,
  regionalPercent: 30,
  picturePostPercent: 60,
  soundPostPercent: 40,
  vfxPercent: 20,
  conceptPhysicalPercent: 0,
  // Section C
  castPercent: 85,
  crewPercent: 90,
  maoriCrewPercent: 5,
  atlCount: 2,
  btlKeyCount: 3,
  btlAdditionalCount: 2,
  hasLeadCast: true,
  supportingCastCount: 2,
  castingLevel: 'associate',
  hasLeadCastMaori: false,
  // Section D
  hasMasterclass: true,
  hasIndustrySeminars: false,
  hasEdSeminars: true,
  attachmentCount: 2,
  internshipCount: 5,
  // Section E
  hasKnowledgeTransfer: false,
  commercialAgreementPercent: 0,
  infrastructureInvestment: 0,
  // Section F
  premiereType: 'nz',
  hasNZPremiere: false,
  hasIntlPromotion: false,
  hasFilmMarketing: true,
  hasTourismMarketing: false,
  hasTourismPartnership: false,
  hasLocationAnnouncement: false,
};

// The "known failer" from SCORING_SPEC.md Example 2 (all same, but sustainability all false)
const failerInputs: ProjectInputs = {
  ...passerInputs,
  hasSustainabilityPlan: false,
  hasSustainabilityOfficer: false,
  hasCarbonReview: false,
};

// ── Top-level shape ────────────────────────────────────────────────────────────
describe('scoreExisting — result shape', () => {
  it('returns maxPoints = 85', () => {
    const result = scoreExisting(passerInputs);
    expect(result.maxPoints).toBe(85);
  });

  it('returns passThreshold = 40', () => {
    const result = scoreExisting(passerInputs);
    expect(result.passThreshold).toBe(40);
  });

  it('returns sections array with 6 sections (A-F)', () => {
    const result = scoreExisting(passerInputs);
    expect(result.sections).toHaveLength(6);
    const ids = result.sections.map(s => s.id);
    expect(ids).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('returns flat criteria list with 33 criteria (A:3 + B:9 + C:10 + D:4 + E:3 + F:4)', () => {
    const result = scoreExisting(passerInputs);
    expect(result.criteria).toHaveLength(33);
  });

  it('every criterion has id, label, score (number), and maxScore (number)', () => {
    const result = scoreExisting(passerInputs);
    for (const c of result.criteria) {
      expect(typeof c.id).toBe('string');
      expect(c.id.length).toBeGreaterThan(0);
      expect(typeof c.label).toBe('string');
      expect(c.label.length).toBeGreaterThan(0);
      // existing engine: no N/A criteria (all 30 criteria are scored)
      expect(typeof c.score).toBe('number');
      expect(typeof c.maxScore).toBe('number');
    }
  });

  it('flat criteria list matches all criteria across all sections', () => {
    const result = scoreExisting(passerInputs);
    const fromSections = result.sections.flatMap(s => s.criteria);
    expect(result.criteria).toHaveLength(fromSections.length);
  });
});

// ── A1 mandatory criterion ─────────────────────────────────────────────────────
describe('scoreExisting — A1 mandatory criterion', () => {
  it('A1 has mandatory: true', () => {
    const result = scoreExisting(passerInputs);
    const a1 = result.criteria.find(c => c.id === 'A1');
    expect(a1?.mandatory).toBe(true);
  });

  it('A1 mandatoryMet is true when hasSustainabilityPlan = true', () => {
    const result = scoreExisting(passerInputs);
    const a1 = result.criteria.find(c => c.id === 'A1');
    expect(a1?.mandatoryMet).toBe(true);
  });

  it('A1 mandatoryMet is false when hasSustainabilityPlan = false', () => {
    const result = scoreExisting(failerInputs);
    const a1 = result.criteria.find(c => c.id === 'A1');
    expect(a1?.mandatoryMet).toBe(false);
  });

  it('A1 score is 3 when hasSustainabilityPlan = true', () => {
    const result = scoreExisting(passerInputs);
    const a1 = result.criteria.find(c => c.id === 'A1');
    expect(a1?.score).toBe(3);
  });

  it('A1 score is 0 when hasSustainabilityPlan = false', () => {
    const result = scoreExisting(failerInputs);
    const a1 = result.criteria.find(c => c.id === 'A1');
    expect(a1?.score).toBe(0);
  });

  it('A1 maxScore is 3', () => {
    const result = scoreExisting(passerInputs);
    const a1 = result.criteria.find(c => c.id === 'A1');
    expect(a1?.maxScore).toBe(3);
  });
});

// ── Pass/fail logic ────────────────────────────────────────────────────────────
describe('scoreExisting — pass/fail logic', () => {
  it('returns passed: true when total >= 40 AND A1 met (known passer = 40pts)', () => {
    const result = scoreExisting(passerInputs);
    expect(result.totalPoints).toBe(40);
    expect(result.mandatoryMet).toBe(true);
    expect(result.passed).toBe(true);
  });

  it('returns passed: false when A1 NOT met, even if total would be >= 40', () => {
    // Create a high-scoring production that fails A1
    const highScoreNoA1: ProjectInputs = {
      ...passerInputs,
      hasSustainabilityPlan: false,
      // Add more scoring to compensate
      hasSustainabilityOfficer: true, // A2: 2pts
      hasCarbonReview: true,          // A3: 2pts
      // Total should still be >= 40 without A1's 3pts
      atlCount: 3,  // bumps C4 to max 9pts (was 2 → 6pts)
    };
    const result = scoreExisting(highScoreNoA1);
    expect(result.mandatoryMet).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('returns passed: false when total < 40 even if A1 met', () => {
    const lowScore: ProjectInputs = {
      ...passerInputs,
      // Remove enough scoring to drop below 40
      hasMasterclass: false,       // -2pts from D
      hasEdSeminars: false,        // -1pt from D
      attachmentCount: 0,          // -2pts from D3
      hasFilmMarketing: false,     // -3pts from F
      castPercent: 70,             // -2pts from C1 (below 80%)
    };
    const result = scoreExisting(lowScore);
    expect(result.mandatoryMet).toBe(true);
    expect(result.totalPoints).toBeLessThan(40);
    expect(result.passed).toBe(false);
  });

  it('mandatoryMet in result reflects A1 criterion', () => {
    const passerResult = scoreExisting(passerInputs);
    const failerResult = scoreExisting(failerInputs);
    expect(passerResult.mandatoryMet).toBe(true);
    expect(failerResult.mandatoryMet).toBe(false);
  });
});

// ── Section A: Sustainability (7pts max) ──────────────────────────────────────
describe('scoreExisting — Section A: Sustainability', () => {
  it('section A maxPoints = 7', () => {
    const result = scoreExisting(passerInputs);
    const secA = result.sections.find(s => s.id === 'A');
    expect(secA?.maxPoints).toBe(7);
  });

  it('section A totals 7 when all criteria met (maxed)', () => {
    const maxA: ProjectInputs = {
      ...passerInputs,
      hasSustainabilityPlan: true,
      hasSustainabilityOfficer: true,
      hasCarbonReview: true,
    };
    const result = scoreExisting(maxA);
    const secA = result.sections.find(s => s.id === 'A');
    expect(secA?.totalPoints).toBe(7);
  });

  it('A2 scores 2pts when hasSustainabilityOfficer = true', () => {
    const result = scoreExisting(passerInputs);
    const a2 = result.criteria.find(c => c.id === 'A2');
    expect(a2?.score).toBe(2);
  });

  it('A3 scores 2pts when hasCarbonReview = true', () => {
    const result = scoreExisting({ ...passerInputs, hasCarbonReview: true });
    const a3 = result.criteria.find(c => c.id === 'A3');
    expect(a3?.score).toBe(2);
  });

  it('A3 scores 0 when hasCarbonReview = false', () => {
    const result = scoreExisting(passerInputs); // hasCarbonReview = false
    const a3 = result.criteria.find(c => c.id === 'A3');
    expect(a3?.score).toBe(0);
  });
});

// ── Section B: NZ Production Activity (21pts max) ─────────────────────────────
describe('scoreExisting — Section B: NZ Production Activity', () => {
  it('section B maxPoints = 21', () => {
    const result = scoreExisting(passerInputs);
    const secB = result.sections.find(s => s.id === 'B');
    expect(secB?.maxPoints).toBe(21);
  });

  it('section B totals 21 when all criteria maxed', () => {
    const maxB: ProjectInputs = {
      ...passerInputs,
      hasStudioLease: true,
      hasPreviousQNZPE: true,
      hasAssociatedContent: true,
      shootingNZPercent: 90,
      regionalPercent: 25,
      picturePostPercent: 75,
      soundPostPercent: 75,
      vfxPercent: 90,
      conceptPhysicalPercent: 90,
    };
    const result = scoreExisting(maxB);
    const secB = result.sections.find(s => s.id === 'B');
    expect(secB?.totalPoints).toBe(21);
  });

  it('B1 scores 2pts when hasStudioLease = true', () => {
    const result = scoreExisting({ ...passerInputs, hasStudioLease: true });
    const b1 = result.criteria.find(c => c.id === 'B1');
    expect(b1?.score).toBe(2);
  });

  it('B1 scores 0 when hasStudioLease = false', () => {
    const result = scoreExisting(passerInputs); // hasStudioLease = false
    const b1 = result.criteria.find(c => c.id === 'B1');
    expect(b1?.score).toBe(0);
  });

  it('B2 scores 2pts when hasPreviousQNZPE = true', () => {
    const result = scoreExisting({ ...passerInputs, hasPreviousQNZPE: true });
    const b2 = result.criteria.find(c => c.id === 'B2');
    expect(b2?.score).toBe(2);
  });

  it('B3 scores 1pt when hasAssociatedContent = true', () => {
    const result = scoreExisting({ ...passerInputs, hasAssociatedContent: true });
    const b3 = result.criteria.find(c => c.id === 'B3');
    expect(b3?.score).toBe(1);
  });

  // B4: shootingNZPercent tiered [[90,2],[75,1]]
  it('B4 scores 2pts when shootingNZPercent >= 90', () => {
    const result = scoreExisting({ ...passerInputs, shootingNZPercent: 90 });
    const b4 = result.criteria.find(c => c.id === 'B4');
    expect(b4?.score).toBe(2);
  });

  it('B4 scores 1pt when shootingNZPercent >= 75 and < 90 (spec example: 85%)', () => {
    const result = scoreExisting(passerInputs); // shootingNZPercent = 85
    const b4 = result.criteria.find(c => c.id === 'B4');
    expect(b4?.score).toBe(1);
  });

  it('B4 scores 0 when shootingNZPercent < 75', () => {
    const result = scoreExisting({ ...passerInputs, shootingNZPercent: 74 });
    const b4 = result.criteria.find(c => c.id === 'B4');
    expect(b4?.score).toBe(0);
  });

  // B5: regional flat threshold 25%
  it('B5 scores 2pts when regionalPercent >= 25', () => {
    const result = scoreExisting(passerInputs); // regionalPercent = 30
    const b5 = result.criteria.find(c => c.id === 'B5');
    expect(b5?.score).toBe(2);
  });

  it('B5 scores 0 when regionalPercent < 25', () => {
    const result = scoreExisting({ ...passerInputs, regionalPercent: 24 });
    const b5 = result.criteria.find(c => c.id === 'B5');
    expect(b5?.score).toBe(0);
  });

  // B6: picture post tiered [[75,3],[50,2],[30,1]]
  it('B6 scores 3pts when picturePostPercent >= 75', () => {
    const result = scoreExisting({ ...passerInputs, picturePostPercent: 75 });
    const b6 = result.criteria.find(c => c.id === 'B6');
    expect(b6?.score).toBe(3);
  });

  it('B6 scores 2pts when picturePostPercent >= 50 and < 75 (spec example: 60%)', () => {
    const result = scoreExisting(passerInputs); // picturePostPercent = 60
    const b6 = result.criteria.find(c => c.id === 'B6');
    expect(b6?.score).toBe(2);
  });

  it('B6 scores 1pt when picturePostPercent >= 30 and < 50', () => {
    const result = scoreExisting({ ...passerInputs, picturePostPercent: 30 });
    const b6 = result.criteria.find(c => c.id === 'B6');
    expect(b6?.score).toBe(1);
  });

  it('B6 scores 0 when picturePostPercent < 30', () => {
    const result = scoreExisting({ ...passerInputs, picturePostPercent: 29 });
    const b6 = result.criteria.find(c => c.id === 'B6');
    expect(b6?.score).toBe(0);
  });

  // B7: sound post tiered [[75,3],[50,2],[30,1]]
  it('B7 scores 1pt when soundPostPercent >= 30 and < 50 (spec example: 40%)', () => {
    const result = scoreExisting(passerInputs); // soundPostPercent = 40
    const b7 = result.criteria.find(c => c.id === 'B7');
    expect(b7?.score).toBe(1);
  });

  // B8: VFX tiered [[90,3],[75,2],[50,1]]
  it('B8 scores 0 when vfxPercent < 50 (spec example: 20%)', () => {
    const result = scoreExisting(passerInputs); // vfxPercent = 20
    const b8 = result.criteria.find(c => c.id === 'B8');
    expect(b8?.score).toBe(0);
  });

  it('B8 scores 3pts when vfxPercent >= 90', () => {
    const result = scoreExisting({ ...passerInputs, vfxPercent: 90 });
    const b8 = result.criteria.find(c => c.id === 'B8');
    expect(b8?.score).toBe(3);
  });

  // B9: concept/physical tiered [[90,3],[75,2],[50,1]]
  it('B9 scores 0 when conceptPhysicalPercent < 50 (spec example: 0%)', () => {
    const result = scoreExisting(passerInputs); // conceptPhysicalPercent = 0
    const b9 = result.criteria.find(c => c.id === 'B9');
    expect(b9?.score).toBe(0);
  });
});

// ── Section C: NZ Personnel (31pts max) ───────────────────────────────────────
describe('scoreExisting — Section C: NZ Personnel', () => {
  it('section C maxPoints = 31', () => {
    const result = scoreExisting(passerInputs);
    const secC = result.sections.find(s => s.id === 'C');
    expect(secC?.maxPoints).toBe(31);
  });

  it('section C totals 31 when all criteria maxed', () => {
    const maxC: ProjectInputs = {
      ...passerInputs,
      castPercent: 80,
      crewPercent: 80,
      maoriCrewPercent: 10,
      atlCount: 3,
      btlKeyCount: 4,
      btlAdditionalCount: 8, // 8 × 0.5 = 4pts (cap)
      hasLeadCast: true,
      supportingCastCount: 3,
      castingLevel: 'director',
      hasLeadCastMaori: true,
    };
    const result = scoreExisting(maxC);
    const secC = result.sections.find(s => s.id === 'C');
    expect(secC?.totalPoints).toBe(31);
  });

  // C1: cast 80% flat threshold
  it('C1 scores 2pts when castPercent >= 80 (spec example: 85%)', () => {
    const result = scoreExisting(passerInputs); // castPercent = 85
    const c1 = result.criteria.find(c => c.id === 'C1');
    expect(c1?.score).toBe(2);
  });

  it('C1 scores 0 when castPercent < 80', () => {
    const result = scoreExisting({ ...passerInputs, castPercent: 79 });
    const c1 = result.criteria.find(c => c.id === 'C1');
    expect(c1?.score).toBe(0);
  });

  // C2: crew 80% flat threshold (1pt)
  it('C2 scores 1pt when crewPercent >= 80 (spec example: 90%)', () => {
    const result = scoreExisting(passerInputs); // crewPercent = 90
    const c2 = result.criteria.find(c => c.id === 'C2');
    expect(c2?.score).toBe(1);
  });

  it('C2 scores 0 when crewPercent < 80', () => {
    const result = scoreExisting({ ...passerInputs, crewPercent: 79 });
    const c2 = result.criteria.find(c => c.id === 'C2');
    expect(c2?.score).toBe(0);
  });

  // C3: Māori crew 10% flat threshold
  it('C3 scores 1pt when maoriCrewPercent >= 10', () => {
    const result = scoreExisting({ ...passerInputs, maoriCrewPercent: 10 });
    const c3 = result.criteria.find(c => c.id === 'C3');
    expect(c3?.score).toBe(1);
  });

  it('C3 scores 0 when maoriCrewPercent < 10 (spec example: 5%)', () => {
    const result = scoreExisting(passerInputs); // maoriCrewPercent = 5
    const c3 = result.criteria.find(c => c.id === 'C3');
    expect(c3?.score).toBe(0);
  });

  // C4: ATL crew count × 3pts, cap 9
  it('C4 scores 6pts when atlCount = 2 (spec example)', () => {
    const result = scoreExisting(passerInputs); // atlCount = 2
    const c4 = result.criteria.find(c => c.id === 'C4');
    expect(c4?.score).toBe(6);
  });

  it('C4 scores 9pts when atlCount = 3', () => {
    const result = scoreExisting({ ...passerInputs, atlCount: 3 });
    const c4 = result.criteria.find(c => c.id === 'C4');
    expect(c4?.score).toBe(9);
  });

  it('C4 scores 9pts when atlCount > 3 (capped)', () => {
    const result = scoreExisting({ ...passerInputs, atlCount: 5 });
    const c4 = result.criteria.find(c => c.id === 'C4');
    expect(c4?.score).toBe(9);
  });

  // C5: BTL key crew count × 1pt, cap 4
  it('C5 scores 3pts when btlKeyCount = 3 (spec example)', () => {
    const result = scoreExisting(passerInputs); // btlKeyCount = 3
    const c5 = result.criteria.find(c => c.id === 'C5');
    expect(c5?.score).toBe(3);
  });

  it('C5 scores 4pts when btlKeyCount >= 4 (capped)', () => {
    const result = scoreExisting({ ...passerInputs, btlKeyCount: 7 });
    const c5 = result.criteria.find(c => c.id === 'C5');
    expect(c5?.score).toBe(4);
  });

  // C6: BTL additional crew count × 0.5pts, cap 4
  it('C6 scores 1pt when btlAdditionalCount = 2 (spec example: 2 × 0.5 = 1)', () => {
    const result = scoreExisting(passerInputs); // btlAdditionalCount = 2
    const c6 = result.criteria.find(c => c.id === 'C6');
    expect(c6?.score).toBe(1);
  });

  it('C6 scores 4pts when btlAdditionalCount >= 8 (cap)', () => {
    const result = scoreExisting({ ...passerInputs, btlAdditionalCount: 8 });
    const c6 = result.criteria.find(c => c.id === 'C6');
    expect(c6?.score).toBe(4);
  });

  it('C6 scores 4pts when btlAdditionalCount > 8 (over cap)', () => {
    const result = scoreExisting({ ...passerInputs, btlAdditionalCount: 12 });
    const c6 = result.criteria.find(c => c.id === 'C6');
    expect(c6?.score).toBe(4);
  });

  // C7: Lead cast binary 3pts
  it('C7 scores 3pts when hasLeadCast = true', () => {
    const result = scoreExisting(passerInputs); // hasLeadCast = true
    const c7 = result.criteria.find(c => c.id === 'C7');
    expect(c7?.score).toBe(3);
  });

  it('C7 scores 0 when hasLeadCast = false', () => {
    const result = scoreExisting({ ...passerInputs, hasLeadCast: false });
    const c7 = result.criteria.find(c => c.id === 'C7');
    expect(c7?.score).toBe(0);
  });

  // C8: supporting cast count × 1pt, cap 3
  it('C8 scores 2pts when supportingCastCount = 2 (spec example)', () => {
    const result = scoreExisting(passerInputs); // supportingCastCount = 2
    const c8 = result.criteria.find(c => c.id === 'C8');
    expect(c8?.score).toBe(2);
  });

  it('C8 scores 3pts when supportingCastCount >= 3 (capped)', () => {
    const result = scoreExisting({ ...passerInputs, supportingCastCount: 5 });
    const c8 = result.criteria.find(c => c.id === 'C8');
    expect(c8?.score).toBe(3);
  });

  // C9: casting selector
  it('C9 scores 1pt when castingLevel = associate (spec example)', () => {
    const result = scoreExisting(passerInputs); // castingLevel = 'associate'
    const c9 = result.criteria.find(c => c.id === 'C9');
    expect(c9?.score).toBe(1);
  });

  it('C9 scores 2pts when castingLevel = director', () => {
    const result = scoreExisting({ ...passerInputs, castingLevel: 'director' });
    const c9 = result.criteria.find(c => c.id === 'C9');
    expect(c9?.score).toBe(2);
  });

  it('C9 scores 0 when castingLevel = none', () => {
    const result = scoreExisting({ ...passerInputs, castingLevel: 'none' });
    const c9 = result.criteria.find(c => c.id === 'C9');
    expect(c9?.score).toBe(0);
  });

  // C10: Lead cast/ATL Māori
  it('C10 scores 2pts when hasLeadCastMaori = true', () => {
    const result = scoreExisting({ ...passerInputs, hasLeadCastMaori: true });
    const c10 = result.criteria.find(c => c.id === 'C10');
    expect(c10?.score).toBe(2);
  });

  it('C10 scores 0 when hasLeadCastMaori = false (spec example)', () => {
    const result = scoreExisting(passerInputs); // hasLeadCastMaori = false
    const c10 = result.criteria.find(c => c.id === 'C10');
    expect(c10?.score).toBe(0);
  });
});

// ── Section D: Skills and Talent Development (6pts max) ───────────────────────
describe('scoreExisting — Section D: Skills and Talent Development', () => {
  it('section D maxPoints = 6', () => {
    const result = scoreExisting(passerInputs);
    const secD = result.sections.find(s => s.id === 'D');
    expect(secD?.maxPoints).toBe(6);
  });

  it('section D totals 6 when all criteria met', () => {
    const maxD: ProjectInputs = {
      ...passerInputs,
      qnzpe: 60_000_000, // ≤ $100m
      hasMasterclass: true,
      hasEdSeminars: true,
      attachmentCount: 2, // meets under100m threshold of 2
      internshipCount: 8, // meets under150m threshold of 8
    };
    const result = scoreExisting(maxD);
    const secD = result.sections.find(s => s.id === 'D');
    expect(secD?.totalPoints).toBe(6);
  });

  // D1: Masterclass
  it('D1 scores 2pts when hasMasterclass = true', () => {
    const result = scoreExisting(passerInputs); // hasMasterclass = true
    const d1 = result.criteria.find(c => c.id === 'D1');
    expect(d1?.score).toBe(2);
  });

  it('D1 scores 0 when hasMasterclass = false', () => {
    const result = scoreExisting({ ...passerInputs, hasMasterclass: false });
    const d1 = result.criteria.find(c => c.id === 'D1');
    expect(d1?.score).toBe(0);
  });

  // D2: Educational seminars
  it('D2 scores 1pt when hasEdSeminars = true', () => {
    const result = scoreExisting(passerInputs); // hasEdSeminars = true
    const d2 = result.criteria.find(c => c.id === 'D2');
    expect(d2?.score).toBe(1);
  });

  it('D2 scores 0 when hasEdSeminars = false', () => {
    const result = scoreExisting({ ...passerInputs, hasEdSeminars: false });
    const d2 = result.criteria.find(c => c.id === 'D2');
    expect(d2?.score).toBe(0);
  });

  // D3: Attachments — binary threshold based on QNZPE
  it('D3 scores 2pts when attachmentCount meets threshold (qnzpe ≤ $100m, threshold=2, count=2)', () => {
    const result = scoreExisting(passerInputs); // qnzpe=60m, attachmentCount=2
    const d3 = result.criteria.find(c => c.id === 'D3');
    expect(d3?.score).toBe(2);
  });

  it('D3 scores 0 when attachmentCount below threshold', () => {
    const result = scoreExisting({ ...passerInputs, attachmentCount: 1 }); // qnzpe=60m, need 2
    const d3 = result.criteria.find(c => c.id === 'D3');
    expect(d3?.score).toBe(0);
  });

  it('D3 uses threshold=4 when qnzpe > $100m', () => {
    const bigBudget = { ...passerInputs, qnzpe: 150_000_000, attachmentCount: 3 };
    const result = scoreExisting(bigBudget); // need 4, has 3 → 0
    const d3 = result.criteria.find(c => c.id === 'D3');
    expect(d3?.score).toBe(0);
  });

  it('D3 scores 2pts when qnzpe > $100m and attachmentCount >= 4', () => {
    const bigBudget = { ...passerInputs, qnzpe: 150_000_000, attachmentCount: 4 };
    const result = scoreExisting(bigBudget);
    const d3 = result.criteria.find(c => c.id === 'D3');
    expect(d3?.score).toBe(2);
  });

  // D4: Internships — tiered thresholds: under50m=4, under150m=8, over150m=10
  it('D4 scores 0 when internshipCount below threshold for qnzpe band (spec example: 5 < 8 for $60m)', () => {
    const result = scoreExisting(passerInputs); // qnzpe=60m (>50m, ≤150m → threshold=8), internshipCount=5
    const d4 = result.criteria.find(c => c.id === 'D4');
    expect(d4?.score).toBe(0);
  });

  it('D4 scores 1pt when qnzpe ≤ $50m and internshipCount >= 4', () => {
    const result = scoreExisting({ ...passerInputs, qnzpe: 50_000_000, internshipCount: 4 });
    const d4 = result.criteria.find(c => c.id === 'D4');
    expect(d4?.score).toBe(1);
  });

  it('D4 scores 0 when qnzpe ≤ $50m and internshipCount < 4', () => {
    const result = scoreExisting({ ...passerInputs, qnzpe: 50_000_000, internshipCount: 3 });
    const d4 = result.criteria.find(c => c.id === 'D4');
    expect(d4?.score).toBe(0);
  });

  it('D4 scores 1pt when qnzpe ≤ $150m and internshipCount >= 8', () => {
    const result = scoreExisting({ ...passerInputs, qnzpe: 100_000_000, internshipCount: 8 });
    const d4 = result.criteria.find(c => c.id === 'D4');
    expect(d4?.score).toBe(1);
  });

  it('D4 scores 1pt when qnzpe > $150m and internshipCount >= 10', () => {
    const result = scoreExisting({ ...passerInputs, qnzpe: 200_000_000, internshipCount: 10 });
    const d4 = result.criteria.find(c => c.id === 'D4');
    expect(d4?.score).toBe(1);
  });
});

// ── Section E: Innovation and Infrastructure (8pts max) ───────────────────────
describe('scoreExisting — Section E: Innovation and Infrastructure', () => {
  it('section E maxPoints = 8', () => {
    const result = scoreExisting(passerInputs);
    const secE = result.sections.find(s => s.id === 'E');
    expect(secE?.maxPoints).toBe(8);
  });

  it('section E totals 8 when all criteria maxed', () => {
    const maxE: ProjectInputs = {
      ...passerInputs,
      hasKnowledgeTransfer: true,
      commercialAgreementPercent: 1, // 1% → 3pts
      infrastructureInvestment: 2_000_000, // $2m → 3pts
    };
    const result = scoreExisting(maxE);
    const secE = result.sections.find(s => s.id === 'E');
    expect(secE?.totalPoints).toBe(8);
  });

  // E1: Knowledge transfer binary
  it('E1 scores 2pts when hasKnowledgeTransfer = true', () => {
    const result = scoreExisting({ ...passerInputs, hasKnowledgeTransfer: true });
    const e1 = result.criteria.find(c => c.id === 'E1');
    expect(e1?.score).toBe(2);
  });

  it('E1 scores 0 when hasKnowledgeTransfer = false (spec example)', () => {
    const result = scoreExisting(passerInputs); // hasKnowledgeTransfer = false
    const e1 = result.criteria.find(c => c.id === 'E1');
    expect(e1?.score).toBe(0);
  });

  // E2: Commercial agreement tiered [[1,3],[0.5,2],[0.25,1]]
  it('E2 scores 3pts when commercialAgreementPercent >= 1', () => {
    const result = scoreExisting({ ...passerInputs, commercialAgreementPercent: 1 });
    const e2 = result.criteria.find(c => c.id === 'E2');
    expect(e2?.score).toBe(3);
  });

  it('E2 scores 2pts when commercialAgreementPercent >= 0.5 and < 1', () => {
    const result = scoreExisting({ ...passerInputs, commercialAgreementPercent: 0.5 });
    const e2 = result.criteria.find(c => c.id === 'E2');
    expect(e2?.score).toBe(2);
  });

  it('E2 scores 1pt when commercialAgreementPercent >= 0.25 and < 0.5', () => {
    const result = scoreExisting({ ...passerInputs, commercialAgreementPercent: 0.25 });
    const e2 = result.criteria.find(c => c.id === 'E2');
    expect(e2?.score).toBe(1);
  });

  it('E2 scores 0 when commercialAgreementPercent < 0.25 (spec example: 0)', () => {
    const result = scoreExisting(passerInputs); // commercialAgreementPercent = 0
    const e2 = result.criteria.find(c => c.id === 'E2');
    expect(e2?.score).toBe(0);
  });

  // E3: Infrastructure investment tiered [[2_000_000,3],[1_000_000,2],[500_000,1]]
  it('E3 scores 3pts when infrastructureInvestment >= $2m', () => {
    const result = scoreExisting({ ...passerInputs, infrastructureInvestment: 2_000_000 });
    const e3 = result.criteria.find(c => c.id === 'E3');
    expect(e3?.score).toBe(3);
  });

  it('E3 scores 2pts when infrastructureInvestment >= $1m and < $2m', () => {
    const result = scoreExisting({ ...passerInputs, infrastructureInvestment: 1_000_000 });
    const e3 = result.criteria.find(c => c.id === 'E3');
    expect(e3?.score).toBe(2);
  });

  it('E3 scores 1pt when infrastructureInvestment >= $500k and < $1m', () => {
    const result = scoreExisting({ ...passerInputs, infrastructureInvestment: 500_000 });
    const e3 = result.criteria.find(c => c.id === 'E3');
    expect(e3?.score).toBe(1);
  });

  it('E3 scores 0 when infrastructureInvestment < $500k (spec example: 0)', () => {
    const result = scoreExisting(passerInputs); // infrastructureInvestment = 0
    const e3 = result.criteria.find(c => c.id === 'E3');
    expect(e3?.score).toBe(0);
  });
});

// ── Section F: Marketing (12pts max) ──────────────────────────────────────────
describe('scoreExisting — Section F: Marketing, Promoting, and Showcasing NZ', () => {
  it('section F maxPoints = 12', () => {
    const result = scoreExisting(passerInputs);
    const secF = result.sections.find(s => s.id === 'F');
    expect(secF?.maxPoints).toBe(12);
  });

  it('section F totals 12 when all criteria maxed', () => {
    const maxF: ProjectInputs = {
      ...passerInputs,
      premiereType: 'world',
      hasFilmMarketing: true,
      hasTourismMarketing: true,
      hasTourismPartnership: true,
    };
    const result = scoreExisting(maxF);
    const secF = result.sections.find(s => s.id === 'F');
    expect(secF?.totalPoints).toBe(12);
  });

  // F1: premiere selector
  it('F1 scores 3pts when premiereType = world', () => {
    const result = scoreExisting({ ...passerInputs, premiereType: 'world' });
    const f1 = result.criteria.find(c => c.id === 'F1');
    expect(f1?.score).toBe(3);
  });

  it('F1 scores 2pts when premiereType = nz (spec example)', () => {
    const result = scoreExisting(passerInputs); // premiereType = 'nz'
    const f1 = result.criteria.find(c => c.id === 'F1');
    expect(f1?.score).toBe(2);
  });

  it('F1 scores 0 when premiereType = none', () => {
    const result = scoreExisting({ ...passerInputs, premiereType: 'none' });
    const f1 = result.criteria.find(c => c.id === 'F1');
    expect(f1?.score).toBe(0);
  });

  // F2: film marketing
  it('F2 scores 3pts when hasFilmMarketing = true (spec example)', () => {
    const result = scoreExisting(passerInputs); // hasFilmMarketing = true
    const f2 = result.criteria.find(c => c.id === 'F2');
    expect(f2?.score).toBe(3);
  });

  // F3: tourism marketing
  it('F3 scores 3pts when hasTourismMarketing = true', () => {
    const result = scoreExisting({ ...passerInputs, hasTourismMarketing: true });
    const f3 = result.criteria.find(c => c.id === 'F3');
    expect(f3?.score).toBe(3);
  });

  it('F3 scores 0 when hasTourismMarketing = false (spec example)', () => {
    const result = scoreExisting(passerInputs); // hasTourismMarketing = false
    const f3 = result.criteria.find(c => c.id === 'F3');
    expect(f3?.score).toBe(0);
  });

  // F4: tourism partnership
  it('F4 scores 3pts when hasTourismPartnership = true', () => {
    const result = scoreExisting({ ...passerInputs, hasTourismPartnership: true });
    const f4 = result.criteria.find(c => c.id === 'F4');
    expect(f4?.score).toBe(3);
  });
});

// ── Worked Examples (SCORING_SPEC.md verified) ────────────────────────────────
describe('scoreExisting — SCORING_SPEC.md Worked Examples', () => {
  it('Example 1: known passer scores exactly 40pts and passes', () => {
    const result = scoreExisting(passerInputs);
    expect(result.totalPoints).toBe(40);
    expect(result.passed).toBe(true);
    expect(result.mandatoryMet).toBe(true);
  });

  it('Example 1: section breakdown A=5, B=6, C=19, D=5, E=0, F=5', () => {
    const result = scoreExisting(passerInputs);
    const sectionTotals = Object.fromEntries(result.sections.map(s => [s.id, s.totalPoints]));
    expect(sectionTotals['A']).toBe(5);
    expect(sectionTotals['B']).toBe(6);
    expect(sectionTotals['C']).toBe(19);
    expect(sectionTotals['D']).toBe(5);
    expect(sectionTotals['E']).toBe(0);
    expect(sectionTotals['F']).toBe(5);
  });

  it('Example 2: known failer scores 35pts and fails on mandatory A1 not met', () => {
    // SCORING_SPEC.md Example 2 summary states "36" but the worked example shows C=19 not 20.
    // Correct total: B=6 + C=19 + D=5 + E=0 + F=5 = 35 (A=0 because sustainability all false).
    const result = scoreExisting(failerInputs);
    expect(result.totalPoints).toBe(35);
    expect(result.passed).toBe(false);
    expect(result.mandatoryMet).toBe(false);
  });

  it('Example 2: section breakdown A=0, B=6, C=19, D=5, E=0, F=5 (total 35)', () => {
    const result = scoreExisting(failerInputs);
    const sectionTotals = Object.fromEntries(result.sections.map(s => [s.id, s.totalPoints]));
    expect(sectionTotals['A']).toBe(0);
    expect(sectionTotals['B']).toBe(6);
    expect(sectionTotals['C']).toBe(19);
    expect(sectionTotals['D']).toBe(5);
    expect(sectionTotals['E']).toBe(0);
    expect(sectionTotals['F']).toBe(5);
  });

  it('maximum possible score is 85 when all criteria are maxed', () => {
    const allMax: ProjectInputs = {
      projectName: 'Max Score Production',
      qnzpe: 60_000_000,
      hasSustainabilityPlan: true,
      hasSustainabilityOfficer: true,
      hasCarbonReview: true,
      hasStudioLease: true,
      hasPreviousQNZPE: true,
      hasAssociatedContent: true,
      shootingNZPercent: 90,
      regionalPercent: 25,
      picturePostPercent: 75,
      soundPostPercent: 75,
      vfxPercent: 90,
      conceptPhysicalPercent: 90,
      castPercent: 80,
      crewPercent: 80,
      maoriCrewPercent: 10,
      atlCount: 3,
      btlKeyCount: 4,
      btlAdditionalCount: 8,
      hasLeadCast: true,
      supportingCastCount: 3,
      castingLevel: 'director',
      hasLeadCastMaori: true,
      hasMasterclass: true,
      hasIndustrySeminars: false, // proposed only, not counted
      hasEdSeminars: true,
      attachmentCount: 2,
      internshipCount: 8,
      hasKnowledgeTransfer: true,
      commercialAgreementPercent: 1,
      infrastructureInvestment: 2_000_000,
      premiereType: 'world',
      hasNZPremiere: false,     // proposed only
      hasIntlPromotion: false,  // proposed only
      hasFilmMarketing: true,
      hasTourismMarketing: true,
      hasTourismPartnership: true,
      hasLocationAnnouncement: false, // proposed only
    };
    const result = scoreExisting(allMax);
    expect(result.totalPoints).toBe(85);
    expect(result.passed).toBe(true);
  });
});

// ── Proposed-only criteria do NOT appear ──────────────────────────────────────
describe('scoreExisting — no proposed-only criteria in results', () => {
  it('does not contain proposed-only criterion D3 (Location Announcement)', () => {
    // D3 in proposed system is "Location Announcement" — should NOT appear in existing results
    // Note: D3 in existing is "Paid Attachment Positions" — different criterion
    const result = scoreExisting(passerInputs);
    // Check that Location Announcement (proposed D3) is not among existing criteria
    // In existing system, D3 = "Paid Attachment Positions for QPs"
    const locationAnnouncement = result.criteria.find(c =>
      c.label.toLowerCase().includes('location announcement')
    );
    expect(locationAnnouncement).toBeUndefined();
  });

  it('does not contain proposed-only criterion C1 (Industry Seminars)', () => {
    const result = scoreExisting(passerInputs);
    const industrySeminars = result.criteria.find(c =>
      c.label.toLowerCase().includes('screen industry')
    );
    expect(industrySeminars).toBeUndefined();
  });
});
