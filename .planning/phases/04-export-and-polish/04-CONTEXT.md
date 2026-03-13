# Phase 4: Export and Polish - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Excel export of all project scoring data, password gate for site access, tooltip quality review, and minor visual polish. The app becomes export-ready and access-controlled. No new screens or major UI changes.

</domain>

<decisions>
## Implementation Decisions

### Export content
- Export all projects at once — single .xlsx file containing every project
- Full criterion breakdown — every criterion's score for each project, not just totals
- Include raw inputs AND scores — full audit trail with input values alongside resulting scores
- One sheet, wide layout — all projects as rows, all criteria as columns in a single sheet

### Export trigger
- Export button lives in the NavBar alongside Import and New Project
- Always exports all projects regardless of any active summary page filters
- Filename includes date: `uplift-compare-2026-03-13.xlsx`

### Password gate
- Simple client-side password check on app load — blocks casual access, not true security
- Password stored as Netlify environment variable (VITE_APP_PASSWORD or similar) — not hardcoded in source
- Session persists via sessionStorage — once entered, valid until browser tab closes
- Full-screen password prompt before any app content is visible

### Polish and tooltips
- Claude reviews and improves tooltip text for clarity and completeness
- Minor visual tweaks if Claude spots issues while working — no specific fixes requested
- Basic responsive handling — should not break on tablet/phone but doesn't need small-screen optimisation

### Claude's Discretion
- Export feedback (toast/notification vs silent download)
- xlsx library choice (SheetJS, ExcelJS, etc.)
- Exact column ordering and header labels in the spreadsheet
- Password prompt UI design
- Which visual tweaks to apply during polish
- Exact tooltip wording improvements
- Responsive breakpoint handling

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scoreExisting()` and `scoreProposed()` (src/scoring/): Pure functions returning full `ScoringResult` with criterion-level detail — drives export data
- `ProjectInputs` type (src/scoring/types.ts): 40+ input fields — defines the raw input columns for export
- `ScoringResult`, `SectionResult`, `CriterionResult` types: Structured result types for criterion-level export
- `useAppStore` (src/store/useAppStore.ts): `projects` array with all project data — export source
- `NavBar` (src/components/NavBar.tsx): Fixed top nav with Import and New Project buttons — export button goes here
- `CRITERION_TOOLTIPS` (src/lib/criterionTooltips.ts): Existing tooltip map — target for quality review
- shadcn/ui components: Button, Dialog — reusable for export button and password prompt

### Established Patterns
- Zustand 5 with persist middleware for localStorage
- shadcn/ui + Tailwind CSS for all UI components
- Blue pass / orange fail colour scheme
- Scores always recomputed from raw inputs (never stored)
- QNZPE stored as whole NZD dollars (100_000_000 for $100m)

### Integration Points
- NavBar needs export button added alongside existing Import/New Project buttons
- App.tsx or a wrapper component needs password gate before rendering routes
- `useAppStore` projects array + scoring functions = export data source
- Environment variable for password needs Netlify config

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-export-and-polish*
*Context gathered: 2026-03-13*
