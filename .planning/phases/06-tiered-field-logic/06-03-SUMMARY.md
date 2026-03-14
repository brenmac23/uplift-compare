---
phase: 06-tiered-field-logic
plan: 03
subsystem: generator
tags: [typescript, prng, tier3, greedy-algorithm, seed-data, correlations]

# Dependency graph
requires:
  - phase: 06-tiered-field-logic
    plan: 02
    provides: generateTier1(), generateTier2(), Tier1Fields, Tier2Fields, weightedSelect()
  - phase: 06-tiered-field-logic
    plan: 01
    provides: TIER3_FIELD_COSTS, AMBITION_TARGET_WEIGHTS correlation constants
  - phase: 05-generator-infrastructure
    provides: BudgetTierConfig, sampleQnzpe(), PRNG factory, generateSeedData entry point
provides:
  - generateTier3() function with 23-call deterministic PRNG contract
  - Tier3Fields type (A2/A3, D1-D4, E1-E3, F1-F4, proposed-only fields)
  - Refactored generateProject() using tier1->tier2->tier3 pipeline
  - Regenerated seedProjects.ts passing all distribution constraints (DIST-01 through DIST-05)
affects: [07-maori-scenario, future-scoring-changes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Score-gap greedy algorithm: sample ambition target, score baseline, iterate cheapest-first to close gap
    - Section E last-resort gate: expensive fields only fire for qnzpe >= $100m projects with remaining gap after cheap+medium pass
    - Pre-read all PRNG rolls before any branching — guarantees fixed 23 rand() calls per project
    - Probability tuning over PRNG output (not seed) is the calibration mechanism for distribution targets

key-files:
  created:
    - scripts/generator/tier3.ts (Tier3Fields type, generateTier3() with 23-call PRNG contract)
  modified:
    - scripts/generator/index.ts (refactored generateProject() to tier1->tier2->tier3 pipeline)
    - scripts/generator/correlations.ts (tuned B4_C2_COVARIANCE: highShootingCrewPassProb=0.95, lowShootingCrewPassProb=0.65)
    - src/data/seedProjects.ts (regenerated; 24/50 pass existing, 41 crewPercent>=80, Section E=3)

key-decisions:
  - "Expensive (Section E) selection probability tuned to 0.10 — lower than plan spec (0.40) to keep Section E active count at 3 (max 8 allowed). With 30 high-budget projects, 0.40 would activate E in ~16 projects."
  - "B4_C2_COVARIANCE split asymmetrically: highShootingCrewPassProb=0.95 / lowShootingCrewPassProb=0.65 to satisfy both DIST-04 correlation test AND >= 40 crewPercent>=80 constraint simultaneously."
  - "Pre-read all 18 greedy loop rolls (14 selection + 4 value) before the loop body — same pattern as Tier 2, enforces fixed PRNG consumption regardless of which fields are activated."

patterns-established:
  - "Score-gap greedy with ambition target: Tier 3 models realistic producer behaviour — each project has a personal goal (40-45) and only pursues criteria it needs to reach that goal."
  - "Two-pass Section E: first pass exhausts cheap+medium, second pass (high-budget only) tries expensive fields as last resort. Cheap/medium probability in first pass is 0.85/0.55; expensive in second is 0.10."

requirements-completed: [TIER-03, DIST-01, DIST-02, DIST-03, DIST-04, DIST-05]

# Metrics
duration: 5min
completed: 2026-03-14
---

# Phase 06 Plan 03: Tier 3 Score-Gap Greedy and generateProject() Pipeline Summary

**Score-gap greedy point-chasing module with per-project ambition targets (40-45); generateProject() refactored to tier1->tier2->tier3 pipeline; 24/50 seed projects pass existing test with all DIST constraints satisfied**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-14T07:47:08Z
- **Completed:** 2026-03-14T07:52:43Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- Created tier3.ts: Tier3Fields type covering all point-chasing fields (A2/A3, D1-D4, E1-E3, F1-F4 plus proposed-only), generateTier3() with deterministic 23-call PRNG contract using pre-read pattern
- Refactored generateProject() in index.ts to the three-tier pipeline: tier1 -> tier2 -> scoreExisting -> tier3, replacing the monolithic Phase 5 placeholder approach
- Tuned B4_C2_COVARIANCE and Tier 3 expensive probability through 4 iterative npm run seed passes to satisfy all constraints simultaneously (crewPercent>=80: 41, Section E: 3, pass rate: 24/50)
- All 271 tests pass across 7 test files; determinism verified by two-run comparison

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Tier 3 score-gap greedy module** - `d37a437` (feat)
2. **Task 2: Refactor generateProject() + regenerate seed data** - `6a100f5` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `scripts/generator/tier3.ts` - Tier3Fields type, generateTier3() greedy point-chaser with 23-call PRNG contract
- `scripts/generator/index.ts` - Refactored generateProject() using three-tier pipeline
- `scripts/generator/correlations.ts` - B4_C2_COVARIANCE tuned: highShooting=0.95, lowShooting=0.65
- `src/data/seedProjects.ts` - Regenerated seed data passing all distribution tests

## Decisions Made
- Expensive (Section E) selection probability set to 0.10 (plan spec was 0.40): plan's 0.40 gave 16 Section E active projects; the test constraint is max 8; iterative tuning landed on 0.10 which yields 3 active projects
- B4_C2_COVARIANCE asymmetric split (0.95/0.65 instead of original 0.88/0.35): original 0.35 for low-shooting produced only 28 crewPercent>=80 (need 40+); equal 0.88/0.88 violated DIST-04 correlation test; 0.95/0.65 satisfies both
- Pre-read all 18 greedy loop rolls upfront (14 selection + 4 value rolls) before any branching — enforces fixed PRNG consumption

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Section E probability reduced from plan's 0.40 to 0.10**
- **Found during:** Task 2 (seed regeneration and testing)
- **Issue:** Plan specified 0.40 probability for expensive fields, but this produced 16 Section E active projects against a test constraint of max 8
- **Fix:** Tuned SELECTION_PROBS.expensive from 0.40 to 0.10 in tier3.ts
- **Files modified:** scripts/generator/tier3.ts
- **Verification:** Section E count dropped to 3, all tests pass
- **Committed in:** 6a100f5 (Task 2 commit)

**2. [Rule 1 - Bug] B4_C2_COVARIANCE probabilities adjusted to satisfy both constraints simultaneously**
- **Found during:** Task 2 (seed regeneration and testing)
- **Issue:** lowShootingCrewPassProb=0.35 gave only 28 crewPercent>=80 (need 40+); setting both to 0.88 violated DIST-04 correlation test; required asymmetric values
- **Fix:** Set highShootingCrewPassProb=0.95, lowShootingCrewPassProb=0.65 in correlations.ts through iterative tuning
- **Files modified:** scripts/generator/correlations.ts
- **Verification:** crewPercent>=80 count = 41, DIST-04 test passes (highShootingPassRate > lowShootingPassRate)
- **Committed in:** 6a100f5 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bug fixes during probability tuning)
**Impact on plan:** Both fixes are necessary for test compliance. Probability values are calibration parameters — the plan acknowledges iterative tuning is expected ("The probability tuning pattern from Phase 5 applies: iterate npm run seed + test until values converge").

## Issues Encountered
- crewPercent>=80 and DIST-04 tests have opposing pressures: increasing low-shooting probability to meet crewPercent>=80 reduces the gap needed for DIST-04 correlation test. Resolved with asymmetric values (0.95/0.65) giving enough differentiation while keeping overall count at 41.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Three-tier generation pipeline is complete and verified; all 50 seed projects satisfy DIST-01 through DIST-05
- Phase 7 (Maori scenario) can now layer onto the existing pipeline — the Maori fields (maoriCrewPercent, hasLeadCastMaori) are hardcoded to 0/false and flagged for Phase 7 override
- The Section-E-heavy profile needed for the "passes-existing-fails-proposed" scenario (Phase 7 blocker) is still outstanding — current generator produces only 3 Section E projects

---
*Phase: 06-tiered-field-logic*
*Completed: 2026-03-14*
