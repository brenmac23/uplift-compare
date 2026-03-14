/**
 * Core types for the seed data generator.
 * All generator modules import their shared types from here.
 */

/** Whether a project is a film or a TV series. */
export type ProductionType = 'film' | 'tv';

/**
 * Four budget tiers derived from user constraints.
 * Correlation tables in Phase 6 key off this type.
 */
export type BudgetTier = 'small' | 'mid' | 'large' | 'tentpole';

/**
 * Configuration for one budget tier: QNZPE range + clustering hint.
 * `clusterCenter` is a fraction of the range (0–1) representing the mode
 * of the triangular distribution used by sampleQnzpe().
 */
export interface BudgetTierConfig {
  tier: BudgetTier;
  minQnzpe: number;
  maxQnzpe: number;
  /** Cluster center as a fraction of the range. E.g., 0.3 = lower third. */
  clusterCenter: number;
}

/** Top-level configuration for a generator run. */
export interface GeneratorConfig {
  /** Arbitrary fixed seed for reproducibility. Default: 0xDEADBEEF. */
  seed: number;
  /** Number of projects to generate. Default: 50. */
  projectCount: number;
}

/**
 * Arbitrary fixed seed for reproducibility.
 * Value 0xDEADBEEF (3735928559) chosen as a conventional placeholder —
 * easy to recognise in logs; has no mathematical significance.
 */
export const SEED = 0xdeadbeef;

/** Total number of seed projects to generate. Centralised so it is easy to change. */
export const PROJECT_COUNT = 50;
