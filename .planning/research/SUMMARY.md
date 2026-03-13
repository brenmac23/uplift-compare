# Project Research Summary

**Project:** Uplift Compare — NZ Screen Production Rebate 5% Uplift scoring tool
**Domain:** Dual-system regulatory points-test calculator and comparison SPA
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

Uplift Compare is a static React SPA that takes raw production data once and calculates pass/fail results under both the existing and proposed NZ Screen Production Rebate Uplift points tests simultaneously. No directly analogous public tool exists — the closest comparables are jurisdiction comparison tools (Entertainment Partners) and immigration points calculators — so the feature landscape is inferred from UX patterns in comparison tables and eligibility calculators. The recommended approach is a three-layer architecture: a pure-function scoring engine at the core, a Zustand store with localStorage persistence in the middle, and React component views on top. The scoring engine is the most critical piece and must be built and validated before any UI work begins.

The primary technical risk is scoring logic correctness. The two source documents use dense policy language, overlapping section names, tiered thresholds, and a conditional pass mark for the proposed test. A wrong scoring interpretation is silent until someone manually cross-checks outputs. The proven mitigation is to translate both rule sets into a written developer-facing spec before writing any code, have it reviewed against the source documents, and enforce correctness with unit tests on the pure scoring functions. The engine must be isolated from React entirely so it is independently testable. This is a hard prerequisite — discovering a rules misunderstanding at the UI phase means rewriting output components, not just logic.

The secondary risks are data model mistakes that are expensive to reverse: storing calculated scores rather than raw inputs in localStorage (making rule corrections impossible without wiping data), duplicating shared input fields across both scoring systems (requiring double entry), and omitting a schema version field (causing crashes when the data model evolves during development). All three must be addressed at project setup. Beyond these structural concerns, the rest of the build follows well-documented patterns; the stack is mature and the UI is straightforward once the engine is correct.

---

## Key Findings

### Recommended Stack

The stack is modern, fully active-maintenance, and verified against official sources. Vite 8 (Rolldown-powered) scaffolds the React 19 + TypeScript project; Tailwind CSS v4 with the first-party Vite plugin handles styling with no config file; shadcn/ui CLI v4 provides accessible component primitives that are copied into the repo (no runtime lock-in). React Hook Form 7.71 + Zod 4 handle forms with uncontrolled inputs (no per-keystroke re-renders) and schema-level validation. Zustand 5 with its built-in `persist` middleware replaces the need for manual localStorage wiring and avoids re-render churn that React Context would cause across a 50-project list. TanStack Table 8.21 provides headless, sortable, filterable table primitives for the summary screen. ExcelJS 4.4 (loaded via dynamic import only on export action) generates styled .xlsx files client-side. React Router 7 in declarative SPA mode handles two routes (`/` and `/project/:id`). Netlify hosts the static output with a `_redirects` rule for SPA routing.

**Core technologies:**
- React 19.2 + TypeScript 5 — UI rendering with type safety across a form with many numeric fields
- Vite 8 — build tool with near-instant HMR; native Netlify support
- Tailwind CSS v4 + shadcn/ui CLI v4 — utility styling with accessible, owned component primitives
- React Hook Form 7.71 + Zod 4 — uncontrolled form state; `watch()` feeds live score preview
- Zustand 5 with `persist` middleware — global state and localStorage in one configuration block
- TanStack Table 8.21 — headless sortable/filterable table for the summary screen
- ExcelJS 4.4 (dynamic import) — styled .xlsx export without server
- React Router 7 declarative SPA mode — two-route client-side navigation

See `.planning/research/STACK.md` for alternatives considered and full version rationale.

### Expected Features

The tool's scope is small and focused. "MVP" is effectively the full feature set from PROJECT.md; there is nothing to cut from the core and little to add.

**Must have (table stakes):**
- Dual scoring engine: existing and proposed tests computed from shared input data
- Pass/fail verdict per test per project with visual indicator (badge/colour + label for accessibility)
- Score breakdown by section for both tests — users need to understand *why*, not just the total
- Single unified input form that feeds both scoring functions — no duplicate entry
- Project list / summary screen with pass/fail badges and basic descriptors for all projects
- Project detail screen with side-by-side score breakdown for both tests
- Create/edit project form with validation
- 50 seeded fictional projects with correct pass/fail distribution per PROJECT.md rules
- Accurate rule encoding validated against source documents
- Light theme, clean aesthetic; Netlify static deployment

**Should have (differentiators):**
- Export to Excel — explicitly required by PROJECT.md; enables stakeholder sharing and analysis
- Score delta column on summary screen — shows at a glance which projects gain or lose under the change
- Filter and sort on project list — makes the 50-project dataset navigable by pass/fail, production type, budget tier
- Seed data statistics panel — "X of 50 pass existing, Y pass proposed" makes policy impact immediately visible
- Mandatory criterion highlighting — A1 sustainability is mandatory in the existing test; show this distinctly
- "Which test is harder" callout on the detail view — purely presentational, data already computed
- Criterion-level help text tooltips — reduces need to read source documents

**Defer (post-ship validation):**
- "What changed" criterion highlighting — useful but requires writing diff annotations for every criterion
- Section collapse/expand accordion — low complexity but adds interaction layer
- Import from JSON — high complexity, unclear demand

See `.planning/research/FEATURES.md` for the full feature dependency tree and anti-feature rationale.

### Architecture Approach

A strict three-layer architecture prevents the primary failure modes. The **engine layer** contains two pure TypeScript functions (`scoreExisting`, `scoreProposed`) that take a `ProjectInputs` plain object and return a `TestResult` plain object — no React, no hooks, no state. All scoring constants and thresholds live in a separate `rules.ts` file so rule changes require editing one value, not hunting through logic. The **store layer** is a Zustand store with `persist` middleware that holds `{ projects[], activeProjectId }` and writes to localStorage; only route-level screen components connect to the store. The **UI layer** is feature-folder structured; sub-components (`ScorePanel`, `CriterionRow`, `PassFailBadge`) are pure-prop components with no store access. Scores are stored alongside raw inputs at save time (`{ inputs, existingResult, proposedResult }` per project) to avoid recomputing all 50 projects on every summary-screen render — but scores are always *derived from* inputs, never the source of truth.

**Major components:**
1. Scoring engine (`src/engine/`) — pure functions, rules constants, unit tests; no React dependency
2. Zustand store (`src/store/`) — project CRUD, seed loading, localStorage persistence
3. `SummaryScreen` — reads pre-computed stored results; TanStack Table for sort/filter
4. `ProjectDetailScreen` — renders two `ScorePanel` instances side by side with live score preview via RHF `watch()`
5. `ProjectFormScreen` — React Hook Form manages local state; saves to store on submit
6. Export utility (`src/utils/export.ts`) — ExcelJS via dynamic import, triggered from `ExportButton`

Build order is non-negotiable: Engine → Types → Store + Seed Data → Form → Detail View → Summary Screen → Export.

See `.planning/research/ARCHITECTURE.md` for data flow diagrams, data structures, folder layout, and anti-patterns to avoid.

### Critical Pitfalls

1. **Misreading the scoring spec** — Write a developer-facing spec document translating both policy documents into exact numeric rules before touching code. Have it reviewed against source .docx files. Unit-test the engine against known-correct inputs and boundary cases (exactly at threshold, just below, just above). Do not start UI until scoring is validated.

2. **Storing derived state in localStorage** — Only persist raw inputs. Scores are always recomputed from inputs. A `score` or `pass` field in the localStorage schema is the anti-pattern. This ensures rule corrections can be deployed without wiping user data.

3. **Scoring engine entangled with UI** — Any `if (formValues.vfx >= 30) setScore(...)` inside a component is the failure mode. The engine must be two pure functions, independently testable, with no React imports.

4. **Shared inputs duplicated per test** — Map all inputs to a single `ProjectInputs` type before building the form. Many fields (crew %, QNZPE, cast %) are consumed by both scoring functions from one stored value. Two form state objects means users enter data twice and the systems can diverge.

5. **No localStorage schema version** — Add `schemaVersion: number` to the store root on day one. Check it on boot; migrate or reseed on mismatch. This prevents the "pull new code, app crashes" cycle during development and protects user data post-launch.

Additional moderate pitfalls to address in Phase 1: floating-point errors on percentage threshold comparisons (normalise before comparing); tiered scoring implemented as cumulative accumulation rather than exclusive tiers; proposed test pass threshold hardcoded as a constant instead of derived from QNZPE (dynamic 20 vs. 30 points).

See `.planning/research/PITFALLS.md` for full detail, warning signs, and phase-specific warnings.

---

## Implications for Roadmap

Based on combined research, the critical path is: **Engine → Types → Store → Form → Detail View → Summary Screen → Export**. This order is dictated by hard dependencies: every subsequent layer consumes the one below. Inverting any step means building UI against fictional data and then rewriting when the real layer arrives.

### Phase 1: Scoring Engine and Data Model

**Rationale:** This is the non-negotiable foundation. Discovering a rules misunderstanding here costs nothing; discovering it at Phase 3 costs a rewrite. All research sources agree: build the engine first, test it in isolation, validate it against the source documents before any UI work.
**Delivers:** `scoreExisting()` and `scoreProposed()` pure functions with unit tests; `ProjectInputs`, `TestResult`, and `Project` TypeScript interfaces; `rules.ts` constants file; written developer spec translating both policy documents.
**Addresses:** Table-stakes features — dual scoring engine, pass/fail verdict, score breakdown by section.
**Avoids:** Pitfalls 1 (misread spec), 3 (engine entangled with UI), 6 (floating-point errors), 7 (tiered vs cumulative), 8 (hardcoded pass threshold).

### Phase 2: Data Layer and Seed Data

**Rationale:** The UI needs data to render. Seed data generation requires the engine to already be correct (the validator runs `scoreExisting` and `scoreProposed` on all 50 records and checks distribution). Zustand store with localStorage must be in place before form or list UI is built.
**Delivers:** Zustand store with `persist` middleware and `schemaVersion`; CRUD actions; 50 seeded fictional projects with programmatic generation script and automated constraint validator.
**Uses:** Zustand 5 `persist` middleware pattern from STACK.md; `seedIfEmpty()` boot pattern from ARCHITECTURE.md.
**Avoids:** Pitfalls 2 (derived state stored), 4 (shared inputs duplicated), 5 (no schema version), 10 (seed data distribution not validated).

### Phase 3: Core UI — Form, Detail View, Summary Screen

**Rationale:** With engine correct and store populated, all three screens can be built in dependency order. The form populates the store; the detail view reads from the store and shows side-by-side scores; the summary screen reads pre-computed stored results.
**Delivers:** `ProjectFormScreen` (React Hook Form + Zod, live score preview via `watch()`); `ProjectDetailScreen` with two `ScorePanel` components side by side, pass/fail badges, score delta, mandatory criterion highlighting; `SummaryScreen` with TanStack Table, pass/fail badges, filter/sort, statistics panel.
**Implements:** Component boundary rule (only screens connect to store); selector-based derived data pattern for summary screen.
**Avoids:** Pitfall 9 (validation blocking live scores — use `watch()`, not `onSubmit`); Pitfall 12 (percentage inputs accepting impossible values); Pitfall 14 (associated content window difference needs help text).

### Phase 4: Export and Polish

**Rationale:** Export reads from the store with no dependencies on form or display logic — easy to add last. Polish items (tooltips, statistics panel, any deferred UI tweaks) fill this phase.
**Delivers:** Excel export via ExcelJS dynamic import (lazy-loaded only on click); criterion-level help text tooltips; "which test is harder" summary callout; final visual polish.
**Avoids:** Pitfall 11 (SheetJS/ExcelJS in main bundle — enforce dynamic import, verify with bundle visualizer).

### Phase Ordering Rationale

- Engine-first is mandated by correctness risk: wrong scoring = fundamentally broken tool with no UI fix available.
- Data layer before UI prevents building screens against mock/empty state that gets replaced later.
- Core UI as one phase keeps form/detail/summary in one coherent sprint — they share components (`PassFailBadge`, `ScorePanel`) and it avoids the "form exists but there's nowhere to see results" intermediate state.
- Export last because it has zero upstream dependencies on display logic and is the only feature that can be safely deferred without blocking any other work.

### Research Flags

Phases with well-documented patterns — deeper research during planning likely not needed:
- **Phase 3 (Core UI):** React Hook Form + Zustand + shadcn/ui is a well-documented 2025-2026 pattern; TanStack Table with shadcn table components is the idiomatic approach.
- **Phase 4 (Export):** ExcelJS dynamic import pattern is straightforward; Vite code-splitting is automatic.

Phases that may benefit from deeper research during planning:
- **Phase 1 (Scoring Engine):** The policy documents themselves are the research input, not external libraries. The risk is domain interpretation, not technical patterns. The developer spec review with a domain expert is the mitigation, not additional technical research.
- **Phase 2 (Seed Data):** The generation strategy (programmatic constrained random vs. hand-crafted) merits a planning decision. The constraint rules from PROJECT.md are specific and interrelated; generating 50 records that satisfy all of them requires thought before coding.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core libraries verified against official docs and npm registry; only ExcelJS is MEDIUM (last published 2023 but 4.1M weekly downloads, no CVEs) |
| Features | HIGH for domain reasoning; MEDIUM for UX patterns | No directly analogous tool found; patterns inferred from comparison tables and eligibility calculators; NN/G and Baymard sources are authoritative |
| Architecture | HIGH | Three-layer pattern is well-established for this class of SPA; Zustand persist, RHF watch(), and selector-based derived state are all from official docs |
| Pitfalls | HIGH | Pitfalls derived from well-documented React form and scoring calculator failure modes, cross-validated across multiple sources |

**Overall confidence: HIGH**

### Gaps to Address

- **Exact scoring rules:** The developer-facing spec translating both policy documents is the single biggest unresolved item. It cannot be produced from research alone — it requires reading the source .docx files and having a domain expert validate the interpretation. This must be the first deliverable of Phase 1, before any code.
- **Shared vs. system-specific inputs:** The exact mapping of `ProjectInputs` fields to criteria in each test requires reading both scoring documents in detail. The architecture assumes this analysis will be done during Phase 1; the form structure depends on it.
- **Tiered criterion resolution:** Whether VFX and other tiered criteria are cumulative or exclusive tiers must be explicitly resolved in the developer spec before implementation. The research flags this as a known ambiguity but cannot resolve it without the source documents.
- **ExcelJS maintenance trajectory:** Last published 2023; currently no known CVEs and 4.1M weekly downloads. Acceptable risk for now; monitor at project start and substitute `write-excel-file` if maintenance concerns materialise (accepting reduced styling control).

---

## Sources

### Primary (HIGH confidence)
- React official docs (react.dev/versions) — React 19.2 version confirmation
- Vite official releases (voidzero.dev) — Vite 8 release confirmation
- Tailwind CSS official (tailwindcss.com/blog/tailwindcss-v4) — v4 Vite plugin
- shadcn/ui changelog (ui.shadcn.com/docs/changelog) — CLI v4 March 2026 release
- npm registry — React Hook Form 7.71, Zod 4, Zustand 5, TanStack Table 8.21, ExcelJS 4.4
- React Router official (reactrouter.com/how-to/spa) — v7 SPA mode
- Netlify official (docs.netlify.com) — Vite build configuration
- Zustand GitHub (pmndrs/zustand) — persist middleware patterns
- NZFC official (nzfilm.co.nz) — confirmed no existing official calculator tool
- NN/G (nngroup.com) — comparison table UX patterns
- PROJECT.md — authoritative requirements and scoring rule descriptions

### Secondary (MEDIUM confidence)
- LogRocket blog — comparison table UX pitfalls; localStorage schema migration patterns
- Baymard Institute — comparison tool usability research (38% of top sites, user difficulties)
- Kent C. Dodds (kentcdodds.com) — derived state best practice
- Robin Wieruch (robinwieruch.de) — React folder structure and computed properties
- Medium / Bacancy Technology — React Hook Form + Zustand patterns; React architecture 2026

### Tertiary (LOW confidence)
- Entertainment Partners Multi-Jurisdiction Comparison Tool — closest analogous domain tool; does jurisdiction comparison not dual-system test comparison; used only for UX reference
- Radix UI maintenance claim — surfaced in search results; shadcn/ui CLI v4 (March 2026) continues shipping Radix-based components, suggesting the claim is overstated for this project's timeline

---
*Research completed: 2026-03-13*
*Ready for roadmap: yes*
