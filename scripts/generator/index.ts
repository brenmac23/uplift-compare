/**
 * generateProject() — assembles one Project from PRNG random values.
 *
 * Uses the three-tier pipeline:
 *   Tier 1 (generateTier1):  budget-correlated fundamentals (6 rand() calls)
 *   Tier 2 (generateTier2):  cross-field correlations from Tier 1 (17 rand() calls)
 *   Tier 3 (generateTier3):  score-gap greedy point-chasing (23 rand() calls)
 *
 * Total: sampleQnzpe (varies) + 6 + 17 + 23 = 46 + qnzpe rand() calls per project.
 */

import type { ProductionType, BudgetTierConfig } from './types';
import type { Project } from '../../src/store/useAppStore';
import type { ProjectInputs } from '../../src/scoring/types';
import { scoreExisting } from '../../src/scoring/scoreExisting';
import { sampleQnzpe } from './tiers';
import { generateTier1 } from './tier1';
import { generateTier2 } from './tier2';
import { generateTier3 } from './tier3';

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

  // Tier 1: Fundamentals — budget-correlated base fields
  const tier1 = generateTier1(rand, tierConfig, productionType);

  // Tier 2: Less Fundamental — cross-field correlations from Tier 1
  const tier2 = generateTier2(rand, tier1, tierConfig);

  // Tier 3: Point-chasing — score-gap greedy over cheap criteria
  const tier3 = generateTier3(rand, tier1, tier2, tierConfig, qnzpe);

  // Assemble ProjectInputs from all three tiers
  const inputs: ProjectInputs = {
    projectName: name,
    productionType,
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
    // Tier 3
    hasSustainabilityOfficer: tier3.hasSustainabilityOfficer,
    hasCarbonReview: tier3.hasCarbonReview,
    hasMasterclass: tier3.hasMasterclass,
    hasEdSeminars: tier3.hasEdSeminars,
    attachmentCount: tier3.attachmentCount,
    internshipCount: tier3.internshipCount,
    hasKnowledgeTransfer: tier3.hasKnowledgeTransfer,
    commercialAgreementPercent: tier3.commercialAgreementPercent,
    infrastructureInvestment: tier3.infrastructureInvestment,
    premiereType: tier3.premiereType,
    hasFilmMarketing: tier3.hasFilmMarketing,
    hasTourismMarketing: tier3.hasTourismMarketing,
    hasTourismPartnership: tier3.hasTourismPartnership,
    // Proposed-only (from Tier 3)
    hasIndustrySeminars: tier3.hasIndustrySeminars,
    hasNZPremiere: tier3.hasNZPremiere,
    hasIntlPromotion: tier3.hasIntlPromotion,
    hasLocationAnnouncement: tier3.hasLocationAnnouncement,
    // Fixed (Maori fields — Phase 7 handles the special scenario)
    maoriCrewPercent: 0,
    hasLeadCastMaori: false,
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
