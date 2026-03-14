---
phase: 06-tiered-field-logic
verified: 2026-03-14T21:00:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 06: Tiered Field Logic Verification Report

**Phase Goal:** All 50 generated projects have field values that reflect how a line producer actually works through the uplift test — each tier referencing the previous tier's outputs for correlation
**Verified:** 2026-03-14T21:00:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Distribution test assertions exist for all five DIST requirements | VERIFIED | 8 test cases in `describe('distribution correlations')` block; seedProjects.test.ts lines 126-196 |
| 2 | correlations.ts exports budget-inverse weight tables for qualifying person fields | VERIFIED | 9 named exports: BUDGET_INVERSE_ATL_WEIGHTS, BUDGET_INVERSE_CAST_WEIGHTS, BUDGET_INVERSE_SUPPORTING_CAST_WEIGHTS, CASTING_LEVEL_WEIGHTS, POST_PRODUCTION_CONFIG, B4_C2_COVARIANCE, BTL_CONFIG, AMBITION_TARGET_WEIGHTS, TIER3_FIELD_COSTS |
| 3 | correlations.ts exports bimodal sampling parameters for post-production fields | VERIFIED | POST_PRODUCTION_CONFIG with highLowSplitProb, splitProb, highRange, lowRange |
| 4 | Tier 1 generates fundamentals with budget-inverse correlations for qualifying person fields | VERIFIED | tier1.ts generateTier1() applies BUDGET_INVERSE_ATL_WEIGHTS, BUDGET_INVERSE_CAST_WEIGHTS, CASTING_LEVEL_WEIGHTS; 6-call PRNG contract documented and implemented |
| 5 | Tier 2 generates B1/B5/B6-B9/C1/C2/C5/C6/C8 with cross-field correlations to Tier 1 | VERIFIED | tier2.ts generateTier2() takes Tier1Fields, implements DIST-01 through DIST-05; 17-call PRNG contract |
| 6 | Tier 3 generates point-chasing fields guided by score-gap to per-project ambition target (40-45) | VERIFIED | tier3.ts generateTier3() samples ambition target, scores baseline, greedy loop over TIER3_FIELD_COSTS cheapest-first; 23-call PRNG contract |
| 7 | generateProject() uses three-tier pipeline; all 50 projects satisfy distribution constraints | VERIFIED | index.ts wires tier1->tier2->tier3; seedProjects.ts contains 50 projects at 2363 lines |
| 8 | All DIST tests pass (bimodal, independence, C6>=C5, B4/C2 covariance, budget-inverse) | VERIFIED | `npx vitest run src/data/__tests__/seedProjects.test.ts` — 24/24 tests pass |
| 9 | Full test suite passes with no regressions | VERIFIED | `npx vitest run` — 271/271 tests across 7 test files pass |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/data/__tests__/seedProjects.test.ts` | Distribution assertions for DIST-01 through DIST-05 | VERIFIED | Contains "bimodal", all 8 DIST assertions present, 24 total tests |
| `scripts/generator/correlations.ts` | Weight tables and correlation constants for tier generation | VERIFIED | 9 exported constants; imports BudgetTier from ./types; 99 lines, fully substantive |
| `scripts/generator/tier1.ts` | generateTier1() with Tier1Fields type and weightedSelect() | VERIFIED | 148 lines; exports generateTier1, Tier1Fields, weightedSelect; budget-inverse correlations applied |
| `scripts/generator/tier2.ts` | generateTier2() with all DIST correlations | VERIFIED | 206 lines; exports generateTier2, Tier2Fields; imports Tier1Fields and 4 correlation constants |
| `scripts/generator/tier3.ts` | generateTier3() score-gap greedy function with Tier3Fields | VERIFIED | 317 lines; imports scoreExisting, TIER3_FIELD_COSTS, AMBITION_TARGET_WEIGHTS; Section E gated on qnzpe >= $100m |
| `scripts/generator/index.ts` | Refactored generateProject() using three-tier pipeline | VERIFIED | 108 lines; imports generateTier1, generateTier2, generateTier3; assembles complete ProjectInputs |
| `src/data/seedProjects.ts` | Regenerated seed data passing all distribution constraints | VERIFIED | 2363 lines, 50 projects, PRNG seed 0xDEADBEEF documented |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| scripts/generator/correlations.ts | scripts/generator/types.ts | `import type { BudgetTier }` | WIRED | Line 8: `import type { BudgetTier } from './types'` |
| scripts/generator/tier1.ts | scripts/generator/correlations.ts | `import BUDGET_INVERSE_*` | WIRED | Lines 24-27: imports BUDGET_INVERSE_ATL_WEIGHTS, BUDGET_INVERSE_CAST_WEIGHTS, CASTING_LEVEL_WEIGHTS |
| scripts/generator/tier2.ts | scripts/generator/correlations.ts | `import POST_PRODUCTION_CONFIG` | WIRED | Lines 38-42: imports POST_PRODUCTION_CONFIG, B4_C2_COVARIANCE, BTL_CONFIG, BUDGET_INVERSE_SUPPORTING_CAST_WEIGHTS |
| scripts/generator/tier2.ts | scripts/generator/tier1.ts | `import Tier1Fields` | WIRED | Line 43: `import { type Tier1Fields, weightedSelect } from './tier1'` |
| scripts/generator/tier3.ts | src/scoring/scoreExisting.ts | `scoreExisting()` call | WIRED | Line 39: `import { scoreExisting } from '../../src/scoring/scoreExisting'`; called at line 193 and 252 |
| scripts/generator/tier3.ts | scripts/generator/correlations.ts | `import TIER3_FIELD_COSTS` | WIRED | Line 40: `import { AMBITION_TARGET_WEIGHTS, TIER3_FIELD_COSTS } from './correlations'` |
| scripts/generator/index.ts | scripts/generator/tier1.ts | `import generateTier1` | WIRED | Line 17: `import { generateTier1 } from './tier1'`; called line 41 |
| scripts/generator/index.ts | scripts/generator/tier2.ts | `import generateTier2` | WIRED | Line 18: `import { generateTier2 } from './tier2'`; called line 44 |
| scripts/generator/index.ts | scripts/generator/tier3.ts | `import generateTier3` | WIRED | Line 19: `import { generateTier3 } from './tier3'`; called line 47 |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| TIER-01 | 06-02 | Tier 1 generates A1, B2, B3, B4, C4, C5, C7, C9 based on production nature and budget | SATISFIED | tier1.ts generates A1/B2/B3/B4/C4/C7/C9; C5 deliberately deferred to Tier 2 (noted in Plan 02 line 132) — still within TIER-01 intent since it's budget-driven |
| TIER-02 | 06-02 | Tier 2 generates B1, B5, B6-B9, C1, C2, C6, C8 with correlations to Tier 1 values | SATISFIED | tier2.ts generates all listed fields including C5 (deferred from Tier 1); all cross-tier correlations via Tier1Fields parameter |
| TIER-03 | 06-03 | Tier 3 generates A2/A3, D1-D4, E1-E3, F1-F4 sparsely, guided by score gap to ~40pt target | SATISFIED | tier3.ts implements score-gap greedy algorithm with ambition targets 40-45; Section E gated on high-budget only |
| DIST-01 | 06-01, 06-02, 06-03 | Post-production (B6/B7) is bimodal — picture and sound coupled | SATISFIED | POST_PRODUCTION_CONFIG bimodal logic in tier2.ts; test passes: all values <= 10 or >= 75 |
| DIST-02 | 06-01, 06-02, 06-03 | VFX (B8) and concept effects (B9) are independent of B6/B7 | SATISFIED | `Math.round(rand() * 100)` uniform for both; test passes: mean difference < 30 between high/low post groups |
| DIST-03 | 06-01, 06-02, 06-03 | BTL additional crew (C6) >= BTL key crew (C5); C5=0 implies C6=0 | SATISFIED | Hard constraint in tier2.ts lines 176-184; PRNG consumed even when C5=0; test passes: all 50 projects compliant |
| DIST-04 | 06-01, 06-02, 06-03 | Low shooting % (B4) correlates with low crew % (C2) | SATISFIED | B4_C2_COVARIANCE (0.95/0.65) in tier2.ts; test passes: highShootingPassRate > lowShootingPassRate |
| DIST-05 | 06-01, 06-02, 06-03 | Higher QNZPE inversely correlates with qualifying person scores | SATISFIED | Budget-inverse weights applied to atlCount/hasLeadCast/castingLevel/castPercent/supportingCastCount; test passes: smallMid mean atlCount > largeTentpole mean |

**All 8 requirement IDs accounted for. No orphaned requirements.**

---

### Anti-Patterns Found

None detected in phase-modified files.

Scanned files:
- `scripts/generator/correlations.ts` — pure data constants, no stubs
- `scripts/generator/tier1.ts` — complete implementation with documented PRNG contract
- `scripts/generator/tier2.ts` — complete implementation with documented PRNG contract
- `scripts/generator/tier3.ts` — complete greedy algorithm, Section E gating implemented
- `scripts/generator/index.ts` — complete three-tier pipeline, no placeholder returns
- `src/data/__tests__/seedProjects.test.ts` — substantive assertions for all DIST constraints
- `src/data/seedProjects.ts` — 2363-line generated file, 50 projects

Notable deviation from plan (auto-fixed, no regression):
- Section E selection probability lowered from plan-spec 0.40 to 0.10 (plan acknowledged iterative tuning was expected)
- B4_C2_COVARIANCE adjusted to 0.95/0.65 (from plan-spec 0.88/0.35) to satisfy both DIST-04 and the >= 40 crewPercent >= 80 constraint simultaneously

Both are calibration adjustments within plan-sanctioned bounds, not implementation gaps.

---

### Human Verification Required

None. All phase-06 constraints are numerically verifiable and test-covered:
- DIST-01 through DIST-05: passing vitest assertions on 50 concrete data points
- PRNG determinism: two-run comparison documented in SUMMARY-03
- Section E gating: structural rule verified by `Section E fields only on projects with qnzpe >= $100m` test

---

### Commit Verification

All commits referenced in SUMMARY files confirmed in git log:

| Commit | Description |
|--------|-------------|
| 71cdd66 | test(06-01): add distribution assertions for DIST-01 through DIST-05 |
| 8ed76bd | feat(06-01): populate correlations module with weight tables |
| 8c27ada | feat(06-02): create Tier 1 field generation module |
| 351b75d | feat(06-02): create Tier 2 field generation module |
| d37a437 | feat(06-03): create Tier 3 score-gap greedy point-chasing module |
| 6a100f5 | feat(06-03): wire three-tier pipeline into generateProject() and regenerate seed data |

---

### Phase Goal Verdict

The phase goal is fully achieved.

All 50 generated projects have field values that reflect how a line producer actually works through the uplift test:

- **Tier 1** establishes budget-correlated production fundamentals (shooting location, qualifying person choices) — smaller budgets favour more local talent
- **Tier 2** reads Tier 1 output to produce logistical follow-ons (post-production bimodal clustering, crew percentages correlated to shooting percentage, BTL counts gated on post-production presence)
- **Tier 3** reads Tier 1+2 output, computes the live score gap to a per-project ambition target (40-45), then greedily selects cheap-to-expensive criteria to close that gap — modeling the actual producer decision-making process

The pipeline is deterministic (fixed PRNG calls per tier: 6+17+23), all 8 distribution constraints are enforced by passing tests, and TypeScript compiles cleanly with zero errors.

---

_Verified: 2026-03-14T21:00:00Z_
_Verifier: Claude (gsd-verifier)_
