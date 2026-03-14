---
phase: 05-generator-infrastructure
plan: 02
subsystem: infra
tags: [tsx, prng, generator, seed-data, typescript, scoring]

# Dependency graph
requires:
  - phase: 05-generator-infrastructure (plan 01)
    provides: "createPrng(), SEED, PROJECT_COUNT, FILM_NAMES, TV_NAMES, pickBudgetTier(), sampleQnzpe(), BudgetTierConfig, ProductionType"
  - phase: src/scoring
    provides: "scoreExisting(), ProjectInputs interface"
provides:
  - "scripts/generator/index.ts: generateProject() assembling one Project from PRNG, returns { project, existingScore }"
  - "scripts/generateSeedData.ts: orchestrates generation, Fisher-Yates name shuffle, distribution report, writeFileSync output"
  - "src/data/seedProjects.ts: auto-generated 50-project deterministic seed file (20 pass existing, 41 crewPercent>=80)"
  - "npm run seed: working command producing deterministic, type-correct output"
affects:
  - 06-tiered-field-logic
  - 07-distribution-targets
  - src/store/useAppStore (consumes SEED_PROJECTS)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "generateProject() takes rand parameter — never generates its own PRNG state"
    - "Fisher-Yates shuffle uses the shared PRNG closure — preserves call-order determinism"
    - "Distribution report printed to stdout before writing file — easy to monitor in CI"
    - "Probability tuning over PRNG output: iterative runs converge on distribution targets"

key-files:
  created:
    - scripts/generator/index.ts
    - scripts/generateSeedData.ts
  modified:
    - src/data/seedProjects.ts

key-decisions:
  - "Section B/C/D/F probabilities tuned iteratively: started at naive values, converged to 20/50 pass rate via 3 trial runs"
  - "Section E (hasKnowledgeTransfer, commercialAgreementPercent, infrastructureInvestment) gated on isHighBudget AND sectionEActive — ensures test constraint (qnzpe<$100m projects never get Section E)"
  - "crewPercent sampled as 80+rand()*20 at 88% probability — reliably produces 40+ projects at >=80% threshold"
  - "hasStudioLease probability 0.10 over 50 projects reliably yields 3-5 (landed 4 with this PRNG seed)"
  - "Task 2 verification-only: no code changes needed — determinism and TypeScript both passed on first run"

patterns-established:
  - "Pattern: Probability constants in generateProject() are the only tuning knobs — never touch PRNG seed"
  - "Pattern: Test constraints drive probability choices; document the target (e.g., 'need 40+ projects') next to each constant"

requirements-completed: [GEN-02, GEN-03, GEN-04]

# Metrics
duration: 25min
completed: 2026-03-14
---

# Phase 5 Plan 02: Generate Project Function and Entry Point Summary

**generateProject() function + npm run seed entry point producing 50 deterministic projects with passing distribution (20/50 existing-pass, 41 crewPercent>=80, 4 hasStudioLease, 16 borderline)**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-14T19:44:00Z
- **Completed:** 2026-03-14T19:49:50Z
- **Tasks:** 2
- **Files modified:** 3 (2 created + seedProjects.ts regenerated)

## Accomplishments

- `generateProject()` wires all Plan 01 building blocks: receives `rand`, `name`, `productionType`, `tierConfig` → builds `ProjectInputs`, calls `scoreExisting()`, returns `{ project, existingScore }`
- `generateSeedData.ts` entry point: creates PRNG from SEED, assigns production types (60/40 film/TV), Fisher-Yates shuffles name pools, calls `generateProject()` 50 times, prints distribution report, writes file
- Determinism verified: two consecutive `npm run seed` runs produce byte-identical output
- All 16 `seedProjects.test.ts` assertions pass; full suite 263/263 green with no regressions
- `npx tsc --noEmit` clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Create generateProject() and entry point script** - `92f7355` (feat)
2. **Task 2: Verify determinism and TypeScript compilation** - verification only, no code changes; no separate commit needed

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `scripts/generator/index.ts` - generateProject() function: builds ProjectInputs from PRNG, calls scoreExisting(), returns project + existingScore
- `scripts/generateSeedData.ts` - Entry point: PRNG init, production type assignment, Fisher-Yates name shuffle, generation loop, distribution report, writeFileSync
- `src/data/seedProjects.ts` - Auto-generated; 50 projects, deterministic from SEED=0xDEADBEEF

## Decisions Made

- **Iterative probability tuning:** Initial naive probabilities produced only 9/50 passes. Three iterations of adjusting Section D/F probabilities (masterclass, seminars, marketing) converged to exactly 20/50 — the minimum required.
- **Section E gate:** `sectionEActive = isHighBudget && rand() < 0.20` — double condition ensures low-budget projects never get E fields, test constraint satisfied automatically.
- **crewPercent formula:** `80 + Math.round(rand() * 20)` at 88% probability — produces distribution clustered in 80-100% range, reliably hitting the 40+ threshold.
- **hasStudioLease at 0.10:** With 50 Bernoulli trials at p=0.10, expected value is 5 with variance; PRNG produced 4 (within 3-5 target).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Probability tuning required 3 iterations**
- **Found during:** Task 1 (initial run)
- **Issue:** Initial probabilities produced 9/50 passes (need 20-30) and 1 hasStudioLease (need 3-5)
- **Fix:** Adjusted probability constants for Section A (sustainability officer, carbon review), Section D (masterclass, seminars), Section F (marketing, premiere), hasStudioLease; biased B4/B6-B9 percentage ranges. Three rounds of `npm run seed` + visual inspection + test run converged on working values.
- **Files modified:** scripts/generator/index.ts
- **Verification:** 16/16 seedProjects.test.ts pass; 263/263 full suite
- **Committed in:** 92f7355 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (probability tuning — expected for PRNG-based generation)
**Impact on plan:** Necessary calibration; no scope creep.

## Issues Encountered

- Initial probability estimates were too conservative for the 20-30 pass rate target. The PRNG seed 0xDEADBEEF produces a specific sequence that with random-looking probabilities landed at 9/50 passes. Required iterative tuning to identify that Section B (post-production percentages) and Section F (marketing) were the primary levers. Final values land exactly at 20/50 passes — minimum of the required range.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `npm run seed` is a working command producing deterministic, type-correct output
- `src/data/seedProjects.ts` exports `SEED_PROJECTS: Project[]` — app compiles and tests pass
- Phase 6 (tiered-field-logic) can replace placeholder probability constants in `generateProject()` with correlated tier-based logic — all import paths and function signatures are in place
- The 20/50 pass rate is at the minimum edge; Phase 6 correlation work may shift it — the 20-30 window has buffer

---
*Phase: 05-generator-infrastructure*
*Completed: 2026-03-14*
