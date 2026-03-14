# Phase 3: Core UI - Research

**Researched:** 2026-03-13
**Domain:** React UI — Tailwind CSS v4, shadcn/ui, React Router v7, live scoring display
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Side-by-side scoring layout**
- Two columns side by side on the detail screen — existing test on left, proposed on right
- All criteria expanded by default (no collapsed sections on initial load, though sections are collapsible per DISP-05)
- Sticky header at top of each column showing score total and pass/fail verdict — stays visible while scrolling through criteria
- Sections aligned horizontally by equivalent sections (existing B aligns with proposed A for NZ Production Activity, etc.). Gaps shown where one system has sections the other doesn't (e.g. existing A: Sustainability has no proposed equivalent)

**Scoring input editing**
- Inputs grouped by scoring section (matching the scoring spec section structure)
- Three-column layout on detail screen: inputs on left, existing scores in middle, proposed scores on right
- Live scoring — scores recompute instantly as user changes any input, no Calculate button
- System-specific inputs (e.g. Sustainability for existing only) shown together with all other inputs, labelled "(Existing only)" or "(Proposed only)" — no hiding or separate grouping

**Summary table and filtering**
- Detailed columns: project name, production type, QNZPE, existing score + verdict, proposed score + verdict
- Clicking a project row navigates to the detail screen for that project
- Aggregate statistics displayed as summary cards above the table: pass count per test, "both pass" count
- Filter bar with dropdowns above the table: pass/fail status (per test), production type (film/TV), budget tier (<$100m / >=$100m)
- Clickable stats cards also act as quick filters (e.g. click "32/50 pass existing" to filter to those 32)
- Stats update to reflect the currently filtered view

**Navigation and actions**
- Simple top nav bar across all screens: app name "Uplift Compare" on left, "Summary" and "Detail" links on right
- "New Project" and "Import" buttons in the nav bar, accessible from any screen
- Create form opens as a modal dialog (name, QNZPE, production type fields). After creation, navigates to the new project's detail screen
- Project detail screen has a dropdown to switch between projects without going back to summary

**Project import**
- File upload only (JSON file) — an "Import" button opens a file picker, user selects a .json file, parsed and validated against ProjectInputs shape

**Visual design**
- Tailwind CSS + shadcn/ui for styling and accessible components (tables, dropdowns, tooltips, collapsible sections, modals)
- Modern and polished light theme: slightly warmer whites, rounded cards with shadows, distinct brand accent colour
- Pass/fail colours: blue for pass, orange for fail — avoids red/green colourblindness. Plus text labels "PASS"/"FAIL" per DISP-03
- Tooltips on each criterion explaining the rule in plain English (DISP-04)
- Score sections are collapsible/expandable (DISP-05) — expanded by default

### Claude's Discretion
- Exact Tailwind theme configuration and brand accent colour
- shadcn/ui component selection and customisation
- Tooltip content wording for each criterion
- Responsive breakpoint handling (three-column layout on wide, stacked on narrow)
- Loading states and error handling
- Exact spacing, typography, and card shadow values
- How the section alignment mapping is implemented internally

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROJ-05 | Project detail screen shows side-by-side comparison with dropdown to switch between projects | React Router v7 `useParams`/`useNavigate`, shadcn `Select` for project switcher, three-column layout pattern |
| PROJ-06 | Summary screen shows all projects with descriptions and pass/fail status for each test | shadcn `Table` component, `Badge` for pass/fail, `scoreExisting`/`scoreProposed` called per row |
| PROJ-07 | User can filter and sort the project list (by pass/fail, type, budget) | shadcn `Select` for filter dropdowns, `useMemo` for derived filtered list in Zustand selector |
| PROJ-08 | Summary screen shows aggregate statistics (pass rates per test) | Computed from filtered project list, shadcn `Card` components as clickable stat cards |
| PROJ-09 | User can import project data from JSON/clipboard | HTML `<input type="file" accept=".json">`, `FileReader` API, runtime validation against `ProjectInputs` shape |
| DISP-02 | App uses light theme with aesthetic, tidy design | Tailwind v4 CSS variables theme, shadcn/ui component library |
| DISP-03 | Visual pass/fail indicators (colour + text, not colour alone) | shadcn `Badge` with blue/orange Tailwind classes + "PASS"/"FAIL" text labels |
| DISP-04 | Each criterion has tooltip/help text explaining the rule in plain English | shadcn `Tooltip`/`TooltipProvider`/`TooltipTrigger`/`TooltipContent` |
| DISP-05 | Score sections are collapsible/expandable | shadcn `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent`, expanded by default via `defaultOpen` |
</phase_requirements>

---

## Summary

This phase transforms the minimal placeholder UI into the fully functional application. The core technical work is threefold: (1) install and configure Tailwind CSS v4 + shadcn/ui from scratch on an existing Vite + React + TypeScript project, (2) build the three-column detail screen that drives live scoring via `scoreExisting()` and `scoreProposed()` as inputs change, and (3) build the summary screen with filtering, aggregate stats, and clickable stat-card filters.

The project already has all scoring logic and data in place (Phases 1–2 complete). `ScoringResult`, `SectionResult`, and `CriterionResult` types are ready for rendering. `useAppStore` exposes `projects` with full `ProjectInputs`. React Router v7 is installed (HashRouter, single route). The existing `CreateProjectForm` and `ProjectListPage` components are minimal stubs that will be completely replaced.

The most complex single task is the detail screen's section alignment: existing and proposed sections must be visually aligned row-by-row even where one system has no equivalent section (e.g. existing A: Sustainability has no proposed equivalent — a blank placeholder must appear opposite it). This requires a pre-defined alignment map (an ordered list of row slots, each slot having an optional existing section ID and optional proposed section ID), not a runtime comparison.

**Primary recommendation:** Install Tailwind CSS v4 + shadcn/ui via the CLI init command first (it handles all config wiring), then build screens bottom-up: shared components first (NavBar, PassFailBadge, CriterionRow), then the detail screen, then the summary screen.

---

## Standard Stack

### Core — Already Installed

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react | ^19.2.4 | UI framework | Installed |
| react-dom | ^19.2.4 | DOM rendering | Installed |
| react-router-dom | ^7.13.1 | Routing (HashRouter) | Installed |
| zustand | ^5.0.11 | State management | Installed |
| vitest | ^4.1.0 | Test runner | Installed |

### To Install This Phase

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | latest v4.x | Utility-first CSS | Locked decision; v4 uses Vite plugin, no config file needed |
| @tailwindcss/vite | latest | Tailwind v4 Vite plugin | Required for v4 Vite integration (replaces PostCSS approach) |
| shadcn/ui (CLI) | latest | Accessible component library | Locked decision; source-copy model, full ownership |
| @types/node | ^24.x | Node types for `path.resolve` in vite config | Needed for path alias — already in devDependencies |

**shadcn components to add (via CLI):**

| Component | shadcn add command | Used For |
|-----------|-------------------|----------|
| button | `npx shadcn@latest add button` | Nav buttons, form submit |
| dialog | `npx shadcn@latest add dialog` | "New Project" modal |
| select | `npx shadcn@latest add select` | Project switcher dropdown, filter dropdowns |
| tooltip | `npx shadcn@latest add tooltip` | Criterion help text (DISP-04) |
| collapsible | `npx shadcn@latest add collapsible` | Collapsible score sections (DISP-05) |
| badge | `npx shadcn@latest add badge` | PASS/FAIL indicators (DISP-03) |
| card | `npx shadcn@latest add card` | Aggregate stat cards |
| table | `npx shadcn@latest add table` | Summary project table |

Note: shadcn/ui is not a npm dependency — components are copied into `src/components/ui/` as local source files. The CLI adds them one at a time.

### Installation Sequence

```bash
# 1. Install Tailwind v4 packages
npm install tailwindcss @tailwindcss/vite

# 2. Init shadcn (handles tsconfig paths, vite alias, components.json)
npx shadcn@latest init -t vite

# 3. Add required shadcn components
npx shadcn@latest add button dialog select tooltip collapsible badge card table
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn-generated (do not hand-edit)
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── collapsible.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── tooltip.tsx
│   ├── NavBar.tsx       # Top nav: title + Summary/Detail links + New/Import buttons
│   ├── PassFailBadge.tsx # Reusable badge: blue=PASS, orange=FAIL + text
│   ├── CriterionRow.tsx  # Single criterion: label + tooltip + existing score + proposed score
│   ├── SectionBlock.tsx  # Collapsible section wrapper with header
│   ├── CreateProjectModal.tsx  # Dialog wrapping existing form logic
│   └── ImportButton.tsx  # File input trigger + parse/validate logic
├── pages/
│   ├── SummaryPage.tsx   # Replaces ProjectListPage
│   └── DetailPage.tsx    # New: three-column scoring detail
├── hooks/
│   └── useFilteredProjects.ts  # Filter + aggregate stats derived from store
├── lib/
│   ├── utils.ts          # shadcn-generated cn() helper
│   ├── sectionAlignment.ts  # The ordered alignment map for detail screen
│   └── criterionTooltips.ts # Tooltip text strings per criterion ID
├── data/
│   └── seedProjects.ts   # Already exists
├── store/
│   └── useAppStore.ts    # Already exists
└── scoring/
    └── ...               # Already exists (all complete)
```

### Pattern 1: Live Scoring in the Detail Screen

The detail screen recomputes scores on every input change using `useMemo`. The `ProjectInputs` object is held in local component state (copied from the store on mount). Changes write back to the store via `updateProject`.

```typescript
// src/pages/DetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { scoreExisting, scoreProposed } from '@/scoring';
import { useMemo, useState } from 'react';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const projects = useAppStore(s => s.projects);
  const updateProject = useAppStore(s => s.updateProject);
  const navigate = useNavigate();

  const project = projects.find(p => p.id === id);

  // Local inputs state drives live scoring
  const [inputs, setInputs] = useState(project?.inputs ?? null);

  // Recompute both scores whenever inputs change — pure functions, fast
  const existingResult = useMemo(
    () => inputs ? scoreExisting(inputs) : null,
    [inputs]
  );
  const proposedResult = useMemo(
    () => inputs ? scoreProposed(inputs) : null,
    [inputs]
  );

  function handleInputChange(field: keyof ProjectInputs, value: unknown) {
    if (!inputs) return;
    const updated = { ...inputs, [field]: value };
    setInputs(updated);
    updateProject(id!, updated);  // persist immediately
  }

  // ... render three-column layout
}
```

**Why local state + useMemo:** Scoring functions are pure and fast (no async). Local state avoids re-renders of the full app on every keystroke. `updateProject` persists to localStorage via Zustand's persist middleware — no debounce needed since Zustand batches writes.

### Pattern 2: Section Alignment Map

The detail screen must align existing and proposed sections horizontally even where no counterpart exists. Define this as a static ordered array of "row slots":

```typescript
// src/lib/sectionAlignment.ts
export interface SectionSlot {
  label: string;              // Display label for this row group
  existingSectionId: string | null;   // e.g. 'A', 'B', null if no equivalent
  proposedSectionId: string | null;   // e.g. 'A', 'B', null if no equivalent
}

export const SECTION_ALIGNMENT: SectionSlot[] = [
  { label: 'Sustainability',          existingSectionId: 'A', proposedSectionId: null },
  { label: 'NZ Production Activity',  existingSectionId: 'B', proposedSectionId: 'A' },
  { label: 'NZ Personnel',            existingSectionId: 'C', proposedSectionId: 'B' },
  { label: 'Skills & Talent Dev.',    existingSectionId: 'D', proposedSectionId: 'C' },
  { label: 'Innovation & Infra.',     existingSectionId: 'E', proposedSectionId: null },
  { label: 'Marketing & Showcasing',  existingSectionId: 'F', proposedSectionId: 'D' },
];
```

Render: for each slot, render a two-column row. If `existingSectionId` is null, render a placeholder (greyed card saying "No equivalent"). If `proposedSectionId` is null, render a placeholder on the right.

### Pattern 3: Pass/Fail Badge

```typescript
// src/components/PassFailBadge.tsx
// Source: shadcn/ui Badge component, custom Tailwind classes
import { Badge } from '@/components/ui/badge';

interface PassFailBadgeProps {
  passed: boolean;
}

export function PassFailBadge({ passed }: PassFailBadgeProps) {
  return (
    <Badge
      className={passed
        ? 'bg-blue-100 text-blue-800 border-blue-300'
        : 'bg-orange-100 text-orange-800 border-orange-300'
      }
    >
      {passed ? 'PASS' : 'FAIL'}
    </Badge>
  );
}
```

Blue/orange avoids red/green colour blindness (deuteranopia/protanopia safe). Text label "PASS"/"FAIL" satisfies DISP-03 without relying on colour alone.

### Pattern 4: Criterion Tooltip

```typescript
// Source: shadcn/ui Tooltip docs
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// TooltipProvider must wrap the app (add to App.tsx, inside HashRouter)
<Tooltip>
  <TooltipTrigger asChild>
    <button aria-label={`Help for ${criterion.label}`}>?</button>
  </TooltipTrigger>
  <TooltipContent>
    <p>{CRITERION_TOOLTIPS[criterion.id]}</p>
  </TooltipContent>
</Tooltip>
```

**Key:** `TooltipProvider` must be placed high in the tree (wrapping `<Routes>` in `App.tsx`). Without it, tooltips will throw a React context error at runtime.

### Pattern 5: Collapsible Section

```typescript
// Source: shadcn/ui Collapsible docs
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

// defaultOpen = true satisfies "expanded by default" requirement
export function SectionBlock({ title, children }: { title: string, children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold py-2">
        <span>{open ? '▾' : '▸'}</span>
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
```

### Pattern 6: New Project Modal

```typescript
// Source: shadcn/ui Dialog docs
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

// The existing CreateProjectForm logic moves inside here
// After addProject(), close dialog and navigate to new project
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>New Project</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>New Project</DialogTitle>
    </DialogHeader>
    <CreateProjectForm onSuccess={(id) => { setOpen(false); navigate(`/project/${id}`); }} />
  </DialogContent>
</Dialog>
```

The `addProject` action needs to return the new project's ID for navigation. Currently it doesn't — this must be changed in the store or handled by reading `projects` after the add.

### Pattern 7: JSON File Import

```typescript
// src/components/ImportButton.tsx
// No external library needed — uses browser FileReader API
function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target?.result as string);
      // Runtime validate against ProjectInputs shape
      if (!isValidProjectInputs(parsed)) {
        setError('Invalid project file format');
        return;
      }
      addProject(parsed);
    } catch {
      setError('Could not parse JSON file');
    }
  };
  reader.readAsText(file);
}

// Validation: check required keys exist with correct types
function isValidProjectInputs(obj: unknown): obj is ProjectInputs {
  if (typeof obj !== 'object' || obj === null) return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.projectName === 'string' &&
    typeof p.qnzpe === 'number' &&
    (p.productionType === 'film' || p.productionType === 'tv')
    // ... spot-check a few more critical fields
  );
}
```

No external validation library (e.g. Zod) is needed for a single-type import. Spot-checking the critical shape fields is sufficient for this use case.

### Pattern 8: Filter Logic with useMemo

```typescript
// src/hooks/useFilteredProjects.ts
import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { scoreExisting, scoreProposed } from '@/scoring';

export type PassFailFilter = 'all' | 'existing-pass' | 'existing-fail' | 'proposed-pass' | 'proposed-fail' | 'both-pass';
export type TypeFilter = 'all' | 'film' | 'tv';
export type BudgetFilter = 'all' | 'under-100m' | 'over-100m';

export function useFilteredProjects(
  passFilter: PassFailFilter,
  typeFilter: TypeFilter,
  budgetFilter: BudgetFilter
) {
  const projects = useAppStore(s => s.projects);

  return useMemo(() => {
    const scored = projects.map(p => ({
      project: p,
      existing: scoreExisting(p.inputs),
      proposed: scoreProposed(p.inputs),
    }));

    return scored.filter(({ project, existing, proposed }) => {
      if (typeFilter !== 'all' && project.inputs.productionType !== typeFilter) return false;
      if (budgetFilter === 'under-100m' && project.inputs.qnzpe >= 100_000_000) return false;
      if (budgetFilter === 'over-100m' && project.inputs.qnzpe < 100_000_000) return false;
      if (passFilter === 'existing-pass' && !existing.passed) return false;
      if (passFilter === 'existing-fail' && existing.passed) return false;
      if (passFilter === 'proposed-pass' && !proposed.passed) return false;
      if (passFilter === 'proposed-fail' && proposed.passed) return false;
      if (passFilter === 'both-pass' && (!existing.passed || !proposed.passed)) return false;
      return true;
    });
  }, [projects, passFilter, typeFilter, budgetFilter]);
}
```

**Performance note:** With 50 seed projects, scoring all of them on every filter change is fast (pure functions, < 1ms total). No performance concern at this scale. `useMemo` prevents redundant re-scoring during unrelated renders.

### Pattern 9: Sticky Score Header (CSS)

```tsx
// Sticky header that stays visible while scrolling criteria
<div className="sticky top-0 z-10 bg-white border-b p-4 shadow-sm">
  <div className="text-2xl font-bold">{result.totalPoints} / {result.maxPoints}</div>
  <PassFailBadge passed={result.passed} />
  {!result.mandatoryMet && (
    <span className="text-orange-700 text-sm">Mandatory criterion not met</span>
  )}
</div>
```

Tailwind `sticky top-0 z-10` works on column headers inside a scrollable container. The parent container must NOT have `overflow: hidden` — use `overflow-y-auto` with a `max-h-*` or `h-screen` constraint.

### Pattern 10: Routing Setup (App.tsx)

```tsx
// src/App.tsx — updated for Phase 3
import { HashRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NavBar } from '@/components/NavBar';
import { SummaryPage } from '@/pages/SummaryPage';
import { DetailPage } from '@/pages/DetailPage';

function App() {
  return (
    <HashRouter>
      <TooltipProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<SummaryPage />} />
          <Route path="/project/:id" element={<DetailPage />} />
        </Routes>
      </TooltipProvider>
    </HashRouter>
  );
}
```

### Anti-Patterns to Avoid

- **Computing scores in render without useMemo:** Will recompute on every parent re-render. Always memoize `scoreExisting(inputs)` and `scoreProposed(inputs)`.
- **Storing computed scores in Zustand:** Violates the established project pattern (STATE.md: "raw inputs only in localStorage; scores always recomputed from inputs").
- **Editing shadcn/ui components in `src/components/ui/`:** These are owned source files but treat them as stable — put customization in wrapper components.
- **Forgetting TooltipProvider:** Causes runtime context error. Must be above any `<Tooltip>` usage in the tree.
- **Using BrowserRouter instead of HashRouter:** Established project decision (HashRouter works on Netlify without redirect config). Do not change.
- **Hiding system-specific inputs:** Locked decision says show all inputs with "(Existing only)"/"(Proposed only)" labels — do not hide or group separately.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible dropdown/select | Custom `<select>` with styling | shadcn `Select` | Keyboard nav, ARIA, portal rendering |
| Modal dialog | Custom div with position:fixed | shadcn `Dialog` | Focus trap, escape key, aria-modal, scroll lock |
| Tooltips | `title` attribute or CSS `:hover` div | shadcn `Tooltip` | Keyboard accessible, touch-friendly, correct ARIA |
| Collapsible panels | Custom `display:none` toggle | shadcn `Collapsible` | Animation, ARIA expanded state, keyboard nav |
| Pass/fail badge | Coloured `<span>` | shadcn `Badge` + Tailwind classes | Consistent sizing, theming, accessible contrast |
| Utility CSS | Inline styles | Tailwind utility classes | Consistency, design system, no specificity battles |

**Key insight:** shadcn/ui components are already written against Radix UI primitives — they handle all ARIA roles, keyboard interactions, and focus management correctly. The detail screen has 40+ input fields and dozens of tooltip triggers; hand-rolling accessibility for each would be a significant risk.

---

## Common Pitfalls

### Pitfall 1: Tailwind v4 — wrong import syntax
**What goes wrong:** Importing Tailwind with v3 directives (`@tailwind base; @tailwind components; @tailwind utilities;`) in `index.css` — these are silently ignored in v4 and no styles are generated.
**Why it happens:** v3 guides are widespread; v4 changed to `@import "tailwindcss";`.
**How to avoid:** Replace the entire contents of `src/index.css` with `@import "tailwindcss";` as first step. The existing CSS variables/custom properties can be added below it.
**Warning signs:** Tailwind classes have no effect; no error thrown.

### Pitfall 2: shadcn init requires path aliases configured first
**What goes wrong:** Running `npx shadcn@latest init` before configuring `@/` path alias causes the CLI to warn "No import alias found in your tsconfig.json file" and may write broken `components.json`.
**Why it happens:** shadcn init reads tsconfig to detect the `@/` alias.
**How to avoid:** Configure path aliases in both `tsconfig.app.json` AND `vite.config.ts` BEFORE running `shadcn init`.
**Path alias config needed in tsconfig.app.json:**
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```
**Path alias config needed in vite.config.ts:**
```typescript
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
```

### Pitfall 3: TooltipProvider missing from tree
**What goes wrong:** Rendering a `<Tooltip>` without a `<TooltipProvider>` ancestor throws a React context error at runtime: "Cannot read properties of null (reading 'viewport')".
**Why it happens:** shadcn Tooltip uses Radix's context internally.
**How to avoid:** Add `<TooltipProvider>` once at the top level in `App.tsx`, wrapping `<Routes>`.

### Pitfall 4: addProject doesn't return the new project ID
**What goes wrong:** After creating a project via the modal, the app needs to navigate to `/project/:id` for the new project, but `addProject` in the current store has no return value.
**Why it happens:** Zustand `set` callbacks don't return values from the action.
**How to avoid:** Two options — (a) generate the UUID before calling `addProject` and pass it in, then navigate to that ID; or (b) read the last project from the store after calling `addProject`. Option (a) is cleaner.

### Pitfall 5: Sticky header fails when parent has overflow:hidden
**What goes wrong:** `sticky top-0` has no effect — the sticky element scrolls away with content.
**Why it happens:** CSS `position: sticky` requires no ancestor with `overflow: hidden/auto/scroll` between the sticky element and its scroll container.
**How to avoid:** The scrollable column on the detail screen must use `overflow-y-auto` with `h-screen` or `max-h-*`, not wrapped by any `overflow: hidden` parent. Keep the sticky header as a direct child of the scrollable container.

### Pitfall 6: N/A criterion scores in aggregate totals
**What goes wrong:** Treating `CriterionResult.score` as always a number causes TypeScript errors or incorrect totals if `'N/A'` is added to a running sum.
**Why it happens:** The type is `number | 'N/A'` — `'N/A'` values should be excluded from any display computation.
**How to avoid:** When displaying per-criterion scores, check `typeof score === 'number'` before rendering. The `ScoringResult.totalPoints` already excludes N/A — use that for section/total display, not re-summing criteria.

### Pitfall 7: Filter state causing stats card to show stale data
**What goes wrong:** Aggregate stats (e.g. "32/50 pass existing") don't update when filters are applied.
**Why it happens:** Stats are computed from the unfiltered project list.
**How to avoid:** Stats must be derived from the SAME filtered list used for the table. Compute stats inside `useFilteredProjects` or pass the filtered result to a stats computation function.

---

## Code Examples

### Tailwind v4 + Vite config

```typescript
// vite.config.ts — after Phase 3 setup
// Source: tailwindcss.com/docs (official), verified 2026-03-13
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### Tailwind v4 CSS import

```css
/* src/index.css — replaces v3 directives */
/* Source: tailwindcss.com/docs official installation guide */
@import "tailwindcss";

/* Project theme extensions below */
@theme {
  --color-pass: oklch(0.6 0.15 240);    /* blue — PASS indicator */
  --color-fail: oklch(0.65 0.18 55);    /* orange — FAIL indicator */
}
```

### tsconfig.app.json path aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    ...existing options...
  }
}
```

### React Router v7 — useParams and useNavigate

```typescript
// Source: reactrouter.com/api/hooks/useNavigate (official docs)
import { useParams, useNavigate } from 'react-router-dom';

const { id } = useParams<{ id: string }>();
const navigate = useNavigate();

// Navigate to a project detail page
navigate(`/project/${projectId}`);

// Navigate to summary
navigate('/');
```

### Summary table row with computed scores

```typescript
// Scores computed at render time — not stored
// Source: project pattern established in STATE.md
import { scoreExisting, scoreProposed } from '@/scoring';

// Inside filtered map:
const existing = scoreExisting(project.inputs);
const proposed = scoreProposed(project.inputs);
// existing.passed, existing.totalPoints, proposed.passed, proposed.totalPoints
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 PostCSS + tailwind.config.js + three `@tailwind` directives | Tailwind v4 Vite plugin + single `@import "tailwindcss"` | January 2025 | Simpler setup; CSS-first config via `@theme {}` |
| `npx shadcn-ui@latest init` | `npx shadcn@latest init` (shorter package name) | ~2024 | The old `shadcn-ui` package name still redirects but new name is `shadcn` |
| shadcn add components one by one interactively | `npx shadcn@latest add button dialog select ...` (multiple in one command) | ~2024 | Can batch-add multiple components |

**Deprecated/outdated:**
- `@tailwind base; @tailwind components; @tailwind utilities;` directives: v3 only, do not use in v4
- `tailwind.config.js` content array: not required in v4 (auto-detection)
- PostCSS plugin approach for Tailwind + Vite: replaced by `@tailwindcss/vite` plugin in v4

---

## Open Questions

1. **`addProject` return value for navigation**
   - What we know: Current store action has `void` return type; the modal needs the new project's ID
   - What's unclear: Whether to refactor the store action or generate UUID pre-call
   - Recommendation: Generate UUID before calling `addProject` — pass it as part of the inputs shape or as a separate parameter. Avoids reading store state immediately after set (race condition risk with persist middleware).

2. **Criterion tooltip text for all 40+ criteria**
   - What we know: `ProjectInputs` has detailed JSDoc comments for every field — these are the source of truth for tooltip wording
   - What's unclear: Final phrasing for plain-English user-facing text
   - Recommendation: Derive tooltip text from the existing JSDoc comments in `types.ts`. Claude's discretion per CONTEXT.md.

3. **Responsive layout breakpoints for three-column detail screen**
   - What we know: Three columns needed on wide screens; stacking needed on narrow
   - What's unclear: Exact breakpoints — left as Claude's discretion
   - Recommendation: Use Tailwind `md:grid-cols-3` (768px threshold) — stack to single column below. The inputs column alone is functional on mobile.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 |
| Config file | `vitest.config.ts` (exists, `environment: 'jsdom'`, `globals: true`) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

No React Testing Library is currently installed. The existing tests are pure unit tests of scoring functions and the Zustand store — no DOM rendering tests exist yet.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROJ-05 | Project detail screen renders with side-by-side scoring | smoke (render test) | `npm test -- src/pages/__tests__/DetailPage.test.tsx` | ❌ Wave 0 |
| PROJ-06 | Summary screen renders project rows with pass/fail status | smoke (render test) | `npm test -- src/pages/__tests__/SummaryPage.test.tsx` | ❌ Wave 0 |
| PROJ-07 | Filter dropdowns correctly filter the project list | unit (hook) | `npm test -- src/hooks/__tests__/useFilteredProjects.test.ts` | ❌ Wave 0 |
| PROJ-08 | Aggregate stats reflect filtered view correctly | unit (hook) | `npm test -- src/hooks/__tests__/useFilteredProjects.test.ts` | ❌ Wave 0 |
| PROJ-09 | JSON import validates ProjectInputs shape correctly | unit | `npm test -- src/components/__tests__/ImportButton.test.ts` | ❌ Wave 0 |
| DISP-02 | Light theme applied — verified by human review | manual-only | N/A — visual inspection | N/A |
| DISP-03 | Pass badge shows "PASS" text, fail badge shows "FAIL" text | unit | `npm test -- src/components/__tests__/PassFailBadge.test.tsx` | ❌ Wave 0 |
| DISP-04 | Tooltip renders criterion help text | smoke (render) | included in DetailPage test | ❌ Wave 0 |
| DISP-05 | Score sections can expand/collapse, expanded by default | smoke (render) | included in DetailPage test | ❌ Wave 0 |

**Note:** Component render tests require React Testing Library + `@testing-library/react`. This is not currently installed.

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/pages/__tests__/DetailPage.test.tsx` — covers PROJ-05, DISP-04, DISP-05
- [ ] `src/pages/__tests__/SummaryPage.test.tsx` — covers PROJ-06
- [ ] `src/hooks/__tests__/useFilteredProjects.test.ts` — covers PROJ-07, PROJ-08
- [ ] `src/components/__tests__/PassFailBadge.test.tsx` — covers DISP-03
- [ ] `src/components/__tests__/ImportButton.test.ts` — covers PROJ-09
- [ ] Install React Testing Library: `npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom`
- [ ] Add setup file: `src/setupTests.ts` with jest-dom imports
- [ ] Update `vitest.config.ts` to include `setupFiles: ['./src/setupTests.ts']`

---

## Sources

### Primary (HIGH confidence)
- [tailwindcss.com/docs](https://tailwindcss.com/docs) — Tailwind v4 Vite installation, `@import "tailwindcss"`, `@tailwindcss/vite` plugin
- [ui.shadcn.com/docs/installation/vite](https://ui.shadcn.com/docs/installation/vite) — shadcn init command for Vite, component add commands
- [ui.shadcn.com/docs/components/radix/tooltip](https://ui.shadcn.com/docs/components/radix/tooltip) — TooltipProvider, TooltipTrigger, TooltipContent API
- [ui.shadcn.com/docs/components/radix/collapsible](https://ui.shadcn.com/docs/components/radix/collapsible) — Collapsible, CollapsibleTrigger, CollapsibleContent API
- [ui.shadcn.com/docs/components/radix/dialog](https://ui.shadcn.com/docs/components/radix/dialog) — Dialog, DialogContent, DialogTrigger modal pattern
- [ui.shadcn.com/docs/components/radix/select](https://ui.shadcn.com/docs/components/radix/select) — Select, SelectContent, SelectItem API
- Project source code — existing types.ts, useAppStore.ts, scoring functions, App.tsx (read directly)
- STATE.md — established project decisions (HashRouter, raw inputs in storage, scoring recomputed)

### Secondary (MEDIUM confidence)
- [reactrouter.com/api/hooks/useNavigate](https://reactrouter.com/api/hooks/useNavigate) — useNavigate and useParams v7 API
- WebSearch results for Tailwind v4 path alias configuration (verified against official docs)
- WebSearch results for shadcn/ui badge custom colour variants (consistent with official shadcn Badge docs)

### Tertiary (LOW confidence)
- Community guides on sticky header implementation (verified against Tailwind CSS position docs)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — locked decisions confirmed, official docs consulted for all library APIs
- Architecture patterns: HIGH — derived directly from existing project types and established patterns; shadcn APIs verified from official docs
- Pitfalls: HIGH for Tailwind v4 syntax and TooltipProvider (common and well-documented); MEDIUM for sticky header CSS (community-verified)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (shadcn/ui moves fast; re-verify install commands if > 30 days)
