# Architecture Research

**Domain:** Algorithmic seed data generation integrated into React SPA (no backend)
**Project:** Uplift Compare v1.1 — Realistic Seed Data milestone
**Researched:** 2026-03-14
**Confidence:** HIGH — based on direct inspection of source files, not inferred from documentation

---

## Context: What Already Exists

The v1.0 architecture is fully implemented and stable. This research focuses exclusively on the
integration question for v1.1: where does the generator live, what does it touch, and in what order
should it be built?

Existing layers (do not change):

```
src/scoring/types.ts        → ProjectInputs interface (the output contract)
src/scoring/scoreExisting.ts → pure function, no side effects
src/scoring/scoreProposed.ts → pure function, no side effects
src/scoring/index.ts        → re-exports both scorers
src/data/seedProjects.ts    → SEED_PROJECTS: Project[] — currently hand-crafted
src/store/useAppStore.ts    → imports SEED_PROJECTS directly; uses it as initial state
src/data/__tests__/seedProjects.test.ts → distribution constraint tests
```

The store initialises with `projects: SEED_PROJECTS` and `resetToDefaults()` restores it.
The seed data file is the only integration point that needs to change.

---

## Decision: Generation Approach

Three options were considered. The correct choice for this codebase is:

### Option A: Pre-generate at dev time, commit static output (RECOMMENDED)

The generator runs as a Node script (`scripts/generateSeedData.ts`). Output is written to
`src/data/seedProjects.ts` (replacing the hand-crafted file). The committed TypeScript file
is identical in shape to what exists today. No runtime changes required anywhere else.

**Why this is correct:**
- Zero impact on app bundle and startup — the seed file stays a static import, no dynamic
  generation code ships to the browser
- Generator can use Node-native randomness (`Math.random` with seeded PRNG) without browser
  compatibility concerns
- Test suite (`seedProjects.test.ts`) already validates the committed output — it remains the
  quality gate, no test changes needed
- Rollback is `git checkout src/data/seedProjects.ts` — trivial
- No build pipeline changes — Netlify build remains `vite build`, nothing else

### Option B: Generate at build time via Vite plugin (NOT RECOMMENDED)

Adds a custom Vite plugin that intercepts the module graph and synthesises seed data during
`vite build`. Technically feasible but adds irreversible complexity to the build system with
no benefit over Option A. The output is identical; the mechanism is harder to debug, harder
to test, and harder to hand off.

### Option C: Generate at runtime on first load (NOT RECOMMENDED)

The app detects an empty or missing seed state and generates data in the browser on first
load. This violates two existing architectural decisions: (1) scores are derived, never stored
redundantly — a runtime generator would need to invoke the scoring engine and store results,
blurring that boundary; (2) the Zustand persist middleware would then store generated data in
localStorage, meaning the user's first-load experience differs from every subsequent load.
It also complicates the existing `resetToDefaults()` action, which currently restores to the
static constant — it would need to re-run the generator.

---

## System Overview: What Changes in v1.1

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
│                                                             │
│  scripts/generateSeedData.ts   (NEW — runs in Node)        │
│       │                                                     │
│       ├── imports: src/scoring/ (existing, unchanged)       │
│       ├── imports: src/data/projectNames.ts (NEW)           │
│       └── writes:  src/data/seedProjects.ts (REPLACED)      │
│                                                             │
└──────────────────────────────────────────────────────────────┘
                          │ committed output
┌──────────────────────────▼───────────────────────────────────┐
│                     App (unchanged)                          │
│                                                             │
│  src/data/seedProjects.ts → src/store/useAppStore.ts        │
│       (same import path, same Project[] type)               │
└─────────────────────────────────────────────────────────────┘
```

Exactly one file changes at runtime: `src/data/seedProjects.ts`. Everything else is either
a new file that only the generator script touches, or unchanged.

---

## New Components

### 1. `scripts/generateSeedData.ts` (generator entry point)

The runnable Node script. Responsibilities:
- Orchestrate the three-tier generation loop (Fundamentals → Less Fundamental → Point-chasing)
- Call the scoring engine after building each `ProjectInputs` to verify pass/fail outcome
- Enforce distribution constraints (pass rate, budget split, borderline count)
- Assign sequential IDs (`seed-001` … `seed-050`) and creative names
- Write the final `SEED_PROJECTS: Project[]` array to `src/data/seedProjects.ts`

The script uses `tsx` (already in the ecosystem for Vite/TypeScript projects) or `ts-node` to
execute TypeScript directly. Add an npm script: `"seed": "tsx scripts/generateSeedData.ts"`.

### 2. `scripts/seedGenerator/` (generator internals — split for testability)

```
scripts/
  generateSeedData.ts          # entry point — calls generator, writes output
  seedGenerator/
    types.ts                   # GeneratorConfig, BudgetTier, TargetOutcome
    projectNames.ts            # Pool of ~80 creative names (no real NZ names)
    budgetProfile.ts           # QNZPE sampling logic (bimodal: small/big)
    fundamentals.ts            # Tier 1: hasSustainabilityPlan, crewPercent, castPercent, shootingNZPercent
    lessFundamental.ts         # Tier 2: post-production percents, personnel counts, ATL/BTL
    pointChasing.ts            # Tier 3: marketing, tourism, Section E, borderline tuning
    correlations.ts            # Budget-to-talent mappings, shooting/crew correlation rules
    verifyDistribution.ts      # Validates full 50-project set against distribution targets
    index.ts                   # generateSeedProjects(config) → ProjectInputs[]
```

Splitting the generator into modules serves testability: `fundamentals.ts`, `lessFundamental.ts`,
and `pointChasing.ts` can each be unit-tested without running a full 50-project generation.

### 3. `src/data/projectNames.ts` (optional, acceptable alternative: inline in generator)

A pool of creative fictional names that the generator draws from without replacement. Keeping
names in `src/data/` (separate from `scripts/`) means they can also be referenced by any
future UI feature (e.g., a "random name" suggestion in the project creation form) without
importing from the scripts directory. If that future feature is out of scope, inline in the
generator is simpler.

---

## Component Responsibilities

| Component | Responsibility | New or Modified |
|-----------|----------------|-----------------|
| `scripts/generateSeedData.ts` | Orchestrate generation, write output file | NEW |
| `scripts/seedGenerator/fundamentals.ts` | Generate Tier 1 fields (guaranteed points every real production takes) | NEW |
| `scripts/seedGenerator/lessFundamental.ts` | Generate Tier 2 fields (post-production, personnel counts) | NEW |
| `scripts/seedGenerator/pointChasing.ts` | Generate Tier 3 fields (marketing, Section E, borderline tuning) | NEW |
| `scripts/seedGenerator/correlations.ts` | Budget-correlated probability tables and correlation rules | NEW |
| `scripts/seedGenerator/verifyDistribution.ts` | Assert 50-project set meets distribution targets | NEW |
| `src/data/seedProjects.ts` | Hand-crafted → algorithmically generated (same shape) | REPLACED |
| `src/data/__tests__/seedProjects.test.ts` | No change needed — already validates distribution | UNCHANGED |
| `src/store/useAppStore.ts` | No change needed — imports same path/same type | UNCHANGED |
| `src/scoring/` | No change — used by generator as a read-only dependency | UNCHANGED |
| `package.json` | Add `"seed": "tsx scripts/generateSeedData.ts"` npm script | MODIFIED |

---

## Data Flow

### Generation Flow (dev time only)

```
npm run seed
        │
generateSeedData.ts
        │
        ├── sample budget tier (small: $20m-$99m / big: $100m-$300m)
        │
        ├── Tier 1 — Fundamentals
        │     hasSustainabilityPlan = true (always)
        │     crewPercent: 80-95% (budget-correlated)
        │     castPercent: 70-90%
        │     shootingNZPercent: based on outcome target
        │
        ├── Tier 2 — Less Fundamental
        │     picturePostPercent, soundPostPercent (bimodal: either high or low)
        │     vfxPercent, conceptPhysicalPercent (random within budget constraints)
        │     atlCount, btlKeyCount, btlAdditionalCount (correlated with budget)
        │     hasLeadCast, supportingCastCount, castingLevel
        │
        ├── Tier 3 — Point-chasing
        │     hasMasterclass, hasEdSeminars, hasIndustrySeminars
        │     hasFilmMarketing, hasTourismPartnership, hasTourismMarketing
        │     premiereType / hasNZPremiere / hasIntlPromotion
        │     Section E fields (big-budget only, sparse)
        │
        ├── scoreExisting(inputs) → verify pass/fail matches target outcome
        │     if mismatch: adjust one Tier 3 field and re-verify (max 3 retries)
        │     if still mismatch: discard and regenerate
        │
        ├── verifyDistribution(allProjects) → assert constraints met
        │     retry with different random seed if constraints not met
        │
        └── write src/data/seedProjects.ts
```

### Runtime Flow (app, unchanged)

```
App boot
    │
useAppStore initialises with SEED_PROJECTS (static import)
    │
Zustand persist checks localStorage
    │
If schema version matches: restore from localStorage (includes seed projects)
If version mismatch: resetToDefaults() → SEED_PROJECTS
    │
UI renders from store (no change from v1.0)
```

---

## Integration Points

### Integration Point 1: Generator → Scoring Engine

The generator imports `scoreExisting` from `src/scoring/index.ts` to verify outcomes during
generation. This is a one-way read-only dependency. The scoring engine has no knowledge of
the generator.

**Boundary:** The generator is a consumer of the scoring engine, not a peer. It must never
modify `src/scoring/`. If the scoring engine changes (e.g., new rule), the generator automatically
produces different outputs on next run — which is the correct behaviour.

### Integration Point 2: Generator → Output File

The generator writes a valid TypeScript module to `src/data/seedProjects.ts`. The output must
satisfy the existing type contract exactly:

```typescript
// Output file shape (must match exactly):
import type { Project } from '../store/useAppStore';
export const SEED_PROJECTS: Project[] = [ ... ];
```

The generator produces this as a string and writes it via `fs.writeFileSync`. Use `prettier`
formatting if already present in the project; otherwise emit clean hand-formatted output.

### Integration Point 3: Existing Tests as Quality Gate

`src/data/__tests__/seedProjects.test.ts` runs as part of the normal `vitest` suite. After
running `npm run seed`, the developer runs `npm test` to verify the generated data passes all
distribution constraints. No new test infrastructure is needed.

The test file should not be modified unless new distribution constraints are added as part of
this milestone.

### Integration Point 4: Store `resetToDefaults()` Action

`resetToDefaults: () => set({ projects: SEED_PROJECTS })` in `useAppStore.ts` refers to the
static import. After regeneration, this action automatically resets to the new generated data
on the next deploy — no store code changes required.

---

## Architectural Patterns

### Pattern 1: Seeded PRNG for Reproducible Generation

Use a seeded pseudo-random number generator (e.g., a simple Mulberry32 or xoshiro implementation
— no npm dependency required, ~10 lines of code) rather than `Math.random()`. Accept the seed
as a CLI argument or a constant in the config.

**Why:** The committed output must be deterministic. If the generator produces different results
each run, the diff noise in `git blame` makes it hard to reason about what changed. A fixed seed
produces the same 50 projects every time the generator runs with that seed. Changing the seed
(or the generation logic) produces a new deterministic set, which can be reviewed in a PR.

```typescript
// scripts/seedGenerator/prng.ts
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

### Pattern 2: Outcome-First Generation (target before inputs)

For each project, decide the target outcome before generating inputs — not the other way around.
Determine: (a) budget tier, (b) pass or fail the existing test, (c) whether it's a borderline
case. Then generate inputs that produce that outcome.

This is the only way to reliably hit the ~60% pass rate and ≥5 borderline targets. Generating
inputs first and checking outcomes afterward requires too many retry loops.

```typescript
// Assign outcome targets upfront:
const targets: TargetOutcome[] = [
  ...Array(30).fill('pass'),   // 30 clear passes
  ...Array(5).fill('borderline-pass'),
  ...Array(5).fill('borderline-fail'),
  ...Array(10).fill('fail'),
].sort(() => rand() - 0.5);  // shuffle
```

### Pattern 3: Tiered Field Generation with Score Tracking

Generate fields in tiers and track accumulated score after each tier. This lets the Tier 3
phase know exactly how many points it needs to add or withhold to hit the target score.

```typescript
function generateProject(target: TargetOutcome, rand: () => number): ProjectInputs {
  const budget = sampleBudget(target, rand);
  const tier1 = generateFundamentals(budget, rand);
  const tier1Score = scoreExisting({ ...tier1, ...defaults }).totalPoints;

  const tier2 = generateLessFundamental(budget, tier1, rand);
  const tier2Score = scoreExisting({ ...tier1, ...tier2, ...defaults }).totalPoints;

  const pointsNeeded = targetPointsFor(target) - tier2Score;
  const tier3 = generatePointChasing(budget, pointsNeeded, rand);

  return { ...tier1, ...tier2, ...tier3 };
}
```

### Pattern 4: Correlation Tables (not conditional logic)

Express budget-to-field correlations as probability tables rather than if/else chains. This
separates the "what values are realistic" knowledge from the generation control flow.

```typescript
// scripts/seedGenerator/correlations.ts
const CREW_PERCENT_BY_BUDGET: Record<BudgetTier, { min: number; max: number; mode: number }> = {
  small: { min: 75, max: 95, mode: 85 },
  big:   { min: 80, max: 95, mode: 90 },
};

const ATL_COUNT_PROB_BY_BUDGET: Record<BudgetTier, number[]> = {
  // index = atlCount, value = probability weight
  small: [0, 0.1, 0.4, 0.5],   // most small budgets get 2-3 ATL
  big:   [0, 0.05, 0.25, 0.7], // big budgets almost always max ATL
};
```

---

## Anti-Patterns

### Anti-Pattern 1: Generator Logic Inside the Application Bundle

**What people do:** Put the generator inside `src/` so it's importable by React components
(e.g., for a "regenerate seeds" dev button).

**Why it's wrong:** The generator imports `fs`, uses Node-specific APIs, and is hundreds of
lines of logic that has no place in a browser bundle. It breaks tree-shaking and adds bundle
size. It creates a false impression that seed generation is a runtime concern.

**Instead:** Keep all generator code in `scripts/`. The generator's output (the static file)
is what the app imports. Never import from `scripts/` inside `src/`.

### Anti-Pattern 2: Validating Distribution Inside the Generator Loop

**What people do:** Check distribution constraints for each project as it's generated, branching
on whether the running count meets targets.

**Why it's wrong:** This creates complex state threading through generation functions and makes
it hard to understand why a particular project was generated a certain way. The loop becomes
order-dependent.

**Instead:** Generate all 50 projects independently (each using its pre-assigned target outcome),
then run `verifyDistribution()` over the full array. If constraints are not met, re-run the
entire generation with a new seed. This keeps generation functions pure and composable.

### Anti-Pattern 3: Hardcoding Score Targets Against the Scoring Engine Rules

**What people do:** Know that "50pts is a safe pass" and hardcode `targetScore = 50` throughout
the generator.

**Why it's wrong:** If the scoring engine rules change (threshold changes, point values shift),
the generator silently produces projects that no longer achieve the intended outcome.

**Instead:** Always verify outcomes by calling `scoreExisting(inputs)` — the generator should
be a consumer of the engine, not a reimplementation of it. Trust the engine's `passed` field,
not a manually computed threshold.

### Anti-Pattern 4: Writing ProjectInputs Without Type-Checking

**What people do:** Build the inputs object incrementally across tier functions and only type-
check at the end.

**Why it's wrong:** TypeScript's structural typing will catch missing required fields only when
the full object is assembled. An intermediate partial object spread into a full call will hide
missing fields until runtime.

**Instead:** Use a helper that constructs a full `ProjectInputs` object from a partial with
defaults applied, and call `scoreExisting` immediately to confirm the object is valid. The
type error surface is maximally small.

---

## Recommended Project Structure (additions only)

```
scripts/
  generateSeedData.ts          # npm run seed entry point
  seedGenerator/
    index.ts                   # generateSeedProjects(config) → ProjectInputs[]
    types.ts                   # BudgetTier, TargetOutcome, GeneratorConfig
    prng.ts                    # Seeded PRNG (mulberry32, ~10 lines)
    correlations.ts            # Probability tables keyed by BudgetTier
    fundamentals.ts            # Tier 1 field generation
    lessFundamental.ts         # Tier 2 field generation
    pointChasing.ts            # Tier 3 field generation
    projectNames.ts            # Pool of ~80 creative fictional names
    verifyDistribution.ts      # Post-generation constraint checks
```

```
src/data/
  seedProjects.ts              # REPLACED — now generator output, not hand-crafted
  __tests__/
    seedProjects.test.ts       # UNCHANGED — distribution tests remain the quality gate
```

---

## Suggested Build Order

Dependencies flow strictly downward — each step can be completed and tested before the next begins.

| Step | Work Item | Why This Position | Test Method |
|------|-----------|-------------------|-------------|
| 1 | `scripts/seedGenerator/types.ts` | All other generator files import from this; zero dependencies | TypeScript compilation |
| 2 | `scripts/seedGenerator/prng.ts` | Required by all random sampling; test with known seed → known output | Unit test: seed → sequence |
| 3 | `scripts/seedGenerator/correlations.ts` | Probability tables referenced by all tier modules | Review tables manually; no logic to test |
| 4 | `scripts/seedGenerator/projectNames.ts` | Name pool needed before writing output; independent | Manual review |
| 5 | `scripts/seedGenerator/fundamentals.ts` | Tier 1 must produce valid ProjectInputs subset | Unit test: output shape + score engine confirms fields |
| 6 | `scripts/seedGenerator/lessFundamental.ts` | Tier 2 extends Tier 1; depends on Tier 1 output + correlations | Unit test: combined Tier 1+2 scores via engine |
| 7 | `scripts/seedGenerator/pointChasing.ts` | Tier 3 depends on score gap from Tier 1+2; final tuning | Unit test: full input + engine = target outcome |
| 8 | `scripts/seedGenerator/verifyDistribution.ts` | Validates completed 50-project array; depends on all generators | Unit test with hand-crafted fixture arrays |
| 9 | `scripts/seedGenerator/index.ts` | Composes all tiers; depends on Steps 1-8 | Integration: generate 10 projects, run engine over each |
| 10 | `scripts/generateSeedData.ts` | Entry point; depends on Step 9 | Run end-to-end, inspect output file |
| 11 | Replace `src/data/seedProjects.ts` | Commit generator output | `npm test` — existing seedProjects.test.ts is the gate |

**Critical path:** types → prng → correlations → fundamentals → lessFundamental → pointChasing → verifyDistribution → index → entry point → replace output

Steps 3 and 4 can be done in parallel with Step 2. Steps 5-7 must be sequential (each tier
depends on the previous). Steps 8 and 9 are strictly after Steps 5-7.

---

## Scalability Considerations

This feature is a developer-time tool, not a production concern. Scalability here means maintainability.

| Concern | Approach |
|---------|----------|
| Adding new distribution constraints | Add assertion to `verifyDistribution.ts`; extend `TargetOutcome` type if needed |
| Changing budget correlations | Edit probability tables in `correlations.ts` — no logic changes elsewhere |
| Adding a new scoring criterion | Extend `ProjectInputs` (already tracked in `src/scoring/types.ts`); add field to appropriate tier in generator |
| Reproducing a specific generated set | Re-run `npm run seed -- --seed=<n>` with the documented seed value |
| Generator performance | 50 projects × 3 tiers × engine call per project = ~150 pure function calls. No performance concern. |

---

## Sources

- Direct source inspection: `src/scoring/types.ts`, `src/data/seedProjects.ts`, `src/store/useAppStore.ts`, `src/data/__tests__/seedProjects.test.ts` (all v1.0 committed files)
- Architecture inferred from existing codebase structure — no external sources required for this integration analysis

---
*Architecture research for: Uplift Compare v1.1 Realistic Seed Data*
*Researched: 2026-03-14*
