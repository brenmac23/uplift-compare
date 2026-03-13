# Phase 1: Scoring Engine - Research

**Researched:** 2026-03-13
**Domain:** Pure TypeScript scoring functions, unit testing, Zustand store skeleton
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tier resolution for multi-level criteria**
- Highest-qualifying-tier-wins across all tiered criteria in both systems — a production hits the highest threshold it qualifies for and gets that tier's points, not a sum of all tiers passed
- Existing E2 and E3 explicitly state "not cumulative" — same logic applies universally
- Proposed criteria showing "1 or 2" or "1 - 3" in the Points column are the same pattern expressed differently

**Count-per-person pattern (separate from tier pattern)**
- Named-role sections use a count × points-per-person model, distinct from threshold tiers
- Existing C4 / Proposed B3 (Above-the-Line): up to 3 qualifying persons × 3pts each = 0-9pts
- Existing C5 / Proposed B4 (Below-the-Line key): count of qualifying persons from named list, capped at 4pts
- Existing C6 / Proposed B5 (Below-the-Line additional): count of qualifying persons from named list, capped at 4pts (proposed: 0.5pts each, existing: 1pt each)
- Existing C7 / Proposed B6 (Lead cast): 1 position, binary
- Existing C8 / Proposed B7 (Supporting cast): up to 3 positions × 1pt each
- Existing C9 / Proposed B8 (Casting): 3-option selector — None / Casting Associate (1pt) / Casting Director (2pts), mutually exclusive

**Input field granularity for personnel**
- Counts, not per-role checkboxes for all named-role sections
- Percentage thresholds (cast %, crew %) use a single percentage input

**One-system-only criteria**
- Criteria that don't exist in the other system display as "N/A" — not 0, not hidden
- Existing-only: A1-A3 Sustainability (7pts), B1 Studio Lease (2pts), C3 Maori Crew 10% (1pt), C10 Lead Cast/ATL Maori (2pts), E1-E3 Innovation & Infrastructure (8pts)
- Proposed-only: D3 Location Announcement (1pt), A4 Regional Filming 10% tier, B1 Cast 60% tier, B5 half-point scoring for additional BTL crew

**Shared inputs with different thresholds**
- Single raw input feeds both engines; each engine silently applies its own thresholds

**Premiere scoring (different input shapes per system)**
- Existing F1: Single choice — None / NZ Premiere (2pts) / World Premiere (3pts)
- Proposed D1: Two independent yes/no inputs — NZ Premiere (2pts) + International Promotion Agreement (2pts), can earn both (4pts)

**Skills & development inputs**
- Seminars, attachments, internships share count-based inputs across both systems

### Claude's Discretion

- TypeScript type structure for `ProjectInputs` and scoring result types
- Unit test framework choice and test organization
- Internal helper function design
- How to structure the scoring spec translation (inline comments vs. separate doc)
- Zustand store skeleton design

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCORE-01 | App encodes the existing uplift points test rules (85 max, 40 min to pass, A1 mandatory 3 points) | Scoring spec section + pure function pattern |
| SCORE-02 | App encodes the proposed uplift points test rules (70 max, 20/30 min tiered by QNZPE) | Scoring spec section + tiered threshold pattern |
| SCORE-03 | User enters raw production data and app auto-calculates points for both systems | `ProjectInputs` type design + both scorer functions |
| SCORE-04 | Shared input fields feed both scoring systems where criteria overlap | Single `ProjectInputs` type consumed by both engines |
| SCORE-05 | App displays pass/fail verdict per test per project | `ScoringResult.verdict` field + mandatory gate in existing scorer |
| SCORE-06 | App displays score breakdown by section with per-criterion detail | `ScoringResult` shape with section array and per-criterion entries |
| SCORE-07 | Mandatory criteria (A1 sustainability in existing test) are visually highlighted | `CriterionResult.mandatory` + `CriterionResult.mandatoryMet` flags |
| INFRA-02 | Data persists in browser localStorage | Zustand persist middleware skeleton with `schemaVersion` |
</phase_requirements>

---

## Summary

Phase 1 is entirely about encoding business rules as pure TypeScript functions and verifying them with unit tests. There is no UI work and no backend. The two core deliverables are `scoreExisting(inputs: ProjectInputs): ScoringResult` and `scoreProposed(inputs: ProjectInputs): ScoringResult`, plus a Zustand store skeleton that initialises `schemaVersion` so the persistence layer is ready for Phase 2.

The highest-risk item is the developer-facing scoring spec: a precise, line-by-line translation of both .docx policy documents into numeric rules before any code is written. Unit tests must be written against known manual calculations from the source documents, not against the code itself — otherwise circular validation gives false confidence. The scoring rules have enough complexity (tiered thresholds, count-per-person patterns, one-system-only criteria, N/A flags) that a written spec acts as a contract for both the test author and the implementer.

The tech stack is greenfield React + Vite + TypeScript (decided in STATE.md). The natural test framework is Vitest 4.x, which reuses the Vite config with zero extra wiring. Zustand 5's persist middleware provides localStorage with built-in versioned migration support — the `version` integer in persist options is the mechanism for `schemaVersion` evolution.

**Primary recommendation:** Write the scoring spec first (both documents translated to structured numeric rules), validate it manually, then drive implementation from tests against that spec.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.x (Vite default) | Type safety for `ProjectInputs`, result types, scoring logic | Decided in STATE.md; catches scoring bugs at compile time |
| Vitest | 4.1.0 | Unit test runner | Native Vite integration — zero config, reuses vite.config.ts, 4x faster than Jest |
| Zustand | 5.0.11 | State management skeleton | Decided in STATE.md; persist middleware handles localStorage natively |
| React | 19.2.4 | App framework (skeleton only in Phase 1) | Decided in STATE.md |
| Vite | 8.0.0 | Build tool and dev server | Decided in STATE.md |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitest/coverage-v8 | 4.1.0 | Code coverage for scoring functions | Run with `--coverage` flag to verify all branches hit |
| zustand/middleware (persist) | bundled with 5.0.11 | localStorage persistence with versioned migration | Used for the store skeleton in this phase |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest requires separate TypeScript/ESM config setup; Vitest reuses Vite config for free — no reason to use Jest in a Vite project |
| Zustand persist | Manual localStorage reads/writes | Persist middleware handles serialisation, version migration, and hydration edge cases; hand-rolling adds risk |

**Installation (scaffold + test deps):**
```bash
npm create vite@latest uplift -- --template react-ts
cd uplift
npm install zustand
npm install -D vitest @vitest/coverage-v8
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── scoring/
│   ├── types.ts          # ProjectInputs, ScoringResult, CriterionResult
│   ├── scoreExisting.ts  # scoreExisting() pure function
│   ├── scoreProposed.ts  # scoreProposed() pure function
│   ├── helpers.ts        # Shared tier/count helpers (no side effects)
│   └── spec.ts           # SCORING_SPEC constants — numeric rule tables
├── store/
│   └── useAppStore.ts    # Zustand store skeleton (schemaVersion only in Phase 1)
└── main.tsx              # App entry point (minimal in Phase 1)

src/scoring/__tests__/
├── scoreExisting.test.ts
├── scoreProposed.test.ts
└── helpers.test.ts

.planning/phases/01-scoring-engine/
└── SCORING_SPEC.md       # Human-readable spec validated against .docx files (Wave 0)
```

### Pattern 1: Pure Scoring Function

**What:** Each engine is a single exported function — no class, no singleton, no mutation. Input goes in, result comes out. Deterministic.

**When to use:** All scoring logic. No criterion should read from module-level state.

```typescript
// src/scoring/scoreExisting.ts
import type { ProjectInputs, ScoringResult } from './types';

export function scoreExisting(inputs: ProjectInputs): ScoringResult {
  const criteria: CriterionResult[] = [];

  // Section A: Sustainability (7pts)
  const a1 = scoreA1Sustainability(inputs);   // mandatory
  const a2 = scoreA2Officer(inputs);
  const a3 = scoreA3CarbonReview(inputs);
  criteria.push(a1, a2, a3);

  // ... all sections ...

  const totalPoints = criteria
    .filter(c => c.score !== 'N/A')
    .reduce((sum, c) => sum + (c.score as number), 0);

  const mandatoryMet = criteria
    .filter(c => c.mandatory)
    .every(c => (c.score as number) > 0);

  const passed = totalPoints >= 40 && mandatoryMet;

  return { totalPoints, maxPoints: 85, passed, mandatoryMet, criteria };
}
```

### Pattern 2: Highest-Qualifying-Tier Helper

**What:** A small helper that takes an array of `[threshold, points]` pairs (descending) and a raw value, returning the points for the highest qualifying tier. Returns 0 if no tier is met.

**When to use:** All tiered criteria — VFX, post-production, E2 Commercial Agreement, regional filming, etc.

```typescript
// src/scoring/helpers.ts

/**
 * Returns points for the highest qualifying tier.
 * tiers must be ordered highest-threshold-first.
 * Example: scoreHighestTier([[90, 3], [75, 2], [50, 1]], 80) => 2
 */
export function scoreHighestTier(
  tiers: Array<[number, number]>,
  value: number
): number {
  for (const [threshold, points] of tiers) {
    if (value >= threshold) return points;
  }
  return 0;
}
```

### Pattern 3: Count-Cap Helper

**What:** Multiplies a count by points-per-head, capped at a maximum. Handles the ATL/BTL personnel sections.

**When to use:** C4/B3 (ATL), C5/B4 (BTL key), C6/B5 (BTL additional), C8/B7 (supporting cast).

```typescript
// src/scoring/helpers.ts
export function scoreCountCapped(
  count: number,
  pointsEach: number,
  cap: number
): number {
  return Math.min(count * pointsEach, cap);
}
```

### Pattern 4: CriterionResult with N/A Support

**What:** Each criterion returns a `CriterionResult` with a score that is either a number or the string `'N/A'`. This supports the one-system-only display requirement without a special branch in the total computation.

**When to use:** All criterion scoring functions. One-system-only criteria return `{ score: 'N/A' }` in the other engine.

```typescript
// src/scoring/types.ts
export interface CriterionResult {
  id: string;           // 'A1', 'B3', etc.
  label: string;        // Human-readable name
  score: number | 'N/A';
  maxScore: number | 'N/A';
  mandatory?: boolean;  // Only true for existing A1
  mandatoryMet?: boolean;
}

export interface ScoringResult {
  totalPoints: number;
  maxPoints: number;
  passed: boolean;
  mandatoryMet: boolean;   // Always true for proposed (no mandatory criteria)
  passThreshold: number;   // 40 for existing; 20 or 30 for proposed
  criteria: CriterionResult[];
}
```

### Pattern 5: Zustand Store Skeleton with Persist

**What:** Minimal Zustand store initialised with `schemaVersion`. Uses persist middleware so the app can boot from empty localStorage without crashing.

**When to use:** This skeleton is the INFRA-02 deliverable. Phase 2 will flesh out the projects array and actions.

```typescript
// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  schemaVersion: number;
}

export const useAppStore = create<AppState>()(
  persist(
    () => ({
      schemaVersion: 1,
    }),
    {
      name: 'uplift-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Anti-Patterns to Avoid

- **Storing computed scores in localStorage:** Scores must always be recomputed from inputs. Never write `totalPoints` or `passed` to the store — these are derived values. (Locked decision from STATE.md.)
- **Cumulative tiers:** Never sum multiple tier levels for a single criterion. Highest-qualifying-tier-wins everywhere.
- **Magic numbers inline:** All point values and thresholds must live in `spec.ts` constants or clearly commented blocks — not scattered as literals through scoring functions. This makes rule corrections trivial.
- **Boolean flags instead of N/A:** Never use `score: 0` to mean "not applicable". Use `'N/A'` explicitly — downstream UI and total computation depend on this distinction.
- **Validating code against code:** Unit tests must have expected values derived from manual calculation against the source documents, not reverse-engineered from the implementation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage persistence with versioned migration | Custom read/write/version-check logic | Zustand persist middleware | Handles serialisation, hydration timing, version migration, partial state writes, and storage errors |
| TypeScript test runner | Jest + ts-jest + babel config | Vitest | Zero config for Vite projects; natively understands TSX/TypeScript via ESBuild |
| State migration between schema versions | Custom migration script | Zustand persist `version` + `migrate` option | Built-in: increment `version`, provide `migrate(persistedState, fromVersion)` — runs automatically on version mismatch |

**Key insight:** The scoring logic itself IS the custom code. Everything around it (persistence, testing, TypeScript transform) should use standard tools with zero ceremony.

---

## Common Pitfalls

### Pitfall 1: Spec Written After Code (Validation Circularity)

**What goes wrong:** Developer reads the .docx, writes the scoring function, then writes tests that pass because both the code and tests were written from the same (possibly wrong) reading.

**Why it happens:** It feels efficient to do everything in one pass.

**How to avoid:** Write SCORING_SPEC.md first, have it reviewed/validated, then write tests from the spec, then write implementation to make tests pass.

**Warning signs:** Test expected values that exactly match what the code produces on first run with no debugging.

---

### Pitfall 2: Conflating Tiers and Count-Per-Person

**What goes wrong:** Treating BTL additional crew count as a tier threshold (e.g., "if count >= 4, award 4pts") instead of a count-cap (count × 1pt, max 4).

**Why it happens:** Both patterns use numeric thresholds and numeric outputs; the distinction is in the source document language.

**How to avoid:** Explicitly categorise each criterion as "tiered" or "counted" in SCORING_SPEC.md. Use the two separate helpers (`scoreHighestTier` vs `scoreCountCapped`) — never mix them.

**Warning signs:** Count-based sections returning the same value regardless of count (e.g., always 4pts when count >= 1).

---

### Pitfall 3: Proposed Pass Threshold — Wrong QNZPE Branch

**What goes wrong:** `scoreProposed()` always uses the 30pt threshold even for sub-$100m projects, or uses `inputs.qnzpe` raw value (in millions?) when the threshold is $100m.

**Why it happens:** Unit conversion ambiguity — if `qnzpe` is stored in dollars, the comparison is `>= 100_000_000`; if in millions, it's `>= 100`.

**How to avoid:** Decide the canonical unit for `qnzpe` in `ProjectInputs` (recommend: whole dollars as `number` for precision). Document it in the type definition with a JSDoc comment. Write a dedicated test: `qnzpe: 99_999_999` → threshold 20; `qnzpe: 100_000_000` → threshold 30.

**Warning signs:** Tests for both branches using the same expected `passed` value.

---

### Pitfall 4: Zustand Store Crashing on Empty localStorage

**What goes wrong:** On first load (fresh localStorage), the persisted state is `null` or `{}`, causing destructuring or property access errors if the default state initialiser doesn't handle partial hydration.

**Why it happens:** Zustand's persist middleware merges the persisted state on top of the default state, but if the persisted data has an unexpected shape, properties can be undefined.

**How to avoid:** Use the `merge` option or ensure all store properties have explicit defaults. Test by clearing localStorage and hard-refreshing — success criterion 5 requires this to work without crashing.

**Warning signs:** `Cannot read properties of undefined` errors in console on first load after clearing storage.

---

### Pitfall 5: Mandatory A1 Logic — Misapplied to Proposed

**What goes wrong:** The mandatory A1 check (existing test only) accidentally gates the proposed pass verdict too, causing `passed: false` even when proposed total meets the threshold.

**Why it happens:** If `mandatoryMet` is computed at the shared level rather than inside each engine function.

**How to avoid:** `mandatoryMet` is computed inside `scoreExisting()` specifically. `scoreProposed()` always returns `mandatoryMet: true`. The `ScoringResult` type carries it per-result, not as global state.

**Warning signs:** Proposed test always failing for projects with no A1 equivalent inputs.

---

## Code Examples

Verified patterns from official sources and the locked decisions:

### Highest-Tier Resolution (VFX example)

```typescript
// Existing B8 VFX: 50% → 1pt, 75% → 2pt, 90% → 3pt
// Proposed A7 VFX: 30% → 1pt, 50% → 2pt, 75% → 3pt
// Same input: inputs.vfxPercent (0-100)

// In scoreExisting:
const b8 = scoreHighestTier([[90, 3], [75, 2], [50, 1]], inputs.vfxPercent ?? 0);

// In scoreProposed:
const a7 = scoreHighestTier([[75, 3], [50, 2], [30, 1]], inputs.vfxPercent ?? 0);
```

### Tiered Pass Threshold (Proposed)

```typescript
// In scoreProposed():
const passThreshold = inputs.qnzpe >= 100_000_000 ? 30 : 20;
const passed = totalPoints >= passThreshold;
```

### Mandatory Criterion Flag (Existing A1)

```typescript
// In scoreExisting():
const a1: CriterionResult = {
  id: 'A1',
  label: 'Sustainability Plan & Report',
  score: inputs.hasSustainabilityPlan ? 3 : 0,
  maxScore: 3,
  mandatory: true,
  mandatoryMet: inputs.hasSustainabilityPlan === true,
};

// Pass gate:
const mandatoryMet = a1.mandatoryMet === true;
const passed = totalPoints >= 40 && mandatoryMet;
```

### Vitest Test File Structure

```typescript
// src/scoring/__tests__/scoreExisting.test.ts
import { describe, it, expect } from 'vitest';
import { scoreExisting } from '../scoreExisting';

// Baseline inputs that score 0 on everything except mandatory A1
const minimalPassing: ProjectInputs = {
  qnzpe: 20_000_000,
  hasSustainabilityPlan: true,  // A1 mandatory — must be true to pass
  // ... all other fields at 0/false/null
};

describe('scoreExisting', () => {
  describe('pass/fail verdict', () => {
    it('returns passed: false when A1 is not met even if total >= 40', () => {
      // Arrange: inputs that reach 40pts but lack A1
      const result = scoreExisting({ ...inputs40ptsNoA1 });
      // Assert
      expect(result.passed).toBe(false);
      expect(result.mandatoryMet).toBe(false);
    });

    it('returns passed: true when total >= 40 and A1 is met', () => {
      const result = scoreExisting(knownPassingInputs);
      expect(result.passed).toBe(true);
      expect(result.totalPoints).toBe(/* manually calculated value */);
    });
  });

  describe('Section B tiered criteria', () => {
    it('B8 VFX: awards 2pts at 80% (hits 75% tier, not 90%)', () => {
      const result = scoreExisting({ ...minimalPassing, vfxPercent: 80 });
      const b8 = result.criteria.find(c => c.id === 'B8')!;
      expect(b8.score).toBe(2);
    });
  });
});
```

### Zustand Persist with Version

```typescript
// Source: https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAppStore = create<AppState>()(
  persist(
    () => ({ schemaVersion: 1 }),
    {
      name: 'uplift-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Phase 2 will add: migrate, partialize, projects array
    }
  )
);
```

---

## The Scoring Spec (Wave 0 Deliverable)

This is the highest-risk item per STATE.md. Before any code is written, a `SCORING_SPEC.md` must be produced and validated. It must contain:

1. **Every criterion** from both tests with exact point values, threshold numbers, and the scoring pattern (tiered / counted / binary / selector)
2. **Maximums per section** and totals (85 / 70)
3. **Pass thresholds** and conditions (existing: 40 + A1 mandatory; proposed: QNZPE-tiered)
4. **One-system-only list** with explicit "returns N/A in other engine" annotation
5. **Shared-input list** — which `ProjectInputs` fields feed which criteria in which engine
6. **At least two full worked examples** (one known passer, one known failer) with line-by-line calculations traceable back to source document sections

The spec is the ground truth. Tests are written from the spec. Code is written to pass the tests.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest + ts-jest + babel config | Vitest (zero config for Vite) | Vitest went stable ~2022, dominant for Vite projects by 2024 | No extra config needed; TypeScript just works |
| Zustand v4 manual storage setup | Zustand v5 `createJSONStorage` + `persist` | Zustand 5.0 released late 2024 | Cleaner TypeScript types; middleware import path changed |
| `create(...)` (Zustand v4 style) | `create<State>()(...)` curried form (Zustand v5) | Zustand 5 | Required for correct TypeScript inference |

**Deprecated/outdated:**
- `import create from 'zustand'` (default import): Removed in Zustand v5 — use named import `import { create } from 'zustand'`
- Jest for Vite projects: Not deprecated but requires significant extra config (ts-jest, babel, ESM flags); Vitest is the obvious choice for this stack

---

## Open Questions

1. **Unit for `qnzpe` in `ProjectInputs`**
   - What we know: The pass threshold is $100m, point thresholds involve dollar amounts ($500k, $1m, $2m for E3)
   - What's unclear: Should `qnzpe` be stored as whole dollars (`100_000_000`), thousands (`100_000`), or millions (`100`)?
   - Recommendation: Store as whole dollars (number in cents would be excessive). Use `100_000_000` as the literal in comparisons. Document unit in JSDoc on the field.

2. **Proposed B5 half-point cap arithmetic**
   - What we know: Proposed B5 awards 0.5pts per qualifying additional BTL crew, max 4pts (so 8 persons = 4pts)
   - What's unclear: Does the source document cap at 4pts or at 8 qualifying persons?
   - Recommendation: Implement as `Math.min(count * 0.5, 4)` and document the cap value in the spec. Verify against the .docx before writing tests.

3. **Internship/attachment thresholds by QNZPE band**
   - What we know: Both systems have skills criteria that mention QNZPE-banded thresholds
   - What's unclear: The exact breakpoints for D3/D4 (existing) and C3/C4 (proposed) need spec extraction from the .docx
   - Recommendation: Treat as highest-risk spec items — extract these tables first and validate before coding.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` — Wave 0 creates this |
| Quick run command | `npx vitest run src/scoring` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCORE-01 | `scoreExisting()` returns 85 max, correct total, pass at 40 with A1 met | unit | `npx vitest run src/scoring/__tests__/scoreExisting.test.ts` | Wave 0 |
| SCORE-02 | `scoreProposed()` returns 70 max, passes at 20 for <$100m, 30 for >=$100m | unit | `npx vitest run src/scoring/__tests__/scoreProposed.test.ts` | Wave 0 |
| SCORE-03 | Both functions accept the same `ProjectInputs` and return numeric scores | unit (type) | `npx vitest run` (TypeScript compile check) | Wave 0 |
| SCORE-04 | `qnzpe`, `crewPercent`, `castPercent` shared — changing one value affects both engine outputs | unit | `npx vitest run src/scoring/__tests__/sharedInputs.test.ts` | Wave 0 |
| SCORE-05 | `passed` field correct for known passing and failing inputs in both engines | unit | `npx vitest run src/scoring/__tests__/scoreExisting.test.ts src/scoring/__tests__/scoreProposed.test.ts` | Wave 0 |
| SCORE-06 | `criteria` array contains one entry per criterion with `id`, `score`, `maxScore` | unit | included in SCORE-01/02 test files | Wave 0 |
| SCORE-07 | Existing A1 criterion has `mandatory: true`; `mandatoryMet: false` causes `passed: false` | unit | `npx vitest run src/scoring/__tests__/scoreExisting.test.ts` | Wave 0 |
| INFRA-02 | App boots on fresh localStorage without crash; `schemaVersion` readable from store | integration (smoke) | `npx vitest run src/store/__tests__/useAppStore.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/scoring`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

All test infrastructure is greenfield — nothing exists yet.

- [ ] `src/scoring/__tests__/scoreExisting.test.ts` — covers SCORE-01, SCORE-05, SCORE-06, SCORE-07
- [ ] `src/scoring/__tests__/scoreProposed.test.ts` — covers SCORE-02, SCORE-05, SCORE-06
- [ ] `src/scoring/__tests__/sharedInputs.test.ts` — covers SCORE-03, SCORE-04
- [ ] `src/store/__tests__/useAppStore.test.ts` — covers INFRA-02
- [ ] `vitest.config.ts` — Vitest configuration at project root
- [ ] `package.json` with `"test": "vitest run"` script
- [ ] `.planning/phases/01-scoring-engine/SCORING_SPEC.md` — human-validated spec (pre-condition for all tests)
- [ ] Framework install: `npm install -D vitest @vitest/coverage-v8`

---

## Sources

### Primary (HIGH confidence)

- npm registry (live query) — vitest@4.1.0, zustand@5.0.11, vite@8.0.0, react@19.2.4
- https://vitest.dev/guide/ — Vitest configuration, current version, Vite prerequisites
- https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5 — Zustand v5 breaking changes (default import removed, curried `create`)

### Secondary (MEDIUM confidence)

- https://devtoolswatch.com/en/vitest-vs-jest-2026 — Vitest vs Jest comparison, 2026 ecosystem status
- https://dev.to/diballesteros/how-to-migrate-zustand-local-storage-store-to-a-new-version-njp — Zustand persist version/migrate pattern
- https://betterstack.com/community/guides/testing/vitest-explained/ — Vitest describe/it/expect pattern

### Tertiary (LOW confidence)

- None — all critical claims verified via npm registry or official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed live from npm registry
- Architecture: HIGH — pure function pattern is foundational TypeScript; Zustand persist API verified
- Pitfalls: HIGH — derived from the locked decisions in CONTEXT.md and known Zustand/Vitest behaviours
- Scoring rules: HIGH — taken verbatim from the detailed criterion breakdown provided in the phase brief; full validation against .docx is a Wave 0 task

**Research date:** 2026-03-13
**Valid until:** 2026-06-13 (90 days — React/Vite/Zustand/Vitest all stable APIs)
