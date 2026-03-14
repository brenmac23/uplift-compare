# Phase 6: Tiered Field Logic - Research

**Researched:** 2026-03-14
**Domain:** TypeScript procedural generation — probabilistic field correlation, bimodal sampling, score-guided greedy selection
**Confidence:** HIGH (domain is internal codebase; all patterns verified from source)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Post-production coupling (B6/B7)**
- Picture post (B6) and sound post (B7) are strongly coupled — both high or both low for the same project
- Occasional splits allowed (not 100% coupling), but the default is they move together
- "Low" cluster means ~0% (post done entirely offshore)
- "High" cluster means genuinely high: 85-100% range
- Budget tier does NOT affect the high/low split — roughly equal across all tiers

**Point-chasing behavior (Tier 3)**
- Producers actively calculate their score gap and cherry-pick the cheapest remaining criteria
- Tier 3 fields (A2/A3, D1-D4, E1-E3, F1-F4) are not organic — they are only pursued for points
- If a producer doesn't need the points, they won't do masterclasses, premieres, etc.
- Target score is ~45 points (not 50) — beyond 45 there's no additional benefit, and further points cost money or creative compromise
- Pass threshold is 40; producers aim for ~45 as a safety buffer
- Spread of ambition: some producers barely clear 40, others build a buffer to ~45 in case another criterion falls through
- No producer deliberately overshoots significantly beyond 45

**Section E strategy**
- Section E is a last resort for high-budget projects that can't reach 40 through cheaper Tier 3 options
- These are expensive commitments (infrastructure investment, commercial agreements)
- More "we were building infrastructure anyway" than active point-chasing
- Only 2-3 projects out of 50 should have any Section E activity (~5% probability)
- Only available to high-budget projects (QNZPE >= $100m)

**BTL crew shaping (C5/C6)**
- Budget inverse correlation: tentpole/large productions fly in their own HODs, scoring lower on C5; smaller productions use more local key crew
- Post-production presence expands C5 range: if NZ post is happening (B6/B7 high), C5 range is 0-7; if no NZ post, C5 range is 0-4
- Higher QNZPE tends toward lower C5 values within whatever range applies
- Shooting % correlation: higher shooting NZ % (B4) correlates with higher crew counts, but high-budget projects may still fly in C6 roles
- C6 tracks with C5 but is generally higher — C6 roles are less likely to be imported than C5 roles
- Hard constraint: C6 >= C5; C5=0 implies C6=0

### Claude's Discretion
- Exact probability curves and distribution shapes for each field
- Correlations table data structure (maps, lookup functions, etc.)
- How to implement the bimodal distribution (e.g., coin flip then sample from high/low cluster)
- Point-chasing algorithm (greedy by cheapest, random selection, etc.)
- Tier 1 and Tier 2 field generation order within each tier
- How to track running score between tiers

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TIER-01 | Tier 1 (Fundamentals) generates A1, B2, B3, B4, C4, C5, C7, C9 based on production nature and budget | Architecture Patterns §Tier 1 fields; budget-inverse C4/C5 correlations; B4/C5 co-variance |
| TIER-02 | Tier 2 (Less Fundamental) generates B1, B5, B6-B9, C1, C2, C6, C8 with correlations to Tier 1 values | B6/B7 bimodal coupling; C6>=C5 hard constraint; B4/C2 co-variance; C1 budget-inverse |
| TIER-03 | Tier 3 (Point-chasing) generates A2/A3, D1-D4, E1-E3, F1-F4 sparsely, guided by score gap to ~40pt target | Score-gap greedy algorithm; ambition-level per project; Section E fallback; point value table |
| DIST-01 | Post-production fields (B6/B7) are bimodal — picture and sound are coupled, avoiding implausible mid-range values | Bimodal sampling pattern; coin-flip cluster assignment; high=85-100%, low=~0%; 10% split probability |
| DIST-02 | VFX (B8) and concept/physical effects (B9) are independently random, not coupled to picture/sound | Independent uniform sampling; no coupling to B6/B7 outcome |
| DIST-03 | BTL additional crew (C6) is almost always >= BTL key crew (C5); C5=0 implies C6=0 | Hard constraint enforcement; C6=clamp(rand, C5, max); C5=0 short-circuit |
| DIST-04 | Low shooting % (B4) correlates with low crew % (C2) | B4 bucket drives C2 probability; high-B4 → high C2 probability; low-B4 → low C2 probability |
| DIST-05 | Higher QNZPE inversely correlates with qualifying person scores (C4, C5, C7, C8, C1) | Budget tier drives inverse weight table; large/tentpole → lower ATL/BTL/cast probabilities |
</phase_requirements>

---

## Summary

Phase 6 replaces the flat placeholder logic in `generateProject()` with a three-tier generation pipeline. The fundamental insight is that each tier gates the next: Tier 1 sets the production's "physical footprint" (shooting, budget, key crew), Tier 2 fills in the logistical decisions that follow naturally from that footprint, and Tier 3 adds deliberate point-chasing to reach a target score.

The phase also populates `correlations.ts` (currently an empty stub) with the cross-field dependency tables. These tables do not need to be a complex lookup structure — keyed plain objects or inline logic within generator functions is sufficient for the 50-project use case. The important constraint is that all randomness continues to flow through the Mulberry32 PRNG via `rand()`, ensuring reproducibility.

The Phase 5 `generateProject()` function is the single rewrite target. The function signature stays the same; only the interior logic changes. All existing infrastructure (PRNG, `sampleQnzpe()`, `scoreExisting()`, `ProjectInputs` type, seedProjects test suite) remains intact.

**Primary recommendation:** Refactor `generateProject()` into three sequential tier functions that share a `ProjectState` accumulator. Each tier reads from the accumulator and writes back to it. `scoreExisting()` is called after Tier 2 to compute the score gap that drives Tier 3.

---

## Standard Stack

### Core (all pre-existing — no new dependencies)
| Asset | Location | Purpose |
|-------|----------|---------|
| `createPrng()` | `scripts/generator/prng.ts` | Mulberry32 PRNG — all randomness |
| `triangular()` | `scripts/generator/tiers.ts` | Inverse CDF for skewed distributions |
| `sampleQnzpe()` | `scripts/generator/tiers.ts` | QNZPE from triangular within tier range |
| `pickBudgetTier()` | `scripts/generator/tiers.ts` | Weighted tier selection |
| `scoreExisting()` | `src/scoring/scoreExisting.ts` | Run-time score check for Tier 3 decisions |
| `ProjectInputs` | `src/scoring/types.ts` | Contract all fields must satisfy |
| `EXISTING_SPEC` | `src/scoring/spec.ts` | Point values for Tier 3 greedy table |
| `CORRELATIONS` | `scripts/generator/correlations.ts` | Stub to populate with correlation data |

### No New Dependencies
Phase 6 is pure logic over existing building blocks. Nothing to install.

---

## Architecture Patterns

### Recommended File Layout
```
scripts/generator/
├── prng.ts          # existing — untouched
├── tiers.ts         # existing — untouched
├── types.ts         # existing — untouched
├── projectNames.ts  # existing — untouched
├── correlations.ts  # POPULATE: correlation tables / weights
├── tier1.ts         # NEW: generateTier1(rand, tierConfig, productionType) → Tier1Fields
├── tier2.ts         # NEW: generateTier2(rand, tier1, tierConfig) → Tier2Fields
├── tier3.ts         # NEW: generateTier3(rand, tier1+2, tierConfig, ambitionTarget) → Tier3Fields
└── index.ts         # REFACTOR: orchestrate tier1→tier2→tier3, call scoreExisting, assemble Project
```

This keeps each tier's logic isolated and independently testable. The planner may choose to keep all tier logic in a single module — either approach is valid given the "coarse" granularity setting.

### Pattern 1: Tier Accumulator

Each tier function receives what came before and returns its own field group. The caller merges them.

```typescript
// Conceptual shape — exact field grouping is discretionary
type Tier1Fields = {
  shootingNZPercent: number;
  hasPreviousQNZPE: boolean;
  hasAssociatedContent: boolean;
  atlCount: number;
  btlKeyCount: number;
  hasLeadCast: boolean;
  castingLevel: ProjectInputs['castingLevel'];
  // A1 always true — not randomised
};

type Tier2Fields = {
  hasStudioLease: boolean;
  regionalPercent: number;
  picturePostPercent: number;  // bimodal
  soundPostPercent: number;    // bimodal, coupled with picture
  vfxPercent: number;          // independent
  conceptPhysicalPercent: number; // independent
  castPercent: number;
  crewPercent: number;         // correlated with B4
  btlAdditionalCount: number;  // >= btlKeyCount
  supportingCastCount: number;
};
```

### Pattern 2: Bimodal Sampling (DIST-01)

The cluster assignment is a single coin flip; then each cluster samples from a narrow band.

```typescript
// Source: derived from CONTEXT.md locked decisions
function sampleBimodal(rand: () => number): number {
  // ~50% high, ~50% low (budget tier has no effect per locked decision)
  const isHigh = rand() < 0.5;
  if (isHigh) {
    // High cluster: 85-100%
    return 85 + Math.round(rand() * 15);
  } else {
    // Low cluster: 0-5% (offshore post)
    return Math.round(rand() * 5);
  }
}

// B6 and B7 share the same cluster assignment
function samplePostProduction(rand: () => number): { picture: number; sound: number } {
  const isHigh = rand() < 0.5;
  // 10% chance of split (occasional mismatch)
  const splitPicture = rand() < 0.10;
  const splitSound = rand() < 0.10;
  const pictureHigh = splitPicture ? !isHigh : isHigh;
  const soundHigh = splitSound ? !isHigh : isHigh;
  return {
    picture: pictureHigh ? 85 + Math.round(rand() * 15) : Math.round(rand() * 5),
    sound: soundHigh ? 85 + Math.round(rand() * 15) : Math.round(rand() * 5),
  };
}
```

### Pattern 3: B4/C2 Co-variance (DIST-04)

Shooting percent drives a probability adjustment for crew percent threshold.

```typescript
// Source: derived from CONTEXT.md locked decisions + REQUIREMENTS.md DIST-04
function sampleCrewPercent(rand: () => number, shootingNZPercent: number): number {
  // Low B4 → substantially lower probability of hitting 80% crew threshold
  const isHighShooting = shootingNZPercent >= 75;
  const passProb = isHighShooting ? 0.88 : 0.35;
  return rand() < passProb
    ? 80 + Math.round(rand() * 20)
    : Math.round(rand() * 79);
}
```

### Pattern 4: C5/C6 Hard Constraint (DIST-03)

C6 must be >= C5 at the sample site; C5=0 forces C6=0.

```typescript
// Source: CONTEXT.md hard constraint + REQUIREMENTS.md DIST-03
function sampleBtlCounts(
  rand: () => number,
  qnzpe: number,
  isHighPost: boolean   // B6/B7 high expands C5 range
): { btlKeyCount: number; btlAdditionalCount: number } {
  const c5Max = isHighPost ? 7 : 4;
  // Inverse budget correlation: tentpole skews toward 0-2, small skews toward 2-4
  const c5 = Math.floor(rand() * (c5Max + 1));

  if (c5 === 0) {
    return { btlKeyCount: 0, btlAdditionalCount: 0 };
  }
  // C6 >= C5; sample from [c5, 8]
  const c6Min = c5;
  const c6Max = 8;
  const c6 = c6Min + Math.floor(rand() * (c6Max - c6Min + 1));
  return { btlKeyCount: c5, btlAdditionalCount: c6 };
}
```

### Pattern 5: DIST-05 Budget-Inverse Qualifying Person Correlation

For Tier 1 fields C4, C5, C7, C8, C1 — higher QNZPE biases toward lower values.

```typescript
// Source: CONTEXT.md BTL crew shaping + REQUIREMENTS.md DIST-05
const BUDGET_INVERSE_ATL_WEIGHTS: Record<BudgetTier, number[]> = {
  // Probability of atlCount being 0, 1, 2, 3
  small:    [0.10, 0.25, 0.35, 0.30],
  mid:      [0.15, 0.30, 0.35, 0.20],
  large:    [0.25, 0.35, 0.25, 0.15],
  tentpole: [0.40, 0.35, 0.15, 0.10],
};
```

### Pattern 6: Score-Gap Greedy Algorithm (Tier 3)

After Tier 2, call `scoreExisting()` to get the current score. Compute gap to ambition target. Greedily select cheapest available criteria until gap is closed or no cheap options remain. Section E is last resort only for high-budget when other options exhausted.

```typescript
// Source: CONTEXT.md point-chasing behavior + locked target of ~45
type PointOption = {
  field: keyof ProjectInputs;
  value: unknown;
  points: number;
  cost: 'cheap' | 'medium' | 'expensive';  // producer's notional cost
};

// Ordered by cost ascending — greedy selects from front
const TIER3_OPTIONS: PointOption[] = [
  { field: 'hasEdSeminars',   value: true,    points: 1, cost: 'cheap' },
  { field: 'hasAssociatedContent', ...               },  // already in Tier 1
  // D1 masterclass, D2 ed seminars, D3 attachments, D4 internships
  // F1 premiere, F2 film marketing, F3 tourism marketing, F4 tourism partnership
  // A2 sustainability officer, A3 carbon review
  // E1-E3 only if high-budget AND gap still > 0 after all cheap options
];

function generateTier3(rand, partialInputs, ambitionTarget: number): Partial<ProjectInputs> {
  const currentScore = scoreExisting(partialInputs).totalPoints;
  const gap = ambitionTarget - currentScore;
  if (gap <= 0) return {}; // already at target
  // greedy selection over TIER3_OPTIONS...
}
```

### Pattern 7: Per-Project Ambition Level

Sample each project's target score from a range rather than a fixed value. This models the "some barely clear 40, others build buffer to 45" behavior.

```typescript
// Source: CONTEXT.md spread of ambition
function sampleAmbitionTarget(rand: () => number): number {
  // Range 40-45, slightly weighted toward 43-44
  const roll = rand();
  if (roll < 0.15) return 40;  // bare minimum
  if (roll < 0.30) return 41;
  if (roll < 0.50) return 42;
  if (roll < 0.75) return 43;
  if (roll < 0.90) return 44;
  return 45;  // maximum buffer builders
}
```

### Anti-Patterns to Avoid

- **Independent field sampling for coupled fields:** B6 and B7 must share a cluster decision — two separate `rand()` calls without coupling will produce mid-range values.
- **Uniform distributions for post-production:** The Phase 5 placeholder uses `10 + rand() * 90` — this spreads values uniformly through mid-range, which is exactly what DIST-01 prohibits.
- **Ignoring C6 >= C5 at sample time:** Clamping C6 post-hoc produces a biased distribution; instead sample C6 conditionally from [C5, max].
- **Populating Tier 3 without a score check:** Tier 3 must read actual points from `scoreExisting()` — guessing the score produces wrong gap calculations.
- **Section E as regular path:** It must only fire when cheaper options have been exhausted AND the project is still below ambition target AND QNZPE >= $100m.
- **Advancing PRNG out of order:** Each new `rand()` call shifts subsequent sequences. Field generation order must be deterministic; branching that consumes different counts of `rand()` on different paths breaks reproducibility across projects.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Triangular distribution sampling | Custom inverse CDF | `triangular()` from `tiers.ts` | Already implemented, tested |
| Score calculation | Re-implement scoring rules | `scoreExisting()` from `scoreExisting.ts` | Keeps Tier 3 decisions in sync with actual scoring logic |
| PRNG | Math.random() or custom algorithm | `createPrng()` / `rand()` closure | Determinism requirement; Mulberry32 already chosen |
| QNZPE sampling | Direct rand() within range | `sampleQnzpe()` from `tiers.ts` | Applies triangular clustering already configured |
| Type contract | Redefine field types | `ProjectInputs` from `src/scoring/types.ts` | Single source of truth; scoring engine depends on it |

---

## Common Pitfalls

### Pitfall 1: PRNG Sequence Drift

**What goes wrong:** Adding a conditional `rand()` call (e.g., "only call rand() for this field if tier is large") causes the PRNG sequence to diverge between projects that hit vs. miss the condition — making project N's fields depend on project N-1's budget tier.

**Why it happens:** Mulberry32 advances on every call. A project that skips a field consumes fewer `rand()` values, shifting all subsequent projects.

**How to avoid:** Always consume the same number of `rand()` calls per field per project, regardless of which branch is taken. Sample then discard rather than conditionally skipping.

**Warning signs:** Changing one project's budget tier causes adjacent projects' names or other unrelated fields to shift.

### Pitfall 2: Bimodal Distribution Collapsing to Uniform

**What goes wrong:** Using a single `rand() * 100` for B6/B7 produces the uniform mid-range distribution the test explicitly prohibits.

**Why it happens:** Phase 5 placeholder intentionally used this — it's the "obvious" implementation.

**How to avoid:** The bimodal implementation must be a two-stage sample: first pick cluster (high/low), then sample within the cluster's narrow band.

**Warning signs:** Histogram of picturePostPercent shows values spread 0-100 rather than clustered at 0-5 and 85-100.

### Pitfall 3: C5 Range Not Conditioned on Post-Production

**What goes wrong:** Sampling C5 from a fixed range (0-7) regardless of B6/B7 outcome misses the "post-production presence expands C5 range" rule.

**Why it happens:** Tier 2 fields are generated in sequence; C5 may be generated before B6/B7, or the B6/B7 outcome may not be passed forward.

**How to avoid:** Generate B6/B7 (bimodal) before C5, pass `isHighPost` flag into the BTL sampling function.

**Warning signs:** Projects with low post-production (B6/B7 near 0) still have btlKeyCount values of 5-7.

### Pitfall 4: Section E Firing Too Often

**What goes wrong:** Phase 5 uses probability 0.20 for Section E on high-budget projects, producing ~5 Section E projects. But the user decision says "2-3 projects" and "5% probability."

**Why it happens:** Phase 5 was calibrated to satisfy the test's "max 5-8" constraint, not the realism target.

**How to avoid:** Section E in Tier 3 must only activate when (a) QNZPE >= $100m, (b) all cheaper Tier 3 options are exhausted, AND (c) the project is still below its ambition target. Let it emerge from score logic, not a fixed probability.

**Warning signs:** More than 3 out of 50 projects have Section E fields active.

### Pitfall 5: Tier 3 Over-scoring

**What goes wrong:** Tier 3 greedily adds points until it reaches the ambition target but overshoots because the cheapest remaining option pushes score past the target.

**Why it happens:** Greedy algorithms add the next-cheapest item without checking headroom.

**How to avoid:** After each Tier 3 field is set to true, recompute the running score. Stop when `currentScore >= ambitionTarget`. Do not add more criteria purely because they are "cheap."

**Warning signs:** Histogram of existing scores shows most projects scoring 45-55 rather than a spread from 40-50.

---

## Code Examples

### Existing Point Values for Tier 3 Greedy Table (from spec.ts)

```typescript
// Source: src/scoring/spec.ts — EXISTING_SPEC
// Tier 3 cheap options and their point values:
// A2: hasSustainabilityOfficer   → 2pts
// A3: hasCarbonReview            → 2pts
// D1: hasMasterclass             → 2pts
// D2: hasEdSeminars              → 1pt
// D3: attachmentCount (threshold met) → 2pts
// D4: internshipCount (threshold met) → 1pt
// F1: premiereType 'nz'          → 2pts, 'world' → 3pts
// F2: hasFilmMarketing           → 3pts
// F3: hasTourismMarketing        → 3pts
// F4: hasTourismPartnership      → 3pts
// E1: hasKnowledgeTransfer       → 2pts (expensive)
// E2: commercialAgreementPercent → up to 3pts (expensive)
// E3: infrastructureInvestment   → up to 3pts (expensive)
```

### Existing PRNG Usage Pattern

```typescript
// Source: scripts/generator/prng.ts + scripts/generator/index.ts
import { createPrng } from './prng';
import { SEED } from './types';

const rand = createPrng(SEED);
// Each project gets a SLICE of the same sequence — do not create a new PRNG per project
// The sequence is advanced monotonically across all 50 projects
```

### Existing Score Check Pattern

```typescript
// Source: scripts/generator/index.ts — already used in generateProject()
import { scoreExisting } from '../../src/scoring/scoreExisting';

const scoringResult = scoreExisting(inputs);
const currentPoints = scoringResult.totalPoints;
const gap = ambitionTarget - currentPoints;
```

---

## State of the Art (Within This Codebase)

| Phase 5 Approach | Phase 6 Replacement | Why |
|------------------|---------------------|-----|
| Flat sequential field generation — all fields in one function | Three-tier pipeline — Tier 1 then Tier 2 then Tier 3 | Tiers gate each other; correlations require prior values |
| Uniform distributions: `10 + rand() * 90` for post fields | Bimodal two-stage sampling for B6/B7 | DIST-01 requirement |
| Fixed probability for Section E (0.20) | Score-gap-conditioned Section E as last resort | User decision: 2-3 projects only |
| `btlAdditionalCount = floor(rand() * 9)` — independent of C5 | `C6 = sample from [C5, 8]` | DIST-03 hard constraint |
| `crewPercent` independent of `shootingNZPercent` | `crewPercent` probability conditioned on B4 bucket | DIST-04 requirement |
| `atlCount` uniform across all budgets | `atlCount` sampled from budget-tier-keyed weight table | DIST-05 requirement |
| `CORRELATIONS = {}` — empty stub | Populated correlation weight tables | Phase 6 contract |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (already configured) |
| Config file | `vite.config.ts` (vitest inline config) or `vitest.config.ts` |
| Quick run command | `npx vitest run src/data/__tests__/seedProjects.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TIER-01 | Tier 1 fields (A1, B2, B3, B4, C4, C5, C7, C9) generated with budget/type correlation | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | Partially — existing tests cover shape; new assertions needed |
| TIER-02 | Tier 2 fields correlated to Tier 1 values | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | Partially |
| TIER-03 | Tier 3 fields sparse; score-guided; no overshoot | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | Partially |
| DIST-01 | B6/B7 bimodal — no mid-range values; coupled | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | No — Wave 0 gap |
| DIST-02 | B8/B9 independent of B6/B7 | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | No — Wave 0 gap |
| DIST-03 | C6 >= C5 always; C5=0 implies C6=0 | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | No — Wave 0 gap |
| DIST-04 | Low B4 correlates with low C2 | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | No — Wave 0 gap |
| DIST-05 | Higher QNZPE → lower C4/C5/C7/C8/C1 scores | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | No — Wave 0 gap |

All new assertions belong in `src/data/__tests__/seedProjects.test.ts` — this file already imports `SEED_PROJECTS` and `scoreExisting`, which is the correct surface to verify distribution properties.

### Sampling Rate
- **Per task commit:** `npx vitest run src/data/__tests__/seedProjects.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/data/__tests__/seedProjects.test.ts` — add distribution assertions for DIST-01 through DIST-05:
  - DIST-01: All projects have picturePostPercent either <= 10 or >= 75 (no mid-range); soundPostPercent same; at least 40% in high cluster
  - DIST-02: Verify B8 and B9 are not statistically coupled to B6/B7 cluster (independence check)
  - DIST-03: Every project: `btlAdditionalCount >= btlKeyCount`; if `btlKeyCount === 0` then `btlAdditionalCount === 0`
  - DIST-04: Projects with shootingNZPercent < 75 have lower crewPercent >= 80 rate than projects with shootingNZPercent >= 90
  - DIST-05: Average atlCount for tentpole tier < average atlCount for small tier

*(Existing tests cover: 50 projects, unique ids, sustainability plan, maori fields, studioLease count, Section E limits, crewPercent >= 80 rate — these remain and are not duplicated)*

---

## Open Questions

1. **PRNG consumption order vs. determinism**
   - What we know: Adding/removing fields or changing branch structure shifts the sequence
   - What's unclear: Whether Tier 3 "optional" field selection (which may or may not call `rand()`) needs padding to keep sequences stable
   - Recommendation: Always call `rand()` for every potential Tier 3 field and use the result only when the field is active. Do not conditionally skip `rand()` calls.

2. **C5 boundary between tiers**
   - What we know: C5 is listed as a Tier 1 field in REQUIREMENTS.md (TIER-01), but its range depends on B6/B7 which are Tier 2 (TIER-02)
   - What's unclear: Whether to generate C5 in Tier 1 with a conservative fixed range and then adjust in Tier 2, or defer C5 to Tier 2
   - Recommendation: Defer C5 to Tier 2 alongside B6/B7 so the post-production context is available. Note this minor deviation from the TIER-01 field list in the plan.

3. **Exact bimodal split probabilities**
   - What we know: ~50/50 high/low split; budget tier does not affect it
   - What's unclear: Whether the 50/50 split is exactly right or should be 40/60 high/low
   - Recommendation: Start at 50/50; the validation report from Phase 5 (`GEN-03`) will show the distribution on each run — adjust if the visual check looks unrealistic.

---

## Sources

### Primary (HIGH confidence)
- `scripts/generator/correlations.ts` — stub contract for Phase 6; BudgetTier + ProductionType as keys confirmed
- `scripts/generator/index.ts` — Phase 5 placeholder logic; exact fields to replace identified
- `scripts/generator/tiers.ts` — `triangular()`, `sampleQnzpe()`, `pickBudgetTier()` — reusable unchanged
- `scripts/generator/prng.ts` — Mulberry32 factory; determinism contract confirmed
- `src/scoring/types.ts` — `ProjectInputs` interface; all field names and types verified
- `src/scoring/spec.ts` — `EXISTING_SPEC` point values; Tier 3 greedy table derived from here
- `src/scoring/scoreExisting.ts` — scoring logic; confirmed callable mid-generation for score-gap
- `src/data/__tests__/seedProjects.test.ts` — existing test assertions; Wave 0 gaps identified
- `.planning/phases/06-tiered-field-logic/6-CONTEXT.md` — user decisions; all locked constraints

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — TIER-01/02/03 and DIST-01 through DIST-05 field lists
- `.planning/STATE.md` — accumulated decisions; PRNG seed confirmed as 0xDEADBEEF

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against actual source files
- Architecture patterns: HIGH — derived directly from existing code contracts and locked user decisions
- Pitfalls: HIGH — identified from Phase 5 placeholder code and specific CONTEXT.md constraints
- Tier 3 greedy algorithm details: MEDIUM — structure is clear, exact cost ordering is Claude's discretion

**Research date:** 2026-03-14
**Valid until:** Stable — domain is internal codebase; no external dependencies
