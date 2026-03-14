/**
 * Cross-field correlation tables for the seed data generator.
 *
 * Phase 6 populates cross-field correlation tables keyed by BudgetTier and ProductionType.
 * This file is a typed stub so that Phase 5 modules can import the symbol and
 * verify the import path is correct before Phase 6 fills in the data.
 */

// Import the types to verify the import path is resolved correctly by tsx.
import type { BudgetTier, ProductionType } from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _EnsureImportsUsed = BudgetTier | ProductionType;

/**
 * Stub correlation table.
 * Phase 6 will replace this with a populated structure keyed by BudgetTier and ProductionType
 * that encodes field probability adjustments (e.g., TV projects get higher crewPercent,
 * tentpole projects are more likely to have hasSustainabilityOfficer).
 */
export const CORRELATIONS = {};
