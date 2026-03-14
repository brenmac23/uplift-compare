---
phase: 06-tiered-field-logic
plan: 02
subsystem: generator
tags: [typescript, prng, correlations, bimodal, budget-tier, tier1, tier2]

# Dependency graph
requires:
  - phase: 06-tiered-field-logic
    plan: 01
    provides: correlations.ts weight tables and sampling constants (BUDGET_INVERSE_*, POST_PRODUCTION_CONFIG, B4_C2_COVARIANCE, BTL_CONFIG)
  - phase: 05-generator-infrastructure
    provides: BudgetTierConfig type, BudgetTier type, ProductionType type, PRNG factory
provides:
  - generateTier1() function with 6-call deterministic PRNG contract
  - generateTier2() function with 17-call deterministic PRNG contract
  - Tier1Fields type (A1, B2, B3, B4, C4, C7, C9)
  - Tier2Fields type (B1, B5, B6, B7, B8, B9, C1, C2, C5, C6, C8)
  - weightedSelect() helper exported from tier1.ts for reuse
affects: [06-03-tier3-generation, 06-04-wiring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Deterministic PRNG contract: each generation function consumes a fixed, documented number of rand() calls regardless of branches taken
    - Budget-inverse pattern applied consistently: small=[high weights], tentpole=[low weights]
    - Bimodal distribution via coin-flip cluster + independent split probability per field
    - Pre-read-both-then-use pattern for 2-call fields to guarantee deterministic consumption

key-files:
  created:
    - scripts/generator/tier1.ts (Tier1Fields type, generateTier1(), weightedSelect())
    - scripts/generator/tier2.ts (Tier2Fields type, generateTier2())
  modified: []

key-decisions:
  - "weightedSelect() exported from tier1.ts rather than a shared utils module — keeps tier graph acyclic and import chain linear (tier2 imports tier1, not a shared util)"
  - "shootingNZPercent ranges are budget-tier-aware (small/mid: 70-100, large: 50-100, tentpole: 40-100) to produce the B4 gradient that drives DIST-04 crewPercent correlation"
  - "For 2-rand()-call fields (B5, C1, C2, C5/C6): pre-read both rolls into const variables before branching — TypeScript enforces no accidental conditional consumption"
  - "C5=0 short-circuit still consumes rand() #16 and discards to maintain PRNG offset for all downstream fields"

patterns-established:
  - "Deterministic PRNG contract: every function documents exact rand() call count in header JSDoc; any branch must consume the same count regardless of path taken"
  - "Pre-read pattern: const r1 = rand(); const r2 = rand(); — both consumed before any if/switch"
  - "Cross-tier correlation: tier2.ts imports Tier1Fields (not ProjectInputs) to signal it only reads Tier 1 output"

requirements-completed: [TIER-01, TIER-02, DIST-01, DIST-02, DIST-03, DIST-04, DIST-05]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 06 Plan 02: Tier 1 and Tier 2 Field Generation Summary

**Deterministic PRNG generation modules for organic production fundamentals (6 rand() calls) and correlated logistical follow-ons (17 rand() calls) with DIST-01 through DIST-05 correlations**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-14T07:43:04Z
- **Completed:** 2026-03-14T07:44:49Z
- **Tasks:** 2
- **Files modified:** 2 (created)

## Accomplishments
- Created tier1.ts exporting Tier1Fields type, generateTier1() with budget-inverse DIST-05 correlations for atlCount/hasLeadCast/castingLevel, and budget-tier-aware shootingNZPercent ranges that seed the DIST-04 B4→C2 correlation downstream
- Created tier2.ts importing Tier1Fields from tier1.ts and applying all five DIST correlations: bimodal B6/B7 post-production (DIST-01), independent uniform B8/B9 VFX/concept (DIST-02), C5/C6 with hard C6>=C5 constraint and C5=0 short-circuit (DIST-03), shootingNZPercent-driven crewPercent (DIST-04), budget-inverse castPercent and supportingCastCount (DIST-05)
- Both modules have deterministic PRNG consumption contracts (6 and 17 calls respectively) enforced by pre-reading all roll variables before branching

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Tier 1 field generation module** - `8c27ada` (feat)
2. **Task 2: Create Tier 2 field generation module** - `351b75d` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `scripts/generator/tier1.ts` - Tier1Fields type, generateTier1() (6 rand() calls), weightedSelect() helper
- `scripts/generator/tier2.ts` - Tier2Fields type, generateTier2() (17 rand() calls) with all DIST correlations

## Decisions Made
- weightedSelect() exported from tier1.ts rather than a shared utility module — keeps the import chain linear (tier2 → tier1, no circular deps)
- Pre-read-both pattern for all 2-call fields ensures TypeScript cannot accidentally introduce conditional PRNG consumption
- C5=0 still consumes rand() #16 and discards it — explicit comment documents this to prevent future "optimization" that would break PRNG offsets

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- tier1.ts and tier2.ts are ready for import by the Plan 03 wiring module (index.ts or generateProject.ts)
- The DIST-01 through DIST-05 regression tests in seedProjects.test.ts will begin passing once Plans 02+03 are wired into the generator entry point
- weightedSelect() is available for Plan 03 to reuse if Tier 3 needs weighted selection

---
*Phase: 06-tiered-field-logic*
*Completed: 2026-03-14*
