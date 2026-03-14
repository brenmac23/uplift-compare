---
phase: 06-tiered-field-logic
plan: 01
subsystem: testing
tags: [vitest, correlations, distribution, bimodal, budget-tier, wave0]

# Dependency graph
requires:
  - phase: 05-generator-infrastructure
    provides: BudgetTier type, PRNG, tiers.ts, correlations.ts stub
provides:
  - Distribution regression tests (DIST-01 through DIST-05) that catch generation logic failures
  - correlations.ts weight tables and config constants consumed by Plans 02 and 03
affects: [06-02-tier1-generation, 06-03-tier2-tier3-generation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Wave 0 Nyquist compliance: write failing tests before changing generation logic
    - Bimodal distribution: coin-flip then sample from high/low cluster range
    - Budget-inverse correlation: smaller budgets favour higher ATL/cast/supporting counts
    - Point-chasing greedy selection: ordered TIER3_FIELD_COSTS array cheapest-first

key-files:
  created:
    - scripts/generator/correlations.ts (replaced stub with 9 exported constants)
    - .planning/phases/06-tiered-field-logic/06-01-SUMMARY.md
  modified:
    - src/data/__tests__/seedProjects.test.ts (added DIST-01 through DIST-05 assertions)

key-decisions:
  - "Wave 0 tests committed first — 8 new DIST tests fail intentionally until Plans 02/03 implement correlated generation"
  - "TIER3_FIELD_COSTS ordered cheapest-first to support greedy point-chasing algorithm in Plan 03"
  - "POST_PRODUCTION_CONFIG uses 10% split probability so picture/sound post are strongly coupled by default"

patterns-established:
  - "Budget-inverse pattern: Record<BudgetTier, weights> with small=[high values], tentpole=[low values]"
  - "Correlation constants are pure data — no logic, no side effects — safe to import anywhere"

requirements-completed: [DIST-01, DIST-02, DIST-03, DIST-04, DIST-05]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 06 Plan 01: Distribution Tests and Correlation Weight Tables Summary

**Failing DIST-01 through DIST-05 regression tests plus 9 typed weight-table constants in correlations.ts for budget-inverse ATL/cast/BTL, bimodal post-production, and point-chasing greedy selection**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-14T07:39:17Z
- **Completed:** 2026-03-14T07:41:22Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added 8 distribution test assertions (DIST-01 through DIST-05) inside a nested `describe` block — all fail intentionally since Phase 5 placeholder logic does not produce correlated distributions
- Replaced the empty `CORRELATIONS = {}` stub in correlations.ts with 9 named exports covering every correlation pattern Plans 02 and 03 will use
- TypeScript compiles cleanly; existing 16 seedProjects tests continue to pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Add distribution test assertions for DIST-01 through DIST-05** - `71cdd66` (test)
2. **Task 2: Populate correlations module with weight tables and sampling constants** - `8ed76bd` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/data/__tests__/seedProjects.test.ts` - Added nested `describe('distribution correlations')` with 8 test cases covering bimodal post, VFX independence, C6>=C5 constraint, shooting/crew co-variance, and budget-inverse ATL
- `scripts/generator/correlations.ts` - Replaced CORRELATIONS stub with BUDGET_INVERSE_ATL_WEIGHTS, BUDGET_INVERSE_CAST_WEIGHTS, BUDGET_INVERSE_SUPPORTING_CAST_WEIGHTS, CASTING_LEVEL_WEIGHTS, POST_PRODUCTION_CONFIG, B4_C2_COVARIANCE, BTL_CONFIG, AMBITION_TARGET_WEIGHTS, TIER3_FIELD_COSTS

## Decisions Made
- Wave 0 test-first: tests written before any generation changes so they catch regressions during Plans 02/03
- TIER3_FIELD_COSTS ordered cheapest-to-most-expensive to support the greedy point-chasing algorithm described in CONTEXT.md
- Coin-flip + range sampling chosen for bimodal post-production (simpler than two-component Gaussian mixture)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- correlations.ts is ready for import by tier1.ts, tier2.ts, tier3.ts
- DIST tests will begin passing as Plans 02 and 03 implement correlated generation logic
- BTL_CONFIG, B4_C2_COVARIANCE, POST_PRODUCTION_CONFIG define the correlation semantics clearly for Plan 02 author

---
*Phase: 06-tiered-field-logic*
*Completed: 2026-03-14*
