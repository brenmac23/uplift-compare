---
phase: 01-scoring-engine
plan: "04"
subsystem: infra
tags: [zustand, localStorage, persist, scoring, integration-tests, barrel-export]

# Dependency graph
requires:
  - phase: 01-02
    provides: scoreExisting() pure function and ProjectInputs type
  - phase: 01-03
    provides: scoreProposed() pure function consuming same ProjectInputs

provides:
  - Zustand store with localStorage persistence (schemaVersion: 1, version: 1)
  - Integration tests proving both engines share ProjectInputs
  - Clean barrel export at src/scoring/index.ts for Phase 2 and Phase 3 consumption

affects:
  - 02-seed-data
  - 03-ui
  - any phase importing from scoring module

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zustand persist middleware with createJSONStorage for localStorage"
    - "Store version field (version: 1) for future migration support"
    - "schemaVersion in state for schema evolution tracking"
    - "Barrel export pattern for module public API"

key-files:
  created:
    - src/store/useAppStore.ts
    - src/store/__tests__/useAppStore.test.ts
    - src/scoring/__tests__/sharedInputs.test.ts
    - src/scoring/index.ts
  modified: []

key-decisions:
  - "Store keeps only schemaVersion: 1 for now — Phase 2 adds projects array and actions"
  - "persist version: 1 set on store for future migrate() support in Phase 2"
  - "Barrel export includes SectionResult type (needed by Phase 3 UI section rendering)"
  - "sharedInputs tests import directly from source files, not barrel — tests remain stable if barrel changes"

patterns-established:
  - "Store: create<T>()(persist(...)) pattern with Zustand 5"
  - "Store tests: useAppStore.getState() directly — no React rendering needed for unit tests"
  - "Barrel: single index.ts at module root re-exports all public API"

requirements-completed: [SCORE-04, SCORE-06, INFRA-02]

# Metrics
duration: 3min
completed: 2026-03-13
---

# Phase 1 Plan 4: Store Skeleton, Shared Input Tests, and Barrel Export Summary

**Zustand store with localStorage persistence (schemaVersion: 1), integration tests proving both scoring engines consume identical ProjectInputs, and clean barrel export for the scoring module**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-13T01:31:31Z
- **Completed:** 2026-03-13T01:34:30Z
- **Tasks:** 2
- **Files modified:** 4 created, 0 modified

## Accomplishments

- Zustand store boots on fresh localStorage with schemaVersion: 1 (INFRA-02)
- Integration tests confirm crewPercent, castPercent, vfxPercent, and qnzpe all propagate correctly through both engines from a single ProjectInputs value (SCORE-04)
- Threshold divergence verified: vfxPercent of 60 → 1pt in existing (50/75/90 tiers), 2pts in proposed (30/50/75 tiers)
- QNZPE-tiered pass threshold verified: 50m → 20pt threshold, 150m → 30pt threshold
- Both criteria arrays have correct per-criterion shape (SCORE-06)
- Barrel export at src/scoring/index.ts provides clean single import path for Phase 2 and Phase 3

## Task Commits

Each task was committed atomically:

1. **Task 1: Zustand store skeleton with persist middleware** - `ef4384f` (feat)
2. **Task 2: Shared inputs integration tests and barrel export** - `fcda0f2` (feat)

_Note: TDD tasks — both RED phases confirmed failure before implementation._

## Files Created/Modified

- `src/store/useAppStore.ts` - Zustand store with persist middleware, schemaVersion: 1 initial state, version: 1 for migrations
- `src/store/__tests__/useAppStore.test.ts` - 4 smoke tests: init value, type check, persist clear/rehydrate cycle
- `src/scoring/__tests__/sharedInputs.test.ts` - 8 integration tests verifying both engines consume shared inputs and diverge where expected
- `src/scoring/index.ts` - Barrel export: scoreExisting, scoreProposed, ProjectInputs, ScoringResult, CriterionResult, SectionResult

## Decisions Made

- Store keeps only `schemaVersion: 1` for now — Phase 2 adds the projects array and all CRUD actions
- `persist version: 1` on store so future `migrate()` function can detect and handle schema upgrades
- Barrel export includes `SectionResult` type (not mentioned in plan but needed by Phase 3 section-level rendering)
- sharedInputs tests import directly from source files rather than via barrel — this keeps the integration tests stable if the barrel re-exports are refactored

## Deviations from Plan

None — plan executed exactly as written. One minor addition: `SectionResult` added to barrel export (also exported from types.ts, required by downstream consumers in Phase 3).

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 1 (Scoring Engine) is complete. All 4 plans executed, 223 tests passing.
- Phase 2 (Seed Data / Store Population) is unblocked:
  - `useAppStore` ready to receive projects array and CRUD actions
  - Both scoring engines accessible via clean barrel import
  - All types exported from `src/scoring/index.ts`
- Phase 3 (UI) can import from `src/scoring/index.ts` directly

---
*Phase: 01-scoring-engine*
*Completed: 2026-03-13*

## Self-Check: PASSED

- src/store/useAppStore.ts: FOUND
- src/store/__tests__/useAppStore.test.ts: FOUND
- src/scoring/__tests__/sharedInputs.test.ts: FOUND
- src/scoring/index.ts: FOUND
- Commit ef4384f: FOUND
- Commit fcda0f2: FOUND
