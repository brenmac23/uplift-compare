# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

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

### Cumulative Quality

| Milestone | Tests | Key Metric |
|-----------|-------|------------|
| v1.0 | 263 | 23/23 requirements satisfied |

### Top Lessons (Verified Across Milestones)

1. Human verification on domain specs catches errors that tests cannot (first milestone — needs cross-validation)
2. Engine-first ordering eliminates integration bugs at UI layer (first milestone — needs cross-validation)
