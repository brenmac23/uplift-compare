# Phase 4: Export and Polish - Research

**Researched:** 2026-03-13
**Domain:** Browser-based Excel generation, client-side password gating, Vite env vars
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Export content:**
- Export all projects at once — single .xlsx file containing every project
- Full criterion breakdown — every criterion's score for each project, not just totals
- Include raw inputs AND scores — full audit trail with input values alongside resulting scores
- One sheet, wide layout — all projects as rows, all criteria as columns in a single sheet

**Export trigger:**
- Export button lives in the NavBar alongside Import and New Project
- Always exports all projects regardless of any active summary page filters
- Filename includes date: `uplift-compare-2026-03-13.xlsx`

**Password gate:**
- Simple client-side password check on app load — blocks casual access, not true security
- Password stored as Netlify environment variable (VITE_APP_PASSWORD or similar) — not hardcoded in source
- Session persists via sessionStorage — once entered, valid until browser tab closes
- Full-screen password prompt before any app content is visible

**Polish and tooltips:**
- Claude reviews and improves tooltip text for clarity and completeness
- Minor visual tweaks if Claude spots issues while working — no specific fixes requested
- Basic responsive handling — should not break on tablet/phone but doesn't need small-screen optimisation

### Claude's Discretion
- Export feedback (toast/notification vs silent download)
- xlsx library choice (SheetJS, ExcelJS, etc.)
- Exact column ordering and header labels in the spreadsheet
- Password prompt UI design
- Which visual tweaks to apply during polish
- Exact tooltip wording improvements
- Responsive breakpoint handling

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DISP-01 | User can export project data to Excel format | SheetJS `writeFileXLSX` handles in-browser download; `scoreExisting`/`scoreProposed` functions + `useAppStore.projects` provide the complete data set |
</phase_requirements>

---

## Summary

Phase 4 has three distinct work areas: (1) browser-based .xlsx generation triggered from the NavBar, (2) a client-side password gate that runs before any app content renders, and (3) tooltip quality review plus light visual polish. All three are straightforward implementations with well-established patterns.

For Excel generation, SheetJS (Community Edition) is the de-facto standard for browser-only .xlsx creation. It requires no server round-trip — the file is assembled in memory and a download is forced via a programmatic anchor click. The library must be installed from the SheetJS CDN tarball (not the stale npm registry package) at version 0.20.3. The flat wide-layout (projects as rows, all inputs + criteria as columns) maps naturally to `utils.aoa_to_sheet` or `utils.json_to_sheet` from a single assembled array.

For the password gate, Vite's `VITE_` prefix convention bakes the value into the client bundle at build time. This is acknowledged-insecure-by-design (as per the locked decision: "blocks casual access, not true security"). The value is set as a Netlify environment variable with the `VITE_` prefix, accessed via `import.meta.env.VITE_APP_PASSWORD`, and the session state (unlocked/locked) lives in `sessionStorage`. The gate renders a full-screen overlay in `App.tsx` before the router renders any routes.

**Primary recommendation:** Use SheetJS 0.20.3 (CDN tarball install) with `writeFileXLSX` and `utils.aoa_to_sheet` for the export; render the password gate as a conditional full-screen component wrapping the router inside `App.tsx`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| xlsx (SheetJS CE) | 0.20.3 (CDN tarball) | Generate .xlsx in browser, trigger download | Only battle-tested pure-JS Excel writer; no server required; works in all modern browsers |

**Critical install note:** The `xlsx` package on the public npm registry is frozen at 0.18.5 and no longer maintained. SheetJS stopped publishing there years ago. Install from the CDN tarball:

```bash
npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

### Supporting (already in project)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.577.0 | Download icon for export button | Use `Download` icon |
| shadcn/ui Button | existing | Export button in NavBar | Same pattern as Import/New Project buttons |
| shadcn/ui Dialog (optional) | existing | Could frame password prompt | Alternative to a bare full-screen div |
| sessionStorage (browser API) | built-in | Persist unlocked state for tab session | Used by password gate |
| import.meta.env | Vite built-in | Read VITE_APP_PASSWORD at runtime | Baked into bundle at build time |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SheetJS | ExcelJS | ExcelJS has richer formatting API but is Node-first; browser bundle is larger; SheetJS is the right choice for a pure download-only use case |
| SheetJS | csv-stringify + rename | CSV is trivial but user requested .xlsx explicitly |
| sessionStorage | localStorage | localStorage persists across tabs and restarts; sessionStorage correctly expires on tab close per the locked decision |

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
src/
├── lib/
│   └── exportXlsx.ts       # Pure function: Project[] → triggers .xlsx download
├── components/
│   ├── ExportButton.tsx    # NavBar button — calls exportXlsx, shows feedback
│   └── PasswordGate.tsx    # Full-screen password prompt component
└── App.tsx                 # Modified: wraps router with PasswordGate
```

### Pattern 1: Excel Export — Flat Wide Layout

**What:** Assemble one row per project. Columns are: project metadata, all raw `ProjectInputs` fields, then existing system criterion scores (with section headers), then proposed system criterion scores. Use `utils.aoa_to_sheet` with an explicit header row.

**When to use:** Always — the locked decision mandates one sheet, wide layout.

**Data flow:**
```
useAppStore.projects
  → for each project: scoreExisting(inputs) + scoreProposed(inputs)
  → flatten into one row object per project
  → utils.aoa_to_sheet([[headers...], [row1...], [row2...], ...])
  → utils.book_append_sheet(wb, ws, "Projects")
  → writeFileXLSX(wb, `uplift-compare-${date}.xlsx`)
```

**Example:**
```typescript
// Source: https://docs.sheetjs.com/docs/getting-started/installation/frameworks/
import { utils, writeFileXLSX } from 'xlsx';
import type { Project } from '@/store/useAppStore';
import { scoreExisting } from '@/scoring/scoreExisting';
import { scoreProposed } from '@/scoring/scoreProposed';

export function exportXlsx(projects: Project[]): void {
  const today = new Date().toISOString().slice(0, 10); // "2026-03-13"
  const filename = `uplift-compare-${today}.xlsx`;

  // Build header row
  const headers = [
    'Project Name', 'Type', 'QNZPE ($NZD)',
    // ... raw input column labels
    'Existing Total', 'Existing Pass?', 'Existing Threshold',
    // ... existing criterion columns: 'Existing A1', 'Existing A2', ...
    'Proposed Total', 'Proposed Pass?', 'Proposed Threshold',
    // ... proposed criterion columns: 'Proposed A1', 'Proposed A2', ...
  ];

  const rows = projects.map((p) => {
    const ex = scoreExisting(p.inputs);
    const pr = scoreProposed(p.inputs);
    return [
      p.inputs.projectName,
      p.inputs.productionType,
      p.inputs.qnzpe,
      // ... all raw inputs in same order as headers
      ex.totalPoints,
      ex.passed ? 'PASS' : 'FAIL',
      ex.passThreshold,
      // ... ex.criteria mapped to scores (number | 'N/A')
      pr.totalPoints,
      pr.passed ? 'PASS' : 'FAIL',
      pr.passThreshold,
      // ... pr.criteria mapped to scores
    ];
  });

  const ws = utils.aoa_to_sheet([headers, ...rows]);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Projects');
  writeFileXLSX(wb, filename);
}
```

### Pattern 2: Password Gate — Conditional Render in App.tsx

**What:** A React component that renders a full-screen password form when `sessionStorage` does not contain the unlock token. On correct password entry, writes to `sessionStorage` and re-renders to show the app.

**When to use:** Wrap the entire router output so no routes render while locked.

**Example:**
```typescript
// PasswordGate.tsx
import { useState } from 'react';

const STORAGE_KEY = 'uplift-unlocked';
const EXPECTED = import.meta.env.VITE_APP_PASSWORD ?? '';

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true'
  );
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value === EXPECTED) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
    } else {
      setError(true);
      setValue('');
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      {/* password form UI */}
    </div>
  );
}
```

```typescript
// App.tsx — wrap router
function App() {
  return (
    <PasswordGate>
      <HashRouter>
        <TooltipProvider>
          <NavBar />
          <Routes>...</Routes>
        </TooltipProvider>
      </HashRouter>
    </PasswordGate>
  );
}
```

### Pattern 3: Export Button in NavBar

**What:** Add an `<ExportButton />` component to the right-side button group in NavBar. It calls `exportXlsx(projects)` on click. For feedback, a brief toast or transient button state change (e.g., icon swap for 1.5s) is sufficient — the browser's native download dialog provides implicit confirmation.

**Example:**
```typescript
// ExportButton.tsx
import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { exportXlsx } from '@/lib/exportXlsx';

export function ExportButton() {
  const projects = useAppStore((s) => s.projects);
  const [done, setDone] = useState(false);

  function handleExport() {
    exportXlsx(projects);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <Button size="sm" variant="outline" onClick={handleExport} disabled={projects.length === 0}>
      {done ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      <span className="ml-1">Export</span>
    </Button>
  );
}
```

### Anti-Patterns to Avoid

- **Using `XLSX.writeFile` for non-xlsx formats:** Stick to `writeFileXLSX` — it tree-shakes better and this project only ever needs .xlsx.
- **Installing from npm registry:** `npm install xlsx` installs the frozen 0.18.5 version. Always use the CDN tarball URL.
- **Storing the password in source code or .env committed to git:** The password must be a Netlify environment variable only, never hardcoded.
- **Fetching the password at runtime from an API:** The app is a static site. `import.meta.env.VITE_APP_PASSWORD` is baked at build time — this is intentional.
- **Using localStorage for the gate state:** Session should expire on tab close per locked decision; use `sessionStorage`.
- **Blocking export when projects is empty:** Disable the button instead of allowing an export of an empty sheet (confusing UX).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Binary .xlsx generation | Custom ZIP + XML writer | SheetJS `writeFileXLSX` | .xlsx is a ZIP of XML files; Office ML is complex; SheetJS handles all encoding, escaping, and format compliance |
| Browser file download trigger | Manual Blob + URL.createObjectURL + click | SheetJS `writeFileXLSX` | SheetJS handles the download trigger internally, including cross-browser fallbacks |
| Column width calculation | Manual string-length estimation loop | SheetJS `utils.sheet_set_col_widths` or skip entirely | Default widths are acceptable for this use case; Excel's auto-fit-on-open covers it |

**Key insight:** The only custom code needed is data assembly (flatten projects into rows). File format and download mechanics are fully handled by SheetJS.

---

## Common Pitfalls

### Pitfall 1: stale npm xlsx package
**What goes wrong:** `npm install xlsx` installs 0.18.5 which lacks recent bug fixes and has known issues with some Excel features.
**Why it happens:** SheetJS stopped publishing to the public npm registry.
**How to avoid:** Always install via `npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`
**Warning signs:** `package.json` shows `"xlsx": "^0.18.5"` — that's the stale version.

### Pitfall 2: VITE_ env var not set in Netlify
**What goes wrong:** `import.meta.env.VITE_APP_PASSWORD` is `undefined` at build time; the password gate either never unlocks or always unlocks.
**Why it happens:** Netlify env vars must be set before triggering a build — they are baked in at build time, not injected at runtime.
**How to avoid:** Set `VITE_APP_PASSWORD` in Netlify's "Environment variables" UI, then trigger a fresh deploy. The fallback `?? ''` in the gate code means an unset variable makes the gate permanently locked (empty password never matches).
**Warning signs:** App never unlocks, or unlocks with any input.

### Pitfall 3: CriterionResult.score is `number | 'N/A'`
**What goes wrong:** Putting `'N/A'` strings directly in numeric Excel cells causes type warnings in Excel or incorrect sorting.
**Why it happens:** The scoring engine returns `'N/A'` for criteria that don't exist in a given scoring system (e.g., existing-only A1 criterion doesn't exist in proposed).
**How to avoid:** In the row builder, map `score === 'N/A' ? '' : score` — blank cells are cleaner than 'N/A' strings in numeric columns. Alternatively, use the literal string `'N/A'` if the user wants explicit notation.
**Warning signs:** Excel shows #VALUE errors in sum formulas over criterion columns.

### Pitfall 4: Column ordering inconsistency across scoring systems
**What goes wrong:** The existing system has criteria A1–A3, B1–B9, C1–C10, D1–D4, E1–E3, F1–F4. The proposed system has A1–A8, B1–B8, C1–C4, D1–D4. They don't share IDs (existing B1 ≠ proposed B1).
**Why it happens:** The two systems are structurally different; naive criterion ordering by ID will mix them up.
**How to avoid:** Use separate column groups — one group for existing criteria (labeled "Existing A1", "Existing A2", etc.) and a separate group for proposed criteria (labeled "Proposed A1", etc.). Pull criterion lists from the `ScoringResult.criteria` flat array in order, using the `id` and `label` fields from each `CriterionResult`.

### Pitfall 5: Password gate flash on load
**What goes wrong:** The app briefly renders the main UI before the gate component mounts, causing a visual flash.
**Why it happens:** `sessionStorage.getItem()` is synchronous, but React's initial render may paint before the effect that checks it.
**How to avoid:** Initialize gate state from `sessionStorage` in the `useState` initializer function (lazy init), not in a `useEffect`. The pattern `useState(() => sessionStorage.getItem(KEY) === 'true')` avoids any async gap.

---

## Code Examples

### Building the flat export row

```typescript
// Source: scoring/types.ts — CriterionResult structure
// Each ScoringResult.criteria is a flat ordered array of CriterionResult

function buildRow(project: Project): (string | number)[] {
  const ex = scoreExisting(project.inputs);
  const pr = scoreProposed(project.inputs);

  const inputValues = [
    project.inputs.projectName,
    project.inputs.productionType,
    project.inputs.qnzpe,
    project.inputs.hasSustainabilityPlan ? 'Yes' : 'No',
    // ... remaining inputs in consistent order
  ];

  const exScores = ex.criteria.map((c) => (c.score === 'N/A' ? '' : c.score));
  const prScores = pr.criteria.map((c) => (c.score === 'N/A' ? '' : c.score));

  return [
    ...inputValues,
    ex.totalPoints, ex.passed ? 'PASS' : 'FAIL', ex.passThreshold,
    ...exScores,
    pr.totalPoints, pr.passed ? 'PASS' : 'FAIL', pr.passThreshold,
    ...prScores,
  ];
}
```

### Building the header row from a sample score result

```typescript
// Derive criterion column headers from a known project's scoring result
// (criterion order is stable — same inputs always produce same criterion array)
function buildHeaders(sampleExisting: ScoringResult, sampleProposed: ScoringResult): string[] {
  const inputHeaders = [
    'Project Name', 'Type', 'QNZPE ($NZD)',
    'Has Sustainability Plan',
    // ... all ProjectInputs fields as human-readable labels
  ];

  const exCriterionHeaders = sampleExisting.criteria.map((c) => `Existing ${c.id}: ${c.label}`);
  const prCriterionHeaders = sampleProposed.criteria.map((c) => `Proposed ${c.id}: ${c.label}`);

  return [
    ...inputHeaders,
    'Existing Total', 'Existing Pass?', 'Existing Threshold',
    ...exCriterionHeaders,
    'Proposed Total', 'Proposed Pass?', 'Proposed Threshold',
    ...prCriterionHeaders,
  ];
}
```

### SheetJS writeFileXLSX complete call

```typescript
// Source: https://docs.sheetjs.com/docs/getting-started/installation/frameworks/
import { utils, writeFileXLSX } from 'xlsx';

const ws = utils.aoa_to_sheet([headers, ...dataRows]);
const wb = utils.book_new();
utils.book_append_sheet(wb, ws, 'Projects');
writeFileXLSX(wb, filename);
// writeFileXLSX triggers browser download — no return value
```

### Netlify environment variable access

```typescript
// Vite bakes this at build time into the client bundle
const EXPECTED_PASSWORD = import.meta.env.VITE_APP_PASSWORD ?? '';

// TypeScript: extend ImportMetaEnv if desired
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_PASSWORD: string;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `xlsx` from npm registry | CDN tarball install | SheetJS stopped npm updates ~2023 | Must use CDN URL in package.json |
| `XLSX.writeFile()` for all formats | `writeFileXLSX()` for xlsx-only output | SheetJS 0.19+ | Better tree-shaking in Vite; smaller bundle |
| `process.env.REACT_APP_*` | `import.meta.env.VITE_*` | Vite (not CRA) | Project uses Vite — use `VITE_` prefix |

---

## Open Questions

1. **Column width / cell formatting**
   - What we know: SheetJS aoa_to_sheet writes raw values; column widths default to Excel's auto-detect
   - What's unclear: Whether the user wants any formatting (bold headers, freeze top row, column widths)
   - Recommendation: Start with no formatting; Excel auto-fit handles most cases. If headers need bolding, `ws['!cols']` and `ws['!freeze']` can be added as a low-effort polish step.

2. **Export feedback style**
   - What we know: This is Claude's discretion; the browser download dialog provides implicit feedback
   - What's unclear: Whether a transient icon swap on the button is sufficient or if a toast is expected
   - Recommendation: Transient icon swap (Download → Check for 1.5s) is lightweight and consistent with the app's minimal UI style. shadcn/ui has a Sonner-based toast available but adds a dependency.

3. **Password gate when VITE_APP_PASSWORD is not set**
   - What we know: `import.meta.env.VITE_APP_PASSWORD` is `undefined` if not set in Netlify
   - What's unclear: Desired behavior in dev environments where the env var may not be set
   - Recommendation: Default `?? ''` makes the gate permanently locked (empty string never matches non-empty input). For local dev, set the var in `.env.local` (git-ignored). Document this in a comment.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | vite.config.ts (inferred) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DISP-01 | `exportXlsx(projects)` assembles correct headers and row count | unit | `npm test -- src/lib/exportXlsx.test.ts` | Wave 0 |
| DISP-01 | `exportXlsx(projects)` maps N/A criterion scores to empty string | unit | `npm test -- src/lib/exportXlsx.test.ts` | Wave 0 |
| DISP-01 | `exportXlsx(projects)` generates filename with today's date | unit | `npm test -- src/lib/exportXlsx.test.ts` | Wave 0 |

**Note:** `writeFileXLSX` triggers a browser download — this cannot be meaningfully unit-tested without mocking. Test the data assembly logic (`buildRows`, `buildHeaders`) as pure functions separately from the SheetJS call. The PasswordGate component logic (sessionStorage check, correct/incorrect password behavior) is also testable with jsdom (already installed).

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/exportXlsx.test.ts` — unit tests for row/header assembly (DISP-01)
- [ ] `src/components/PasswordGate.test.tsx` — gate unlock/lock behavior (if desired; manual verification is also acceptable given the simplicity)

---

## Sources

### Primary (HIGH confidence)
- [SheetJS Frameworks Installation](https://docs.sheetjs.com/docs/getting-started/installation/frameworks/) — CDN tarball install, named imports, writeFileXLSX
- [SheetJS Data Export](https://docs.sheetjs.com/docs/solutions/output/) — writeFile vs writeFileXLSX, browser download mechanism
- [Vite Env Variables](https://vite.dev/guide/env-and-mode) — VITE_ prefix, import.meta.env, Netlify env var behaviour
- Project source: `src/scoring/types.ts` — CriterionResult.score typed as `number | 'N/A'`
- Project source: `src/store/useAppStore.ts` — projects array structure, Project interface
- Project source: `src/components/NavBar.tsx` — existing button layout for integration point
- Project source: `src/App.tsx` — PasswordGate wrapping point

### Secondary (MEDIUM confidence)
- [npm xlsx page](https://www.npmjs.com/package/xlsx) — confirmed stale at 0.18.5, CDN preferred
- [SheetJS CDN](https://cdn.sheetjs.com/) — version 0.20.3 confirmed current

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — SheetJS CDN install and writeFileXLSX confirmed via official docs; Vite env vars confirmed via official Vite docs
- Architecture: HIGH — data shapes fully read from project source; integration points confirmed (NavBar.tsx, App.tsx, scoring types)
- Pitfalls: HIGH — npm registry staleness confirmed by official SheetJS docs; N/A type confirmed from types.ts; sessionStorage vs localStorage distinction from Vite docs + locked decision

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (SheetJS versioning is slow-moving; Vite env conventions are stable)
