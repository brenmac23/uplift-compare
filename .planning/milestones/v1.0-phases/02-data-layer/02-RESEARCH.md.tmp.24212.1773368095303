# Phase 2: Data Layer - Research

**Researched:** 2026-03-13
**Domain:** Zustand store expansion, localStorage persistence, seed data design, React routing (hash), Netlify deployment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Seed project identity**
- Claude decides name tone and naming constraints (genre-evocative preferred over generic)
- No descriptions — title only (descriptions can be added in Phase 3 if needed)
- Add a `productionType` field to `ProjectInputs`: `'film' | 'tv'` — mix of both in seed data
- No NZ references or real franchise names (per requirements). Claude applies good judgement on other real-world references

**Project creation form**
- Minimal creation: name + QNZPE + productionType only — all scoring fields default to zero/false
- User fills in scoring detail later on the project detail screen (Phase 3)
- Edit any project (including seed projects), delete only user-created projects (seed projects protected)
- Include a "Reset to defaults" button that clears localStorage and restores original seed data (user-created projects lost on reset)
- Minimal validation only: name not empty, QNZPE > 0. Percentages clamped 0-100 by input type. No business rule validation

**Data distribution strategy**
- Approximate 50/50 split on existing test pass/fail (roughly half, not exactly 25/25)
- Half over $100m QNZPE, all over $20m QNZPE (per requirements)
- Include borderline cases near pass thresholds (38-42pts existing, 18-22/28-32pts proposed) — these make the comparison most interesting
- Let cross-results (pass one test, fail the other) happen naturally from the distribution — don't force them
- Static JSON array committed to source — hand-crafted/AI-generated, not runtime-generated. Deterministic and reviewable
- Follow realism rules from requirements: all have A1, none have C3/C10, B1 rare, big budget = low qualifying persons, Section E rare/big budget only, most reach 80% on C2 especially smaller budgets

**Deployment setup**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROJ-01 | App ships with 50 seeded fictional projects (mix of films and TV, fake titles, no NZ references or real franchises) | Seed data design section covers file structure, ID scheme, and naming constraints |
| PROJ-02 | Seed data distribution: half pass existing test, half fail; half over $100m QNZPE, all over $20m QNZPE | Distribution strategy section covers scoring verification pattern using existing scoreExisting/scoreProposed |
| PROJ-03 | Seed data follows realism rules (all have A1, none have C3/C10, B1 rare, big budget = low qualifying persons, Section E rare/big budget only, most reach 80% on C2 especially smaller budgets) | Realism rules section maps each rule to ProjectInputs fields |
| PROJ-04 | User can create new projects via input form | Store actions section covers addProject, validation, default values |
| INFRA-01 | App deploys on Netlify as a static site | Netlify deployment section covers netlify.toml, CLI workflow, hash router requirement |
</phase_requirements>

---

## Summary

Phase 2 builds on a complete Phase 1 scoring engine (pure functions, full TypeScript types, Zustand skeleton with persist). The work is primarily: (1) expanding the Zustand store with a `Project` entity and CRUD actions, (2) authoring 50 realistic seed projects as a static JSON array, (3) wiring up hash-based routing so URLs survive Netlify's static file server, and (4) deploying to Netlify via GitHub auto-deploy.

All the hard technical groundwork exists. The store already has `persist` middleware with `version: 1` and a comment marking Phase 2 expansion. The `ProjectInputs` type just needs one new field (`productionType`). The scoring functions `scoreExisting` and `scoreProposed` are importable and usable directly to verify seed data distribution in tests.

The biggest design decisions are: (a) how to identify seed vs user-created projects (an `isSeeded` boolean on the Project entity is simplest and most explicit), (b) which router to install (React Router v6 HashRouter is proven and well-documented; wouter lacks built-in hash support), and (c) the Netlify deploy workflow (netlify.toml + GitHub auto-deploy is minimal and correct for a Vite/static site).

**Primary recommendation:** Expand the store in one plan, write and verify seed data in a second plan, install HashRouter and wire routing scaffolding in a third plan, and deploy to Netlify in a fourth plan. Each plan is independently verifiable.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.11 (installed) | State management + localStorage persistence | Already in use; persist middleware already configured |
| react-router-dom | ^6.x | Hash-based client-side routing | Mature, HashRouter built-in, TypeScript-first, avoids redirect config on Netlify |
| vitest | ^4.1.0 (installed) | Unit tests for store actions + seed data distribution | Already configured with jsdom environment |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| netlify-cli | latest (global install) | Deploy CLI, site init, GitHub linking | Netlify setup plan only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-router-dom HashRouter | wouter | wouter has no built-in HashRouter; requires custom hook — adds complexity with no size benefit for this app |
| react-router-dom HashRouter | TanStack Router | Overkill for a 4-route app; heavier bundle |
| Static JSON seed file | Runtime-generated seeds | Runtime generation makes distribution non-deterministic and harder to review/audit |

**Installation:**
```bash
npm install react-router-dom
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── data/
│   └── seedProjects.ts      # 50 seed projects as typed ProjectWithMeta[]
├── store/
│   └── useAppStore.ts       # Expanded with Project CRUD + resetToDefaults
├── scoring/                  # (Phase 1, unchanged)
│   ├── types.ts              # Add productionType to ProjectInputs here
│   ├── scoreExisting.ts
│   ├── scoreProposed.ts
│   └── index.ts
├── components/
│   └── CreateProjectForm.tsx # Minimal form: name, QNZPE, productionType
├── App.tsx                   # HashRouter, Route scaffolding
└── main.tsx                  # (unchanged)
```

### Pattern 1: Project Entity with isSeeded Flag

**What:** Each stored project carries an `isSeeded: boolean` flag. This allows the UI and store actions to protect seed projects from deletion while permitting editing of all projects.

**When to use:** Whenever you need to distinguish seed vs user-created without changing IDs or separate arrays.

**Example:**
```typescript
// src/store/useAppStore.ts (extended)
import type { ProjectInputs } from '../scoring/types';

export interface Project {
  id: string;           // e.g. 'seed-001' for seeds, crypto.randomUUID() for user-created
  isSeeded: boolean;
  inputs: ProjectInputs; // includes the new productionType field
  createdAt: string;    // ISO timestamp
}

interface AppState {
  schemaVersion: number;
  projects: Project[];
  addProject: (inputs: ProjectInputs) => void;
  updateProject: (id: string, inputs: ProjectInputs) => void;
  deleteProject: (id: string) => void;   // noop if isSeeded
  resetToDefaults: () => void;
}
```

### Pattern 2: Zustand persist migrate() for Schema Version Upgrade

**What:** The store is currently at `version: 1`. Phase 2 changes the stored shape (adds `projects` array). Bump to `version: 2` and add `migrate` to handle users who already have `version: 1` data in localStorage.

**When to use:** Any time the persisted store shape changes.

**Example:**
```typescript
// Source: zustand.docs.pmnd.rs/reference/integrations/persisting-store-data
persist(
  storeCreator,
  {
    name: 'uplift-storage',
    version: 2,
    storage: createJSONStorage(() => localStorage),
    migrate: (persistedState: unknown, version: number) => {
      if (version === 1) {
        // v1 had no projects array — initialise from seed data
        return {
          ...(persistedState as object),
          schemaVersion: 2,
          projects: SEED_PROJECTS,
        };
      }
      return persistedState as AppState;
    },
  }
)
```

**Migrate function signature (HIGH confidence — official docs):**
- `(persistedState: unknown, version: number) => T | Promise<T>`
- `version` is the version stored in localStorage (i.e., the OLD version)
- A migration runs whenever stored version !== config version
- Must return state compatible with the current schema

### Pattern 3: Seed Data as Static Typed Array

**What:** Export seed projects as a `const` array of `Project` objects from `src/data/seedProjects.ts`. TypeScript enforces shape at compile time, no runtime generation.

**When to use:** Any deterministic, reviewable dataset that never changes at runtime.

**Example:**
```typescript
// src/data/seedProjects.ts
import type { Project } from '../store/useAppStore';

export const SEED_PROJECTS: Project[] = [
  {
    id: 'seed-001',
    isSeeded: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    inputs: {
      projectName: 'Iron Meridian',
      productionType: 'film',
      qnzpe: 120_000_000,
      hasSustainabilityPlan: true,
      // ... all other ProjectInputs fields
    },
  },
  // ... 49 more
];
```

### Pattern 4: Hash Router Scaffolding

**What:** Wrap the app in `<HashRouter>` from react-router-dom. Phase 2 only needs enough routes to verify the app loads and data is visible — full routing is Phase 3.

**When to use:** Static hosting without server-side redirect rules.

**Example:**
```typescript
// src/App.tsx — Phase 2 minimal routing shell
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProjectListPage } from './pages/ProjectListPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ProjectListPage />} />
      </Routes>
    </HashRouter>
  );
}
```

### Pattern 5: Store Reset Pattern

**What:** `resetToDefaults()` action clears localStorage by setting `projects` back to `SEED_PROJECTS` and calling Zustand's state setter. The persist middleware writes to localStorage automatically on next render.

**Example:**
```typescript
resetToDefaults: () => set({ projects: SEED_PROJECTS }),
```

Note: This relies on Zustand's persist middleware — when `set` is called, the middleware serialises the new state to localStorage. No manual `localStorage.clear()` needed.

### Anti-Patterns to Avoid

- **Storing computed scores in localStorage:** Raw `ProjectInputs` only — scores are always recomputed from inputs. This is established project convention (STATE.md: "Raw inputs only in storage; scores always recomputed").
- **Separate arrays for seed vs user projects:** A single `projects: Project[]` with `isSeeded` flag is simpler and avoids merge complexity.
- **Using `crypto.randomUUID()` for seed IDs:** Seeds need stable, predictable IDs (e.g. `'seed-001'`) so tests can reference them. Use `crypto.randomUUID()` only for user-created projects.
- **BrowserRouter on Netlify without `_redirects`:** Without a redirect rule or `HashRouter`, refreshing any non-root URL returns 404. Hash routing avoids this entirely.
- **Skipping migrate() on schema bump:** Users with v1 localStorage will get an empty projects array if migrate is absent. Always add migrate when bumping version.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage persistence | Custom serialise/deserialise | Zustand persist middleware (already installed) | Handles version, migration, JSON storage, rehydration |
| Client-side routing | Manual window.location / hash parsing | react-router-dom HashRouter | Handles history, params, nested routes; battle-tested |
| Unique IDs for user projects | Custom UUID generator | `crypto.randomUUID()` (built-in browser API) | Available in all modern browsers, no install needed |
| Seed data distribution verification | Manual tallying | Call `scoreExisting(inputs)` and `scoreProposed(inputs)` in tests | The scoring engine is already correct and tested |

**Key insight:** The infrastructure for persistence, scoring, and testing is already built. This phase is data authoring and wiring, not infrastructure.

---

## Common Pitfalls

### Pitfall 1: Forgetting to Add productionType to ALL ProjectInputs Defaults

**What goes wrong:** The new `productionType: 'film' | 'tv'` field on `ProjectInputs` is non-nullable. Any code creating a ProjectInputs object without it will fail TypeScript compilation.

**Why it happens:** The field is added to the type but not to the minimal create form defaults.

**How to avoid:** When adding the field to `types.ts`, immediately update: (1) seed data objects, (2) the create form's initial state / default values, (3) any test fixtures.

**Warning signs:** TypeScript errors on `ProjectInputs` construction after the type is updated.

### Pitfall 2: Zustand Store Test Isolation — persist.clearStorage()

**What goes wrong:** Tests share localStorage state between test cases because Zustand persist middleware doesn't reset between tests automatically.

**Why it happens:** jsdom localStorage persists across tests in the same test file.

**How to avoid:** Use the existing pattern from `useAppStore.test.ts` — call `useAppStore.persist.clearStorage()` then `useAppStore.persist.rehydrate()` in `beforeEach`.

**Warning signs:** Test order dependency — tests pass individually but fail in sequence.

### Pitfall 3: Seed Data Distribution Miscalculation

**What goes wrong:** Manually estimated scores don't match actual `scoreExisting()` output — the existing test has multiple dependencies (QNZPE band affects D3/D4 thresholds; A1 mandatory fail overrides total score).

**Why it happens:** The scoring rules have non-obvious interactions. A project with 40 points but `hasSustainabilityPlan: false` fails despite meeting the threshold.

**How to avoid:** After authoring seed data, run a verification test that calls `scoreExisting` and `scoreProposed` on every seed project and asserts the distribution constraints. Do NOT rely on manually counted point totals.

**Warning signs:** Seed data "looks right" but verification test reveals 35 passing instead of ~25.

### Pitfall 4: Hash Router vs BrowserRouter Build Output

**What goes wrong:** App works locally with Vite dev server but 404s on Netlify when users navigate to any route other than `/`.

**Why it happens:** BrowserRouter requires the server to serve `index.html` for all paths. Netlify static serves the file tree literally.

**How to avoid:** Use `HashRouter` (decided). All routes will be `/#/...` which Netlify serves correctly from the root `index.html`.

**Warning signs:** Netlify deploy succeeds but navigating to a project URL returns "Page Not Found".

### Pitfall 5: Netlify CLI Requires Authentication Before site:create

**What goes wrong:** `netlify deploy` without prior `netlify login` fails with auth errors.

**Why it happens:** CLI needs a personal access token or OAuth session.

**How to avoid:** Plan must include `netlify login` as the first step before any deploy commands. This opens a browser OAuth flow.

**Warning signs:** `Error: Not logged in. Please log in to continue.`

### Pitfall 6: GitHub + Netlify Auto-Deploy Requires Public Repo or Netlify GitHub App

**What goes wrong:** Netlify cannot access a private GitHub repository without installing the Netlify GitHub App.

**Why it happens:** GitHub's OAuth scopes for Netlify's integration require explicit permission.

**How to avoid:** Plan should include: (1) creating the GitHub repo, (2) installing Netlify GitHub App on the repo, (3) linking via Netlify dashboard or `netlify link`. The simplest path is to use the Netlify web dashboard to link the GitHub repo after the CLI creates the site.

---

## Code Examples

Verified patterns from existing codebase and official sources:

### Store Expansion — addProject action
```typescript
// Pattern used in this codebase: Zustand 5 + persist
addProject: (inputs: ProjectInputs) => set((state) => ({
  projects: [
    ...state.projects,
    {
      id: crypto.randomUUID(),
      isSeeded: false,
      inputs,
      createdAt: new Date().toISOString(),
    },
  ],
})),
```

### Store Expansion — deleteProject (seed-protected)
```typescript
deleteProject: (id: string) => set((state) => ({
  projects: state.projects.filter(
    (p) => p.id !== id || p.isSeeded
  ),
})),
```

### Seed Data Distribution Verification Test
```typescript
// src/data/__tests__/seedProjects.test.ts
import { describe, it, expect } from 'vitest';
import { SEED_PROJECTS } from '../seedProjects';
import { scoreExisting, scoreProposed } from '../../scoring';

describe('seed data distribution', () => {
  it('has exactly 50 projects', () => {
    expect(SEED_PROJECTS).toHaveLength(50);
  });

  it('all projects have QNZPE >= $20m', () => {
    SEED_PROJECTS.forEach((p) => {
      expect(p.inputs.qnzpe).toBeGreaterThanOrEqual(20_000_000);
    });
  });

  it('roughly half have QNZPE >= $100m', () => {
    const bigBudget = SEED_PROJECTS.filter(
      (p) => p.inputs.qnzpe >= 100_000_000
    );
    expect(bigBudget.length).toBeGreaterThanOrEqual(20);
    expect(bigBudget.length).toBeLessThanOrEqual(30);
  });

  it('roughly half pass the existing test', () => {
    const passing = SEED_PROJECTS.filter(
      (p) => scoreExisting(p.inputs).passed
    );
    expect(passing.length).toBeGreaterThanOrEqual(20);
    expect(passing.length).toBeLessThanOrEqual(30);
  });

  it('all have hasSustainabilityPlan = true (realism: A1 mandatory)', () => {
    SEED_PROJECTS.forEach((p) => {
      expect(p.inputs.hasSustainabilityPlan).toBe(true);
    });
  });

  it('none have maoriCrewPercent > 0 (realism: C3 excluded)', () => {
    SEED_PROJECTS.forEach((p) => {
      expect(p.inputs.maoriCrewPercent).toBe(0);
    });
  });

  it('none have hasLeadCastMaori = true (realism: C10 excluded)', () => {
    SEED_PROJECTS.forEach((p) => {
      expect(p.inputs.hasLeadCastMaori).toBe(false);
    });
  });
});
```

### netlify.toml (minimal, hash router — no redirect needed)
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Note: With HashRouter, no `[[redirects]]` rule is needed because all routing is client-side via the URL hash. The file `dist/index.html` is always served for the root path.

### Zustand persist migrate (version 1 → 2)
```typescript
// Source: zustand.docs.pmnd.rs persist docs
migrate: (persistedState: unknown, version: number) => {
  if (version === 1) {
    // v1 had schemaVersion only; v2 adds projects
    return {
      ...(persistedState as { schemaVersion: number }),
      schemaVersion: 2,
      projects: SEED_PROJECTS,
    };
  }
  return persistedState as AppState;
},
```

---

## Seed Data Design Guide

This section guides the planner and implementer on authoring the 50 seed projects.

### Realism Rules Mapped to ProjectInputs Fields

| Realism Rule | Field(s) | Constraint |
|---|---|---|
| All have A1 | `hasSustainabilityPlan` | Always `true` |
| None have C3 | `maoriCrewPercent` | Always `0` |
| None have C10 | `hasLeadCastMaori` | Always `false` |
| B1 rare | `hasStudioLease` | Only 3-5 of 50 |
| Big budget = low qualifying persons | `atlCount`, `btlKeyCount`, `castPercent`, `crewPercent` | Inverse correlation with `qnzpe`; large QNZPE projects score fewer personnel points |
| Section E rare/big budget only | `hasKnowledgeTransfer`, `commercialAgreementPercent`, `infrastructureInvestment` | Only projects with QNZPE >= $100m; max 5-8 of 50 |
| Most reach 80% on C2 (crew) | `crewPercent` | >= 80 for ~40 of 50 projects |

### Budget Distribution
- 25 projects: QNZPE $20m-$99m (small/mid)
- 25 projects: QNZPE $100m-$300m (big budget)

### Scoring Target Distribution for Existing Test
- ~25 failing (< 40pts, OR missing A1 mandatory — but A1 is always true so no mandatory fails)
- ~25 passing (>= 40pts)
- Include 5-8 borderline projects at 38-42pts

### Naming Constraints
- Genre-evocative, not generic (e.g. "Iron Meridian" not "Project 1")
- No NZ place names, no Maori words in titles
- No real franchise names (Marvel, Star Wars, etc.)
- Mix: ~30 films, ~20 TV series (or similar ratio)
- OK to evoke genre (sci-fi, thriller, action, drama, fantasy) without referencing real IP

### Default Values for New User Projects (created via form)

When a user creates a project with only name + QNZPE + productionType, all other fields default to:
- All booleans: `false`
- All numbers: `0`
- `castingLevel`: `'none'`
- `premiereType`: `'none'`

This means new projects score 0 on everything except QNZPE-derived thresholds — they fail both tests. This is intentional: users fill in scoring fields on the project detail screen (Phase 3).

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zustand v4 persist stores initial state at creation | Zustand v5 persist does NOT store at creation — manual state set needed for async storage | v4→v5 (Oct 2024) | This codebase uses synchronous localStorage so not affected; keep using `createJSONStorage(() => localStorage)` |
| wouter considered for hash routing | react-router-dom HashRouter | Research (2026-03-13) | wouter lacks HashRouter; react-router-dom v6 is the correct choice |
| Manual `_redirects` file for Netlify SPAs | HashRouter — no redirect config needed | Architecture decision | Simpler deployment; no server config required |

**Deprecated/outdated:**
- wouter for hash routing: No built-in `HashRouter`. Would require a custom location hook. Not worth the complexity tradeoff.

---

## Open Questions

1. **GitHub repository visibility**
   - What we know: Netlify's GitHub App works with both public and private repos
   - What's unclear: Whether the repo will be public or private — affects Netlify setup steps
   - Recommendation: Plan should include both cases; note that Netlify GitHub App install is required for private repos

2. **Netlify site name**
   - What we know: Claude has discretion on the Netlify site name
   - What's unclear: Whether user has a preferred naming convention
   - Recommendation: Use `uplift-compare` or similar as the Netlify site name; it can be renamed later

3. **Seed data authoring approach**
   - What we know: Static JSON array committed to source; AI-generated is acceptable
   - What's unclear: Whether the implementer will hand-craft all 50 or generate them programmatically then commit the output
   - Recommendation: Generate all 50 in one pass with a script/AI, verify with the distribution test, then commit the static array. Don't commit a generator script — only the output.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 |
| Config file | `vitest.config.ts` (root, `globals: true`, `environment: jsdom`) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROJ-01 | 50 seed projects exist with correct shape | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | Wave 0 |
| PROJ-02 | Distribution: half pass existing, half fail; half >= $100m; all >= $20m | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | Wave 0 |
| PROJ-03 | Realism rules: A1 always true, C3/C10 always false, Section E constrained | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | Wave 0 |
| PROJ-04 | addProject adds project; deleteProject protects seeds; localStorage persists | unit | `npx vitest run src/store/__tests__/useAppStore.test.ts` | Extend existing |
| INFRA-01 | App loads on Netlify with 50 projects | smoke (manual) | Manual: open deployed URL, count projects | N/A (manual) |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/data/__tests__/seedProjects.test.ts` — covers PROJ-01, PROJ-02, PROJ-03
- [ ] `src/data/seedProjects.ts` — the seed data file itself (not a test gap, but a Wave 1 artifact)

---

## Sources

### Primary (HIGH confidence)
- Zustand docs (zustand.docs.pmnd.rs/reference/integrations/persisting-store-data) — persist middleware API, migrate signature, version semantics
- Netlify Vite docs (docs.netlify.com/build/frameworks/framework-setup-guides/vite/) — netlify.toml config, build command, publish dir
- Existing codebase: `src/store/useAppStore.ts`, `src/scoring/types.ts`, `src/store/__tests__/useAppStore.test.ts`, `vitest.config.ts` — verified directly

### Secondary (MEDIUM confidence)
- react-router-dom HashRouter documentation (reactrouter.com/6.30.3/router-components/hash-router) — verified HashRouter exists in v6, no server config required
- WebSearch: wouter lacks HashRouter — confirmed by multiple sources including logrocket blog and wouter GitHub

### Tertiary (LOW confidence)
- Netlify GitHub App integration workflow — described in search results but not verified step-by-step against current Netlify UI

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified against official docs or existing codebase
- Architecture: HIGH — patterns directly derived from existing code patterns and official Zustand/React Router docs
- Seed data design: HIGH — constraints are exactly specified in CONTEXT.md + REQUIREMENTS.md; scoring rules verified in Phase 1
- Pitfalls: HIGH — all pitfalls derived from verified code patterns and known static-hosting behaviours
- Netlify deploy workflow: MEDIUM — steps confirmed in docs but exact CLI interaction sequence is partially manual

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (Netlify/react-router APIs are stable; 30-day window reasonable)
