import { describe, it, expect } from 'vitest';
import { SEED_PROJECTS } from '../seedProjects';
import { scoreExisting } from '../../scoring';

describe('SEED_PROJECTS distribution and realism', () => {
  // ── Count and shape ──────────────────────────────────────────────────────

  it('has exactly 50 projects', () => {
    expect(SEED_PROJECTS).toHaveLength(50);
  });

  it('all have unique ids matching pattern seed-NNN', () => {
    const ids = SEED_PROJECTS.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(50);
    for (const id of ids) {
      expect(id).toMatch(/^seed-\d{3}$/);
    }
  });

  it('all have isSeeded=true', () => {
    for (const p of SEED_PROJECTS) {
      expect(p.isSeeded).toBe(true);
    }
  });

  it('all have non-empty projectName', () => {
    for (const p of SEED_PROJECTS) {
      expect(p.inputs.projectName.trim().length).toBeGreaterThan(0);
    }
  });

  it('has a mix of production types: at least 15 film and at least 15 TV', () => {
    const filmCount = SEED_PROJECTS.filter((p) => p.inputs.productionType === 'film').length;
    const tvCount = SEED_PROJECTS.filter((p) => p.inputs.productionType === 'tv').length;
    expect(filmCount).toBeGreaterThanOrEqual(15);
    expect(tvCount).toBeGreaterThanOrEqual(15);
  });

  // ── Budget distribution ──────────────────────────────────────────────────

  it('all have qnzpe >= $20m', () => {
    for (const p of SEED_PROJECTS) {
      expect(p.inputs.qnzpe).toBeGreaterThanOrEqual(20_000_000);
    }
  });

  it('between 20-30 projects have qnzpe >= $100m', () => {
    const bigBudgetCount = SEED_PROJECTS.filter(
      (p) => p.inputs.qnzpe >= 100_000_000
    ).length;
    expect(bigBudgetCount).toBeGreaterThanOrEqual(20);
    expect(bigBudgetCount).toBeLessThanOrEqual(30);
  });

  // ── Scoring distribution ─────────────────────────────────────────────────

  it('between 20-30 projects pass scoreExisting', () => {
    const passingCount = SEED_PROJECTS.filter((p) => scoreExisting(p.inputs).passed).length;
    expect(passingCount).toBeGreaterThanOrEqual(20);
    expect(passingCount).toBeLessThanOrEqual(30);
  });

  it('at least 5 projects have existing score between 38-42 (borderline)', () => {
    const borderlineCount = SEED_PROJECTS.filter((p) => {
      const result = scoreExisting(p.inputs);
      return result.totalPoints >= 38 && result.totalPoints <= 42;
    }).length;
    expect(borderlineCount).toBeGreaterThanOrEqual(5);
  });

  // ── Realism rules ────────────────────────────────────────────────────────

  it('all have hasSustainabilityPlan === true', () => {
    for (const p of SEED_PROJECTS) {
      expect(p.inputs.hasSustainabilityPlan).toBe(true);
    }
  });

  it('all have maoriCrewPercent === 0', () => {
    for (const p of SEED_PROJECTS) {
      expect(p.inputs.maoriCrewPercent).toBe(0);
    }
  });

  it('all have hasLeadCastMaori === false', () => {
    for (const p of SEED_PROJECTS) {
      expect(p.inputs.hasLeadCastMaori).toBe(false);
    }
  });

  it('between 3-5 projects have hasStudioLease === true', () => {
    const studioLeaseCount = SEED_PROJECTS.filter((p) => p.inputs.hasStudioLease).length;
    expect(studioLeaseCount).toBeGreaterThanOrEqual(3);
    expect(studioLeaseCount).toBeLessThanOrEqual(5);
  });

  it('Section E fields only on projects with qnzpe >= $100m', () => {
    for (const p of SEED_PROJECTS) {
      if (p.inputs.qnzpe < 100_000_000) {
        expect(p.inputs.hasKnowledgeTransfer).toBe(false);
        expect(p.inputs.commercialAgreementPercent).toBe(0);
        expect(p.inputs.infrastructureInvestment).toBe(0);
      }
    }
  });

  it('max 5-8 projects have any Section E field active', () => {
    const sectionECount = SEED_PROJECTS.filter(
      (p) =>
        p.inputs.hasKnowledgeTransfer ||
        p.inputs.commercialAgreementPercent > 0 ||
        p.inputs.infrastructureInvestment > 0
    ).length;
    expect(sectionECount).toBeLessThanOrEqual(8);
    // at least some (can be 0 min, but the constraint is max 5-8, so 0 is fine too)
  });

  it('at least 40 projects have crewPercent >= 80', () => {
    const highCrewCount = SEED_PROJECTS.filter((p) => p.inputs.crewPercent >= 80).length;
    expect(highCrewCount).toBeGreaterThanOrEqual(40);
  });
});
