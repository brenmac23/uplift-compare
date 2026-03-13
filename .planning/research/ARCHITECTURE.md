# Architecture Patterns

**Domain:** Form-heavy scoring/comparison React SPA (no backend)
**Project:** Uplift Compare — NZ Screen Production Rebate points test comparison tool
**Researched:** 2026-03-13

---

## Recommended Architecture

A three-layer SPA with a pure-function scoring engine at the core, Zustand for global state with localStorage persistence, and React Hook Form for local form input handling. The scoring engine is stateless and testable in isolation. UI reads from the store; the store is the single source of truth for all project data.

```
┌─────────────────────────────────────────────────────────────┐
│                          UI Layer                           │
│  SummaryScreen   ProjectDetailScreen   ProjectFormScreen    │
│       │                  │                     │           │
│   ProjectCard        ScorePanel            FormSection     │
│       │                  │                     │           │
│   PassFailBadge      CriterionRow         InputField       │
└──────────────────────────┬──────────────────────────────────┘
                           │ reads / dispatches
┌──────────────────────────▼──────────────────────────────────┐
│                       Store Layer                           │
│             Zustand store + persist middleware              │
│   { projects[], activeProjectId, uiState }                  │
│               │                   │                        │
│          selectors            actions                       │
│   (derived score data)   (CRUD + project switching)        │
└──────────────────────────┬──────────────────────────────────┘
                           │ called with raw input data
┌──────────────────────────▼──────────────────────────────────┐
│                     Engine Layer                            │
│        scoreExisting(inputs) → ExistingResult              │
│        scoreProposed(inputs) → ProposedResult              │
│        (pure functions, no side effects, no React)         │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  Persistence Layer                          │
│     Zustand persist middleware → localStorage               │
│     Seed data loader (runs once on first boot)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `App` / Router | Route switching, layout shell | All screens |
| `SummaryScreen` | Lists all projects with pass/fail status for both tests | Zustand store (reads projects + scores) |
| `ProjectDetailScreen` | Shows one project's full score breakdown side by side | Zustand store (reads active project), `ScorePanel` x2 |
| `ProjectFormScreen` | Input form to create or edit a project | React Hook Form (local), Zustand store (saves on submit) |
| `ScorePanel` | Renders one test's full section/criterion breakdown | Pure props from parent — no store access |
| `CriterionRow` | Single criterion: label, raw input, points awarded, max | Pure props |
| `PassFailBadge` | Visual indicator — pass/green or fail/red | Pure props (score, threshold) |
| `ProjectCard` | Summary row on the summary screen | Pure props (project summary data) |
| `ProjectSelector` | Dropdown to switch active project | Zustand store (reads list, dispatches setActiveProject) |
| `ExportButton` | Triggers xlsx export of current project data | Calls export util, reads from store |

**Boundary rule:** Only screens (route-level components) connect to the Zustand store. Sub-components (`ScorePanel`, `CriterionRow`, `PassFailBadge`) receive everything via props. This keeps them reusable and independently testable.

---

## Data Flow

### Input → Score (the main loop)

```
User types in form field
        │
React Hook Form (local, uncontrolled)
        │  (on submit or on change watch)
        ▼
Raw input object { vfxPercent, qnzpe, castPercent, ... }
        │
        ├──► scoreExisting(inputs)  → { sections[], totalScore, pass: bool }
        └──► scoreProposed(inputs)  → { sections[], totalScore, pass: bool, threshold: 20|30 }
                │
        Zustand store.saveProject(id, inputs, existingResult, proposedResult)
                │
        localStorage (via persist middleware)
                │
        UI re-renders from store
```

### Form Strategy: Controlled vs. Uncontrolled

Use **React Hook Form** for the data-entry form. It keeps inputs uncontrolled (no re-render per keystroke) and validates on submit. For the "live score preview" (updating scores as the user types), use `watch()` from React Hook Form to feed the scoring functions. This avoids 85+ individual useState calls for a form of this complexity.

Do **not** store form field values in Zustand during editing. Only commit to the store on save. Zustand is for persisted project records, not transient form state.

### Scoring as Derived State

Scores are never stored redundantly. The pattern:

```typescript
// In the store or a selector:
const existingScore = useMemo(() => scoreExisting(project.inputs), [project.inputs]);
const proposedScore = useMemo(() => scoreProposed(project.inputs), [project.inputs]);
```

Or recomputed at save time and stored alongside raw inputs for instant retrieval on the summary screen. Store both raw inputs AND computed results — computing all 50 projects on every summary-screen render is wasteful.

**Recommended:** Store `{ inputs, existingResult, proposedResult }` per project. Recompute only when inputs change.

---

## Scoring Engine Design

The engine is the most critical architectural decision. It must be isolated from React to remain independently testable and to make rule changes easy to apply.

```typescript
// src/engine/scoring.ts

export interface ProjectInputs {
  // Shared
  qnzpe: number;          // dollar amount
  productionType: 'film' | 'tv';

  // Existing test inputs
  hasSustainabilityPlan: boolean;
  vfxPercentExisting: number;
  castPercent: number;
  // ... all criteria inputs

  // Proposed test inputs
  vfxPercentProposed: number;
  // ... etc
}

export interface SectionScore {
  sectionId: string;
  label: string;
  pointsAwarded: number;
  maxPoints: number;
  criteria: CriterionScore[];
}

export interface TestResult {
  sections: SectionScore[];
  totalScore: number;
  maxScore: number;
  passMark: number;
  pass: boolean;
}

export function scoreExisting(inputs: ProjectInputs): TestResult { ... }
export function scoreProposed(inputs: ProjectInputs): TestResult { ... }
```

**Key design rules for the engine:**
- Pure functions only — no state, no side effects, no imports from React
- Each criterion is its own small function called by the section scorer
- Thresholds and point values are constants in a separate `src/engine/rules.ts` file — changing a rule means editing one value, not hunting through logic
- The engine is the right place to put the QNZPE-tiered pass mark logic for the proposed test

---

## Data Structures

### Project record (what goes in the store and localStorage)

```typescript
interface Project {
  id: string;                    // uuid
  title: string;                 // fake title
  description: string;
  productionType: 'film' | 'tv';
  isSeeded: boolean;             // true for the 50 seed projects
  inputs: ProjectInputs;         // raw form data
  existingResult: TestResult;    // computed at save time
  proposedResult: TestResult;    // computed at save time
  createdAt: string;             // ISO date string
  updatedAt: string;
}
```

### Store shape (Zustand)

```typescript
interface AppStore {
  projects: Project[];
  activeProjectId: string | null;

  // Actions
  setActiveProject: (id: string) => void;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  seedIfEmpty: () => void;       // called on app boot
}
```

---

## Patterns to Follow

### Pattern 1: Selector-based derived data for summary screen

Compute summary-level data (pass/fail, total score) using selectors that read from stored results — not by re-running the engine on every render.

```typescript
const summaryRows = useAppStore(state =>
  state.projects.map(p => ({
    id: p.id,
    title: p.title,
    existingPass: p.existingResult.pass,
    proposedPass: p.proposedResult.pass,
    existingScore: p.existingResult.totalScore,
    proposedScore: p.proposedResult.totalScore,
  }))
);
```

### Pattern 2: Zustand persist middleware for localStorage

```typescript
const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'uplift-compare-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

This is the cleanest pattern for localStorage in a React SPA — no manual `getItem`/`setItem` calls scattered through components. Confidence: HIGH (official Zustand docs).

### Pattern 3: Seed data loaded once on boot

```typescript
// In App.tsx or main.tsx:
useEffect(() => {
  useAppStore.getState().seedIfEmpty();
}, []);
```

`seedIfEmpty` checks whether the store already has projects before loading seeds — prevents re-seeding on every cold start.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing scores as state separate from inputs

**What it looks like:** `const [existingScore, setExistingScore] = useState(null)` alongside `inputs` state.
**Why bad:** Score and inputs get out of sync when inputs change. Two sources of truth.
**Instead:** Derive scores from inputs via the engine at save time. Store both together in the project record.

### Anti-Pattern 2: Running the engine inside render

**What it looks like:** Calling `scoreExisting(inputs)` directly in component render body on every keystroke.
**Why bad:** With a complex scoring engine and 50 projects, this kills performance.
**Instead:** For live preview — use `watch()` from React Hook Form with `useMemo`. For summary screen — read pre-computed stored results.

### Anti-Pattern 3: Cramming all form fields into one component

**What it looks like:** A 300-line `ProjectForm.tsx` with 40+ input fields.
**Why bad:** Unmaintainable. Impossible to test sections independently.
**Instead:** Decompose into section components (`SectionA`, `SectionB`, etc.) that match the test sections. Each section component owns its fields and is composed into the parent form.

### Anti-Pattern 4: Shared inputs duplicated per test

**What it looks like:** Separate `castPercentExisting` and `castPercentProposed` fields for criteria that share the same underlying data.
**Why bad:** User has to enter the same real-world percentage twice.
**Instead:** Identify which inputs are shared (cast %, crew %, QNZPE, etc.) and store them once. The engine applies different threshold rules to the same input value.

---

## Folder Structure

```
src/
  engine/
    rules.ts          # Point values and thresholds as constants
    scoring.ts        # scoreExisting(), scoreProposed() — pure functions
    scoring.test.ts   # Unit tests for the engine (critical)

  store/
    useAppStore.ts    # Zustand store with persist middleware
    seedData.ts       # 50 fictional projects as static data

  features/
    summary/
      SummaryScreen.tsx
      ProjectCard.tsx
    project-detail/
      ProjectDetailScreen.tsx
      ScorePanel.tsx
      CriterionRow.tsx
      PassFailBadge.tsx
    project-form/
      ProjectFormScreen.tsx
      sections/
        SectionA.tsx
        SectionB.tsx
        # ... one per test section

  utils/
    export.ts         # Excel export via SheetJS/xlsx

  App.tsx
  main.tsx
```

---

## Build Order (Phase Dependencies)

This order respects hard dependencies — later phases cannot start without the previous layer being stable.

| Order | Component / Layer | Why This Position |
|-------|-------------------|-------------------|
| 1 | Engine layer (`rules.ts`, `scoring.ts`) | Everything else depends on correct scoring logic. Build and test in isolation before touching UI. |
| 2 | TypeScript types / interfaces | `ProjectInputs`, `TestResult`, `Project` — shared contracts. Define once, used everywhere. |
| 3 | Store layer (`useAppStore.ts`) + seed data | UI needs somewhere to read from. Seed data gives you realistic test subjects immediately. |
| 4 | Project form (input collection) | Can't test scoring UI without a way to get inputs into the system. |
| 5 | Project detail / score display | Now you have inputs in the store and scoring works — render the comparison. |
| 6 | Summary screen | Reads pre-computed stored results — trivial once the store and engine are working. |
| 7 | Export feature | Reads from store, no dependencies on form or display logic. Easy to add last. |

**Critical path:** Engine → Types → Store → Form → Detail → Summary → Export

The engine being first is non-negotiable. Discovering a rules misunderstanding at phase 4 means rewriting output components. Discovering it at phase 1 costs nothing.

---

## Scalability Considerations

This is a single-browser, no-backend app. Scalability concerns are practical rather than load-based.

| Concern | Approach |
|---------|----------|
| localStorage size limit (~5MB) | 50 projects with full result data is well under 1MB. Not a concern. |
| Re-rendering on store updates | Zustand's selector pattern prevents unnecessary re-renders. Components subscribe to only their slice. |
| Engine performance | With 50 projects, even an unoptimised engine runs in <1ms total. `useMemo` is sufficient; no worker threads needed. |
| Adding new scoring criteria | Rules as constants + engine as pure functions = add a constant, add a function, done. No UI changes needed for new criteria. |
| Seed data maintenance | Seed data is static TypeScript — no migration concern. Changes are a file edit + redeployment. |

---

## Sources

- [React Hook Form + Zustand pattern — Medium](https://medium.com/@rahulshukla_9187/dynamic-forms-in-react-with-zustand-react-hook-form-zod-c866cb4f7a69)
- [Zustand persist middleware — official discussion](https://github.com/pmndrs/zustand/discussions/1922)
- [Derived state best practice — Kent C. Dodds](https://kentcdodds.com/blog/dont-sync-state-derive-it)
- [Computed properties in React — Robin Wieruch](https://www.robinwieruch.de/react-computed-properties/)
- [React folder structure 2025 — Robin Wieruch](https://www.robinwieruch.de/react-folder-structure/)
- [React architecture patterns 2026 — Bacancy Technology](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices)
- [Feature-based folder structure with Vite — Medium](https://medium.com/@prajwalabraham.21/react-folder-structure-with-vite-typescript-beginner-to-advanced-9cd12d1d18a6)
- [CRUD with localStorage clean pattern — Medium](https://medium.com/@naimishdhorajiya2001/crud-with-local-storage-in-react-the-clean-way-c2b8eb7d04bb)
