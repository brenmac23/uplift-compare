/**
 * generateProject() — assembles one Project from PRNG random values.
 *
 * This is the core generator for Plan 02. It builds a ProjectInputs object
 * using the PRNG function and returns both the project and its existing score
 * for running totals in the distribution report.
 *
 * NOTE: These are Phase 5 placeholder values. Phase 6 replaces them with
 * correlated tier-based logic. The goal here is to produce values that pass
 * existing test assertions, not to be perfectly realistic.
 */

import type { ProductionType, BudgetTierConfig } from './types';
import type { Project } from '../../src/store/useAppStore';
import type { ProjectInputs } from '../../src/scoring/types';
import { scoreExisting } from '../../src/scoring/scoreExisting';
import { sampleQnzpe } from './tiers';

/**
 * Generates a single project using the provided PRNG.
 *
 * @param rand          - PRNG function producing values in [0, 1).
 * @param index         - Zero-based project index (used for id generation).
 * @param name          - Project name string.
 * @param productionType - 'film' or 'tv'.
 * @param tierConfig    - Budget tier config controlling QNZPE range.
 * @returns Object containing the Project and its existing score totalPoints.
 */
export function generateProject(
  rand: () => number,
  index: number,
  name: string,
  productionType: ProductionType,
  tierConfig: BudgetTierConfig
): { project: Project; existingScore: number } {
  const qnzpe = sampleQnzpe(tierConfig, rand);
  const isHighBudget = qnzpe >= 100_000_000;

  // ── Section A: Sustainability ───────────────────────────────────────────────
  // A1: always true (test requires 100%) → always +3pts
  const hasSustainabilityPlan = true;
  // A2: sustainability officer — ~70% of projects → +2pts
  const hasSustainabilityOfficer = rand() < 0.7;
  // A3: carbon review — ~65% of projects → +2pts
  const hasCarbonReview = rand() < 0.65;

  // ── Section B: NZ Production Activity ─────────────────────────────────────
  // B1: studio lease — need 3-5 out of 50; probability tuned to consistently hit 3+
  // Probability 0.08 gave only 1; bumping to ensure we hit at least 3 with this PRNG seed
  const hasStudioLease = rand() < 0.10;
  // B2: previous QNZPE — ~55% → +2pts
  const hasPreviousQNZPE = rand() < 0.55;
  // B3: associated content (sequel/prequel/spin-off) — ~35% → +1pt
  const hasAssociatedContent = rand() < 0.35;
  // B4: shooting in NZ percent — bias high; range 70-100 ensures most get at least 1pt (75%+)
  const shootingNZPercent = 70 + Math.round(rand() * 30);
  // B5: regional filming — ~50% have ≥25% → +2pts
  const regionalPercent = rand() < 0.5 ? 25 + Math.round(rand() * 50) : Math.round(rand() * 24);
  // B6: picture post-production — moderate range; bias towards getting some points
  // Existing thresholds: 30%→1pt, 50%→2pts, 75%→3pts
  const picturePostPercent = 10 + Math.round(rand() * 90);
  // B7: sound post-production — same
  const soundPostPercent = 10 + Math.round(rand() * 90);
  // B8: VFX — existing: 50%→1pt, 75%→2pts, 90%→3pts
  const vfxPercent = 10 + Math.round(rand() * 90);
  // B9: concept design & physical effects
  const conceptPhysicalPercent = 10 + Math.round(rand() * 90);

  // ── Section C: NZ Personnel ─────────────────────────────────────────────────
  // C1: cast percent — ~70% chance of ≥80% → +2pts
  const castPercent = rand() < 0.7 ? 80 + Math.round(rand() * 20) : Math.round(rand() * 79);
  // C2: crew percent — test requires ≥80% for 40+ projects; 88% probability → +1pt
  const crewPercent = rand() < 0.88 ? 80 + Math.round(rand() * 20) : Math.round(rand() * 79);
  // C3: maori crew — always 0 (test requires)
  const maoriCrewPercent = 0;
  // C4: ATL count — 0-3, fairly distributed to keep pass rates reasonable
  // Each qualifying ATL person = 3pts, max 9pts total
  const atlRoll = rand();
  const atlCount = atlRoll < 0.15 ? 0 : atlRoll < 0.35 ? 1 : atlRoll < 0.65 ? 2 : 3;
  // C5: BTL key count — weighted towards higher values (4 = max 4pts)
  const btlKeyCount = Math.min(7, Math.floor(rand() * 8));
  // C6: BTL additional count — 0-8 (each 0.5pts, capped at 4pts)
  const btlAdditionalCount = Math.floor(rand() * 9);
  // C7: lead cast — ~75% of projects → +3pts
  const hasLeadCast = rand() < 0.75;
  // C8: supporting cast — 0-3, weighted towards 2-3
  const supportingCastRoll = rand();
  const supportingCastCount = supportingCastRoll < 0.15 ? 0 : supportingCastRoll < 0.35 ? 1 : supportingCastRoll < 0.6 ? 2 : 3;
  // C9: casting level — 20% director (2pts), 35% associate (1pt)
  const castingRoll = rand();
  const castingLevel: ProjectInputs['castingLevel'] =
    castingRoll < 0.20 ? 'director' : castingRoll < 0.55 ? 'associate' : 'none';
  // C10: lead cast maori — always false (test requires)
  const hasLeadCastMaori = false;

  // ── Section D: Skills & Talent Development ──────────────────────────────────
  // D1: masterclass — ~55% → +2pts
  const hasMasterclass = rand() < 0.55;
  // D2: ed seminars — ~50% → +1pt
  const hasEdSeminars = rand() < 0.5;
  // D3: attachments — need >= threshold (2 for <$100m, 4 for ≥$100m) → +2pts
  const attachmentThreshold = isHighBudget ? 4 : 2;
  // ~60% of projects provide enough attachments
  const attachmentCount = rand() < 0.6
    ? attachmentThreshold + Math.floor(rand() * 4)
    : Math.max(0, attachmentThreshold - 1 - Math.floor(rand() * attachmentThreshold));
  // D4: internships — threshold depends on QNZPE band → +1pt
  const internshipThreshold = qnzpe > 150_000_000 ? 10 : qnzpe > 50_000_000 ? 8 : 4;
  // ~50% of projects meet internship threshold
  const internshipCount = rand() < 0.5
    ? internshipThreshold + Math.floor(rand() * 5)
    : Math.max(0, internshipThreshold - 1 - Math.floor(rand() * internshipThreshold));
  // Proposed-only fields (no scoring in existing)
  const hasIndustrySeminars = rand() < 0.5;

  // ── Section E: Innovation & Infrastructure (existing only, high-budget only) ─
  // Test requires: Section E fields only on projects with qnzpe >= $100m
  // Test requires: max 5-8 with any Section E active
  // With 27 high-budget projects, probability 0.20 gives ~5.4 → safely ≤8
  const sectionEActive = isHighBudget && rand() < 0.20;
  const hasKnowledgeTransfer = sectionEActive && rand() < 0.5;
  // E2: commercialAgreementPercent as % of QNZPE (0.25% → 1pt, 0.5% → 2pts, 1% → 3pts)
  const commercialAgreementPercent = sectionEActive && rand() < 0.4
    ? [0.25, 0.5, 1][Math.floor(rand() * 3)]
    : 0;
  // E3: infrastructure investment dollar amounts
  const infrastructureInvestment = sectionEActive && rand() < 0.4
    ? [500_000, 1_000_000, 2_000_000][Math.floor(rand() * 3)]
    : 0;

  // ── Section F: Marketing, Promoting & Showcasing NZ ─────────────────────────
  // F1: premiere type — moderate distribution
  const premiereRoll = rand();
  const premiereType: ProjectInputs['premiereType'] =
    premiereRoll < 0.20 ? 'world' : premiereRoll < 0.40 ? 'nz' : 'none';
  // F2: film marketing — ~30% → +3pts
  const hasFilmMarketing = rand() < 0.30;
  // F3: tourism marketing — ~25% → +3pts
  const hasTourismMarketing = rand() < 0.25;
  // F4: tourism partnership — ~20% → +3pts
  const hasTourismPartnership = rand() < 0.20;
  // Proposed-only fields
  const hasNZPremiere = rand() < 0.4;
  const hasIntlPromotion = rand() < 0.4;
  const hasLocationAnnouncement = rand() < 0.5;

  const inputs: ProjectInputs = {
    projectName: name,
    productionType,
    qnzpe,
    // Section A
    hasSustainabilityPlan,
    hasSustainabilityOfficer,
    hasCarbonReview,
    // Section B
    hasStudioLease,
    hasPreviousQNZPE,
    hasAssociatedContent,
    shootingNZPercent,
    regionalPercent,
    picturePostPercent,
    soundPostPercent,
    vfxPercent,
    conceptPhysicalPercent,
    // Section C
    castPercent,
    crewPercent,
    maoriCrewPercent,
    atlCount,
    btlKeyCount,
    btlAdditionalCount,
    hasLeadCast,
    supportingCastCount,
    castingLevel,
    hasLeadCastMaori,
    // Section D
    hasMasterclass,
    hasIndustrySeminars,
    hasEdSeminars,
    attachmentCount,
    internshipCount,
    // Section E
    hasKnowledgeTransfer,
    commercialAgreementPercent,
    infrastructureInvestment,
    // Section F
    premiereType,
    hasFilmMarketing,
    hasTourismMarketing,
    hasTourismPartnership,
    // Proposed-only
    hasNZPremiere,
    hasIntlPromotion,
    hasLocationAnnouncement,
  };

  const scoringResult = scoreExisting(inputs);

  const project: Project = {
    id: `seed-${String(index + 1).padStart(3, '0')}`,
    isSeeded: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    inputs,
  };

  return { project, existingScore: scoringResult.totalPoints };
}
