---
phase: 07-distribution-targets-and-validation
plan: 01
subsystem: testing
tags: [vitest, prng, maori, seed-data, distribution, scoring]

# Dependency graph
requires:
  - phase: 06-tiered-field-logic
    provides: tier1/tier2/tier3 pipeline with pre-read pattern and PRNG offsets
  - phase: 05-generator-infrastructure
    provides: Mulberry32 PRNG, generateProject(), seedProjects.ts
provides:
  - SCEN-01 through SCEN-04 test assertions in seedProjects.test.ts
  - Probabilistic Maori activation (2% per project) with pre-read pattern
  - Extended distribution report with median, mean, stddev, SCEN counters
  - Updated generator return type with existingPassed and proposedPassed
affects: [07-02-plan, plan-02-tuning]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pre-read pattern for Maori activation (2 rand() always consumed per project)
    - Extended generateProject() return with both scoring system results
    - SCEN counter pattern in distribution report for observable tuning targets

key-files:
  created: []
  modified:
    - src/data/__tests__/seedProjects.test.ts
    - scripts/generator/index.ts
    - scripts/generateSeedData.ts
    - src/data/seedProjects.ts

key-decisions:
  - "Maori rand() calls placed after tier3 in generateProject() — shifts PRNG for subsequent projects (expected), but within each project the 2 calls are always consumed regardless of activation"
  - "hasStudioLease test now failing (2 instead of 3-5) due to PRNG sequence shift from Maori additions — accepted as expected collateral, Plan 02 tuning will address"
  - "proposedPassed added to generateProject() return to enable SCEN-01 detection at report time without re-scoring"

patterns-established:
  - "Pre-read pattern: consume both Maori rand() calls unconditionally, use maoriActive boolean to conditionally set values"
  - "SCEN counter logging in distribution report provides observable tuning targets for Plan 02"

requirements-completed: [SCEN-02, SCEN-04]

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 7 Plan 01: Distribution Targets and Validation - SCEN Test Assertions and Maori Activation Summary

**SCEN test assertions (SCEN-01 to SCEN-04) added, Maori probabilistic activation (2% PRNG) implemented with pre-read pattern, distribution report extended with median/stddev/SCEN counters**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-14T09:01:42Z
- **Completed:** 2026-03-14T09:16:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added scoreProposed import to both test file and generator; 4 new SCEN it() blocks established
- Replaced hardcoded Maori fields (always 0/false) with probabilistic activation: maoriActivationRoll < 0.02 with pre-read pattern consuming 2 rand() per project unconditionally
- Extended distribution report: now shows median 38.25, mean 37.9, stddev 5.42, SCEN-01 through SCEN-04 counters
- Generator return type extended with existingPassed and proposedPassed for SCEN-01 detection
- Seed data regenerated and verified deterministic (two consecutive runs produce identical output)

## Task Commits

Each task was committed atomically:

1. **Task 1: SCEN test assertions and Maori activation in generator** - `294ff47` (feat)
2. **Task 2: Extend distribution report and regenerate seed data** - `a75e5ae` (feat)

## Files Created/Modified
- `src/data/__tests__/seedProjects.test.ts` - Added scoreProposed import, relaxed 2 Maori assertions, added 4 SCEN it() blocks
- `scripts/generator/index.ts` - Added scoreProposed import, Maori probabilistic activation with pre-read, updated return type and PRNG count comment
- `scripts/generateSeedData.ts` - Updated results array type, added median/stddev/SCEN computations, extended distribution report
- `src/data/seedProjects.ts` - Regenerated with new Maori probabilistic values (0 Maori active in current PRNG run)

## Decisions Made
- Maori rand() calls placed at end of generateProject() after tier3 — this shifts subsequent projects' PRNG sequences (expected structural consequence)
- proposedPassed stored in results array for SCEN-01 detection at report time without re-scoring
- hasStudioLease failure (2 vs expected 3-5) accepted as PRNG-shift collateral; Plan 02 tuning will correct all distribution failures together

## Deviations from Plan

None - plan executed exactly as written. The studioLease test failure (2 instead of 3-5) is a documented expected consequence of adding Maori rand() calls which shift the PRNG sequence for subsequent projects. The plan objective explicitly states some tests will fail before Plan 02 tuning.

## Issues Encountered

**PRNG sequence shift causes studioLease test failure:** Adding 2 Maori rand() calls per project shifts the PRNG state for all subsequent projects' tier1/tier2/tier3 generation. This causes `hasStudioLease` count to drop from ~3 to 2, failing the existing 3-5 assertion. This is an expected consequence — Plan 02 will tune parameters to restore all distribution targets simultaneously.

**Current test results at plan completion:**
- 25 passing, 3 failing
- Passing: all shape/count/DIST-01 through DIST-05 tests, SCEN-02, SCEN-04
- Failing: hasStudioLease (2/3), SCEN-01 (0/1 needed), SCEN-03 (24/25-35 needed)

**Current distribution stats:**
- Pass rate: 24/50 (48%)
- Median score: 38.25
- Mean score: 37.9
- Stddev: 5.42 (SCEN-04: PASSES range 4-12)
- SCEN-01 count: 0
- SCEN-02 (Maori active): 0
- SCEN-03: 24 (just below 25 threshold)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 02 can now begin tuning: targets are observable via distribution report SCEN counters
- SCEN-03 needs pass rate increase from 24 to 28-30 range
- SCEN-01 requires at least one project to pass existing but fail proposed (may need parameter or explicit fallback)
- hasStudioLease needs restoration to 3-5 range

---
*Phase: 07-distribution-targets-and-validation*
*Completed: 2026-03-14*
