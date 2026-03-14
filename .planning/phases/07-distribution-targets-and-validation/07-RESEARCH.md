# Phase 7: Distribution Targets and Validation - Research

**Researched:** 2026-03-14
**Domain:** Seed data tuning, statistical validation, PRNG-deterministic special scenario injection
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Passes-existing-fails-proposed (SCEN-01):** Hybrid approach — tune parameters to produce naturally; if tuning fails, reserve a fallback project index with overrides. Target 2-3 if they emerge naturally, guarantee at least 1. Do not suppress fails-existing-passes-proposed reverse scenarios if they emerge.
- **Maori criteria (SCEN-02):** Probabilistic — each project has ~2% chance of being Maori-active. No guarantee of exactly 1 — whatever the PRNG produces at 2% probability is acceptable.
- **Validation approach:** Build an automated tuning script that converges on pass rate (~60%) and score distribution shape (median ~48). Distribution report stays focused on existing scoring — proposed scoring verification only in test assertions.
- **Score distribution shape (SCEN-04):** Target median ~48, range 35-58. Natural bell-curve, most projects land 45-52, tails at 35-40 and 55-58. Stddev assertion: 4-12.
- **Pass rate testing (SCEN-03):** Test assertion range 25-35 (50-70% buffer). Tuning target tighter: ~28-30 projects passing.

### Claude's Discretion

- Which parameters to auto-tune vs. verify-only
- Tuning script architecture and convergence algorithm
- Exact Maori field values and combination (C3 only, C10 only, or both)
- Production profile for passes-existing-fails-proposed scenario
- Whether to enhance the distribution report with a histogram

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCEN-01 | At least one project passes the existing test but fails the proposed test | Scoring gap analysis between existing (40pt threshold) and proposed (30pt threshold for QNZPE >=100m) reveals how a high-budget, Section-E/F-heavy project can score 40+ existing but miss proposed's different weighting. Fallback override mechanism identified. |
| SCEN-02 | Approximately 1-2% of projects (1 out of 50) have active Maori criteria (C3/C10) | PRNG pre-read pattern (consume rand() even when branch not taken) is established and must be applied here. C3 requires maoriCrewPercent>=10; C10 requires hasLeadCastMaori=true. Both fields currently hardcoded to 0/false in index.ts lines 94-95. |
| SCEN-03 | Approximately 60% of projects pass the existing test | Existing test count (seedProjects.test.ts line 58-62) already asserts 20-30 passing, but SCEN-03 targets 28-30 (56-60%). Tuning knobs identified in AMBITION_TARGET_WEIGHTS and SELECTION_PROBS. The existing assertion window (20-30) must remain green while the actual count is pushed toward 28-30. |
| SCEN-04 | Projects soft-cap around ~50 points — point-chasing becomes unlikely as score exceeds target | The Tier 3 greedy algorithm already implements a soft cap via the gap-based selection gate (skip if gap<=0). The ambition target distribution (AMBITION_TARGET_WEIGHTS centered at 40-45) must be retuned upward to shift the score median from its current position to ~48. |
</phase_requirements>

---

## Summary

Phase 7 has no new infrastructure to build — it tunes existing levers and adds two surgical code changes. All randomness infrastructure, scoring engines, and generation pipeline are complete. The work is:

1. **Two code changes in generator:** Replace the hardcoded `maoriCrewPercent: 0` / `hasLeadCastMaori: false` lines in `scripts/generator/index.ts` with probabilistic Maori activation (SCEN-02), consuming a deterministic PRNG call. Understand the PRNG pre-read pattern to preserve offsets for any project that does not activate Maori criteria.

2. **Ambition target retuning:** Shift `AMBITION_TARGET_WEIGHTS` in `correlations.ts` upward from the current [40-45 center] toward [43-48 center] to drive median score toward ~48 (SCEN-03, SCEN-04). Each `npm run seed` prints the distribution report, making iteration fast.

3. **SCEN-01 investigation then fallback:** Run the retuned generator, scan for any project where `scoreExisting(inputs).passed && !scoreProposed(inputs).passed`. The structural difference between the two scoring systems makes this likely for high-budget projects heavy on Section E/F criteria that the existing system rewards more than the proposed. If no natural case emerges, reserve index with a deterministic override profile.

4. **Test additions in seedProjects.test.ts:** Four new `it()` blocks for SCEN-01 through SCEN-04. Two existing assertions (`maoriCrewPercent === 0`, `hasLeadCastMaori === false`) must be replaced or relaxed to accommodate the Maori activation scenario.

5. **Distribution report expansion:** Add SCEN-01 through SCEN-04 lines to the stdout report in `generateSeedData.ts`.

6. **Tuning script (optional but decided):** A `scripts/tuneSeedData.ts` entry point that systematically adjusts `AMBITION_TARGET_WEIGHTS` and/or `SELECTION_PROBS`, runs generation, checks stats, and reports convergence — replacing manual iteration.

**Primary recommendation:** Start with tuning (SCEN-03/SCEN-04) since it drives the seed output that SCEN-01 depends on. Maori activation (SCEN-02) is independent and can be done in parallel as a standalone code change.

---

## Standard Stack

### Core (no new dependencies needed)

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| vitest | ^4.1.0 | Test runner for new SCEN assertions | Already installed, all existing tests use it |
| tsx | ^4.21.0 | Runs generator scripts directly | Already powering `npm run seed` |
| TypeScript | ~5.9.3 | All generator code is typed | Project-wide standard |

### No New Dependencies

Phase 7 adds no npm packages. All tooling is already in place:
- `scoreExisting` and `scoreProposed` from `src/scoring/` are already importable in generators
- `scoreProposed` is not yet imported in `scripts/generator/index.ts` — it needs to be added for SCEN-01 detection

---

## Architecture Patterns

### Established Patterns (MUST follow)

#### Pre-Read Pattern for Conditional Fields
Every project in the PRNG sequence consumes a fixed number of `rand()` calls, regardless of branching. Fields that might not activate still read their `rand()` and discard the value when the condition is false. This is the most critical pattern for Phase 7 — violation breaks all downstream PRNG offsets.

```typescript
// CORRECT: Consumes rand() even when Maori not active
const maoriRoll = rand();            // Always consumed — preserves PRNG sequence
const maoriActive = maoriRoll < 0.02;
const maoriCrewPercent = maoriActive ? (10 + Math.floor(rand() * 20)) : 0;
// ⚠️ If maoriCrewPercent has a value rand(), must ALSO consume it unconditionally:
const maoriCrewValueRoll = rand();  // Pre-read — consumed regardless of maoriActive
const maoriCrewPercent = maoriActive ? (10 + Math.floor(maoriCrewValueRoll * 20)) : 0;
```

Precedent: `tier3.ts` lines 207-219 — all 18 greedy-loop rand() calls are pre-read upfront in a single pass, then branch logic decides which pre-read values are used.

Precedent: C5=0 case in tier2 — still consumes rand() #16 and discards it (STATE.md decision log).

#### PRNG Call Budget Tracking
The comment block at the top of `scripts/generator/index.ts` documents the total rand() call count per project. When Phase 7 adds Maori rand() calls, this comment must be updated:

```
// Total: sampleQnzpe (varies) + 6 + 17 + 23 + [new Maori calls] per project.
```

#### Distribution Report Pattern
`generateSeedData.ts` computes stats and prints to stdout after generation. Phase 7 extends this with SCEN stats — same pattern, no architectural change.

### Recommended Project Structure (additions only)

```
scripts/
├── generator/
│   ├── correlations.ts     # AMBITION_TARGET_WEIGHTS retuned here (SCEN-03/04)
│   └── index.ts            # Maori activation added here (SCEN-02); scoreProposed imported
├── generateSeedData.ts     # Distribution report extended with SCEN-01 through SCEN-04
└── tuneSeedData.ts         # NEW: automated tuning script (Claude's discretion)
src/data/__tests__/
└── seedProjects.test.ts    # New SCEN-01 through SCEN-04 assertions added; Maori assertions updated
```

### SCEN-01 Mechanism Analysis

The existing and proposed systems reward different criteria with different weights. The structural gap that enables passes-existing-fails-proposed:

**Existing system:** Has Section E (Innovation, 8pts max), Section F (Marketing, 12pts max). A high-budget project with E1+E2+E3 (8pts) + F1+F2+F3+F4 (12pts) can reach 40pts via Section E/F alone if Tier 1-3 add 20+ points.

**Proposed system (QNZPE >= $100m):** Pass threshold is 30pts, but Section E and F criteria don't exist in the same form. The proposed system's Section D (Marketing) has different structure — `hasFilmMarketing` maps to D2 (3pts), `hasTourismPartnership` maps to D4 (4pts), premiere maps to D1 (2+2pts). Critically, Section E (E1 hasKnowledgeTransfer=2pts, E2 commercialAgreement=3pts, E3 infrastructureInvestment=3pts) has **no direct proposed equivalent** — those 8 points from existing simply don't transfer to proposed.

A project that relies heavily on Section E active fields + limited Section B/C (low crew%, low ATL because tentpole budget) could score 40-45 existing but fall below 30 in proposed because:
- E1/E2/E3 give 0 points in proposed
- Proposed B2 (crew, 3pts) and B3 (ATL, 9pts max) require strong personnel which high-budget projects may lack

**Profile to tune for SCEN-01:** tentpole budget, hasKnowledgeTransfer=true, commercialAgreementPercent>0, infrastructureInvestment>0, low atlCount (0-1), no hasLeadCast, low crewPercent.

### Anti-Patterns to Avoid

- **Adjusting PRNG seed:** Changing SEED in `types.ts` would regenerate all 50 projects from scratch, invalidating all existing test snapshots. Tune parameters, not the seed.
- **Consuming rand() inside an if-branch:** This shifts all downstream PRNG values for projects that take a different branch, breaking determinism across the 50-project sequence.
- **Adding Maori fields without pre-reading:** If `maoriCrewPercent` value needs a rand() call, that call must occur before any branching.
- **Assuming scoreProposed pass threshold is the same as existing:** Existing uses flat 40pts; proposed uses 20pts (QNZPE <$100m) or 30pts (>=100m). The QNZPE-tiered threshold is critical for SCEN-01 analysis.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Score computation | Custom scoring logic in tuning script | `scoreExisting()` and `scoreProposed()` from `src/scoring/` | Single source of truth; already tested |
| Statistical stddev | Custom implementation | One-pass variance formula inline | Simple enough — no library needed, just `Math.sqrt(variance)` |
| PRNG | Any other RNG approach | Existing `createPrng(SEED)` from `scripts/generator/prng.ts` | Changing PRNG invalidates all existing tests |

**Key insight:** The entire value of Phase 7 is *not* building new systems — it is calibrating existing ones. Any code that reimplements scoring or PRNG logic is wrong by definition.

---

## Common Pitfalls

### Pitfall 1: Breaking existing `maoriCrewPercent === 0` test assertion
**What goes wrong:** The existing test in `seedProjects.test.ts` (lines 81-83) asserts ALL 50 projects have `maoriCrewPercent === 0`. After SCEN-02, at least one project may have a non-zero value.
**Why it happens:** The test was written when Maori fields were always false/0.
**How to avoid:** Before implementing SCEN-02, update the two Maori assertions to accommodate 0-2 projects with active Maori criteria. Change from "all projects must have 0/false" to "at most N projects have active Maori criteria". The existing test must stay green after SCEN-02 is implemented.
**Warning signs:** Test failure on `maoriCrewPercent === 0` or `hasLeadCastMaori === false`.

### Pitfall 2: SCEN-01 is impossible with current ambition target distribution
**What goes wrong:** The current AMBITION_TARGET_WEIGHTS center the greedy ambition at 40-45 points. If tuning drives most projects to 45-52 (SCEN-04), more projects will activate Section E/F, potentially making passes-existing-fails-proposed scenarios more common. But if the proposed system's lower threshold (30pts for big budgets) catches most of these projects anyway, SCEN-01 may be hard to produce naturally.
**Why it happens:** The proposed pass threshold (30pts for QNZPE >= $100m) is much lower than existing (40pts), so many projects that pass existing also pass proposed.
**How to avoid:** After tuning for SCEN-04, immediately run `scoreProposed` across all 50 projects to check for natural SCEN-01 instances before considering the fallback override. If none found, apply a targeted override at a reserved index (e.g., project index 0 or 49) with the Section-E-heavy / low-personnel profile described above.

### Pitfall 3: Tuning AMBITION_TARGET_WEIGHTS without tracking median separately from mean
**What goes wrong:** The distribution report in `generateSeedData.ts` currently reports min/max but not median. Tuning toward median 48 requires actually computing the median.
**Why it happens:** Median is not currently in the distribution report.
**How to avoid:** Add median computation to the report before starting tuning. Median is: sort scores array, take middle element. This is the primary dial for SCEN-04 validation.

### Pitfall 4: Maori rand() call count not matching the PRNG contract
**What goes wrong:** Adding Maori logic that conditionally consumes 0 or 1 extra rand() calls — instead of always consuming a fixed count — breaks PRNG offsets for all subsequent projects.
**Why it happens:** Natural coding instinct is to only sample a value when it will be used.
**How to avoid:** Decide on a fixed number of Maori rand() calls (e.g., 2: one for activation probability, one for maoriCrewPercent value sampling). Always consume both, regardless of whether the project is Maori-active. Update the PRNG call count comment in `index.ts`.

### Pitfall 5: Tuning SELECTION_PROBS when AMBITION_TARGET_WEIGHTS is the right lever
**What goes wrong:** Adjusting cheap/medium/expensive selection probabilities changes the Section E count and Section F distribution, not just the pass rate. This can cause the studioLease, Section E count, or crewPercent tests to fail.
**Why it happens:** SELECTION_PROBS seems like an obvious pass rate knob.
**How to avoid:** Primary pass rate tuning lever is AMBITION_TARGET_WEIGHTS (shifts the ambition target distribution, which directly controls how aggressively Tier 3 adds points). SELECTION_PROBS should only be adjusted if the ambition target approach is insufficient, and only after verifying Section E count stays <= 8.

---

## Code Examples

### Maori Probabilistic Activation (SCEN-02 pattern)

```typescript
// In scripts/generator/index.ts, replacing lines 93-95
// Pattern: pre-read both rand() calls unconditionally to preserve PRNG offsets

// Maori activation (SCEN-02): ~2% probability per project
// rand() N: activation roll — always consumed
const maoriActivationRoll = rand();
// rand() N+1: crew percent value — always consumed (pre-read pattern)
const maoriCrewValueRoll = rand();

const maoriActive = maoriActivationRoll < 0.02;
const maoriCrewPercent = maoriActive ? (10 + Math.floor(maoriCrewValueRoll * 20)) : 0;
const hasLeadCastMaori = maoriActive;  // activate both C3 and C10 when Maori-active
```

### SCEN-01 Detection (for distribution report and test)

```typescript
// In generateSeedData.ts and seedProjects.test.ts
import { scoreProposed } from '../../src/scoring/scoreProposed';

const scen01Projects = results.filter(r =>
  r.existingScore >= 40                               // passes existing (40pt threshold)
  && r.existingPassed                                  // mandatory A1 also met
  && !scoreProposed(r.project.inputs).passed           // fails proposed
);
```

### Median Computation (for distribution report)

```typescript
// In generateSeedData.ts — add before the console.log block
const sortedScores = [...scores].sort((a, b) => a - b);
const median = sortedScores.length % 2 === 0
  ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
  : sortedScores[Math.floor(sortedScores.length / 2)];

// Stddev
const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
const stddev = Math.sqrt(variance);
```

### Updated AMBITION_TARGET_WEIGHTS (starting point for SCEN-04)

Current value (centers at ~42):
```typescript
export const AMBITION_TARGET_WEIGHTS: number[] = [0.15, 0.15, 0.20, 0.25, 0.15, 0.10];
// Maps to targets: [40, 41, 42, 43, 44, 45]
```

Direction to move (to shift median toward 48, targets need to include higher values):
```typescript
// Option A: extend the target array to include 46-48
export const AMBITION_TARGET_WEIGHTS: number[] = [0.05, 0.10, 0.15, 0.20, 0.20, 0.15, 0.10, 0.05];
// Maps to targets: [40, 41, 42, 43, 44, 45, 46, 47]
// (AMBITION_VALUES array also needs extending in tier3.ts)
```

Or keep targets [40-45] but shift the weight distribution right:
```typescript
// Option B: same targets, shift weights rightward
export const AMBITION_TARGET_WEIGHTS: number[] = [0.05, 0.10, 0.15, 0.20, 0.30, 0.20];
// Maps to targets: [40, 41, 42, 43, 44, 45]
// Median ambition becomes ~44, pushing final scores toward ~47-49
```

**Note:** Option B is simpler (no changes to `AMBITION_VALUES` in tier3.ts). Option A gives finer control. Start with Option B.

### New SCEN Assertions in seedProjects.test.ts

```typescript
import { scoreProposed } from '../../scoring/scoreProposed';

it('SCEN-01: at least one project passes existing but fails proposed', () => {
  const count = SEED_PROJECTS.filter(p => {
    const ex = scoreExisting(p.inputs);
    const prop = scoreProposed(p.inputs);
    return ex.passed && !prop.passed;
  }).length;
  expect(count).toBeGreaterThanOrEqual(1);
});

it('SCEN-02: at most 3 projects have active Maori criteria', () => {
  const count = SEED_PROJECTS.filter(p =>
    p.inputs.maoriCrewPercent >= 10 || p.inputs.hasLeadCastMaori
  ).length;
  expect(count).toBeGreaterThanOrEqual(0);
  expect(count).toBeLessThanOrEqual(3);
});

it('SCEN-03: between 25-35 projects pass scoreExisting', () => {
  const count = SEED_PROJECTS.filter(p => scoreExisting(p.inputs).passed).length;
  expect(count).toBeGreaterThanOrEqual(25);
  expect(count).toBeLessThanOrEqual(35);
});

it('SCEN-04: existing score stddev is between 4 and 12', () => {
  const scores = SEED_PROJECTS.map(p => scoreExisting(p.inputs).totalPoints);
  const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
  const variance = scores.reduce((s, x) => s + (x - mean) ** 2, 0) / scores.length;
  const stddev = Math.sqrt(variance);
  expect(stddev).toBeGreaterThanOrEqual(4);
  expect(stddev).toBeLessThanOrEqual(12);
});
```

**Existing assertions to update (SCEN-02 conflict):**
- Line 81: Change `all have maoriCrewPercent === 0` to `at most 3 projects have maoriCrewPercent > 0`
- Line 86: Change `all have hasLeadCastMaori === false` to `at most 3 projects have hasLeadCastMaori === true`

**Existing assertion to verify compatibility (SCEN-03 vs existing):**
- Line 58-62: Current assertion is `between 20-30 projects pass scoreExisting`. SCEN-03 targets 28-30. These two constraints overlap at 28-30, so the test can be tightened to `25-35` (more resilient buffer) or left at `20-30` (tighter, allows current passing to co-exist). The decision is: add SCEN-03 as a SEPARATE assertion at 25-35, leaving the existing 20-30 check in place. They can coexist — any value in 25-30 satisfies both.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded `maoriCrewPercent: 0` | Probabilistic 2% activation | Phase 7 | SCEN-02 satisfied; two existing test assertions need relaxing |
| Ambition targets 40-45 (weights favor 43) | Targets 40-45 or extended, weights shifted right | Phase 7 | Median score rises from ~43 to ~48; SCEN-03/04 satisfied |
| No SCEN assertions in tests | Four new `it()` blocks | Phase 7 | SCEN-01 through SCEN-04 all automatically verified |
| Distribution report without median/stddev | Report extended with median, stddev, SCEN counters | Phase 7 | Tuning iteration becomes observational |

---

## Open Questions

1. **Does SCEN-01 emerge naturally after SCEN-04 tuning?**
   - What we know: The structural scoring gap (Section E not scoring in proposed) makes SCEN-01 plausible for Section-E-active tentpole projects.
   - What's unclear: Current pass count is unknown (previous target was 20/50). After tuning to 28-30, the score distribution may or may not produce a natural SCEN-01 case.
   - Recommendation: Run generation after SCEN-04 tuning and check before committing to the fallback override. The distribution report should log SCEN-01 count to make this visible.

2. **How many rand() calls does Maori activation add per project?**
   - What we know: The pre-read pattern requires a fixed number of calls. Two calls are needed (activation roll + value roll).
   - What's unclear: Whether hasLeadCastMaori needs a separate rand() call or is derived from the same activation roll.
   - Recommendation: Use exactly 2 rand() calls per project for Maori. Derive hasLeadCastMaori from the same `maoriActive` boolean (no separate roll needed). Update the total-per-project comment in `index.ts` from 46+qnzpe to 48+qnzpe.

3. **Will SCEN-03 require changes beyond AMBITION_TARGET_WEIGHTS?**
   - What we know: Current distribution was deliberately converged to 20/50 passing (40% pass rate per STATE.md). Need to reach 28-30/50 (56-60%).
   - What's unclear: Whether the AMBITION_TARGET_WEIGHTS shift alone is sufficient or if SELECTION_PROBS also needs adjusting.
   - Recommendation: Start with Option B weight shift in AMBITION_TARGET_WEIGHTS only. If after 2-3 iterations the pass count does not rise to 28-30, then widen SELECTION_PROBS.cheap slightly.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npm run test -- seedProjects` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCEN-01 | At least 1 project passes existing AND fails proposed | unit | `npm run test -- seedProjects` | ❌ Wave 0 — new `it()` block needed |
| SCEN-02 | 0-3 projects have active Maori criteria | unit | `npm run test -- seedProjects` | ❌ Wave 0 — replaces/supplements existing Maori assertions |
| SCEN-03 | 25-35 projects pass scoreExisting | unit | `npm run test -- seedProjects` | ❌ Wave 0 — new `it()` block (existing 20-30 check remains) |
| SCEN-04 | Score stddev between 4-12 | unit | `npm run test -- seedProjects` | ❌ Wave 0 — new `it()` block needed |

### Sampling Rate

- **Per task commit:** `npm run test -- seedProjects`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] 4 new `it()` blocks in `src/data/__tests__/seedProjects.test.ts` — covers SCEN-01 through SCEN-04
- [ ] 2 existing Maori assertions modified in `src/data/__tests__/seedProjects.test.ts` — accommodates SCEN-02
- [ ] `scoreProposed` added to imports in `src/data/__tests__/seedProjects.test.ts` — needed for SCEN-01 test
- [ ] Median + stddev stats added to `generateSeedData.ts` distribution report — needed to observe SCEN-04 during tuning

Note: No new test files needed — all changes are additions to `seedProjects.test.ts`. No new test framework config needed.

---

## Sources

### Primary (HIGH confidence)

- Source code — `src/data/__tests__/seedProjects.test.ts`: Full set of 197 existing assertions; identifies exactly which two Maori assertions conflict with SCEN-02
- Source code — `scripts/generator/index.ts`: Confirms Maori fields hardcoded at lines 93-95; PRNG call count documented in header comment
- Source code — `scripts/generator/tier3.ts`: Pre-read pattern implementation at lines 207-219; confirms exactly 23 rand() calls per project
- Source code — `src/scoring/spec.ts`: Authoritative point values and thresholds for both scoring systems; confirms Section E has no proposed equivalent and the pass threshold difference (40 existing vs 30 proposed for $100m+)
- Source code — `scripts/generateSeedData.ts`: Distribution report format; confirms median/stddev not currently reported
- `.planning/phases/07-distribution-targets-and-validation/07-CONTEXT.md`: All locked decisions

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` decision log: Previous tuning converged to 20/50 pass rate; B4_C2_COVARIANCE was split asymmetrically; SELECTION_PROBS.expensive = 0.10 was specifically tuned down from 0.40 to keep Section E count <= 8. These constraints still apply.

### Tertiary (LOW confidence)

- None — all findings verified directly from source code.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all tooling verified from package.json and existing files
- Architecture: HIGH — PRNG patterns verified from existing tier3.ts and STATE.md decisions; scoring gap analysis verified from spec.ts
- Pitfalls: HIGH — derived from direct code reading (existing test assertions, PRNG contract comments, prior tuning decisions in STATE.md)

**Research date:** 2026-03-14
**Valid until:** 2026-06-14 (stable domain — no external dependencies to invalidate)
