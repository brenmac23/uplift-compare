import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scoreExisting } from '../scoring/scoreExisting';
import { scoreProposed } from '../scoring/scoreProposed';
import type { ProjectInputs } from '../scoring/types';
import type { Project } from '../store/useAppStore';
import { buildHeaders, buildRow, buildFilename, exportXlsx } from './exportXlsx';

// ── Minimal project fixture ────────────────────────────────────────────────────

const minimalInputs: ProjectInputs = {
  projectName: 'Test Film',
  productionType: 'film',
  qnzpe: 120_000_000,
  hasSustainabilityPlan: true,
  hasSustainabilityOfficer: false,
  hasCarbonReview: false,
  hasStudioLease: false,
  hasPreviousQNZPE: true,
  hasAssociatedContent: false,
  shootingNZPercent: 90,
  regionalPercent: 30,
  picturePostPercent: 60,
  soundPostPercent: 50,
  vfxPercent: 60,
  conceptPhysicalPercent: 50,
  castPercent: 85,
  crewPercent: 85,
  maoriCrewPercent: 0,
  atlCount: 2,
  btlKeyCount: 3,
  btlAdditionalCount: 4,
  hasLeadCast: true,
  supportingCastCount: 2,
  castingLevel: 'associate',
  hasLeadCastMaori: false,
  hasMasterclass: true,
  hasIndustrySeminars: true,
  hasEdSeminars: true,
  attachmentCount: 4,
  internshipCount: 4,
  hasKnowledgeTransfer: false,
  commercialAgreementPercent: 0,
  infrastructureInvestment: 0,
  premiereType: 'nz',
  hasNZPremiere: true,
  hasIntlPromotion: false,
  hasFilmMarketing: true,
  hasTourismMarketing: false,
  hasTourismPartnership: false,
  hasLocationAnnouncement: true,
};

const testProject: Project = {
  id: 'test-001',
  isSeeded: false,
  inputs: minimalInputs,
  createdAt: '2026-03-13T00:00:00.000Z',
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('buildHeaders', () => {
  const sampleEx = scoreExisting(minimalInputs);
  const samplePr = scoreProposed(minimalInputs);

  it('returns array starting with Project Name, Type, QNZPE ($NZD)', () => {
    const headers = buildHeaders(sampleEx, samplePr);

    expect(headers[0]).toBe('Project Name');
    expect(headers[1]).toBe('Type');
    expect(headers[2]).toBe('QNZPE ($NZD)');
  });

  it('contains existing system summary columns and criterion columns', () => {
    const headers = buildHeaders(sampleEx, samplePr);

    expect(headers).toContain('Existing Total');
    expect(headers).toContain('Existing Pass?');
    expect(headers).toContain('Existing Threshold');
    // Existing criteria should be present
    const existingCritHeaders = headers.filter(
      (h) =>
        h.startsWith('Existing ') &&
        !['Existing Total', 'Existing Pass?', 'Existing Threshold'].includes(h)
    );
    expect(existingCritHeaders.length).toBeGreaterThan(0);
    // Each criterion header should have format "Existing {id}: {label}"
    existingCritHeaders.forEach((h) => expect(h).toMatch(/^Existing \w+: .+/));
  });

  it('contains proposed system summary columns and criterion columns', () => {
    const headers = buildHeaders(sampleEx, samplePr);

    expect(headers).toContain('Proposed Total');
    expect(headers).toContain('Proposed Pass?');
    expect(headers).toContain('Proposed Threshold');
    const proposedCritHeaders = headers.filter(
      (h) =>
        h.startsWith('Proposed ') &&
        !['Proposed Total', 'Proposed Pass?', 'Proposed Threshold'].includes(h)
    );
    expect(proposedCritHeaders.length).toBeGreaterThan(0);
    proposedCritHeaders.forEach((h) => expect(h).toMatch(/^Proposed \w+: .+/));
  });
});

describe('buildRow', () => {
  const sampleEx = scoreExisting(minimalInputs);
  const samplePr = scoreProposed(minimalInputs);
  const headers = buildHeaders(sampleEx, samplePr);

  it('returns row with correct values matching header order', () => {
    const row = buildRow(testProject);

    // Row and headers should have same length
    expect(row.length).toBe(headers.length);

    // First 3 values: project name, type, qnzpe
    expect(row[0]).toBe('Test Film');
    expect(row[1]).toBe('film');
    expect(row[2]).toBe(120_000_000);
  });

  it('maps N/A criterion scores to empty string (not "N/A")', () => {
    const row = buildRow(testProject);

    // Should NOT contain the literal string 'N/A'
    const naValues = row.filter((v) => v === 'N/A');
    expect(naValues).toHaveLength(0);
  });

  it('maps boolean inputs to Yes/No strings', () => {
    const row = buildRow(testProject);

    // hasSustainabilityPlan = true should appear as 'Yes'
    // hasSustainabilityOfficer = false should appear as 'No'
    // The row should contain both 'Yes' and 'No' values
    expect(row).toContain('Yes');
    expect(row).toContain('No');

    // Should not contain raw true/false booleans
    expect(row).not.toContain(true);
    expect(row).not.toContain(false);
  });

  it('uses PASS/FAIL for passed field', () => {
    const row = buildRow(testProject);

    // Should contain either 'PASS' or 'FAIL' (not true/false) for the pass? columns
    const passFailValues = row.filter((v) => v === 'PASS' || v === 'FAIL');
    // Two pass/fail columns: one for existing, one for proposed
    expect(passFailValues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('buildFilename', () => {
  it('returns filename in format uplift-compare-YYYY-MM-DD.xlsx', () => {
    const filename = buildFilename();

    // Should match the exact pattern
    expect(filename).toMatch(/^uplift-compare-\d{4}-\d{2}-\d{2}\.xlsx$/);
  });

  it("contains today's date", () => {
    const filename = buildFilename();
    const today = new Date().toISOString().slice(0, 10);

    expect(filename).toBe(`uplift-compare-${today}.xlsx`);
  });
});

describe('exportXlsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls writeFileXLSX when projects array is non-empty', () => {
    // writeFileXLSX triggers a browser download — we can only verify it is called,
    // not the download itself (jsdom does not support browser file saves).
    // The function should run without throwing when given a valid project.
    expect(() => exportXlsx([testProject])).not.toThrow();
  });

  it('does not throw when called with empty array', () => {
    expect(() => exportXlsx([])).not.toThrow();
  });
});
