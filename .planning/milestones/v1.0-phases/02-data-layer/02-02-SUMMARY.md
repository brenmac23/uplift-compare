---
phase: 02-data-layer
plan: "02"
subsystem: database
tags: [seed-data, typescript, vitest, zustand, scoring]

# Dependency graph
requires:
  - phase: 02-data-layer/02-01
    provides: Project type, useAppStore with projects array, seedProjects.ts stub
  - phase: 01-scoring-engine
    provides: scoreExisting, scoreProposed, ProjectInputs type, scoring spec constants

provides:
  - 50 typed seed Project objects in SEED_PROJECTS const array (src/data/seedProjects.ts)
  - Distribution verification test suite (src/data/__tests__/seedProjects.test.ts)

affects:
  - 02-data-layer/02-03 (deployment - needs real seed data for first deploy)
  - 03-ui (project list will render these 50 projects)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Static typed seed data as const array — hand-crafted, deterministic, reviewable
    - Raw ProjectInputs only stored — scores always recomputed, never persisted
    - Distribution-verified seed data — automated tests enforce business realism constraints

key-files:
  created:
    - src/data/seedProjects.ts
    - src/data/__tests__/seedProjects.test.ts
  modified:
    - src/store/__tests__/useAppStore.test.ts

key-decisions:
  - "beforeEach in useAppStore tests resets to empty array (not SEED_PROJECTS) — 50 real seeds break index-based assertions written against empty stub"
  - "borderline-fail projects (39pts) included to maximise comparison value near the 40pt pass threshold"
  - "Section E (Innovation/Infrastructure) on only 4 big-budget projects — realism: rare in practice"
  - "crewPercent set to 80-85 for most projects — small/mid budget productions hit NZ crew threshold more easily"

patterns-established:
  - "Seed data distribution: ~60% pass for existing system, ensuring meaningful comparison variety"
  - "Borderline cases (38-42pts): 5 projects near threshold to highlight how close calls differ between systems"

requirements-completed: [PROJ-01, PROJ-02, PROJ-03]

# Metrics
duration: 7min
completed: 2026-03-13
---

# Phase 2 Plan 02: Seed Projects Summary

**50 hand-crafted genre-evocative seed productions (sci-fi, thriller, drama, fantasy) with verified distribution: 30 pass existing test, 5 borderline at 38-42pts, all constraints enforced by automated tests**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-13T02:34:07Z
- **Completed:** 2026-03-13T02:41:02Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- 50 typed Project objects with genre-evocative names authored as static const array
- Distribution verification test suite (16 assertions across count, budget, scoring, and realism)
- All 252 tests pass including existing scoring engine and store tests
- TypeScript compiles cleanly with no type errors

## Task Commits

1. **Task 1: Write distribution verification tests** - `4357475` (test)
2. **Task 2: Author 50 seed projects and pass all distribution tests** - `a18f60d` (feat)

## Files Created/Modified

- `src/data/seedProjects.ts` - 50 Project objects, seed-001 through seed-050, all fields populated
- `src/data/__tests__/seedProjects.test.ts` - 16 distribution and realism verification tests
- `src/store/__tests__/useAppStore.test.ts` - beforeEach reset to empty array (auto-fixed deviation)

## Decisions Made

- Used empty array for `beforeEach` state reset in store tests rather than SEED_PROJECTS — the CRUD unit tests were written against the empty stub; with 50 real projects the index-based assertions (`projects[0]`, `toHaveLength(1)`) break
- Borderline-fail at 39pts (just below 40pt pass threshold) gives the richest comparison story for the UI
- Section E fields on only 4 projects (all big-budget >=\$100m) — reflects real rarity

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed useAppStore.test.ts store reset to empty array**
- **Found during:** Task 2 (running full test suite after authoring seed data)
- **Issue:** Store tests used `useAppStore.setState({ projects: [...SEED_PROJECTS] })` in `beforeEach`, then asserted `projects.toHaveLength(1)` after a single `addProject` call. With 50 real seeds, the projects array starts at 50, so `addProject` yields 51 — failing 7 tests.
- **Fix:** Changed `beforeEach` to reset to `projects: []` for CRUD isolation
- **Files modified:** `src/store/__tests__/useAppStore.test.ts`
- **Verification:** All 17 store tests pass
- **Committed in:** `a18f60d` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in test setup)
**Impact on plan:** Required fix — the store tests were intentionally written against the stub. Now that the stub is replaced with real data, the reset logic needed updating. No scope creep.

## Issues Encountered

- Initial seed design had only 4 borderline projects (test required 5+). Fixed by redesigning seed-046 from a low-score fail (21pts) to a borderline fail (39pts).
- Redesigning seed-046 initially produced 31 passing projects (over the 20-30 limit). Adjusted supporting cast count from 2 to 1 to yield 39pts (fail) instead of 40pts (pass).

## Next Phase Readiness

- seed data complete and verified — Plan 02-03 (deployment) can proceed
- 50 projects in localStorage on first app load — UI phase has rich dataset immediately
- No blockers

---
*Phase: 02-data-layer*
*Completed: 2026-03-13*
