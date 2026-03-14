---
phase: 03-core-ui
plan: 03
subsystem: ui
tags: [react, tailwind, shadcn, scoring, detail-page, tooltips, collapsible]

# Dependency graph
requires:
  - phase: 03-01
    provides: PassFailBadge, shadcn components (Collapsible, Tooltip, Select), routing shell
  - phase: 01-scoring-engine
    provides: scoreExisting, scoreProposed, ScoringResult types
  - phase: 02-data-layer
    provides: useAppStore, Project, updateProject

provides:
  - Three-column detail screen (inputs | existing scores | proposed scores)
  - Live scoring: inputs update instantly without a Calculate button
  - Section alignment map (6 slots with placeholders for system-specific sections)
  - Plain English criterion tooltips for all 33 existing + 24 proposed criteria
  - Collapsible section wrappers (SectionBlock) expanded by default
  - CriterionRow with tooltip, mandatory badge, N/A handling
  - Project switcher dropdown navigating between projects

affects: [03-core-ui, future-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CRITERION_TOOLTIPS keyed by 'existing:ID' / 'proposed:ID' to handle ID reuse across systems"
    - "useMemo for pure scoring functions — recomputes only when inputs change"
    - "useEffect on id dependency to reset local inputs when user switches project via URL"
    - "SECTION_ALIGNMENT static map drives both score column rendering and input grouping"

key-files:
  created:
    - src/lib/sectionAlignment.ts
    - src/lib/criterionTooltips.ts
    - src/components/SectionBlock.tsx
    - src/components/CriterionRow.tsx
  modified:
    - src/pages/DetailPage.tsx

key-decisions:
  - "Criterion tooltip keys prefixed with 'existing:' or 'proposed:' to avoid ID conflicts (both systems have A1, B1, etc. with different meanings)"
  - "Local useState for inputs + useMemo for scoring avoids full store re-renders on every keystroke"
  - "useEffect on id/project resets local state when user navigates to a new project via the switcher"

patterns-established:
  - "SectionBlock: reusable collapsible wrapper accepting title, subtitle, and children"
  - "ScoreColumn: renders all 6 SECTION_ALIGNMENT slots, showing placeholder card for null section IDs"
  - "InputsColumn: grouped by SECTION_ALIGNMENT slot order to visually match score columns"

requirements-completed: [PROJ-05, DISP-04, DISP-05]

# Metrics
duration: 4min
completed: 2026-03-13
---

# Phase 03 Plan 03: Detail Screen Summary

**Three-column detail screen with live scoring, section alignment placeholders, criterion tooltips, collapsible sections, and project switcher — the core interactive UX of the app**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T04:17:29Z
- **Completed:** 2026-03-13T04:20:59Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Live scoring detail screen: changing any input immediately updates both existing (85pt) and proposed (70pt) score columns without a Calculate button
- Section alignment map with 6 slots — Sustainability (existing only) and Innovation & Infra (existing only) show "No equivalent" placeholders in the proposed column
- Plain English tooltips for all 57 criteria across both systems, keyed by system prefix to handle ID overlap
- Collapsible SectionBlock and CriterionRow components reusable across any scoring context
- Project switcher Select dropdown at top navigates between projects without returning to summary

## Task Commits

Each task was committed atomically:

1. **Task 1: Create section alignment map, criterion tooltips, and shared detail components** - `d29ef54` (feat)
2. **Task 2: Build DetailPage with three-column layout, live scoring, and project switcher** - `f8d3bb0` (feat)

## Files Created/Modified
- `src/lib/sectionAlignment.ts` - SECTION_ALIGNMENT (6 slots) and findSection helper
- `src/lib/criterionTooltips.ts` - Plain English tooltip text for all criteria in both systems
- `src/components/SectionBlock.tsx` - Collapsible section wrapper with chevron, expanded by default
- `src/components/CriterionRow.tsx` - Criterion row with score, tooltip, mandatory badge, N/A handling
- `src/pages/DetailPage.tsx` - Full three-column detail screen replacing placeholder stub

## Decisions Made
- Tooltip keys prefixed `existing:ID` / `proposed:ID` because both systems reuse IDs (A1, B1, C1, D1) for completely different criteria — a flat Record keyed only by ID would cause collisions
- Local `useState` for inputs rather than reading directly from store on every render — avoids Zustand re-rendering the entire tree on each keystroke, consistent with prior research decisions
- `useEffect` watching `[id, project]` resets local inputs when switching projects via dropdown or URL navigation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 03 Plan 03 is complete. Phase 03 has no further plans listed.
- The full core UI is now functional: summary page, create-project form, detail screen with live scoring.
- No blockers for any future work.

---
*Phase: 03-core-ui*
*Completed: 2026-03-13*
