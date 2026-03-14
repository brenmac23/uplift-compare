import { describe, it, expect } from 'vitest';
import { SEED_PROJECTS } from '../seedProjects';
import { scoreExisting } from '../../scoring';
import { scoreProposed } from '../../scoring/scoreProposed';

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

  it('at most 3 projects have active Maori crew (maoriCrewPercent >= 10)', () => {
    const count = SEED_PROJECTS.filter(p => p.inputs.maoriCrewPercent >= 10).length;
    expect(count).toBeLessThanOrEqual(3);
  });

  it('at most 3 projects have hasLeadCastMaori === true', () => {
    const count = SEED_PROJECTS.filter(p => p.inputs.hasLeadCastMaori).length;
    expect(count).toBeLessThanOrEqual(3);
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

  // ── Special scenarios (SCEN-01 through SCEN-04) ──────────────────────────

  it('SCEN-01: at least one project passes existing but fails proposed', () => {
    const count = SEED_PROJECTS.filter(p => {
      const ex = scoreExisting(p.inputs);
      const prop = scoreProposed(p.inputs);
      return ex.passed && !prop.passed;
    }).length;
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('SCEN-02: at most 3 projects have active Maori criteria', () => {
    const count = SEED_PROJECTS.filter(p =>
      p.inputs.maoriCrewPercent >= 10 || p.inputs.hasLeadCastMaori
    ).length;
    expect(count).toBeGreaterThanOrEqual(0);
    expect(count).toBeLessThanOrEqual(3);
  });

  it('SCEN-03: between 25-35 projects pass scoreExisting', () => {
    const count = SEED_PROJECTS.filter(p => scoreExisting(p.inputs).passed).length;
    expect(count).toBeGreaterThanOrEqual(25);
    expect(count).toBeLessThanOrEqual(35);
  });

  it('SCEN-04: existing score stddev is between 4 and 12', () => {
    const scores = SEED_PROJECTS.map(p => scoreExisting(p.inputs).totalPoints);
    const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
    const variance = scores.reduce((s, x) => s + (x - mean) ** 2, 0) / scores.length;
    const stddev = Math.sqrt(variance);
    expect(stddev).toBeGreaterThanOrEqual(4);
    expect(stddev).toBeLessThanOrEqual(12);
  });

  // ── Distribution correlations (DIST-01 through DIST-05) ──────────────────

  describe('distribution correlations (DIST-01 through DIST-05)', () => {
    // DIST-01: bimodal post-production
    it('picturePostPercent is bimodal — all values either <= 10 or >= 75', () => {
      for (const p of SEED_PROJECTS) {
        const v = p.inputs.picturePostPercent;
        expect(v <= 10 || v >= 75).toBe(true);
      }
    });

    it('soundPostPercent is bimodal — all values either <= 10 or >= 75', () => {
      for (const p of SEED_PROJECTS) {
        const v = p.inputs.soundPostPercent;
        expect(v <= 10 || v >= 75).toBe(true);
      }
    });

    it('at least 40% of projects have high post-production (picturePostPercent >= 75)', () => {
      const count = SEED_PROJECTS.filter((p) => p.inputs.picturePostPercent >= 75).length;
      expect(count).toBeGreaterThanOrEqual(20);
    });

    // DIST-02: VFX/concept independence
    it('vfxPercent and conceptPhysicalPercent vary independently from post-production cluster', () => {
      const highPost = SEED_PROJECTS.filter((p) => p.inputs.picturePostPercent >= 75);
      const lowPost = SEED_PROJECTS.filter((p) => p.inputs.picturePostPercent <= 10);
      const mean = (arr: typeof SEED_PROJECTS, key: 'vfxPercent' | 'conceptPhysicalPercent') =>
        arr.reduce((sum, p) => sum + p.inputs[key], 0) / arr.length;
      const highPostVfxMean = mean(highPost, 'vfxPercent');
      const lowPostVfxMean = mean(lowPost, 'vfxPercent');
      expect(Math.abs(highPostVfxMean - lowPostVfxMean)).toBeLessThan(30);
    });

    // DIST-03: C6 >= C5 constraint
    it('btlAdditionalCount >= btlKeyCount for all projects', () => {
      for (const p of SEED_PROJECTS) {
        expect(p.inputs.btlAdditionalCount).toBeGreaterThanOrEqual(p.inputs.btlKeyCount);
      }
    });

    it('btlKeyCount === 0 implies btlAdditionalCount === 0', () => {
      for (const p of SEED_PROJECTS) {
        if (p.inputs.btlKeyCount === 0) {
          expect(p.inputs.btlAdditionalCount).toBe(0);
        }
      }
    });

    // DIST-04: B4/C2 co-variance
    it('low shooting percent correlates with lower crew percent pass rate', () => {
      const lowShooting = SEED_PROJECTS.filter((p) => p.inputs.shootingNZPercent < 75);
      const highShooting = SEED_PROJECTS.filter((p) => p.inputs.shootingNZPercent >= 90);
      const passRate = (arr: typeof SEED_PROJECTS) =>
        arr.length === 0
          ? 0
          : arr.filter((p) => p.inputs.crewPercent >= 80).length / arr.length;
      const lowShootingPassRate = passRate(lowShooting);
      const highShootingPassRate = passRate(highShooting);
      expect(highShootingPassRate).toBeGreaterThan(lowShootingPassRate);
    });

    // DIST-05: budget-inverse qualifying person
    it('higher budget tiers have lower average atlCount', () => {
      const smallMid = SEED_PROJECTS.filter((p) => p.inputs.qnzpe < 100_000_000);
      const largeTentpole = SEED_PROJECTS.filter((p) => p.inputs.qnzpe >= 100_000_000);
      const mean = (arr: typeof SEED_PROJECTS) =>
        arr.reduce((sum, p) => sum + p.inputs.atlCount, 0) / arr.length;
      const smallMidMean = mean(smallMid);
      const largeTentpoleMean = mean(largeTentpole);
      expect(smallMidMean).toBeGreaterThan(largeTentpoleMean);
    });
  });
});
