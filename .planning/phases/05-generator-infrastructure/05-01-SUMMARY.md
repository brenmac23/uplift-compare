---
phase: 05-generator-infrastructure
plan: 01
subsystem: infra
tags: [tsx, prng, generator, typescript, seed-data]

# Dependency graph
requires: []
provides:
  - "scripts/generator/types.ts: BudgetTier, BudgetTierConfig, GeneratorConfig, ProductionType, SEED, PROJECT_COUNT"
  - "scripts/generator/prng.ts: mulberry32 createPrng() factory — deterministic seeded PRNG"
  - "scripts/generator/projectNames.ts: 50 film names + 32 TV series names with genre variety"
  - "scripts/generator/tiers.ts: four budget tier configs, triangular distribution, sampleQnzpe(), pickBudgetTier()"
  - "scripts/generator/correlations.ts: typed stub for Phase 6 correlation tables"
  - "tsx devDependency + 'seed' npm script"
affects:
  - 05-generator-infrastructure (plans 02+)
  - 06-tiered-field-logic
  - 07-distribution-targets

# Tech tracking
tech-stack:
  added: [tsx@4.21.0]
  patterns:
    - "Mulberry32 seeded PRNG factory: createPrng(seed) returns closure with no mutable global state"
    - "Triangular distribution inverse CDF for budget clustering within tiers"
    - "Weighted tier selection: small=25%, mid=25%, large=30%, tentpole=20% → ~50% at $100m+"

key-files:
  created:
    - scripts/generator/types.ts
    - scripts/generator/prng.ts
    - scripts/generator/projectNames.ts
    - scripts/generator/tiers.ts
    - scripts/generator/correlations.ts
  modified:
    - package.json

key-decisions:
  - "Use mulberry32 PRNG (not seedrandom or Math.random()) — ~10 lines, zero deps, deterministic closure"
  - "Seed constant 0xDEADBEEF — arbitrary, documented in code, easy to trace in logs"
  - "Triangular distribution for QNZPE clustering — simple, transparent, no dependency"
  - "Tier weights: small=25% mid=25% large=30% tentpole=20% — produces ~50% at $100m+ to satisfy test window"
  - "50 film names + 32 TV names — buffer beyond 50 needed, 60/40 split mirrors production type ratio"

patterns-established:
  - "Pattern: Generator modules import types from ./types; never cross-import between sibling modules"
  - "Pattern: All randomness flows through createPrng() closure; no Math.random() in generator code"
  - "Pattern: PRNG passed as function parameter (rand: () => number) — never stored at module level"

requirements-completed: [GEN-01, NAME-01]

# Metrics
duration: 5min
completed: 2026-03-14
---

# Phase 5 Plan 01: Generator Infrastructure Summary

**Mulberry32 seeded PRNG factory, four-tier budget clustering with triangular distribution, and curated 82-name project pool — all generator building blocks for Plan 02's generateProject()**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-14T06:36:40Z
- **Completed:** 2026-03-14T06:41:49Z
- **Tasks:** 2
- **Files modified:** 6 (5 created + package.json)

## Accomplishments

- tsx@4.21.0 installed as devDependency with `npm run seed` script wired up
- Deterministic mulberry32 PRNG verified: identical sequences from identical seeds
- 82 creative fictional project names (50 film + 32 TV) with genre variety across action, sci-fi, fantasy, drama, horror, comedy
- Budget tier logic with triangular distribution clustering and weighted selection (~50% of projects at $100m+)
- Typed correlations stub with verified import paths ready for Phase 6

## Task Commits

Each task was committed atomically:

1. **Task 1: Install tsx and create generator types + PRNG** - `9f76ebc` (feat)
2. **Task 2: Create project name pools, budget tiers, and correlations stub** - `1c26532` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `scripts/generator/types.ts` - BudgetTier, BudgetTierConfig, GeneratorConfig, ProductionType, SEED (0xDEADBEEF), PROJECT_COUNT (50)
- `scripts/generator/prng.ts` - createPrng(seed): mulberry32 factory returning () => number closure
- `scripts/generator/projectNames.ts` - FILM_NAMES (50 entries), TV_NAMES (32 entries), genre variety, mixed tone
- `scripts/generator/tiers.ts` - BUDGET_TIERS, triangular(), sampleQnzpe(), pickBudgetTier() with weighted selection
- `scripts/generator/correlations.ts` - CORRELATIONS stub, BudgetTier/ProductionType imports verified
- `package.json` - tsx in devDependencies, seed script added

## Decisions Made

- **Mulberry32 over external library:** Zero dependencies, ~10 lines, deterministic closure with no global state.
- **SEED = 0xDEADBEEF:** Arbitrary but memorable; documented in types.ts comment.
- **Triangular distribution for QNZPE:** Simple inverse CDF with no dependency. Mode derived from clusterCenter fraction.
- **Tier weights small=25%/mid=25%/large=30%/tentpole=20%:** Produces ~50% of projects at $100m+, keeping generated set inside the existing test's 20-30 projects constraint.
- **50 film + 32 TV names:** Buffer pool beyond the 50 needed; 60/40 split mirrors the planned 60% film / 40% TV production type ratio.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All five scripts/generator/ building blocks are complete and TypeScript-clean.
- Plan 02 can immediately import from types, prng, projectNames, tiers, and correlations.
- tsx runner is available for `npx tsx` and `npm run seed`.
- No blockers.

---
*Phase: 05-generator-infrastructure*
*Completed: 2026-03-14*
