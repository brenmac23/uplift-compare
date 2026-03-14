# Phase 2: Data Layer - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Zustand store expansion, localStorage persistence for projects, 50 seeded fictional projects with controlled distribution, project creation (minimal form), and first Netlify deployment via GitHub auto-deploy. No UI screens beyond what's needed to verify data loads — screens are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Seed project identity
- Claude decides name tone and naming constraints (genre-evocative preferred over generic)
- No descriptions — title only (descriptions can be added in Phase 3 if needed)
- Add a `productionType` field to `ProjectInputs`: `'film' | 'tv'` — mix of both in seed data
- No NZ references or real franchise names (per requirements). Claude applies good judgement on other real-world references

### Project creation form
- Minimal creation: name + QNZPE + productionType only — all scoring fields default to zero/false
- User fills in scoring detail later on the project detail screen (Phase 3)
- Edit any project (including seed projects), delete only user-created projects (seed projects protected)
- Include a "Reset to defaults" button that clears localStorage and restores original seed data (user-created projects lost on reset)
- Minimal validation only: name not empty, QNZPE > 0. Percentages clamped 0-100 by input type. No business rule validation

### Data distribution strategy
- Approximate 50/50 split on existing test pass/fail (roughly half, not exactly 25/25)
- Half over $100m QNZPE, all over $20m QNZPE (per requirements)
- Include borderline cases near pass thresholds (38-42pts existing, 18-22/28-32pts proposed) — these make the comparison most interesting
- Let cross-results (pass one test, fail the other) happen naturally from the distribution — don't force them
- Static JSON array committed to source — hand-crafted/AI-generated, not runtime-generated. Deterministic and reviewable
- Follow realism rules from requirements: all have A1, none have C3/C10, B1 rare, big budget = low qualifying persons, Section E rare/big budget only, most reach 80% on C2 especially smaller budgets

### Deployment setup
- Include Netlify CLI setup in plan (netlify-cli init, site creation, first deploy)
- Default Netlify subdomain (something.netlify.app) — custom domain later
- Hash router (e.g. `/#/project/123`) — no server-side redirect config needed
- Git init + push to GitHub + connect Netlify for auto-deploys on push

### Claude's Discretion
- Exact seed project names and scoring values (within distribution constraints)
- Zustand store shape expansion (actions, selectors, migrate function)
- How to distinguish seed vs user-created projects internally (e.g. `isSeeded` flag, ID prefix, etc.)
- Hash router library choice (React Router, wouter, etc.)
- GitHub repo name and Netlify site name

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ProjectInputs` type (src/scoring/types.ts): Defines all scoring input fields. Needs `productionType` added
- `ScoringResult`, `SectionResult`, `CriterionResult` types: Used to validate seed data distribution
- `scoreExisting()` and `scoreProposed()`: Run against each seed project to verify pass/fail distribution
- `useAppStore` (src/store/useAppStore.ts): Zustand store skeleton with `schemaVersion: 1` and persist middleware

### Established Patterns
- Zustand 5 with `persist` + `createJSONStorage(() => localStorage)` already configured
- Store key: `uplift-storage`, version: 1 — Phase 2 adds `migrate()` for version 2
- Raw inputs only in storage; scores always recomputed from inputs (never stored)
- QNZPE stored as whole NZD dollars (100_000_000 for $100m)

### Integration Points
- `useAppStore` needs: `projects` array, `addProject()`, `updateProject()`, `deleteProject()`, `resetToDefaults()`
- Seed data array imported into store initialization
- `scoreExisting(inputs)` and `scoreProposed(inputs)` used to validate seed data meets distribution requirements
- Barrel export (src/scoring/index.ts) already exports `SectionResult` type for Phase 3

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-data-layer*
*Context gathered: 2026-03-13*
