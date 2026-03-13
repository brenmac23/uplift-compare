/**
 * Raw production data inputs consumed by both scoring engines.
 * All percentage fields are expressed as 0-100 (not 0-1).
 * All dollar fields are in whole NZD (e.g. 100_000_000 for $100m).
 * All count fields are non-negative integers unless noted.
 */
export interface ProjectInputs {
  // ── Identity (not scored, used for display) ──────────────────────────────

  /** Human-readable name for the production. */
  projectName: string;

  // ── Financial ─────────────────────────────────────────────────────────────

  /**
   * Qualifying New Zealand Production Expenditure in whole NZD dollars.
   * Used by proposed engine pass threshold: >= 100_000_000 → 30pt threshold; < 100_000_000 → 20pt threshold.
   * Also used by existing D3/D4 and proposed C3/C4 attachment/internship tier logic.
   */
  qnzpe: number;

  // ── Section A: Sustainability (existing only) ─────────────────────────────

  /**
   * Existing A1 (mandatory, 3pts): Production has a Sustainability Action Plan AND
   * submits a final Sustainability Report. This is the only mandatory criterion —
   * failing it causes the existing test to fail regardless of total score.
   */
  hasSustainabilityPlan: boolean;

  /**
   * Existing A2 (2pts): Experienced sustainability officer appointed in pre-production,
   * overseeing Sustainability Action Plan, training a trainee, and delivering BTS video.
   */
  hasSustainabilityOfficer: boolean;

  /**
   * Existing A3 (2pts): Independent carbon emissions review conducted by NZFC pre-approved provider.
   */
  hasCarbonReview: boolean;

  // ── Section B (existing) / Section A (proposed): NZ Production Activity ──

  /**
   * Existing B1 (2pts, existing only): Production filmed in NZ studio leased by production
   * or Related Entity for at least 3 years. N/A in proposed.
   */
  hasStudioLease: boolean;

  /**
   * Existing B2 (2pts) / Proposed A1 (2pts): Applicant/Related Entity has had approved QNZPE
   * of at least $100m for previous productions in NZ in the preceding 5 years.
   */
  hasPreviousQNZPE: boolean;

  /**
   * Existing B3 (1pt) / Proposed A2 (2pts): Production is a sequel, prequel, or spin-off
   * from a production that previously shot in NZ.
   * Existing: within last 3 years. Proposed: within last 5 years.
   */
  hasAssociatedContent: boolean;

  /**
   * Existing B4 / Proposed A3: Percentage of Principal Photography days in NZ (0-100).
   * Existing: 75% → 1pt, 90% → 2pts. Proposed: same thresholds (1 or 2 pts).
   */
  shootingNZPercent: number;

  /**
   * Existing B5 / Proposed A4: Percentage of NZ Principal Photography days that are Regional Filming (0-100).
   * Existing: 25% → 2pts (flat, no tiering). Proposed: 10% → 1pt, 25% → 2pts (tiered).
   */
  regionalPercent: number;

  /**
   * Existing B6 / Proposed A5: Percentage of total picture post-production expenditure that is QNZPE (0-100).
   * Both: 30% → 1pt, 50% → 2pts, 75% → 3pts.
   */
  picturePostPercent: number;

  /**
   * Existing B7 / Proposed A6: Percentage of total sound post-production expenditure that is QNZPE (0-100).
   * Both: 30% → 1pt, 50% → 2pts, 75% → 3pts.
   */
  soundPostPercent: number;

  /**
   * Existing B8 / Proposed A7: Percentage of total digital/visual effects expenditure that is QNZPE (0-100).
   * Existing: 50% → 1pt, 75% → 2pts, 90% → 3pts.
   * Proposed: 30% → 1pt, 50% → 2pts, 75% → 3pts.
   */
  vfxPercent: number;

  /**
   * Existing B9 / Proposed A8: Percentage of total concept design & physical effects expenditure that is QNZPE (0-100).
   * Existing: 50% → 1pt, 75% → 2pts, 90% → 3pts.
   * Proposed: 30% → 1pt, 50% → 2pts, 75% → 3pts.
   */
  conceptPhysicalPercent: number;

  // ── Section C (existing) / Section B (proposed): NZ Personnel ────────────

  /**
   * Existing C1 / Proposed B1: Percentage of total cast who are Qualifying Persons (0-100).
   * Existing: 80% → 2pts (no 60% tier).
   * Proposed: 60% → 2pts, 80% → 3pts.
   */
  castPercent: number;

  /**
   * Existing C2 (1pt) / Proposed B2 (3pts): 80% or more of total crew are Qualifying Persons.
   * Single threshold in both systems; different point values.
   */
  crewPercent: number;

  /**
   * Existing C3 (1pt, existing only): 10% or more of crew (qualifying persons from C2) are Māori.
   * N/A in proposed.
   */
  maoriCrewPercent: number;

  /**
   * Existing C4 / Proposed B3: Number of Above-the-Line positions (Director / Producer /
   * Executive Producer / Associate Producer / Co-Producer / Writer / Showrunner) that are
   * Qualifying Persons. Range 0-3. Each qualifies for 3pts. Max 9pts.
   */
  atlCount: number;

  /**
   * Existing C5 / Proposed B4: Number of key Below-the-Line positions (DOP / 1st AD / Editor /
   * VFX Supervisor / Costume Designer / Composer / Production Designer) that are Qualifying Persons.
   * Each qualifies for 1pt, capped at 4pts.
   */
  btlKeyCount: number;

  /**
   * Existing C6 / Proposed B5: Number of additional Below-the-Line positions that are Qualifying Persons.
   * Existing: 1pt each, capped at 4pts. Proposed: 0.5pts each, capped at 4pts (so 8 positions = 4pts).
   */
  btlAdditionalCount: number;

  /**
   * Existing C7 (3pts) / Proposed B6 (4pts): At least one lead cast member is a Qualifying Person.
   * Binary yes/no.
   */
  hasLeadCast: boolean;

  /**
   * Existing C8 / Proposed B7: Number of supporting cast positions that are Qualifying Persons.
   * Range 0-3. Each qualifies for 1pt. Max 3pts.
   */
  supportingCastCount: number;

  /**
   * Existing C9 / Proposed B8: Casting role selector.
   * 'none' = 0pts, 'associate' = 1pt (Casting Associate QP), 'director' = 2pts (Casting Director QP).
   * Mutually exclusive — only the highest-value role claimed.
   */
  castingLevel: 'none' | 'associate' | 'director';

  /**
   * Existing C10 (2pts, existing only): At least one lead cast or ATL crew member (from C4 or C7) is Māori.
   * N/A in proposed.
   */
  hasLeadCastMaori: boolean;

  // ── Section D (existing) / Section C (proposed): Skills & Talent Development

  /**
   * Existing D1 (2pts, existing only): Masterclass(es) delivered by key production personnel
   * to NZ screen sector participants. Min 4hrs for QNZPE ≤ $100m, 8hrs for QNZPE > $100m.
   * N/A in proposed (replaced by separate industry seminar criterion C1).
   */
  hasMasterclass: boolean;

  /**
   * Proposed C1 (1pt, proposed only): Seminar(s) delivered to NZ screen industry participants.
   * 1 seminar for QNZPE < $100m, 2 seminars for QNZPE ≥ $100m. Each min 45 mins.
   * N/A in existing (existing has D1 masterclass instead).
   */
  hasIndustrySeminars: boolean;

  /**
   * Existing D2 (1pt) / Proposed C2 (1pt): Educational seminars for secondary/vocational/tertiary students.
   * Existing: 1 seminar for QNZPE < $50m, 2 for $50m-$100m, 3 for QNZPE > $100m (each 90mins).
   * Proposed: 1 seminar for QNZPE < $100m, 2 for QNZPE ≥ $100m (each 45mins).
   * Input captures whether the required number of seminars has been delivered.
   */
  hasEdSeminars: boolean;

  /**
   * Existing D3 (2pts) / Proposed C3 (2pts): Paid and credited attachment positions for QPs with sector experience.
   * Existing: min 2 for QNZPE ≤ $100m, min 4 for QNZPE > $100m.
   * Proposed: same thresholds.
   * Input is the number of attachment positions provided.
   */
  attachmentCount: number;

  /**
   * Existing D4 (1pt) / Proposed C4 (2pts): Paid internship positions for QPs.
   * Existing: min 4 for QNZPE ≤ $50m, min 8 for QNZPE ≤ $150m, min 10 for QNZPE > $150m.
   * Proposed: min 2 for QNZPE ≤ $100m, min 4 for QNZPE > $100m.
   * Input is the number of internship positions provided.
   */
  internshipCount: number;

  // ── Section E: Innovation & Infrastructure (existing only) ────────────────

  /**
   * Existing E1 (2pts, existing only): Production method/technology not commonly used in NZ
   * is used, crew trained, and a workshop made available to the screen sector.
   * N/A in proposed.
   */
  hasKnowledgeTransfer: boolean;

  /**
   * Existing E2 (up to 3pts, existing only): Commercial agreement with NZ entity to create/develop
   * new production methods or technologies. Value as percentage of QNZPE (0-100).
   * 0.25% → 1pt, 0.5% → 2pts, 1% → 3pts. Not cumulative.
   * N/A in proposed.
   */
  commercialAgreementPercent: number;

  /**
   * Existing E3 (up to 3pts, existing only): Investment in NZ infrastructure (new/upgraded).
   * Dollar amount in whole NZD. $500k → 1pt, $1m → 2pts, $2m+ → 3pts. Not cumulative.
   * N/A in proposed.
   */
  infrastructureInvestment: number;

  // ── Section F (existing) / Section D (proposed): Marketing & Showcasing NZ

  /**
   * Existing F1: Single premiere type selector.
   * 'none' = 0pts, 'nz' = 2pts (NZ premiere in NZ), 'world' = 3pts (World premiere in NZ).
   * Only applies to existing system — proposed uses hasNZPremiere + hasIntlPromotion instead.
   */
  premiereType: 'none' | 'nz' | 'world';

  /**
   * Proposed D1 part 1 (2pts, proposed only): NZ premiere held in New Zealand.
   * Independent yes/no from hasIntlPromotion — can earn both for 4pts total.
   * N/A in existing (existing uses premiereType selector instead).
   */
  hasNZPremiere: boolean;

  /**
   * Proposed D1 part 2 (2pts, proposed only): Agreement with NZFC to promote NZ at the world/international premiere.
   * Independent yes/no from hasNZPremiere — can earn both for 4pts total.
   * N/A in existing (existing uses premiereType selector instead).
   */
  hasIntlPromotion: boolean;

  /**
   * Existing F2 (3pts) / Proposed D2 (3pts): Bespoke film marketing partnership agreed with NZFC.
   */
  hasFilmMarketing: boolean;

  /**
   * Existing F3 (3pts, existing only): Tourism marketing partnership with Tourism NZ (high impact plan).
   * N/A in proposed (replaced/superseded by hasTourismPartnership + hasLocationAnnouncement).
   */
  hasTourismMarketing: boolean;

  /**
   * Existing F4 (3pts) / Proposed D4 (4pts): Bespoke high-value partnership with Tourism New Zealand.
   * Different point values between systems.
   */
  hasTourismPartnership: boolean;

  /**
   * Proposed D3 (1pt, proposed only): Agreement with NZFC for a location announcement before/at
   * start of Principal Photography. N/A in existing.
   */
  hasLocationAnnouncement: boolean;
}

// ── Result Types ─────────────────────────────────────────────────────────────

/**
 * Result for a single scoring criterion.
 */
export interface CriterionResult {
  /** Criterion ID, e.g. 'A1', 'B3'. */
  id: string;
  /** Human-readable criterion name. */
  label: string;
  /** Points scored. 'N/A' if this criterion does not exist in this scoring system. */
  score: number | 'N/A';
  /** Maximum points available. 'N/A' if not applicable to this scoring system. */
  maxScore: number | 'N/A';
  /** True only for existing A1 (Sustainability Plan & Report), which is mandatory. */
  mandatory?: boolean;
  /** Whether the mandatory requirement was met. Only set when mandatory is true. */
  mandatoryMet?: boolean;
}

/**
 * Aggregated result for a scoring section (e.g. Section A, Section B).
 */
export interface SectionResult {
  /** Section ID, e.g. 'A', 'B'. */
  id: string;
  /** Human-readable section name, e.g. 'Sustainability'. */
  label: string;
  /** Sum of scored points in this section (N/A criteria excluded). */
  totalPoints: number;
  /** Maximum points available in this section. */
  maxPoints: number;
  /** All criteria in this section. */
  criteria: CriterionResult[];
}

/**
 * Overall result returned by scoreExisting() or scoreProposed().
 */
export interface ScoringResult {
  /** Sum of all scored points (N/A criteria excluded). */
  totalPoints: number;
  /** Maximum points available in this scoring system (85 for existing, 70 for proposed). */
  maxPoints: number;
  /** Whether the production passes the test. */
  passed: boolean;
  /**
   * Whether all mandatory criteria were met.
   * Always true for proposed (no mandatory criteria).
   * For existing: true only if A1 was scored > 0.
   */
  mandatoryMet: boolean;
  /** The pass threshold applied: 40 for existing; 20 or 30 for proposed (QNZPE-dependent). */
  passThreshold: number;
  /** Results grouped by section. */
  sections: SectionResult[];
  /** Flat list of all criteria across all sections (convenience accessor). */
  criteria: CriterionResult[];
}
