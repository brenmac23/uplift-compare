---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Realistic Seed Data
status: planning
stopped_at: Completed 07-distribution-targets-and-validation-02-PLAN.md
last_updated: "2026-03-14T09:18:36.887Z"
last_activity: 2026-03-14 — Roadmap created, 17 requirements mapped across phases 5-7
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 7
  completed_plans: 7
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** Instant, accurate side-by-side comparison of how a production fares under both the existing and proposed uplift scoring systems
**Current focus:** Phase 5 — Generator Infrastructure

## Current Position

Phase: 5 of 7 (Generator Infrastructure)
Plan: — of — in current phase
Status: Ready to plan
Last activity: 2026-03-14 — Roadmap created, 17 requirements mapped across phases 5-7

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (v1.1)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| — | — | — | — |

*Updated after each plan completion*
| Phase 05-generator-infrastructure P01 | 5min | 2 tasks | 6 files |
| Phase 05-generator-infrastructure P02 | 25min | 2 tasks | 3 files |
| Phase 06-tiered-field-logic P01 | 2min | 2 tasks | 2 files |
| Phase 06-tiered-field-logic P02 | 2min | 2 tasks | 2 files |
| Phase 06-tiered-field-logic P03 | 5min | 2 tasks | 4 files |
| Phase 07-distribution-targets-and-validation P01 | 3min | 2 tasks | 4 files |
| Phase 07-distribution-targets-and-validation P02 | 20min | 2 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
All v1.0 decisions archived — see milestones/v1.0-ROADMAP.md for full history.

- [v1.1 roadmap]: 3-phase structure (Generator Infrastructure → Tiered Field Logic → Distribution Targets) — coarse granularity, strict dependency order enforced by module architecture
- [v1.1 roadmap]: Target 28-30 passing projects (not exactly 30) to stay inside existing test's 20-30 window while hitting ~60% goal
- [Phase 05-generator-infrastructure]: Mulberry32 PRNG with SEED=0xDEADBEEF — zero-dep factory closure, deterministic sequences
- [Phase 05-generator-infrastructure]: Tier weights small=25%/mid=25%/large=30%/tentpole=20% — ~50% at $100m+ to satisfy 20-30 test window
- [Phase 05-generator-infrastructure]: Triangular distribution for QNZPE clustering — simple inverse CDF, no dependency
- [Phase 05-generator-infrastructure]: Probability tuning over PRNG output (not PRNG seed) is the calibration mechanism for distribution targets — iterative runs converged to 20/50 pass rate in 3 iterations
- [Phase 06-tiered-field-logic]: Wave 0 test-first: DIST tests written before generation changes to catch regressions during Plans 02/03
- [Phase 06-tiered-field-logic]: TIER3_FIELD_COSTS ordered cheapest-first for greedy point-chasing algorithm
- [Phase 06-tiered-field-logic]: Coin-flip + range sampling for bimodal post-production (simpler than two-component Gaussian mixture)
- [Phase 06-tiered-field-logic]: weightedSelect() exported from tier1.ts to keep import chain linear (tier2 imports tier1, no shared util module)
- [Phase 06-tiered-field-logic]: Pre-read pattern for 2-call fields ensures deterministic PRNG consumption regardless of branch taken
- [Phase 06-tiered-field-logic]: C5=0 still consumes rand() #16 and discards it to preserve PRNG offsets for all downstream fields
- [Phase 06-tiered-field-logic]: Expensive (Section E) selection probability tuned to 0.10 — plan spec was 0.40 but that gave 16 Section E active; max 8 allowed
- [Phase 06-tiered-field-logic]: B4_C2_COVARIANCE split asymmetrically: highShootingCrewPassProb=0.95 / lowShootingCrewPassProb=0.65 to satisfy both crewPercent>=80 constraint and DIST-04 correlation test
- [Phase 07-distribution-targets-and-validation]: Maori rand() calls placed after tier3 in generateProject() — shifts PRNG for subsequent projects (expected), 2 calls always consumed via pre-read pattern
- [Phase 07-distribution-targets-and-validation]: proposedPassed added to generateProject() return for SCEN-01 detection without re-scoring at report time
- [Phase 07-distribution-targets-and-validation]: AMBITION_VALUES extended from [40-45] to [42,44,46,48,50,52,54,56] with Option A (wider range) over Option B (same 6 shifted) for better greedy algorithm headroom
- [Phase 07-distribution-targets-and-validation]: SCEN-01 fallback override applied post-generation at index 49 using Section-E-heavy tentpole profile (existing=40, proposed=28) — asymmetry from Section E (8pts existing-only) is the differentiating mechanism

### Pending Todos

None.

### Blockers/Concerns

- [Phase 5]: Constraint matrix must be compiled as first task before any generation code — resolves known 20-30 vs. 60% conflict
- [Phase 7]: passes-existing-fails-proposed scenario cannot emerge by chance — requires explicit Section-E-heavy profile in generator design

## Session Continuity

Last session: 2026-03-14T09:15:17.511Z
Stopped at: Completed 07-distribution-targets-and-validation-02-PLAN.md
Resume file: None
