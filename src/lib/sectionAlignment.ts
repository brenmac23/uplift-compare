import type { ScoringResult, SectionResult } from '../scoring/types';

/**
 * Represents one row in the three-column layout: a visual slot that may or may not
 * have a corresponding section in each scoring system.
 */
export interface SectionSlot {
  /** Display label for this row (shown in the inputs column header). */
  label: string;
  /** Section ID in the existing scoring system, or null if no equivalent. */
  existingSectionId: string | null;
  /** Section ID in the proposed scoring system, or null if no equivalent. */
  proposedSectionId: string | null;
}

/**
 * Static alignment map between existing and proposed sections.
 *
 * The two scoring systems have different structures:
 * - Existing: A (Sustainability), B (Production), C (Personnel), D (Skills), E (Innovation), F (Marketing)
 * - Proposed: A (Production), B (Personnel), C (Skills), D (Marketing)
 *
 * This map aligns them so that semantically equivalent sections appear on the same row,
 * with null placeholders where one system has no equivalent.
 */
export const SECTION_ALIGNMENT: SectionSlot[] = [
  { label: 'Sustainability',         existingSectionId: 'A', proposedSectionId: null },
  { label: 'NZ Production Activity', existingSectionId: 'B', proposedSectionId: 'A' },
  { label: 'NZ Personnel',           existingSectionId: 'C', proposedSectionId: 'B' },
  { label: 'Skills & Talent Dev.',   existingSectionId: 'D', proposedSectionId: 'C' },
  { label: 'Innovation & Infra.',    existingSectionId: 'E', proposedSectionId: null },
  { label: 'Marketing & Showcasing', existingSectionId: 'F', proposedSectionId: 'D' },
];

/**
 * Finds a section by ID from a ScoringResult. Returns null if sectionId is null
 * or not found (e.g. when the scoring system has no equivalent for this slot).
 */
export function findSection(result: ScoringResult, sectionId: string | null): SectionResult | null {
  if (!sectionId) return null;
  return result.sections.find((s) => s.id === sectionId) ?? null;
}
