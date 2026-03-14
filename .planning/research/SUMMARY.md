# Project Research Summary

**Project:** Uplift Compare v1.1 — Realistic Seed Data Generation
**Domain:** Probabilistic synthetic data generation integrated into an existing React/TypeScript SPA (no backend)
**Researched:** 2026-03-14
**Confidence:** HIGH

## Executive Summary

Uplift Compare v1.1 adds a probabilistic seed data generator to replace the hand-crafted `seedProjects.ts` with 50 algorithmically generated `Project` objects. The generator is a developer-time Node script — not a runtime browser concern — and produces a committed static TypeScript file that the existing app imports unchanged. The recommended architecture is pre-generation at dev time: run `npm run seed`, commit the output, and let the existing test suite in `seedProjects.test.ts` serve as the quality gate. No new npm dependencies are required; every mathematical primitive needed (seeded PRNG, Box-Muller normal sampling, bimodal mixing) can be implemented inline in under 120 lines, and every reviewed library alternative was rejected as over-engineered for the task.

The key technical insight from combined research is that realistic data requires three sequentially-dependent design decisions made upfront: (1) assign outcome targets (pass/fail/borderline) before generating inputs — not the reverse; (2) generate fields in tier order (Fundamentals first, then Less Fundamental, then Point-chasing) so each tier can reference the previous tier's outputs for correlation; (3) express budget-to-field correlations as probability tables, not conditional logic, separating domain knowledge from control flow. The two scoring systems (existing and proposed) reward different criteria, and at least one project must score differently under each — this cannot be left to chance and requires an explicit Section-E-heavy project profile to be modelled intentionally.

The primary risk is underestimating cross-field correlation requirements. Nine specific correlation rules are documented in research, and violating any one of them produces data that a NZ screen production domain expert would flag immediately. The mitigation is a constraint matrix (every assertion from the existing test suite compiled alongside all v1.1 requirements before any generation code is written), a `verifyDistribution()` pass after all 50 projects are built, and an eleven-point "looks-done-but-isn't" checklist before committing output. All pitfalls are prevention-phase concerns — they cannot be patched after data is produced without rebuilding the generator.

## Key Findings

### Recommended Stack

The v1.1 milestone requires zero new npm dependencies. The existing stack (TypeScript ~5.9.3, Vitest ^4.1.0) provides everything needed. All statistical primitives — Mulberry32 PRNG (~8 lines), Box-Muller normal sampling (~6 lines), bimodal mixing (~3 lines) — are implemented inline in `scripts/seedGenerator/`. Libraries reviewed and explicitly rejected include `seedrandom` (3kB for 8 lines of math), `d3-random` (20kB for two functions), `simple-statistics` (analysis library, not generation), and `faker.js` (2MB bundle, no domain model for NZ screen production rules).

**Core technologies:**
- TypeScript ~5.9.3: type-safe generator implementation — `ProjectInputs` interface enforces field completeness at compile time
- Vitest ^4.1.0: distribution verification — existing `seedProjects.test.ts` is the quality gate, no new test infrastructure needed
- Mulberry32 PRNG (inline, ~8 lines): deterministic output for the same seed — critical for reproducible, reviewable committed output
- Box-Muller transform (inline, ~6 lines): normal distribution sampling — standard algorithm, no IP concerns
- `tsx` (already in the ecosystem): runs the TypeScript generator script via `npm run seed` without a compilation step

See `.planning/research/STACK.md` for all rejected alternatives and full rationale.

### Expected Features

The feature set is fully scoped. All v1.1 items are P1 (blocking the milestone); differentiators are P2 (add after domain expert review of Phase 1 output); nothing is new v2+ scope.

**Must have (v1.1 P1 — table stakes):**
- Seeded PRNG — required for deterministic, reviewable output; all other features depend on this
- Three-tier decision order (Fundamentals, Less Fundamental, Point-chasing) — domain plausibility requires this sequencing
- Budget-stratified talent scoring with $50m inflection — above inflection, studios import ATL talent; below it, NZ talent dominates
- Bimodal picture/sound post-production — productions either post in NZ (75-95%) or they do not (0-20%); uniform mid-range values are implausible
- BTL additional count >= BTL key count enforcement — structurally required; the additional BTL pool is a superset of key positions
- Shooting/crew percent correlation — `crewPercent` must co-vary with `shootingNZPercent`
- ~60% pass existing test (55-65% band, targeting 28-30 of 50) — milestone goal; targeting 28-30 stays safely inside the existing test's 20-30 window
- Soft cap at ~50 points — implemented as probabilistic acceptance weighting, not hard rejection
- At least 1 passes-existing-fails-proposed scenario — the core analytical purpose of the comparison tool
- Maori criteria at ~1-2% (exactly 1 project with `maoriCrewPercent >= 10` and `hasLeadCastMaori = true`) — always false in v1.0
- Creative fictional project names (curated list of 60+, manually verified against real productions)
- All existing `seedProjects.test.ts` tests remain green — non-negotiable

**Should have (P2 — add after domain expert review of Phase 1 output):**
- `hasPreviousQNZPE` / `hasAssociatedContent` correlation (sequels more likely to have prior NZ history)
- Budget-realistic QNZPE multi-modal distribution (clusters at small, mid, tentpole) vs. current 25/25 split
- Regional filming correlated with shooting percent
- Studio lease budget-gated at >= $100m only
- Generator validation report to stdout (distribution summary after each run, ~20 lines)

**Defer (v2+):**
- More than 50 seed projects
- Seed data parameterised by jurisdiction or year (tool is NZ-specific and current)

See `.planning/research/FEATURES.md` for the full criterion-by-criterion generation reference, feature dependency tree, and validation test extensions.

### Architecture Approach

The generator lives entirely in `scripts/seedGenerator/` — a Node-only directory that never imports into `src/`. The only file that changes in the application is `src/data/seedProjects.ts`, which goes from hand-crafted to generator output with identical shape and export contract. The generation entry point imports `scoreExisting` and `scoreProposed` from `src/scoring/` as a read-only consumer; the scoring engine has no knowledge of the generator. One new npm script (`"seed": "tsx scripts/generateSeedData.ts"`) is the only `package.json` change. The Netlify build pipeline is completely unaffected.

**Major components (all new, in dependency order):**
1. `scripts/seedGenerator/types.ts` — `BudgetTier`, `TargetOutcome`, `GeneratorConfig` (zero dependencies; must be first)
2. `scripts/seedGenerator/prng.ts` — Mulberry32 seeded PRNG (foundation for all random draws)
3. `scripts/seedGenerator/correlations.ts` — probability tables keyed by `BudgetTier` (separates domain knowledge from logic)
4. `scripts/seedGenerator/projectNames.ts` — pool of ~80 curated fictional names
5. `scripts/seedGenerator/fundamentals.ts` — Tier 1 field generation (shooting %, ATL/BTL, lead cast, sustainability)
6. `scripts/seedGenerator/lessFundamental.ts` — Tier 2 (bimodal post-production, personnel counts, crew %)
7. `scripts/seedGenerator/pointChasing.ts` — Tier 3 (marketing, tourism, Section E, score gap tuning)
8. `scripts/seedGenerator/verifyDistribution.ts` — post-generation constraint validation over the full 50-project array
9. `scripts/seedGenerator/index.ts` — `generateSeedProjects(config) → ProjectInputs[]`
10. `scripts/generateSeedData.ts` — entry point; writes output to `src/data/seedProjects.ts`

See `.planning/research/ARCHITECTURE.md` for data flow diagrams, anti-patterns, scalability notes, and the complete suggested build order with rationale.

### Critical Pitfalls

All nine identified pitfalls must be addressed in Phase 1 (generator design). None can be patched after generation code is written without rebuilding the generator from the point of the mistake.

1. **BTL additional count uncorrelated with BTL key count** — generate `btlAdditionalCount` as a function of `btlKeyCount` (floor signal), not as an independent draw; cap at 8 (scoring maximum)
2. **Post-production fields uniformly correlated** — treat `picturePostPercent`/`soundPostPercent` as a bimodal coupled pair (high together or low together); treat `vfxPercent`/`conceptPhysicalPercent` as independent draws; never apply a single base value to all four
3. **Pass rate achieved via post-hoc score manipulation** — assign pass/fail profiles before generating inputs (outcome-first pattern); do not flip fields on already-generated projects to hit the target rate
4. **passes-existing-fails-proposed scenario never occurring naturally** — explicitly model a Section-E-heavy project profile (large-budget, `hasKnowledgeTransfer`/`infrastructureInvestment`); verify with `scoreExisting(p.inputs).passed && !scoreProposed(p.inputs).passed`
5. **Existing test assertions broken by new generator** — compile a complete constraint matrix of every `seedProjects.test.ts` assertion alongside every v1.1 requirement before writing any generation code; target 28-30 passing (not 30/50 exactly) to stay safely inside the 20-30 test window
6. **Score soft cap implemented as hard rejection** — model the ~50pt cap as a probabilistic acceptance modifier (score > 50: accept with decreasing probability), not a hard reject-and-retry loop; prevents the artificial distribution cliff
7. **Non-deterministic generation** — implement seeded PRNG before any other random draw; use a fixed integer seed constant; document the seed value; run generator twice and confirm diff is empty
8. **shootingNZPercent and crewPercent uncorrelated** — establish `shootingNZPercent` as a primary signal in Tier 1; use it to constrain the `crewPercent` draw range in Tier 2
9. **Project names colliding with real productions** — use three-word combinations from curated abstract vocabulary; manually verify all 50 names before committing

See `.planning/research/PITFALLS.md` for warning signs, recovery costs, and the full "looks-done-but-isn't" checklist.

## Implications for Roadmap

Based on the strict dependency order in ARCHITECTURE.md and the phase-mapped pitfalls in PITFALLS.md, this milestone maps cleanly to two phases. There is no reordering flexibility — each phase depends on the previous one being complete.

### Phase 1: Generator Foundation and Core Logic

**Rationale:** All P1 features depend on the seeded PRNG, correlation tables, and tiered field generation being correct before any output can be validated. Architecture research documents a strict build order (types → prng → correlations → fundamentals → lessFundamental → pointChasing → verifyDistribution → index → entry point) that must be followed — each module is a dependency of the next. All nine critical pitfalls are prevention-phase concerns that must be baked into generator design, not discovered during testing. The constraint matrix is the mandatory first act before a single line of generation code is written.

**Delivers:** A runnable `npm run seed` script producing 50 deterministic `Project` objects satisfying all v1.1 P1 requirements. Generator output passes all existing `seedProjects.test.ts` assertions plus the nine new test assertions (BTL correlation, bimodal post, crew/shooting correlation, pass rate at 28-30, Section E gating, soft cap, determinism, Maori count, passes-existing-fails-proposed).

**Addresses:** All FEATURES.md P1 items — seeded PRNG, three-tier decision order, budget-stratified talent ($50m inflection), bimodal picture/sound post, BTL additional >= BTL key, shooting/crew correlation, ~60% pass rate, soft cap, at least 1 passes-existing-fails-proposed, Maori criteria 1 project, creative project names, all existing tests green.

**Avoids:** All 9 pitfalls from PITFALLS.md. The constraint matrix must be compiled as the very first task, before implementation begins.

**Build sequence within phase:**
1. Compile constraint matrix (all existing test assertions vs. all v1.1 requirements; resolve the 20-30 vs. 60% conflict)
2. `types.ts` → `prng.ts` → `correlations.ts` + `projectNames.ts` (steps 3 and 4 can parallelize)
3. `fundamentals.ts` → `lessFundamental.ts` → `pointChasing.ts` (must be sequential; each tier references the previous)
4. `verifyDistribution.ts` → `index.ts` → `generateSeedData.ts`
5. Run `npm run seed`, then `npm test` — all green before committing output

### Phase 2: Distribution Refinement and Domain Expert Review

**Rationale:** P2 differentiators (multi-modal QNZPE distribution, regional/shooting correlation, `hasPreviousQNZPE`/`hasAssociatedContent` correlation, studio lease budget gate, generator validation report) are additive quality improvements that require a domain expert to review the Phase 1 output before any are prioritised. They cannot be evaluated without a working generator, and adding them prematurely risks complicating Phase 1.

**Delivers:** Refined generator with P2 correlations enabled based on expert review feedback, plus a stdout distribution summary report for future parameter tuning.

**Addresses:** All FEATURES.md P2 items — `hasPreviousQNZPE`/`hasAssociatedContent` correlation, budget-realistic QNZPE multi-modal distribution, regional filming/shooting % correlation, studio lease budget gate at >= $100m, generator validation report.

**Avoids:** Scope creep — all P2 items are strictly gated behind Phase 1 completion and domain expert sign-off.

### Phase Ordering Rationale

- The seeded PRNG is a zero-dependency foundation that every other module requires; it cannot be deferred even partially
- Tier ordering is mandated by cross-field correlation: `crewPercent` in Tier 2 needs `shootingNZPercent` from Tier 1; Tier 3 needs the accumulated score from Tiers 1+2 to know how many points to add or withhold
- `verifyDistribution()` must run post-generation over all 50 projects rather than incrementally; this means the full generator pipeline must be complete before distribution validation can run
- P2 differentiators are sequenced after Phase 1 because they require domain expert feedback on the Phase 1 dataset to know which correlations are actually visible as implausible to a reviewer

### Research Flags

Phases with well-documented patterns — research during planning not needed:
- **Phase 1:** Architecture, stack, feature scope, and pitfalls are all thoroughly documented across the four research files. The build order is explicit and verified against TypeScript module dependencies. Proceed directly to implementation planning.
- **Phase 2:** P2 items are small additive refinements to the Phase 1 generator. No novel patterns; no research phase needed.

No phases require `/gsd:research-phase` during planning. All decisions are resolved in the research files.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified against existing codebase; all rejected libraries directly reviewed on npm; no inference involved |
| Features | HIGH | Domain rules provided directly by NZ screen production expert; existing codebase and test suite read in full; P1/P2/deferred split is unambiguous |
| Architecture | HIGH | Based on direct inspection of all v1.0 committed source files; build order verified against TypeScript module dependencies; no external sources required |
| Pitfalls | HIGH | Derived from direct inspection of existing test suite, scoring engine, and scoring spec; all pitfalls grounded in specific field names, test assertions, and scoring thresholds |

**Overall confidence:** HIGH

### Gaps to Address

- **Exact seed constant:** The generator seed value (e.g., `42`) should be documented as a comment in `scripts/generateSeedData.ts` at authoring time. If the seed needs to change, bumping the constant is the correct mechanism — not changing the algorithm.
- **Name list final review:** The 60+ project names must be manually verified against real productions before committing. No automated check exists; this is a manual gate before Phase 1 is considered done.
- **Constraint matrix:** Must be compiled as the first act of Phase 1 before any code is written. The conflict between the existing test's 20-30 passing window and the v1.1 60% target (30/50 = exactly the top of the window) is known — the resolution is to target 28-30, not exactly 30 — but this must be codified in the matrix before implementation begins.

## Sources

### Primary (HIGH confidence)

- `src/data/seedProjects.ts` — current v1.0 hand-authored seed data; read in full
- `src/data/__tests__/seedProjects.test.ts` — all existing constraint assertions; read in full
- `src/scoring/types.ts` — `ProjectInputs` interface; all fields read field-by-field
- `src/scoring/scoreExisting.ts` — existing scoring logic; read in full
- `src/store/useAppStore.ts` — store initialisation and `resetToDefaults()` pattern; read in full
- `.planning/PROJECT.md` — v1.1 milestone goals and out-of-scope constraints
- Domain expert (NZ screen production) — ten domain rules provided in milestone context

### Secondary (MEDIUM confidence)

- Mulberry32 algorithm: [cprosche/mulberry32 GitHub](https://github.com/cprosche/mulberry32) — 8-line implementation, passes statistical tests
- Box-Muller transform: [Wikipedia](https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform) — standard algorithm, no IP concerns

### Reviewed and rejected

- `d3-random` 3.x — 20kB for two functions replaceable inline
- `seedrandom` 3.0.5 — 8-line Mulberry32 is sufficient; adds unnecessary devDep
- `simple-statistics` 7.8.8 — analysis library, not generation
- `@faker-js/faker` — 2MB bundle, no NZ screen production domain model
- `prando` — inactive since 2021; Mulberry32 inline has no maintenance dependency
- `@stdlib/random-base-box-muller` — brings in wider `@stdlib` ecosystem as transitive dep for 6 lines of math

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*
