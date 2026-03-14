# Phase 1: Scoring Engine - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Pure scoring functions with unit tests and validated rule encoding for both the existing and proposed NZ Screen Production Rebate 5% Uplift points tests. No UI, no persistence beyond a Zustand store skeleton with `schemaVersion`. Scores are always recomputed from raw inputs — never stored as source of truth.

</domain>

<decisions>
## Implementation Decisions

### Tier resolution for multi-level criteria
- **Highest-qualifying-tier-wins** across all tiered criteria in both systems — a production hits the highest threshold it qualifies for and gets that tier's points, not a sum of all tiers passed
- Existing E2 and E3 explicitly state "not cumulative" — same logic applies universally
- Proposed criteria showing "1 or 2" or "1 - 3" in the Points column are the same pattern expressed differently (e.g., proposed A3: 75% → 1pt, 90% → 2pts)

### Count-per-person pattern (separate from tier pattern)
- Named-role sections use a **count × points-per-person** model, distinct from threshold tiers
- Existing C4 / Proposed B3 (Above-the-Line): up to 3 qualifying persons × 3pts each = 0-9pts
- Existing C5 / Proposed B4 (Below-the-Line key): count of qualifying persons from named list, capped at 4pts
- Existing C6 / Proposed B5 (Below-the-Line additional): count of qualifying persons from named list, capped at 4pts (note: proposed awards 0.5pts each, existing awards 1pt each)
- Existing C7 / Proposed B6 (Lead cast): 1 position, binary (existing 3pts, proposed 4pts)
- Existing C8 / Proposed B7 (Supporting cast): up to 3 positions × 1pt each
- Existing C9 / Proposed B8 (Casting): 3-option selector — None / Casting Associate (1pt) / Casting Director (2pts), mutually exclusive

### Input field granularity for personnel
- **Counts, not per-role checkboxes** for all named-role sections
- Above-the-line: "How many ATL positions are QPs?" (0-3)
- Below-the-line key crew: "How many key BTL positions are QPs?" (0-4 cap in existing C5, 0-4 cap in proposed B4)
- Below-the-line additional crew: "How many additional BTL positions are QPs?" (0-4 cap in existing C6, 0-8 in proposed B5 at 0.5pts each)
- Lead cast: binary yes/no
- Supporting cast: count (0-3)
- Casting: 3-option selector (None / Associate / Director)
- Percentage thresholds (cast %, crew %) use a single percentage input

### One-system-only criteria
- Criteria that don't exist in the other system display as **"N/A"** in scoring results — not 0, not hidden
- This makes the side-by-side comparison informative: users see what one system rewards that the other doesn't

**Existing-only criteria (show N/A in proposed results):**
- A1-A3 Sustainability (7pts)
- B1 Studio Lease (2pts)
- C3 Maori Crew 10% (1pt)
- C10 Lead Cast/ATL Maori (2pts)
- E1-E3 Innovation & Infrastructure (8pts)

**Proposed-only criteria (show N/A in existing results):**
- D3 Location Announcement (1pt)
- A4 Regional Filming 10% tier (existing B5 only has 25% threshold)
- B1 Cast 60% tier (existing C1 only has 80%)
- B5 half-point scoring for additional BTL crew

### Shared inputs with different thresholds
- Where both systems share a criterion but with different thresholds, a single raw input feeds both engines
- Each engine silently applies its own thresholds (e.g., VFX: same percentage input, existing scores at 50/75/90%, proposed at 30/50/75%)
- No special handling needed — the comparison naturally reveals where thresholds diverge

### Premiere scoring (different input shapes per system)
- **Existing F1:** Single choice — None / NZ Premiere (2pts) / World Premiere (3pts)
- **Proposed D1:** Two independent yes/no inputs — NZ Premiere (2pts) + International Promotion Agreement (2pts), can earn both (4pts)
- These sections have **different input shapes** per system — this is acceptable given the fundamental restructuring

### Skills & development inputs
- Seminars, attachments, internships share count-based inputs across both systems
- Each engine applies its own thresholds (e.g., internship count needed varies by QNZPE band, proposed requires fewer hours/positions)
- QNZPE dollar amount determines which threshold band applies within each engine

### Claude's Discretion
- TypeScript type structure for `ProjectInputs` and scoring result types
- Unit test framework choice and test organization
- Internal helper function design
- How to structure the scoring spec translation (inline comments vs. separate doc)
- Zustand store skeleton design

</decisions>

<specifics>
## Specific Ideas

- Both source documents (.docx) are in the project root and serve as the authoritative reference for all scoring rules
- The existing test has 85 max points, 40 minimum to pass (must include mandatory 3pts from A1 Sustainability)
- The proposed test has 70 max points, 20 minimum for QNZPE <$100m, 30 minimum for QNZPE >=$100m, no mandatory section
- STATE.md flags the developer-facing scoring spec (translating both .docx files into exact numeric rules) as the single highest-risk item — this must be validated before scoring code is written

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no source code exists yet

### Established Patterns
- None yet — this phase establishes the foundational patterns

### Integration Points
- Scoring functions will be consumed by Phase 3 (Core UI) for live scoring display
- `ProjectInputs` type will be used by Phase 2 (Data Layer) for seed data generation and Zustand store shape
- Zustand store skeleton (`schemaVersion` field) initialised in this phase, fleshed out in Phase 2

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-scoring-engine*
*Context gathered: 2026-03-13*
