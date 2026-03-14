# Stack Research

**Domain:** Probabilistic seed data generation — TypeScript/browser, no backend
**Researched:** 2026-03-14
**Confidence:** HIGH

---

## Verdict: Zero New Dependencies

The v1.1 seed data task requires no new npm packages. Every required capability — seeded PRNG, normal distribution sampling, bimodal mixing, budget-correlated fields — is implementable in pure TypeScript with ~80–120 lines of utility code. Adding a library for this would increase bundle size, introduce a maintenance surface, and solve a problem that doesn't exist.

The existing stack already provides everything needed:
- TypeScript for type-safe generator functions
- Vitest for distribution verification tests
- The existing `Project` type and `scoreExisting` / `scoreProposed` functions as integration points

---

## Recommended Stack

### Core Technologies (unchanged — already in project)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TypeScript | ~5.9.3 | Generator implementation | Type-safe field definitions, compile-time enforcement of value ranges |
| Vitest | ^4.1.0 | Distribution verification | Run `scoreExisting` against generated projects to verify ~60% pass rate, bimodal distribution shape, correlation constraints |

### New Code to Write (not install)

| Module | Location | Purpose | Why inline not a library |
|--------|----------|---------|--------------------------|
| `seededRng.ts` | `src/data/generator/` | Mulberry32 PRNG returning `() => number` | 8 lines. Gives deterministic output for the same seed — critical for reproducible test snapshots. Libraries like `seedrandom` (3.0.5) add 3kB bundle overhead and DefinitelyTyped dependency for an 8-line function. |
| `distributions.ts` | `src/data/generator/` | Box-Muller normal, clamp, bimodal mixer, weighted boolean | ~50 lines. Box-Muller is a 6-line standard algorithm; bimodal = two normal calls with a random pick; clamp is one line. No statistical library brings enough additional value to justify its inclusion. |
| `generateProject.ts` | `src/data/generator/` | Three-tier orchestrator (Fundamentals → Less Fundamental → Point-chasing) | Domain logic that's specific to NZ Screen rebate rules — no generic library would model QNZPE inflection at $50m or the soft ~50pt cap. |
| `generateSeedProjects.ts` | `src/data/generator/` | Generates the 50-project array, calls `generateProject` 50 times with different seeds | Entry point; replace the hand-crafted `SEED_PROJECTS` array with a `generateSeedProjects()` call |

---

## Supporting Libraries — Considered and Rejected

| Library | Version | What It Provides | Why Not |
|---------|---------|-----------------|---------|
| `d3-random` | 3.x | `randomNormal(mu, sigma)`, `randomUniform()`, `randomLogNormal()` | Would add the full d3-random module (~20kB) for two functions. Box-Muller in vanilla JS is 6 lines. No bimodal support — you'd compose two normals manually anyway. |
| `seedrandom` | 3.0.5 | Seeded PRNG, browser-compatible, no eval (CSP-safe since 3.0.5) | 3kB for functionality replaceable with 8 lines of Mulberry32. Adds `@types/seedrandom` as a separate devDep. Fine for large projects; overkill here. |
| `simple-statistics` | 7.8.8 | Full stats library: distributions, regression, clustering | 316 dependents; good library. But the relevant functions (normal CDF, sample) are not what's needed — the task is _generating_ values, not _analyzing_ them. Bundle cost is not justified. |
| `prando` | latest | TypeScript-native seeded PRNG, deterministic | Well-made but inactive (last release 2021). Mulberry32 inline is simpler and has no maintenance dependency. |
| `@stdlib/random-base-box-muller` | 0.2.x | Box-Muller implementation as standalone module | Brings in the wider `@stdlib` ecosystem as a transitive dependency. For 6 lines of math, this is not acceptable. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `faker.js` / `@faker-js/faker` | Faker generates _surface-realistic_ strings and random values with no domain model. It cannot model QNZPE-correlated BTL crew counts or the three-tier scoring logic. Bundle is ~2MB. | Custom generator with domain knowledge |
| Any stats library (simple-statistics, jStat, ml-stat) | Generating 50 data points does not require a full statistics library. The only math needed is Box-Muller (normal sampling) and linear interpolation for budget-correlated scoring — both inline in 10 lines each. | Inline implementations in `distributions.ts` |
| Full `d3` bundle | Already in scope rejection — importing `d3-random` risks pulling in tree-shaking-unfriendly d3 internals depending on bundler config | `d3-random` standalone if a d3 sub-package were ever justified, but in this case still not needed |
| Any database seeding library (drizzle-seed, Prisma seed) | Those tools seed SQL databases from schemas. This project uses in-memory static TypeScript arrays — the concepts don't transfer. | Static `Project[]` array generated at build time |

---

## Implementation Pattern

The generator should use a functional, seeded-PRNG-threaded approach:

```typescript
// seededRng.ts — Mulberry32, well-known algorithm
export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

```typescript
// distributions.ts — Box-Muller, clamped normal, bimodal
export function normalSample(rng: () => number, mu: number, sigma: number): number {
  // Box-Muller transform
  const u1 = Math.max(rng(), 1e-10); // avoid log(0)
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + sigma * z;
}

export function clampedNormal(
  rng: () => number,
  mu: number,
  sigma: number,
  min: number,
  max: number
): number {
  return Math.min(max, Math.max(min, normalSample(rng, mu, sigma)));
}

export function bimodalSample(
  rng: () => number,
  mu1: number, sigma1: number,
  mu2: number, sigma2: number,
  weight1 = 0.5 // probability of drawing from first mode
): number {
  return rng() < weight1
    ? normalSample(rng, mu1, sigma1)
    : normalSample(rng, mu2, sigma2);
}

export function weightedBool(rng: () => number, probability: number): boolean {
  return rng() < probability;
}
```

```typescript
// Budget-correlated talent scoring example
// QNZPE inflection at $50m: small productions rarely attract A-list international cast
function castPercent(rng: () => number, qnzpe: number): number {
  const isLargeBudget = qnzpe >= 50_000_000;
  return isLargeBudget
    ? clampedNormal(rng, 72, 8, 50, 100)   // large: higher NZ cast % expected
    : clampedNormal(rng, 85, 6, 60, 100);  // small: NZ talent dominates
}
```

### Correlation Without a Library

Budget-correlated fields use conditional distributions, not Cholesky decomposition. For this domain:

- **Conditional branching**: `if (qnzpe >= 50_000_000)` draw from different mu/sigma
- **Derived fields**: `btlAdditionalCount = Math.round(btlKeyCount * rng() * 2 + 1)` — BTL additional is a function of BTL key
- **Score-targeting loop**: generate fields, score, if score is outside desired range adjust one parameter and re-score (simple hill-climbing, no optimization library needed)

This is the standard approach for domain-specific synthetic data generation where correlations are domain rules, not statistical co-variance matrices.

---

## Integration Points

| Existing Code | How Generator Connects |
|---------------|----------------------|
| `src/store/useAppStore.ts` — `Project` type | Generator output type must satisfy `Project`. Import and return `Project[]`. |
| `src/scoring/index.ts` — `scoreExisting`, `scoreProposed` | Call both inside generator's verification step to hit ~60% pass rate target. |
| `src/data/seedProjects.ts` | Replace hand-crafted array export with: `export const SEED_PROJECTS = generateSeedProjects()` |
| `src/data/__tests__/seedProjects.test.ts` | Existing distribution tests (60 pass rate, bimodal check, budget tiers) run unchanged against generated output — this is the acceptance criterion |

---

## Version Compatibility

No new dependencies means no new compatibility concerns. The existing stack already works together.

| Concern | Status |
|---------|--------|
| TypeScript strict mode | Inline math functions are trivially typeable — all inputs/outputs are `number` or `boolean` |
| Vitest tree-shaking | No new modules to shake; generator runs at module load time |
| Netlify static build | Generator runs at build time or module import; no runtime network calls |
| Bundle size impact | ~0kB added to production bundle (pure TS, no new deps) |

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Inline Mulberry32 | `seedrandom` library | If the project already had `seedrandom` or needed cryptographic-quality randomness |
| Inline Box-Muller | `d3-random` | If the project already imported d3 for visualization — then use the existing dep, don't duplicate |
| Conditional distributions | Cholesky copula correlation | If you needed precise statistical correlation coefficients across 10+ fields simultaneously — overkill for 6 correlated fields with known domain rules |
| Score-targeting loop | Analytical field computation | Analytical is faster but requires solving the scoring function in reverse; loop is simple, fast enough for 50 projects |

---

## Sources

- Mulberry32 algorithm: [cprosche/mulberry32 GitHub](https://github.com/cprosche/mulberry32) — 32-bit state PRNG, passes statistical tests, 8-line implementation
- Box-Muller transform: [Wikipedia — Box-Muller transform](https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform) — standard algorithm, no IP concerns
- d3-random npm: [npmjs.com/package/d3-random](https://www.npmjs.com/package/d3-random) — reviewed and rejected (overkill)
- simple-statistics npm: [npmjs.com/package/simple-statistics](https://www.npmjs.com/package/simple-statistics) — reviewed and rejected (analysis library, not generation)
- seedrandom npm: [npmjs.com/package/seedrandom](https://www.npmjs.com/package/seedrandom) — reviewed and rejected (inline is sufficient)
- Correlated random variables (general): [Open Risk Manual](https://www.openriskmanual.org/wiki/How_to_Generate_Correlated_Random_Numbers) — Cholesky approach documented; overkill for conditional-distribution pattern

---

*Stack research for: Uplift Compare v1.1 — Realistic seed data generation*
*Researched: 2026-03-14*
