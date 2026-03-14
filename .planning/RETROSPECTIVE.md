# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — Realistic Seed Data

**Shipped:** 2026-03-14
**Phases:** 3 | **Plans:** 7

### What Was Built
- Deterministic seed generator with Mulberry32 PRNG — `npm run seed` produces identical 50-project dataset from fixed seed
- Three-tier field generation pipeline (Fundamentals → Correlations → Point-chasing) modelling how a line producer works through the uplift test
- Cross-field correlations: bimodal post-production (B6/B7), budget-inverse talent scoring, shooting/crew covariance (B4/C2), BTL crew correlation (C5/C6)
- Score-gap greedy point-chasing algorithm with soft ~50pt cap
- All 4 special scenarios verified: passes-existing-fails-proposed, Maori activation, ~60% pass rate, soft score cap
- Wave 0 distribution regression tests (DIST-01 through DIST-05) catching generation logic regressions

### What Worked
- Wave 0 test-first pattern: DIST tests written before generation changes meant every Tier 1/2/3 implementation had immediate feedback
- Pre-read PRNG pattern: consuming a fixed number of rand() calls regardless of branch eliminated an entire class of non-determinism bugs
- Probability tuning over PRNG output (not seed): iterative weight adjustments converged on distribution targets in 2-3 iterations
- Coarse 3-phase granularity matched the strict dependency chain — no wasted planning overhead
- Single-day execution again — tight scope and clear constraints enabled rapid completion

### What Was Inefficient
- Section E selection probability spec'd at 0.40 but needed 0.10 in practice — plan spec was too aggressive, required runtime tuning
- B4_C2_COVARIANCE needed asymmetric split (0.95/0.65) instead of symmetric — plan underspecified the constraint interaction
- SCEN-01 (passes-existing-fails-proposed) cannot emerge organically from the generator — required explicit fallback override at index 49, which was only discovered during Phase 7 execution
- AMBITION_VALUES needed widening from [40-45] to [42-56] to give the greedy algorithm enough headroom — original range too conservative

### Patterns Established
- Pre-read-both-then-use for 2-call PRNG fields — guarantees deterministic consumption regardless of branch
- Post-generation override for scenarios that can't emerge from probabilistic generation
- Score-gap greedy with cheapest-first ordering as standard point-chasing approach
- Coin-flip + range sampling as lightweight bimodal distribution (simpler than Gaussian mixture)

### Key Lessons
1. Deterministic PRNG contracts (fixed call count per function) are essential for reproducible generation — any branch-dependent consumption creates cascading non-determinism across all subsequent projects
2. Some scenarios (like passes-existing-fails-proposed) are mathematically unlikely to emerge from tuning alone — identify these during planning and design explicit fallback mechanisms
3. Weight/probability specs in plans should be treated as starting points, not targets — iterative calibration against test assertions is the real tuning mechanism
4. Wave 0 test-first for statistical properties is even more valuable than unit-test-first — it catches distribution regressions that individual project tests miss

### Cost Observations
- Sessions: ~3 (research/plan, execute phases 5-6, execute phase 7)
- Notable: 7 plans completed in a single day, same velocity as v1.0's 13 plans — generator work is more computation-heavy but fewer files

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-13
**Phases:** 4 | **Plans:** 13

### What Was Built
- Dual scoring engine encoding existing (33 criteria, 85pt max) and proposed (24 criteria, 70pt max) uplift tests with 263 unit tests
- 50 seeded fictional projects with realistic distribution across budget tiers and pass/fail outcomes
- Full SPA: summary table with filters/stats, three-column detail screen with live scoring, project creation and JSON import
- Browser-side Excel export via SheetJS
- Client-side password gate with sessionStorage persistence

### What Worked
- Engine-first build order: scoring correctness validated with 170+ tests before any UI, meaning UI phase had zero scoring bugs
- Human verification of SCORING_SPEC.md caught a BTL Additional scoring error (0.5pts not 1pt) before it propagated
- Pure function architecture: scoreExisting/scoreProposed consumed cleanly by UI, export, and tests with no coupling
- Single-day execution for entire MVP — tight dependency chain kept scope focused

### What Was Inefficient
- Plan counting errors (criteria count wrong in 2 plans) required mid-execution corrections
- SCORING_SPEC.md Example 2 arithmetic error (36 vs 35pts) needed human catch
- SheetJS npm registry unavailable — CDN tarball workaround added friction
- Phase 4 marked as "1/2 plans executed" in ROADMAP.md even though both completed (stale status)

### Patterns Established
- SCORING_SPEC.md as human-verified ground truth before TDD implementation
- Criterion tooltip keys prefixed by system ('existing:ID' / 'proposed:ID') to handle ID reuse
- Local useState + useMemo pattern for forms with live scoring (avoids store re-renders)
- QNZPE in whole dollars internally, millions in UI — conversion at boundary

### Key Lessons
1. Human verification gates on domain-critical specs pay for themselves — the 0.5pt BTL error would have cascaded through every test
2. Engine-first ordering eliminates an entire class of integration bugs — UI just calls pure functions
3. Plan task counts and criteria counts should be verified against source documents, not estimated

### Cost Observations
- Sessions: ~4 (one per phase, roughly)
- Notable: Entire MVP built in a single day — engine-first ordering and pure function architecture enabled rapid parallel-safe execution

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 13 | Engine-first build order, human-verified spec |
| v1.1 | 3 | 7 | Wave 0 test-first, pre-read PRNG pattern, iterative calibration |

### Cumulative Quality

| Milestone | Tests | Key Metric |
|-----------|-------|------------|
| v1.0 | 263 | 23/23 requirements satisfied |
| v1.1 | 275 | 17/17 requirements satisfied, all 4 SCEN assertions green |

### Top Lessons (Verified Across Milestones)

1. Human verification on domain specs catches errors that tests cannot — confirmed across both milestones (scoring spec in v1.0, constraint interactions in v1.1)
2. Engine-first / test-first ordering eliminates integration bugs — confirmed: v1.0 engine-first, v1.1 Wave 0 test-first
3. Single-day milestone execution is sustainable with tight scope, clear constraints, and strict dependency ordering — confirmed across both milestones
