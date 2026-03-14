# Phase 3: Core UI - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

All three screens (summary, detail, create form) with live scoring, side-by-side scoring breakdowns, filtering, aggregate statistics, project import, tooltips, collapsible sections, and visual polish. The app becomes fully usable for comparing how productions score under both uplift tests.

</domain>

<decisions>
## Implementation Decisions

### Side-by-side scoring layout
- Two columns side by side on the detail screen — existing test on left, proposed on right
- All criteria expanded by default (no collapsed sections on initial load, though sections are collapsible per DISP-05)
- Sticky header at top of each column showing score total and pass/fail verdict — stays visible while scrolling through criteria
- Sections aligned horizontally by equivalent sections (existing B aligns with proposed A for NZ Production Activity, etc.). Gaps shown where one system has sections the other doesn't (e.g. existing A: Sustainability has no proposed equivalent)

### Scoring input editing
- Inputs grouped by scoring section (matching the scoring spec section structure)
- Three-column layout on detail screen: inputs on left, existing scores in middle, proposed scores on right
- Live scoring — scores recompute instantly as user changes any input, no Calculate button
- System-specific inputs (e.g. Sustainability for existing only) shown together with all other inputs, labelled "(Existing only)" or "(Proposed only)" — no hiding or separate grouping

### Summary table and filtering
- Detailed columns: project name, production type, QNZPE, existing score + verdict, proposed score + verdict
- Clicking a project row navigates to the detail screen for that project
- Aggregate statistics displayed as summary cards above the table: pass count per test, "both pass" count
- Filter bar with dropdowns above the table: pass/fail status (per test), production type (film/TV), budget tier (<$100m / >=$100m)
- Clickable stats cards also act as quick filters (e.g. click "32/50 pass existing" to filter to those 32)
- Stats update to reflect the currently filtered view

### Navigation and actions
- Simple top nav bar across all screens: app name "Uplift Compare" on left, "Summary" and "Detail" links on right
- "New Project" and "Import" buttons in the nav bar, accessible from any screen
- Create form opens as a modal dialog (name, QNZPE, production type fields). After creation, navigates to the new project's detail screen
- Project detail screen has a dropdown to switch between projects without going back to summary

### Project import
- File upload only (JSON file) — an "Import" button opens a file picker, user selects a .json file, parsed and validated against ProjectInputs shape

### Visual design
- Tailwind CSS + shadcn/ui for styling and accessible components (tables, dropdowns, tooltips, collapsible sections, modals)
- Modern and polished light theme: slightly warmer whites, rounded cards with shadows, distinct brand accent colour
- Pass/fail colours: blue for pass, orange for fail — avoids red/green colourblindness. Plus text labels "PASS"/"FAIL" per DISP-03
- Tooltips on each criterion explaining the rule in plain English (DISP-04)
- Score sections are collapsible/expandable (DISP-05) — expanded by default

### Claude's Discretion
- Exact Tailwind theme configuration and brand accent colour
- shadcn/ui component selection and customisation
- Tooltip content wording for each criterion
- Responsive breakpoint handling (three-column layout on wide, stacked on narrow)
- Loading states and error handling
- Exact spacing, typography, and card shadow values
- How the section alignment mapping is implemented internally

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scoreExisting()` and `scoreProposed()` (src/scoring/): Pure functions returning `ScoringResult` with sections and criteria — ready for live scoring display
- `ProjectInputs` type (src/scoring/types.ts): All 40+ input fields with JSDoc comments — can drive form generation
- `ScoringResult`, `SectionResult`, `CriterionResult` types: Structured result types ready for rendering
- `useAppStore` (src/store/useAppStore.ts): Zustand store with `projects`, `addProject`, `updateProject`, `deleteProject`, `resetToDefaults`
- `CreateProjectForm` (src/components/): Existing minimal form — needs to be converted to modal and restyled
- `ProjectListPage` (src/pages/): Existing minimal table — will be replaced by the full summary screen

### Established Patterns
- Zustand 5 with persist middleware for localStorage
- HashRouter with React Router (single route currently at `/`)
- Raw inputs only in storage; scores always recomputed from `ProjectInputs`
- QNZPE stored as whole NZD dollars (100_000_000 for $100m)
- `CriterionResult.score` typed as `number | 'N/A'` — N/A for criteria absent in that system

### Integration Points
- `App.tsx` needs new routes: `/` (summary), `/project/:id` (detail)
- Nav bar component wrapping the `<Routes>` in App.tsx
- `useAppStore` selectors for filtered project lists, aggregate stats
- Barrel export (src/scoring/index.ts) already exports `SectionResult` for section-level rendering

</code_context>

<specifics>
## Specific Ideas

- The section alignment on the detail screen should make it visually obvious where one test has sections the other doesn't — gaps or "no equivalent" placeholders
- Stats cards should feel interactive — obvious they're clickable as filters, not just display
- The three-column layout (inputs | existing | proposed) is the core UX innovation — users change an input and immediately see both scores update

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-core-ui*
*Context gathered: 2026-03-13*
