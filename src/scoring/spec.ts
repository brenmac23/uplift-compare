/**
 * Numeric scoring rule constants for both scoring systems.
 *
 * These constants are the single source of truth for all threshold values and
 * point assignments. Scoring functions reference these — never inline magic numbers.
 *
 * Source documents:
 *   - Existing_Production_Rebate_5_Uplift_points_test.docx
 *   - Proposed_Production_Rebate_5_Uplift_points_test.docx
 */

// ── Existing System Spec ────────────────────────────────────────────────────

export const EXISTING_SPEC = {
  // ── Section A: Sustainability (7 pts max) ─────────────────────────────────
  sectionA: {
    label: 'Sustainability',
    maxPoints: 7,
    a1: { id: 'A1', label: 'Sustainability Action Plan and Sustainability Report', points: 3, mandatory: true },
    a2: { id: 'A2', label: 'Sustainability Officer', points: 2 },
    a3: { id: 'A3', label: 'Carbon Emissions Review', points: 2 },
  },

  // ── Section B: NZ Production Activity (21 pts max) ────────────────────────
  sectionB: {
    label: 'New Zealand Production Activity',
    maxPoints: 21,
    b1: { id: 'B1', label: 'NZ Studio Lease', points: 2 },
    b2: { id: 'B2', label: 'Previous QNZPE ≥ $100m', points: 2 },
    b3: { id: 'B3', label: 'Associated Content (sequel/prequel/spin-off, within 3 years)', points: 1 },
    // B4: Shooting in NZ — tiered [threshold%, points]
    b4: {
      id: 'B4',
      label: 'Shooting in New Zealand',
      maxPoints: 2,
      tiers: [[90, 2], [75, 1]] as Array<[number, number]>,
    },
    // B5: Regional filming — single flat threshold (not tiered)
    b5: {
      id: 'B5',
      label: 'Shooting in Regions (≥25% Regional Filming)',
      points: 2,
      threshold: 25,
    },
    // B6: Picture post-production — tiered
    b6: {
      id: 'B6',
      label: 'Picture Post-Production in NZ',
      maxPoints: 3,
      tiers: [[75, 3], [50, 2], [30, 1]] as Array<[number, number]>,
    },
    // B7: Sound post-production — tiered
    b7: {
      id: 'B7',
      label: 'Sound Post-Production in NZ',
      maxPoints: 3,
      tiers: [[75, 3], [50, 2], [30, 1]] as Array<[number, number]>,
    },
    // B8: VFX — tiered (higher thresholds than proposed)
    b8: {
      id: 'B8',
      label: 'Digital or Visual Effects in NZ',
      maxPoints: 3,
      tiers: [[90, 3], [75, 2], [50, 1]] as Array<[number, number]>,
    },
    // B9: Concept design & physical effects — tiered
    b9: {
      id: 'B9',
      label: 'Concept Design and Physical Effects in NZ',
      maxPoints: 3,
      tiers: [[90, 3], [75, 2], [50, 1]] as Array<[number, number]>,
    },
  },

  // ── Section C: NZ Personnel (31 pts max) ──────────────────────────────────
  sectionC: {
    label: 'New Zealand Personnel',
    maxPoints: 31,
    // C1: Cast — single 80% threshold
    c1: {
      id: 'C1',
      label: 'Cast ≥80% Qualifying Persons',
      points: 2,
      threshold: 80,
    },
    // C2: Crew — single 80% threshold
    c2: {
      id: 'C2',
      label: 'Crew ≥80% Qualifying Persons',
      points: 1,
      threshold: 80,
    },
    // C3: Māori crew — single 10% threshold (existing only)
    c3: {
      id: 'C3',
      label: 'Māori Crew ≥10% (of QP crew)',
      points: 1,
      threshold: 10,
    },
    // C4: ATL crew — count × 3pts, max 3 persons = 9pts
    c4: {
      id: 'C4',
      label: 'Above-the-Line Crew (up to 3 QPs)',
      pointsEach: 3,
      maxCount: 3,
      maxPoints: 9,
    },
    // C5: BTL key crew — count × 1pt, capped at 4pts
    c5: {
      id: 'C5',
      label: 'Below-the-Line Key Crew (DOP, 1st AD, Editor, VFX Sup, Costume, Composer, Prod Designer)',
      pointsEach: 1,
      cap: 4,
      maxPoints: 4,
    },
    // C6: BTL additional crew — count × 1pt, capped at 4pts (existing: 1pt each)
    c6: {
      id: 'C6',
      label: 'More Below-the-Line Crew (additional roles)',
      pointsEach: 1,
      cap: 4,
      maxPoints: 4,
    },
    // C7: Lead cast — binary, 3pts (NOTE: existing text says "4 points" in criteria but column says 3 — verified: 3pts)
    c7: {
      id: 'C7',
      label: 'Lead Cast (1 QP)',
      points: 3,
    },
    // C8: Supporting cast — count × 1pt, max 3 = 3pts
    c8: {
      id: 'C8',
      label: 'Supporting Cast (up to 3 QPs)',
      pointsEach: 1,
      maxCount: 3,
      maxPoints: 3,
    },
    // C9: Casting selector
    c9: {
      id: 'C9',
      label: 'Casting (Director 2pts, Associate 1pt)',
      directorPoints: 2,
      associatePoints: 1,
      maxPoints: 2,
    },
    // C10: Lead cast/ATL Māori (existing only)
    c10: {
      id: 'C10',
      label: 'Lead Cast or ATL Crew is Māori',
      points: 2,
    },
  },

  // ── Section D: Skills & Talent Development (6 pts max) ───────────────────
  sectionD: {
    label: 'Skills and Talent Development',
    maxPoints: 6,
    // D1: Masterclass (existing only)
    d1: {
      id: 'D1',
      label: 'Masterclass(es) to NZ Screen Sector',
      points: 2,
    },
    // D2: Educational seminars
    d2: {
      id: 'D2',
      label: 'Educational Seminars',
      points: 1,
    },
    // D3: Attachments — tiered by QNZPE
    d3: {
      id: 'D3',
      label: 'Paid Attachment Positions for QPs',
      points: 2,
      // thresholds: { qnzpeUnder100m: minCount, qnzpe100mPlus: minCount }
      thresholds: { under100m: 2, over100m: 4 },
    },
    // D4: Internships — tiered by QNZPE
    d4: {
      id: 'D4',
      label: 'Paid Internships',
      points: 1,
      thresholds: { under50m: 4, under150m: 8, over150m: 10 },
    },
  },

  // ── Section E: Innovation & Infrastructure (8 pts max) ────────────────────
  sectionE: {
    label: 'Innovation and Infrastructure',
    maxPoints: 8,
    // E1: Knowledge transfer (binary)
    e1: {
      id: 'E1',
      label: 'Transfer of Knowledge of Production Method or Technology',
      points: 2,
    },
    // E2: Commercial agreement — tiered as % of QNZPE; NOT cumulative
    e2: {
      id: 'E2',
      label: 'Commercial Agreement for New Production Method/Technology',
      maxPoints: 3,
      tiers: [[1, 3], [0.5, 2], [0.25, 1]] as Array<[number, number]>,
    },
    // E3: Infrastructure investment — tiered in whole NZD dollars; NOT cumulative
    e3: {
      id: 'E3',
      label: 'Investment in NZ Infrastructure',
      maxPoints: 3,
      tiers: [[2_000_000, 3], [1_000_000, 2], [500_000, 1]] as Array<[number, number]>,
    },
  },

  // ── Section F: Marketing, Promoting & Showcasing NZ (12 pts max) ──────────
  sectionF: {
    label: 'Marketing, Promoting, and Showcasing New Zealand',
    maxPoints: 12,
    // F1: Premiere selector (NZ premiere or world premiere)
    f1: {
      id: 'F1',
      label: 'Premiere in New Zealand',
      nzPoints: 2,
      worldPoints: 3,
      maxPoints: 3,
    },
    f2: { id: 'F2', label: 'Film Marketing Partnership with NZFC', points: 3 },
    f3: { id: 'F3', label: 'Tourism Marketing Partnership with TNZ', points: 3 },
    f4: { id: 'F4', label: 'Bespoke Partnership with Tourism New Zealand', points: 3 },
  },

  // ── Overall ────────────────────────────────────────────────────────────────
  maxPoints: 85,
  passThreshold: 40,
  mandatoryCriterionId: 'A1',
} as const;


// ── Proposed System Spec ────────────────────────────────────────────────────

export const PROPOSED_SPEC = {
  // ── Section A: NZ Production Activity (20 pts max) ────────────────────────
  sectionA: {
    label: 'New Zealand Production Activity',
    maxPoints: 20,
    a1: { id: 'A1', label: 'Previous QNZPE ≥ $100m', points: 2 },
    a2: { id: 'A2', label: 'Associated Content (sequel/prequel/spin-off, within 5 years)', points: 2 },
    // A3: Shooting in NZ — tiered
    a3: {
      id: 'A3',
      label: 'Shooting in New Zealand',
      maxPoints: 2,
      tiers: [[90, 2], [75, 1]] as Array<[number, number]>,
    },
    // A4: Regional filming — tiered (proposed adds 10% tier)
    a4: {
      id: 'A4',
      label: 'Shooting in Regions',
      maxPoints: 2,
      tiers: [[25, 2], [10, 1]] as Array<[number, number]>,
    },
    // A5: Picture post-production — tiered (same as existing)
    a5: {
      id: 'A5',
      label: 'Picture Post-Production in NZ',
      maxPoints: 3,
      tiers: [[75, 3], [50, 2], [30, 1]] as Array<[number, number]>,
    },
    // A6: Sound post-production — tiered (same as existing)
    a6: {
      id: 'A6',
      label: 'Sound Post-Production in NZ',
      maxPoints: 3,
      tiers: [[75, 3], [50, 2], [30, 1]] as Array<[number, number]>,
    },
    // A7: VFX — tiered (lower thresholds than existing)
    a7: {
      id: 'A7',
      label: 'Digital or Visual Effects in NZ',
      maxPoints: 3,
      tiers: [[75, 3], [50, 2], [30, 1]] as Array<[number, number]>,
    },
    // A8: Concept design & physical effects — tiered (lower thresholds than existing)
    a8: {
      id: 'A8',
      label: 'Concept Design and Physical Effects in NZ',
      maxPoints: 3,
      tiers: [[75, 3], [50, 2], [30, 1]] as Array<[number, number]>,
    },
  },

  // ── Section B: NZ Personnel (32 pts max) ──────────────────────────────────
  sectionB: {
    label: 'New Zealand Personnel',
    maxPoints: 32,
    // B1: Cast — tiered (proposed adds 60% tier, existing has only 80%)
    b1: {
      id: 'B1',
      label: 'Cast (60%→2pts, 80%→3pts)',
      maxPoints: 3,
      tiers: [[80, 3], [60, 2]] as Array<[number, number]>,
    },
    // B2: Crew — single 80% threshold (more points than existing: 3 vs 1)
    b2: {
      id: 'B2',
      label: 'Crew ≥80% Qualifying Persons',
      points: 3,
      threshold: 80,
    },
    // B3: ATL crew — count × 3pts, max 3 persons = 9pts (same as existing C4)
    b3: {
      id: 'B3',
      label: 'Above-the-Line Crew (up to 3 QPs)',
      pointsEach: 3,
      maxCount: 3,
      maxPoints: 9,
    },
    // B4: BTL key crew — count × 1pt, capped at 4pts (same as existing C5)
    b4: {
      id: 'B4',
      label: 'Below-the-Line Key Crew (DOP, 1st AD, Editor, VFX Sup, Costume, Composer, Prod Designer)',
      pointsEach: 1,
      cap: 4,
      maxPoints: 4,
    },
    // B5: BTL additional crew — count × 0.5pt, capped at 4pts (proposed: 0.5pts each vs existing 1pt each)
    b5: {
      id: 'B5',
      label: 'Additional Below-the-Line Crew (up to 8 QPs at 0.5pt each)',
      pointsEach: 0.5,
      cap: 4,
      maxPoints: 4,
    },
    // B6: Lead cast — binary, 4pts (more than existing C7's 3pts)
    b6: {
      id: 'B6',
      label: 'Lead Cast (1 QP)',
      points: 4,
    },
    // B7: Supporting cast — count × 1pt, max 3 = 3pts (same as existing C8)
    b7: {
      id: 'B7',
      label: 'Supporting Cast (up to 3 QPs)',
      pointsEach: 1,
      maxCount: 3,
      maxPoints: 3,
    },
    // B8: Casting selector (same point values as existing C9)
    b8: {
      id: 'B8',
      label: 'Casting (Director 2pts, Associate 1pt)',
      directorPoints: 2,
      associatePoints: 1,
      maxPoints: 2,
    },
  },

  // ── Section C: Skills & Talent Development (6 pts max) ───────────────────
  sectionC: {
    label: 'Skills and Talent Development',
    maxPoints: 6,
    // C1: Industry seminars (proposed only — replaces masterclass from existing D1)
    c1: {
      id: 'C1',
      label: 'Seminars — Screen Industry',
      points: 1,
    },
    // C2: Educational seminars
    c2: {
      id: 'C2',
      label: 'Seminars — Education Sector',
      points: 1,
    },
    // C3: Attachments — tiered by QNZPE (same thresholds as existing D3)
    c3: {
      id: 'C3',
      label: 'Paid Attachment Positions for QPs',
      points: 2,
      thresholds: { under100m: 2, over100m: 4 },
    },
    // C4: Internships — tiered by QNZPE (fewer required than existing D4)
    c4: {
      id: 'C4',
      label: 'Paid Internships',
      points: 2,
      thresholds: { under100m: 2, over100m: 4 },
    },
  },

  // ── Section D: Marketing, Promoting & Showcasing NZ (12 pts max) ──────────
  sectionD: {
    label: 'Marketing, Promoting, and Showcasing New Zealand',
    maxPoints: 12,
    // D1: Premiere — two independent yes/no inputs (replaces existing F1 selector)
    d1: {
      id: 'D1',
      label: 'Premiere (NZ Premiere 2pts + Intl Promotion 2pts)',
      nzPremierePoints: 2,
      intlPromotionPoints: 2,
      maxPoints: 4,
    },
    d2: { id: 'D2', label: 'Bespoke Marketing Partnership with NZFC', points: 3 },
    // D3: Location announcement (proposed only)
    d3: { id: 'D3', label: 'Location Announcement', points: 1 },
    // D4: Tourism partnership — 4pts (more than existing F4's 3pts)
    d4: { id: 'D4', label: 'Bespoke Partnership with Tourism New Zealand', points: 4 },
  },

  // ── Overall ────────────────────────────────────────────────────────────────
  maxPoints: 70,
  passThresholdUnder100m: 20,
  passThresholdOver100m: 30,
  qnzpeThreshold: 100_000_000,
} as const;
