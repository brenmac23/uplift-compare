import { utils, writeFileXLSX } from 'xlsx';
import type { Project } from '../store/useAppStore';
import type { ScoringResult } from '../scoring/types';
import { scoreExisting } from '../scoring/scoreExisting';
import { scoreProposed } from '../scoring/scoreProposed';

// ── Human-readable labels for ProjectInputs fields ────────────────────────────
// Ordered to match the row builder below.
const INPUT_HEADERS: string[] = [
  'Project Name',
  'Type',
  'QNZPE ($NZD)',
  'Has Sustainability Plan',
  'Has Sustainability Officer',
  'Has Carbon Review',
  'Has Studio Lease',
  'Has Previous QNZPE',
  'Has Associated Content',
  'Shooting NZ %',
  'Regional %',
  'Picture Post %',
  'Sound Post %',
  'VFX %',
  'Concept/Physical %',
  'Cast %',
  'Crew %',
  'Maori Crew %',
  'ATL Count',
  'BTL Key Count',
  'BTL Additional Count',
  'Has Lead Cast',
  'Supporting Cast Count',
  'Casting Level',
  'Has Lead Cast Maori',
  'Has Masterclass',
  'Has Industry Seminars',
  'Has Ed Seminars',
  'Attachment Count',
  'Internship Count',
  'Has Knowledge Transfer',
  'Commercial Agreement %',
  'Infrastructure Investment ($NZD)',
  'Premiere Type',
  'Has NZ Premiere',
  'Has Intl Promotion',
  'Has Film Marketing',
  'Has Tourism Marketing',
  'Has Tourism Partnership',
  'Has Location Announcement',
];

/**
 * Builds the header row for the export spreadsheet.
 * Order: project metadata / raw inputs, then existing system columns, then proposed system columns.
 */
export function buildHeaders(
  sampleExisting: ScoringResult,
  sampleProposed: ScoringResult
): string[] {
  const exCriterionHeaders = sampleExisting.criteria.map(
    (c) => `Existing ${c.id}: ${c.label}`
  );
  const prCriterionHeaders = sampleProposed.criteria.map(
    (c) => `Proposed ${c.id}: ${c.label}`
  );

  return [
    ...INPUT_HEADERS,
    'Existing Total',
    'Existing Pass?',
    'Existing Threshold',
    ...exCriterionHeaders,
    'Proposed Total',
    'Proposed Pass?',
    'Proposed Threshold',
    ...prCriterionHeaders,
  ];
}

/**
 * Builds a single data row for a project.
 * Calls scoreExisting and scoreProposed internally.
 * - Booleans are mapped to 'Yes'/'No'
 * - N/A criterion scores are mapped to empty string
 * - passed field is mapped to 'PASS'/'FAIL'
 * - QNZPE is exported as raw whole NZD number
 */
export function buildRow(project: Project): (string | number)[] {
  const { inputs } = project;
  const ex = scoreExisting(inputs);
  const pr = scoreProposed(inputs);

  const bool = (v: boolean): string => (v ? 'Yes' : 'No');

  const inputValues: (string | number)[] = [
    inputs.projectName,
    inputs.productionType,
    inputs.qnzpe,
    bool(inputs.hasSustainabilityPlan),
    bool(inputs.hasSustainabilityOfficer),
    bool(inputs.hasCarbonReview),
    bool(inputs.hasStudioLease),
    bool(inputs.hasPreviousQNZPE),
    bool(inputs.hasAssociatedContent),
    inputs.shootingNZPercent,
    inputs.regionalPercent,
    inputs.picturePostPercent,
    inputs.soundPostPercent,
    inputs.vfxPercent,
    inputs.conceptPhysicalPercent,
    inputs.castPercent,
    inputs.crewPercent,
    inputs.maoriCrewPercent,
    inputs.atlCount,
    inputs.btlKeyCount,
    inputs.btlAdditionalCount,
    bool(inputs.hasLeadCast),
    inputs.supportingCastCount,
    inputs.castingLevel,
    bool(inputs.hasLeadCastMaori),
    bool(inputs.hasMasterclass),
    bool(inputs.hasIndustrySeminars),
    bool(inputs.hasEdSeminars),
    inputs.attachmentCount,
    inputs.internshipCount,
    bool(inputs.hasKnowledgeTransfer),
    inputs.commercialAgreementPercent,
    inputs.infrastructureInvestment,
    inputs.premiereType,
    bool(inputs.hasNZPremiere),
    bool(inputs.hasIntlPromotion),
    bool(inputs.hasFilmMarketing),
    bool(inputs.hasTourismMarketing),
    bool(inputs.hasTourismPartnership),
    bool(inputs.hasLocationAnnouncement),
  ];

  const exScores = ex.criteria.map((c) =>
    c.score === 'N/A' ? ('' as string) : (c.score as number)
  );
  const prScores = pr.criteria.map((c) =>
    c.score === 'N/A' ? ('' as string) : (c.score as number)
  );

  return [
    ...inputValues,
    ex.totalPoints,
    ex.passed ? 'PASS' : 'FAIL',
    ex.passThreshold,
    ...exScores,
    pr.totalPoints,
    pr.passed ? 'PASS' : 'FAIL',
    pr.passThreshold,
    ...prScores,
  ];
}

/**
 * Returns the export filename with today's date.
 * Format: uplift-compare-YYYY-MM-DD.xlsx
 */
export function buildFilename(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `uplift-compare-${today}.xlsx`;
}

/**
 * Assembles and downloads a .xlsx file containing all projects.
 * One row per project. Columns: raw inputs + existing criterion scores + proposed criterion scores.
 * Entirely browser-side — no server request.
 */
export function exportXlsx(projects: Project[]): void {
  if (projects.length === 0) return;

  // Use first project to derive stable header structure
  const sampleEx = scoreExisting(projects[0].inputs);
  const samplePr = scoreProposed(projects[0].inputs);
  const headers = buildHeaders(sampleEx, samplePr);
  const rows = projects.map(buildRow);

  const ws = utils.aoa_to_sheet([headers, ...rows]);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Projects');
  writeFileXLSX(wb, buildFilename());
}
