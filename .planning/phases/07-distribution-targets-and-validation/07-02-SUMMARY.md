---
phase: 07-distribution-targets-and-validation
plan: 02
subsystem: testing
tags: [vitest, prng, seed-data, distribution, scoring, calibration, scen-01]

# Dependency graph
requires:
  - phase: 07-distribution-targets-and-validation
    plan: 01
    provides: SCEN-01 to SCEN-04 test assertions, Maori activation, distribution report with SCEN counters
  - phase: 06-tiered-field-logic
    provides: tier1/tier2/tier3 pipeline with SELECTION_PROBS, AMBITION_TARGET_WEIGHTS
affects: []

provides:
  - Tuned AMBITION_TARGET_WEIGHTS and AMBITION_VALUES targeting higher score distribution
  - SCEN-01 fallback override mechanism in generateSeedData.ts
  - All 4 SCEN assertions green (SCEN-01 through SCEN-04)
  - Final calibrated seedProjects.ts with 275 passing tests

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SCEN-01 fallback override applied post-generation (after all rand() calls) to preserve PRNG determinism
    - Section-E-heavy tentpole profile as canonical passes-existing-fails-proposed scenario
    - Iterative tuning: adjust weights, run seed, check SCEN counters in report

key-files:
  created: []
  modified:
    - scripts/generator/correlations.ts
    - scripts/generator/tier2.ts
    - scripts/generator/tier3.ts
    - scripts/generateSeedData.ts
    - src/data/seedProjects.ts

key-decisions:
  - "AMBITION_VALUES extended from [40-45] to [42,44,46,48,50,52,54,56] — single shift of 6-target array to 8-target array covering wider range"
  - "Medium SELECTION_PROBS increased from 0.55 to 0.70 — critical for pass count increase from 24 to 28"
  - "hasStudioLease probability increased from 0.10 to 0.15 — restores 3-5 range after PRNG shift from Maori addition (Plan 01)"
  - "SCEN-01 fallback override at index 49 (post-generation) — Section-E-heavy profile: existing=40, proposed=28 — chosen because Section E (8pts) exists only in existing system"
  - "Override applied after all rand() calls consumed — preserves PRNG determinism for all 49 prior projects"

patterns-established:
  - "Post-generation override pattern: apply profile overrides AFTER all PRNG consumption to maintain determinism"
  - "SCEN-01 profile recipe: tentpole qnzpe=$220m, Section E fully active (E1+E2+E3=8pts), crewPercent<80, atlCount=0, hasMasterclass=true (existing D1=2pts)"

requirements-completed: [SCEN-01, SCEN-03, SCEN-04]

# Metrics
duration: 20min
completed: 2026-03-14
---

# Phase 7 Plan 02: Distribution Targets and Validation - Final Calibration Summary

**AMBITION_TARGET_WEIGHTS tuned to 8-element array [42-56], SCEN-01 fallback override added, all 275 tests pass with SCEN-01=1, SCEN-03=28/50, SCEN-04=6.53, studioLease=5**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-14T22:00:00Z
- **Completed:** 2026-03-14T22:20:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Extended AMBITION_VALUES from 6-element [40-45] to 8-element [42,44,46,48,50,52,54,56] with weights concentrated on 48-50
- Increased medium SELECTION_PROBS from 0.55 to 0.70, pushing more projects past the 40-point existing threshold
- Restored hasStudioLease probability to 0.15 (from 0.10), recovering 3-5 count after PRNG shift
- Implemented SCEN-01 fallback override: Section-E-heavy tentpole profile at index 49 (existing=40, proposed=28)
- All 275 tests green including all 4 SCEN assertions and all DIST-01 through DIST-05 assertions
- Determinism confirmed: two consecutive seed runs produce identical seedProjects.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Tune AMBITION_TARGET_WEIGHTS and SELECTION_PROBS for SCEN-03 and SCEN-04** - `d6a6a9f` (feat)
2. **Task 2: SCEN-01 fallback override and final seed data regeneration** - `835a93f` (feat)

## Files Created/Modified
- `scripts/generator/correlations.ts` - AMBITION_TARGET_WEIGHTS extended to 8 elements [42-56]
- `scripts/generator/tier3.ts` - AMBITION_VALUES extended from [40-45] to [42,44,46,48,50,52,54,56]; medium SELECTION_PROBS 0.55 → 0.70
- `scripts/generator/tier2.ts` - hasStudioLease probability 0.10 → 0.15
- `scripts/generateSeedData.ts` - Added SCEN-01 fallback override block with scoreExisting/scoreProposed imports; verify-before-apply pattern
- `src/data/seedProjects.ts` - Regenerated final seed data (275 tests pass)

## Decisions Made
- Extended AMBITION_VALUES to 8 elements covering 42-56 rather than option B (same 6 elements shifted) — the wider range gives the greedy algorithm more headroom to push scores
- SCEN-01 override uses Section E asymmetry (8pts existing-only) as the differentiating mechanism; chosen over alternative approaches (random profile selection) because it's deterministic and guaranteed
- Override profile verified before applying (scoreExisting.passed=true AND !scoreProposed.passed required) to prevent silent failures
- No change to SELECTION_PROBS.expensive (kept at 0.10) — Section E count remains 7, within <= 8 constraint

## Deviations from Plan

None — plan executed exactly as written. Both Option B (weights only) and Option A (extend array) were considered; Option A was applied directly because it was the better approach. The SCEN-01 fallback was needed (natural count was 0), matching the plan's expected scenario.

## Issues Encountered

**Option B (same 6-element array shifted) insufficient:** Setting weights to [0.05, 0.10, 0.15, 0.20, 0.30, 0.20] over targets [40-45] did not move the median — the greedy algorithm ceiling was already being hit. Required Option A (extend AMBITION_VALUES to [42,44,46,48,50,52,54,56]).

**SCEN-01 not naturally occurring:** With this PRNG seed, no project naturally passes existing but fails proposed. The fallback override was applied as designed. The override at index 49 gives existing=40, proposed=28, satisfying SCEN-01 exactly.

## Final Distribution Report

- Pass rate (existing): 28/50 (56%)
- Score range: 24-52.5
- Borderline (38-42): 18
- hasStudioLease: 5 (restored to 3-5 range)
- Section E active: 7 (within <= 8 constraint)
- crewPercent >= 80: 41 (>= 40)
- Median score: 40.5
- Mean score: 40.9
- Stddev: 6.53 (SCEN-04: passes 4-12)
- SCEN-01: 1 (>= 1 required)
- SCEN-02 (Maori active): 0 (<= 3)
- SCEN-03: 28/50 (within 25-35 range)
- SCEN-04 stddev: 6.53 (within 4-12 range)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 7 is complete — all 4 SCEN requirements satisfied, all 275 tests green
- Milestone v1.1 (Realistic Seed Data) is complete
- No blockers or follow-up items

---
*Phase: 07-distribution-targets-and-validation*
*Completed: 2026-03-14*
