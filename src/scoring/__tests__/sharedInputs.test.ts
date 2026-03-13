import { describe, it, expect } from 'vitest';
import { scoreExisting } from '../scoreExisting';
import { scoreProposed } from '../scoreProposed';
import type { ProjectInputs, CriterionResult } from '../types';

/**
 * Integration tests verifying both scoring engines consume the same ProjectInputs type.
 * These tests prove SCORE-04: a shared field change affects both outputs.
 */

const baseline: ProjectInputs = {
  projectName: 'Test Production',
  productionType: 'film',
  qnzpe: 50_000_000,

  // Sustainability (existing only)
  hasSustainabilityPlan: true,
  hasSustainabilityOfficer: true,
  hasCarbonReview: true,

  // Production Activity
  hasStudioLease: true,
  hasPreviousQNZPE: true,
  hasAssociatedContent: true,
  shootingNZPercent: 80,
  regionalPercent: 30,
  picturePostPercent: 50,
  soundPostPercent: 50,
  vfxPercent: 60,
  conceptPhysicalPercent: 60,

  // Personnel
  castPercent: 50,
  crewPercent: 50,
  maoriCrewPercent: 5,
  atlCount: 2,
  btlKeyCount: 3,
  btlAdditionalCount: 4,
  hasLeadCast: true,
  supportingCastCount: 2,
  castingLevel: 'associate',
  hasLeadCastMaori: false,

  // Skills & Talent
  hasMasterclass: true,
  hasIndustrySeminars: true,
  hasEdSeminars: true,
  attachmentCount: 2,
  internshipCount: 4,

  // Innovation (existing only)
  hasKnowledgeTransfer: false,
  commercialAgreementPercent: 0,
  infrastructureInvestment: 0,

  // Marketing
  premiereType: 'nz',
  hasNZPremiere: true,
  hasIntlPromotion: false,
  hasFilmMarketing: true,
  hasTourismMarketing: false,
  hasTourismPartnership: false,
  hasLocationAnnouncement: false,
};

describe('Shared inputs integration — both engines consume ProjectInputs', () => {
  it('Both scoreExisting() and scoreProposed() return valid ScoringResult from same inputs', () => {
    const existing = scoreExisting(baseline);
    const proposed = scoreProposed(baseline);

    // Both return results without error
    expect(existing).toBeDefined();
    expect(proposed).toBeDefined();

    // Both have numeric totals
    expect(typeof existing.totalPoints).toBe('number');
    expect(typeof proposed.totalPoints).toBe('number');

    // Both have correct maxPoints per spec
    expect(existing.maxPoints).toBe(85);
    expect(proposed.maxPoints).toBe(70);
  });

  it('result.criteria is a non-empty array with correct CriterionResult shape', () => {
    const existing = scoreExisting(baseline);
    const proposed = scoreProposed(baseline);

    // Both must have non-empty criteria arrays
    expect(existing.criteria.length).toBeGreaterThan(0);
    expect(proposed.criteria.length).toBeGreaterThan(0);

    // Each entry must have id, label, score, maxScore
    const checkShape = (c: CriterionResult) => {
      expect(typeof c.id).toBe('string');
      expect(typeof c.label).toBe('string');
      expect(c.score === 'N/A' || typeof c.score === 'number').toBe(true);
      expect(c.maxScore === 'N/A' || typeof c.maxScore === 'number').toBe(true);
    };

    existing.criteria.forEach(checkShape);
    proposed.criteria.forEach(checkShape);
  });

  it('Changing crewPercent from 50 to 85 changes crew criterion score in BOTH results', () => {
    const lowCrew = scoreExisting({ ...baseline, crewPercent: 50 });
    const highCrew = scoreExisting({ ...baseline, crewPercent: 85 });

    const lowCrewProposed = scoreProposed({ ...baseline, crewPercent: 50 });
    const highCrewProposed = scoreProposed({ ...baseline, crewPercent: 85 });

    // Existing C2 threshold is 80% for 1pt
    const existingC2Low = lowCrew.criteria.find(c => c.id === 'C2');
    const existingC2High = highCrew.criteria.find(c => c.id === 'C2');
    expect(existingC2Low?.score).toBe(0);
    expect(existingC2High?.score).toBe(1);

    // Proposed B2 threshold is 80% for 3pts
    const proposedB2Low = lowCrewProposed.criteria.find(c => c.id === 'B2');
    const proposedB2High = highCrewProposed.criteria.find(c => c.id === 'B2');
    expect(proposedB2Low?.score).toBe(0);
    expect(proposedB2High?.score).toBe(3);
  });

  it('Changing castPercent from 50 to 85 changes cast criterion score in BOTH results', () => {
    const lowCast = scoreExisting({ ...baseline, castPercent: 50 });
    const highCast = scoreExisting({ ...baseline, castPercent: 85 });

    const lowCastProposed = scoreProposed({ ...baseline, castPercent: 50 });
    const highCastProposed = scoreProposed({ ...baseline, castPercent: 85 });

    // Existing C1 threshold is 80% for 2pts
    const existingC1Low = lowCast.criteria.find(c => c.id === 'C1');
    const existingC1High = highCast.criteria.find(c => c.id === 'C1');
    expect(existingC1Low?.score).toBe(0);
    expect(existingC1High?.score).toBe(2);

    // Proposed B1: 60% → 2pts, 80% → 3pts
    const proposedB1Low = lowCastProposed.criteria.find(c => c.id === 'B1');
    const proposedB1High = highCastProposed.criteria.find(c => c.id === 'B1');
    expect(proposedB1Low?.score).toBe(0);
    expect(proposedB1High?.score).toBe(3);
  });

  it('vfxPercent of 60 produces different scores in each engine (different thresholds)', () => {
    const inputs = { ...baseline, vfxPercent: 60 };
    const existing = scoreExisting(inputs);
    const proposed = scoreProposed(inputs);

    // Existing B8: thresholds 50/75/90 — 60% → 1pt (hits 50% tier)
    const existingB8 = existing.criteria.find(c => c.id === 'B8');
    // Proposed A7: thresholds 30/50/75 — 60% → 2pts (hits 50% tier)
    const proposedA7 = proposed.criteria.find(c => c.id === 'A7');

    expect(existingB8?.score).toBe(1);
    expect(proposedA7?.score).toBe(2);

    // The scores must differ — this is the key threshold divergence test
    expect(existingB8?.score).not.toEqual(proposedA7?.score);
  });

  it('qnzpe of 50_000_000 gives proposed passThreshold 20', () => {
    const result = scoreProposed({ ...baseline, qnzpe: 50_000_000 });
    expect(result.passThreshold).toBe(20);
  });

  it('qnzpe of 150_000_000 gives proposed passThreshold 30', () => {
    const result = scoreProposed({ ...baseline, qnzpe: 150_000_000 });
    expect(result.passThreshold).toBe(30);
  });

  it('Both engines accept the SAME ProjectInputs object (TypeScript compile-time check)', () => {
    // If this compiles, SCORE-04 is satisfied — both engines use ProjectInputs
    const inputs: ProjectInputs = { ...baseline };
    const existing = scoreExisting(inputs);
    const proposed = scoreProposed(inputs);

    expect(existing).toBeDefined();
    expect(proposed).toBeDefined();
  });
});
