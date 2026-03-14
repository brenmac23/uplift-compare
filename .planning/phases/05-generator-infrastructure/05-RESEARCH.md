# Phase 5: Generator Infrastructure - Research

**Researched:** 2026-03-14
**Domain:** TypeScript code generation, seeded PRNG, Node.js script runner
**Confidence:** HIGH

## Summary

Phase 5 builds the generator scaffold: a `scripts/generateSeedData.ts` entry point that runs via `npm run seed`, uses a seeded PRNG for deterministic output, generates 50 `Project` objects matching the `ProjectInputs` contract, and writes a valid `src/data/seedProjects.ts` file. Field values in this phase are placeholder/minimal — tiered logic and correlations are Phase 6/7. The key infrastructure decisions are: (1) how to run the TypeScript script, (2) the PRNG implementation, (3) the module structure for extensibility, and (4) the output code-generation pattern.

**tsx via `npx tsx` is the right runner** — the existing src files use extensionless imports (`import from './helpers'`), which Node 24's native `--experimental-strip-types` cannot resolve. tsx handles bundler-mode resolution correctly. tsx is not currently installed as a project dependency and must be added as a devDependency.

**Primary recommendation:** Install tsx as a devDependency, add `"seed": "tsx scripts/generateSeedData.ts"` to package.json scripts, implement a mulberry32 PRNG seeded with a fixed constant, and generate field values using the decisions in CONTEXT.md.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Project name flavor:**
- Separate name pools for film (cinematic-sounding titles) and TV (series-sounding titles)
- Genre variety across the pool — action, sci-fi, fantasy, drama, horror, comedy represented
- Mixed tone — some serious/prestige names, some lighter/quirkier names
- No need to avoid proximity to real titles (e.g., "The Dark Horizon" is fine)
- ~80 names total (buffer beyond the 50 needed), split roughly 60/40 film/TV to match production type ratio

**Budget tier definitions:**
- 4 tiers: Small (<$50m), Mid ($50m-$99m), Large ($100m-$199m), Tentpole ($200m-$250m)
- Floor: $20m minimum QNZPE
- Ceiling: $250m maximum QNZPE
- Distribution within tiers is clustered (not uniform) — e.g., small-budget projects cluster around $30-40m
- `BudgetTier` type encodes these four tiers; all correlation tables key off this type

**Film vs TV split:**
- Each project has a 60% chance of being film, 40% TV (probabilistic, not quota-based)
- Both film and TV appear across all budget tiers
- TV shows skew toward higher crew percentage (more local crew embedded for longer shoots)
- TV shows are less likely to travel outside NZ (higher shootingNZPercent)
- Production type assignment happens early in generation so downstream tier logic can reference it

### Claude's Discretion
- Exact seed constant value (document in code comment)
- Clustering algorithm within budget tiers (e.g., beta distribution, truncated normal)
- Output file formatting (comments, structure, header)
- Correlations table data structure (maps, objects, functions)
- Constraint matrix format and location

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. Tiered field logic is Phase 6; distribution targets are Phase 7.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GEN-01 | Generator uses a seeded PRNG for deterministic, reproducible output | Mulberry32 PRNG pattern documented below — pure function, fixed seed constant |
| GEN-02 | Generator tracks running score after each tier to guide subsequent tier decisions | scoreExisting() is importable from scripts/ via tsx; call it after each project is assembled |
| GEN-03 | Generator prints validation report (distribution stats, pass rates, score ranges) to stdout | console.log() in entry point after all 50 projects generated; stdlib only |
| GEN-04 | Generator outputs static TypeScript file replacing existing seedProjects.ts | fs.writeFileSync to src/data/seedProjects.ts; template literal code generation |
| NAME-01 | Projects have creative fictional names (no real NZ names or real franchises) | Curated name pool arrays in scripts/generator/projectNames.ts; 48 film + 32 TV names minimum |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tsx | ^4.21.0 | Run TypeScript scripts in Node without build step | Handles bundler-mode extensionless imports; zero config; de facto standard for TS scripts |
| Node.js fs | built-in | Write output file | No dependency needed for `writeFileSync` |
| Node.js process | built-in | Read process.stdout, exit codes | Standard for CLI scripts |

### No External PRNG Library Needed
A seeded PRNG can be implemented in ~10 lines of pure TypeScript (mulberry32 algorithm). No library needed.

**Installation:**
```bash
npm install --save-dev tsx
```

Then add to `package.json` scripts:
```json
"seed": "tsx scripts/generateSeedData.ts"
```

---

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── generateSeedData.ts        # Entry point: orchestrates generation, writes file, prints report
└── generator/
    ├── types.ts               # BudgetTier type, GeneratorConfig, internal generator types
    ├── prng.ts                # Mulberry32 seeded PRNG factory
    ├── projectNames.ts        # Curated film and TV name pools (~80 names)
    ├── tiers.ts               # Budget tier definitions and QNZPE clustering logic
    ├── correlations.ts        # Correlations table structure (stub for Phase 6)
    └── index.ts               # generateProject() function; assembles one Project from PRNG
```

This build order enforces clean dependency direction:
`types → prng → projectNames → tiers → correlations → index → entry point`

### Pattern 1: Mulberry32 PRNG Factory

**What:** A simple, fast, seedable PRNG that returns a factory function producing values in [0, 1). Identical to Math.random() interface but deterministic from a fixed seed.

**When to use:** All random decisions in the generator — production type, QNZPE, field values, name selection.

**Why mulberry32:** Single 32-bit state, zero dependencies, no closure over mutable global state, trivially testable.

```typescript
// Source: public domain algorithm, widely referenced in graphics/simulation
/**
 * Creates a seeded pseudo-random number generator using the mulberry32 algorithm.
 * Returns a function with the same interface as Math.random() — values in [0, 1).
 *
 * SEED: 0xDEADBEEF (3735928559) — arbitrary, document here so reruns are traceable.
 */
export function createPrng(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

### Pattern 2: Typed Budget Tier with Clustering

**What:** `BudgetTier` is a union type encoding the four tiers. A function converts tier to a clustered QNZPE value using the PRNG.

**Why clustering (not uniform):** Real productions cluster around practical budget points, not spread uniformly. A beta(2, 5) approximation or a simple triangular distribution gives plausible clustering.

```typescript
// scripts/generator/types.ts
export type BudgetTier = 'small' | 'mid' | 'large' | 'tentpole';

export interface BudgetTierConfig {
  tier: BudgetTier;
  minQnzpe: number;
  maxQnzpe: number;
  /** Cluster center as a fraction of the range (0-1). E.g., 0.3 = lower third. */
  clusterCenter: number;
}
```

```typescript
// scripts/generator/tiers.ts — clustering via triangular distribution
export const BUDGET_TIERS: BudgetTierConfig[] = [
  { tier: 'small',    minQnzpe: 20_000_000,  maxQnzpe:  49_999_999, clusterCenter: 0.4 },
  { tier: 'mid',      minQnzpe: 50_000_000,  maxQnzpe:  99_999_999, clusterCenter: 0.35 },
  { tier: 'large',    minQnzpe: 100_000_000, maxQnzpe: 199_999_999, clusterCenter: 0.3 },
  { tier: 'tentpole', minQnzpe: 200_000_000, maxQnzpe: 250_000_000, clusterCenter: 0.4 },
];

/**
 * Triangular distribution: sample from min..max with mode at clusterCenter*range.
 * Returns whole NZD rounded to nearest $1m for plausibility.
 */
export function sampleQnzpe(tier: BudgetTierConfig, rand: () => number): number {
  const range = tier.maxQnzpe - tier.minQnzpe;
  const mode = tier.minQnzpe + clusterCenter * range;
  // Triangular via inverse CDF
  const u = rand();
  const fc = (mode - tier.minQnzpe) / range;
  let raw: number;
  if (u < fc) {
    raw = tier.minQnzpe + Math.sqrt(u * range * (mode - tier.minQnzpe));
  } else {
    raw = tier.maxQnzpe - Math.sqrt((1 - u) * range * (tier.maxQnzpe - mode));
  }
  return Math.round(raw / 1_000_000) * 1_000_000;
}
```

### Pattern 3: Code Generation via Template Literal

**What:** The entry point generates the TypeScript source as a string and writes it with `fs.writeFileSync`.

**When to use:** Static file generation where the output shape is fixed.

**Why template literal over AST builders:** No dependencies, readable, trivially correct for this fixed schema. The output format is inspectable.

```typescript
// scripts/generateSeedData.ts (entry point sketch)
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const OUTPUT_PATH = resolve(import.meta.dirname, '../src/data/seedProjects.ts');

function renderProject(p: Project, index: number): string {
  return `  {
    id: '${p.id}',
    isSeeded: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    inputs: ${JSON.stringify(p.inputs, null, 6).replace(/^/gm, '    ').trimStart()},
  }`;
}

const header = `/**
 * Auto-generated by scripts/generateSeedData.ts
 * Run \`npm run seed\` to regenerate. Do not edit manually.
 * Seed constant: 0xDEADBEEF
 */
import type { Project } from '../store/useAppStore';

export const SEED_PROJECTS: Project[] = [
`;

const body = projects.map(renderProject).join(',\n');
const footer = `\n];\n`;

writeFileSync(OUTPUT_PATH, header + body + footer, 'utf-8');
```

### Pattern 4: Running Score Tracking (GEN-02)

**What:** After each project's fields are assembled, call `scoreExisting(project.inputs)` to get the running score. Store it on a parallel structure for use by subsequent field selections and for the distribution report.

**How:** Import `scoreExisting` directly from `../../src/scoring/scoreExisting` in the generator. tsx resolves this correctly.

```typescript
// scripts/generator/index.ts
import { scoreExisting } from '../../src/scoring/scoreExisting';

export function generateProject(prng: () => number, index: number): { project: Project; existingScore: number } {
  const inputs = buildInputs(prng);
  const existingScore = scoreExisting(inputs).totalPoints;
  return {
    project: { id: `seed-${String(index + 1).padStart(3, '0')}`, isSeeded: true, createdAt: '2026-01-01T00:00:00.000Z', inputs },
    existingScore,
  };
}
```

### Pattern 5: Distribution Report (GEN-03)

After generating all 50 projects, print a summary to stdout before writing the file:

```
=== Seed Data Distribution Report ===
Total projects: 50
Film: 31 | TV: 19
Budget tiers: small=14 mid=13 large=13 tentpole=10
Pass rate (existing): 26/50 (52%)
Score range: 22–72
Borderline (38-42): 7
hasSustainabilityPlan=true: 50/50
maoriCrewPercent=0: 50/50
studioLease: 4
=====================================
```

### Anti-Patterns to Avoid

- **Using Math.random():** Non-deterministic. All randomness MUST flow through the seeded PRNG.
- **Global PRNG state:** Pass the PRNG function as an argument; never store state at module level where test imports could interfere.
- **Node 24 `--experimental-strip-types` without tsx:** Fails on the project's extensionless imports (`import from './helpers'`) — confirmed by testing.
- **JSON.stringify for the whole file:** `JSON.stringify` produces `"true"`/`"false"` for booleans and doesn't handle TypeScript syntax. Use template literals for the file wrapper; JSON.stringify is fine for the inputs object body (it's valid TS literal syntax for objects containing only primitives).
- **Hardcoding 50 in generator logic:** Use a `PROJECT_COUNT = 50` constant so it's easy to change during testing.
- **Writing to stdout and piping:** The file write must use `writeFileSync` directly to the path. Do not pipe stdout.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Running TypeScript scripts | Custom build step / tsc compile | `tsx` (devDependency) | tsx handles bundler-mode extensionless imports; tsc can't emit when `noEmit: true` |
| Seeded PRNG | npm PRNG library (seedrandom, etc.) | ~10-line mulberry32 implementation | Zero dependency, auditable, exactly fits the need |
| Clustered distributions | scipy/statistics library | Triangular distribution inverse CDF (~6 lines) | Simple, transparent, no dependency |

**Key insight:** This phase needs almost no external libraries — just tsx as a runner. All math is simple enough to inline.

---

## Common Pitfalls

### Pitfall 1: tsx Not Installed
**What goes wrong:** `npm run seed` fails with `sh: tsx: not found`
**Why it happens:** tsx is not in the current package.json; it's only available via `npx tsx`
**How to avoid:** Add `tsx` to devDependencies and install it — `npm install --save-dev tsx`. The CONTEXT.md references `tsx scripts/generateSeedData.ts` as the runner.
**Warning signs:** Any colleague running `npm run seed` without `npx` prefix fails

### Pitfall 2: Import Path Resolution (Confirmed in Research)
**What goes wrong:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...src/scoring/helpers'`
**Why it happens:** The project uses `moduleResolution: "bundler"` in tsconfig; src files use extensionless imports. Node 24's native `--experimental-strip-types` does not resolve extensionless imports. Only tsx handles this correctly.
**How to avoid:** Always use tsx (not `node --experimental-strip-types`) as the runner.
**Warning signs:** Script fails on first import of any src module

### Pitfall 3: PRNG Call Order Sensitivity
**What goes wrong:** Adding/reordering a field in the generator changes all subsequent values, making "deterministic" outputs fragile during development.
**Why it happens:** PRNG state is sequential — any insertion changes downstream values.
**How to avoid:** Finalize the field generation order before testing output consistency. Document the call sequence in comments. Once order is locked, don't add calls without knowing it changes all subsequent projects.
**Warning signs:** `npm run seed` twice produces identical files, but a minor generator change makes all projects different.

### Pitfall 4: TypeScript Compilation Errors in Output File
**What goes wrong:** Generated `src/data/seedProjects.ts` has syntax errors or type errors — the app fails to compile.
**Why it happens:** Template literal generation doesn't validate TypeScript output.
**How to avoid:** After writing the file, run `npx tsc --noEmit` (or `npm run build`) in the seed script's exit path to validate. OR run `vitest run src/data/__tests__/seedProjects.test.ts` which imports the file and will fail on parse errors.
**Warning signs:** App loads but shows blank project list; TypeScript error on `npm run build`

### Pitfall 5: Maori Fields Accidentally Set
**What goes wrong:** `maoriCrewPercent` > 0 or `hasLeadCastMaori: true` on any project — the test suite fails.
**Why it happens:** The generator carelessly randomizes all boolean fields.
**How to avoid:** Hardcode `maoriCrewPercent: 0` and `hasLeadCastMaori: false` in the generator for Phase 5. Phase 7 handles the SCEN-02 exception explicitly.
**Warning signs:** `seedProjects.test.ts` fails on "all have maoriCrewPercent === 0" assertion.

### Pitfall 6: hasSustainabilityPlan Not Always True
**What goes wrong:** `seedProjects.test.ts` fails — some generated projects have `hasSustainabilityPlan: false`.
**Why it happens:** The field is treated as a random boolean.
**How to avoid:** Hardcode `hasSustainabilityPlan: true` — the test requires 100% compliance, and it's also the mandatory criterion for the existing test to pass.

### Pitfall 7: ID Format Wrong
**What goes wrong:** Test `'all have unique ids matching pattern seed-NNN'` fails.
**Why it happens:** IDs generated as `seed-1` (not zero-padded) or `seed-0001` (over-padded).
**How to avoid:** Use `String(index + 1).padStart(3, '0')` — produces `seed-001` through `seed-050`.

---

## Code Examples

### PRNG instantiation and consumption
```typescript
// scripts/generateSeedData.ts
import { createPrng } from './generator/prng';

const SEED = 0xdeadbeef; // document why this value was chosen
const rand = createPrng(SEED);

// All downstream calls to rand() produce the same sequence
const productionType = rand() < 0.6 ? 'film' : 'tv';
```

### Selecting a name without repetition
```typescript
// scripts/generator/projectNames.ts
export const FILM_NAMES: string[] = [
  'Shattered Horizon', 'The Last Meridian', 'Echoes of the Deep',
  // ... ~48 total
];
export const TV_NAMES: string[] = [
  'The Waiheke Files', 'Southern Cross', 'Beneath the Kauri',
  // ... ~32 total
];

// scripts/generator/index.ts — shuffle pool with PRNG, take first 50
function sampleNames(pool: string[], count: number, rand: () => number): string[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
```

### Writing the output file
```typescript
// scripts/generateSeedData.ts
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '../src/data/seedProjects.ts');

const lines = [
  '/**',
  ' * Auto-generated by scripts/generateSeedData.ts — do not edit manually.',
  ` * Regenerate with: npm run seed`,
  ` * Seed constant: 0x${SEED.toString(16).toUpperCase()}`,
  ' */',
  "import type { Project } from '../store/useAppStore';",
  '',
  'export const SEED_PROJECTS: Project[] = [',
  ...projects.map((p) => renderProject(p) + ','),
  '];',
  '',
];

writeFileSync(OUTPUT, lines.join('\n'), 'utf-8');
console.log(`Written: ${OUTPUT}`);
```

### Triangular distribution for QNZPE clustering
```typescript
// scripts/generator/tiers.ts
export function triangular(min: number, max: number, mode: number, u: number): number {
  const fc = (mode - min) / (max - min);
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}
```

### Running test suite after generation
```bash
# Add to the npm script or run manually to validate output
npx vitest run src/data/__tests__/seedProjects.test.ts
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ts-node for scripts | tsx | ~2022 | tsx is faster, no separate tsconfig needed |
| Node 18 requiring `.js` extension rewriting | Node 24 `--experimental-strip-types` | 2024 | But bundler-mode extensionless imports still require tsx |

**Deprecated/outdated:**
- `ts-node`: Slower than tsx, more config-heavy. tsx replaced it as the standard.
- `node --loader ts-node/esm`: Complex, deprecated in newer Node versions.

---

## Open Questions

1. **Should `npm run seed` run the test suite automatically after writing the file?**
   - What we know: The CONTEXT.md does not specify this
   - What's unclear: Whether the planner wants seed + test as a single command
   - Recommendation: Keep them separate. `npm run seed` writes the file; developers run `npm test` separately. Avoids coupling.

2. **`import.meta.dirname` availability**
   - What we know: `import.meta.dirname` is available in Node.js 21.2+ (confirmed Node 24 is in use)
   - What's unclear: Whether tsx passes it through correctly
   - Recommendation: Use `import.meta.dirname` directly — it's the modern ESM equivalent of `__dirname`, works in Node 24 with tsx.

3. **Tier assignment distribution (quota vs probabilistic)**
   - What we know: Film/TV split is probabilistic (60/40), not quota-based. Budget tier split is not explicitly specified.
   - What's unclear: Whether budget tier should also be probabilistic or quota-based for the 20-30 large projects test constraint.
   - Recommendation: Use probabilistic tier assignment with weights tuned to land ~50% of projects at $100m+ (to reliably satisfy the `between 20-30 projects have qnzpe >= $100m` test). A simple weight distribution: small=25%, mid=25%, large=30%, tentpole=20% gives ~50% at $100m+. Adjust if needed.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (globals: true, environment: jsdom) |
| Quick run command | `npx vitest run src/data/__tests__/seedProjects.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GEN-01 | Running `npm run seed` twice produces identical `src/data/seedProjects.ts` | smoke (manual diff) | `npm run seed && cp src/data/seedProjects.ts /tmp/seed1.ts && npm run seed && diff /tmp/seed1.ts src/data/seedProjects.ts` | ❌ Wave 0 — add to verify script |
| GEN-02 | Generator tracks score per project (for report accuracy) | unit | `npx vitest run scripts/generator/__tests__/index.test.ts` | ❌ Wave 0 |
| GEN-03 | Distribution report printed to stdout | smoke | `npm run seed 2>&1 \| grep "Pass rate"` | ❌ Wave 0 |
| GEN-04 | Generated file is syntactically valid TS matching SEED_PROJECTS export | integration | `npx vitest run src/data/__tests__/seedProjects.test.ts` | ✅ exists |
| NAME-01 | All 50 projects have non-empty unique names from the curated pool | integration | `npx vitest run src/data/__tests__/seedProjects.test.ts` | ✅ (partial — tests non-empty names; unique names should be added) |

### Sampling Rate
- **Per task commit:** `npx vitest run src/data/__tests__/seedProjects.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** All 12 existing `seedProjects.test.ts` assertions green + `npm run seed` determinism verified

### Wave 0 Gaps
- [ ] `scripts/generator/__tests__/index.test.ts` — unit tests for `generateProject()` and PRNG determinism (covers GEN-01, GEN-02)
- [ ] `scripts/` directory — does not exist yet, must be created in Wave 0
- [ ] tsx devDependency — `npm install --save-dev tsx` must run before any task executes the seed script

*(Existing `src/data/__tests__/seedProjects.test.ts` covers GEN-04 and NAME-01 integration — 12 assertions already written and will pass once the generator produces correct output.)*

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `src/scoring/types.ts`, `src/store/useAppStore.ts`, `src/data/__tests__/seedProjects.test.ts`, `package.json`, `tsconfig.app.json`
- Live execution testing — Node 24.13.0 + `--experimental-strip-types` limitation confirmed by running actual commands against the project; tsx via npx confirmed working

### Secondary (MEDIUM confidence)
- tsx documentation pattern (npx tsx version 4.21.0 confirmed via npx)
- Mulberry32 algorithm: widely published public-domain algorithm; implementation verified manually

### Tertiary (LOW confidence)
- Triangular distribution inverse CDF formula — standard statistics, but the specific TypeScript implementation should be unit-tested

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — tsx confirmed working via live test; src import resolution failure confirmed for Node native stripping
- Architecture: HIGH — file layout directly derived from CONTEXT.md build order requirement; all interfaces verified against existing codebase
- Pitfalls: HIGH — pitfalls 1-4 confirmed by live execution; pitfalls 5-7 derived from reading the existing test file assertions

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (tsx and Node 24 are stable; no fast-moving dependencies)
