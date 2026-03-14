---
phase: 01-scoring-engine
plan: 03
subsystem: scoring
tags: [typescript, vitest, scoring, proposed, tdd]

# Dependency graph
requires:
  - phase: 01-scoring-engine
    plan: 01
    provides: "ProjectInputs, ScoringResult, CriterionResult, SectionResult types; scoreHighestTier, scoreCountCapped helpers; PROPOSED_SPEC constants in spec.ts"
provides:
  - scoreProposed pure function (src/scoring/scoreProposed.ts)
  - 90-test suite covering all 24 criteria, section totals, pass logic, B5 half-points, worked examples
  - QNZPE-tiered pass threshold logic (< $100m → 20, >= $100m → 30)
affects: [01-04-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD red-green workflow — failing tests committed before implementation
    - All PROPOSED_SPEC constants used directly — no magic numbers in scoreProposed
    - QNZPE-tiered pass threshold via ternary on PROPOSED_SPEC.qnzpeThreshold
    - D1 Premiere as two independent binary scores summed (not a selector)
    - sumNumericScores private helper filters N/A defensively (none in proposed)

key-files:
  created:
    - src/scoring/scoreProposed.ts
    - src/scoring/__tests__/scoreProposed.test.ts
  modified: []

key-decisions:
  - "Criterion count is 24 (A:8 + B:8 + C:4 + D:4), not 22 — test corrected to match spec"
  - "QNZPE threshold comparison: >= 100_000_000 for 30pt threshold, < 100_000_000 for 20pt threshold (matches PROPOSED_SPEC.qnzpeThreshold)"
  - "sumNumericScores private helper defensive against N/A scores even though proposed has none"
  - "D1 Premiere scored as two additive binaries — no exclusive selector, both can be earned"

patterns-established:
  - "scoreProposed follows same structural pattern as scoreExisting: section-by-section criterion construction then SectionResult aggregation"
  - "Attachment/internship QNZPE threshold: > qnzpeThreshold (strict greater-than) for over100m bucket"

requirements-completed: [SCORE-02, SCORE-05]

# Metrics
duration: 5min
completed: 2026-03-13
---

# Phase 1 Plan 03: scoreProposed — Proposed Uplift Points Test Engine Summary

**scoreProposed() pure function with 90 unit tests: 24 criteria across 4 sections (A=20pts, B=32pts, C=6pts, D=12pts), QNZPE-tiered pass threshold (20 for <$100m, 30 for >=$100m), B5 half-point arithmetic, and worked-example validation from SCORING_SPEC.md**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-13T01:22:46Z
- **Completed:** 2026-03-13T01:27:54Z
- **Tasks:** 2 of 2 (RED + GREEN, TDD)
- **Files modified:** 2 created

## Accomplishments
- `scoreProposed()` pure function implementing all 24 proposed criteria across 4 sections
- 90 tests covering: criterion scoring, section totals, pass threshold QNZPE logic (with boundary tests), B5 half-point arithmetic, full worked examples from SCORING_SPEC.md
- Maximum score tests confirm A=20, B=32, C=6, D=12, total=70
- Existing-only criteria correctly absent (no Sustainability, Studio Lease, Maori criteria, Masterclass, Innovation, or Tourism Marketing)
- All 211 tests across the project pass (helpers + scoreExisting + scoreProposed)

## Task Commits

Each task was committed atomically:

1. **RED — failing tests for scoreProposed** - `2322aa3` (test)
2. **GREEN — implement scoreProposed + fix criterion count test** - `ea118e9` (feat)

## Files Created/Modified
- `src/scoring/scoreProposed.ts` - scoreProposed pure function (195 lines), all constants from PROPOSED_SPEC
- `src/scoring/__tests__/scoreProposed.test.ts` - 90 unit tests across 8 describe blocks (823 lines)

## Decisions Made
- Criterion count is 24 not 22 — test initially written as 22 (counting ~22 criterion specs by rough read), corrected to 24 (A:8+B:8+C:4+D:4) upon implementation. Arithmetic error in initial test, not a logic error.
- QNZPE threshold for C3/C4 attachment/internship uses strict `>` (over100m) vs `<=` (under100m), matching PROPOSED_SPEC bucket naming and SCORING_SPEC.md boundary example.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Criterion count test corrected from 22 to 24**
- **Found during:** GREEN phase (first test run)
- **Issue:** Test asserted `toHaveLength(22)` but proposed has 24 criteria (A1-A8=8, B1-B8=8, C1-C4=4, D1-D4=4). The plan description mentions "~22 criteria" informally; actual spec-derived count is 24.
- **Fix:** Updated test assertion to `toHaveLength(24)` — implementation was correct, test comment was wrong
- **Files modified:** `src/scoring/__tests__/scoreProposed.test.ts`
- **Verification:** All 90 tests pass after fix
- **Committed in:** `ea118e9` (GREEN commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — test assertion off by 2)
**Impact on plan:** Minimal. Implementation was correct; only the test expectation needed correction. Criterion count of 24 verified against SCORING_SPEC.md section breakdown.

## Issues Encountered
None beyond the criterion count assertion — resolved immediately.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both `scoreExisting()` and `scoreProposed()` are complete and tested
- Plan 04 (integration + store) can proceed — both scoring engines ready
- All 211 project tests pass

---
*Phase: 01-scoring-engine*
*Completed: 2026-03-13*
