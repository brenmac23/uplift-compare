# Technology Stack

**Project:** Uplift Compare — NZ Screen Production Rebate scoring tool
**Researched:** 2026-03-13
**Confidence:** HIGH (all recommendations verified against official docs or npm registry)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 19.2.x | UI rendering | Latest stable; React 19 ships with improved form handling via Actions, better Suspense, and `useOptimistic`. No breaking API changes for this use case. |
| Vite | 8.x | Build tool & dev server | Rolldown-powered v8 is the current release; first-party React plugin; near-instant HMR. The `npm create vite@latest` template ships a working React + TS project in seconds. Netlify has native Vite support. |
| TypeScript | 5.x | Type safety | Ships with the Vite react-ts template. Essential for a scoring engine with many numeric fields — type errors surface at compile time, not runtime. |

### State Management & Persistence

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | 5.x | Global state + localStorage persistence | The `persist` middleware (built into Zustand) serialises the entire store to localStorage with one configuration block. No boilerplate, no Context Provider wrapping. At 50 seeded projects plus user-created ones, React Context would cause re-render churn across the comparison views. Zustand's selective subscription model prevents that. |

**Why not React Context:** No built-in persistence means manually wiring `useEffect` + `JSON.stringify` everywhere. Context also re-renders all subscribers on any state change — problematic with a large project list and live score recalculation.

**Why not Redux Toolkit:** RTK's pattern is appropriate for team-scale apps. This is a single-developer static tool; Zustand delivers 80% of the value at 20% of the ceremony.

### Forms

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Hook Form | 7.71.x | Form state, validation wiring | Actively maintained (published 20 days ago as of research date). Uncontrolled-by-default — no re-render on every keystroke, which matters when a form triggers live dual-system score recalculation. Smaller bundle (27.9kB) than Formik (44.7kB). Formik is effectively unmaintained (last commit ~1 year ago). |
| Zod | 4.x | Schema validation | Integrates directly with React Hook Form via `@hookform/resolvers/zod`. Declares field constraints as TypeScript types simultaneously — a percentage field declared `z.number().min(0).max(100)` is both a runtime validator and a compile-time type. |
| @hookform/resolvers | latest | Bridge between RHF and Zod | Official resolver package; required for Zod integration. |

### UI Components & Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first styling | v4 released January 2025; first-party Vite plugin (`@tailwindcss/vite`) replaces the old PostCSS setup — one plugin import, no config file, no content globs. Full builds up to 5x faster than v3. Light-theme aesthetics are straightforward with Tailwind's neutral/slate palette. |
| shadcn/ui | CLI v4 (March 2026) | Component primitives | The standard for Tailwind + React component libraries. Components are copied into your repo (you own them), so there is no runtime dependency lock-in. Covers every UI primitive this project needs: Input, Select, Table, Card, Badge, Button, Dialog. Uses Radix UI primitives under the hood for accessibility. CLI v4 is the current release. |

**Why not MUI:** Heavy bundle, opinionated Material Design aesthetic that fights against custom light-theme designs. Tailwind overrides in MUI are painful.

**Why not Ant Design:** Same problem — strong pre-baked visual identity, difficult to customise to a clean aesthetic without fighting the library.

**Note on Radix UI maintenance:** Search results surfaced a claim that Radix UI is not being actively maintained. However, shadcn/ui CLI v4 (released March 2026) continues to ship components using Radix primitives, and the shadcn team is actively exploring Base UI as a future alternative. For this project's scope and timeline, Radix-based shadcn/ui is fine.

### Data Tables

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TanStack Table | 8.21.x | Summary screen project table | Headless — no style opinions, works directly with Tailwind/shadcn. Handles sorting, filtering, and column visibility. For 50–200 projects (seed data + user additions), client-side processing is trivial. The summary screen needs sortable columns (pass/fail status, project name, QNZPE amount) and that is exactly the TanStack Table sweet spot. |

**Why not a pre-styled grid like AG Grid:** Overkill bundle, fights the custom design. TanStack Table with shadcn table components is the idiomatic 2026 pattern.

### Excel Export

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| ExcelJS | 4.4.0 | Generate .xlsx files in browser | Despite the last npm publish being 2023, ExcelJS has 4.1M weekly downloads and is widely used in production browser contexts. It supports `writeBuffer()` for in-browser generation without a server. Offers cell styling (bold headers, column widths, number formats) that pure SheetJS CE does not provide in the free tier. |
| file-saver | 2.x | Trigger browser download | Standard companion to ExcelJS for browser-side file downloads. Small, stable, no dependencies. |

**Why not SheetJS (xlsx) from npm:** The npm registry package is frozen at version 0.18.5. SheetJS moved distribution to its own CDN (cdn.sheetjs.com), creating installation friction and supply chain uncertainty. Known CVEs include prototype pollution (CVE-2023-30533) and zip slip (CVE-2024-22363). Not appropriate for a greenfield project.

**Why not write-excel-file:** Very lightweight and browser-native, but limited styling options. For a professional-looking export with proper column headers and data types, ExcelJS gives more control.

**Mitigation for ExcelJS bundle size:** Use dynamic import (`const ExcelJS = await import('exceljs')`) so the ~700kB library only loads when the user clicks "Export". This keeps initial load fast.

### Routing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Router | 7.x | Client-side routing | v7 declarative mode is the lightest footprint for a SPA with no backend. The app has two main routes: `/` (summary) and `/project/:id` (detail). In v7, you import from `react-router` (not `react-router-dom`; the latter re-exports the former). |

**Why not hash routing:** Clean URL routing works fine on Netlify — add a `_redirects` file (`/* /index.html 200`) and all routes resolve correctly as a SPA.

### Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Netlify | — | Static site hosting | Specified in requirements. Vite outputs to `dist/`. Build command: `npm run build`. Publish directory: `dist`. Netlify auto-detects Vite projects. Add `public/_redirects` with `/* /index.html 200` for SPA routing. No backend, no serverless functions needed. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build tool | Vite 8 | Create React App | CRA is deprecated and unmaintained |
| Forms | React Hook Form | Formik | Formik last committed ~1 year ago; unmaintained |
| State | Zustand | React Context | No built-in persistence; re-render churn |
| State | Zustand | Redux Toolkit | Excessive ceremony for single-developer static tool |
| UI | shadcn/ui + Tailwind | MUI | MUI aesthetic fights custom light theme design |
| UI | shadcn/ui + Tailwind | Ant Design | Same as MUI; strong pre-baked visual identity |
| Tables | TanStack Table | AG Grid | Overkill; style opinions conflict with Tailwind |
| Excel | ExcelJS | SheetJS (npm) | npm package frozen at 0.18.5; CVE history; CDN distribution friction |
| Excel | ExcelJS | write-excel-file | Limited cell styling options for professional output |
| Validation | Zod | Yup | Zod 4.x has better TypeScript inference and is more actively maintained |

---

## Installation

```bash
# Scaffold project
npm create vite@latest uplift-compare -- --template react-ts
cd uplift-compare

# Tailwind CSS v4 (Vite plugin, no config file needed)
npm install tailwindcss @tailwindcss/vite

# shadcn/ui (follow CLI prompts)
npx shadcn@latest init

# Forms + validation
npm install react-hook-form zod @hookform/resolvers

# State management
npm install zustand

# Routing
npm install react-router

# Tables
npm install @tanstack/react-table

# Excel export
npm install exceljs file-saver
npm install -D @types/file-saver
```

**vite.config.ts additions:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**index.css (Tailwind v4 — single import, no directives):**
```css
@import "tailwindcss";
```

**Netlify SPA routing (public/_redirects):**
```
/* /index.html 200
```

---

## Confidence Assessment

| Decision | Confidence | Basis |
|----------|------------|-------|
| React 19.2.x | HIGH | Official react.dev versions page, npm registry |
| Vite 8.x | HIGH | Official vite.dev releases page |
| Tailwind CSS v4 | HIGH | Official tailwindcss.com, multiple Vite integration guides |
| shadcn/ui CLI v4 | HIGH | Official ui.shadcn.com changelog, March 2026 release confirmed |
| React Hook Form 7.71.x | HIGH | npm registry, GitHub releases; Formik deprecation confirmed by multiple sources |
| Zod 4.x | HIGH | npm registry, zod.dev |
| Zustand 5.x | HIGH | npm registry, GitHub |
| TanStack Table 8.21.x | HIGH | npm registry, tanstack.com docs |
| ExcelJS 4.4.0 | MEDIUM | npm package exists, widely used, but last published 2023; no known CVEs; maintenance uncertain |
| React Router 7.x | HIGH | Official reactrouter.com docs, confirmed SPA mode support |
| Netlify + Vite | HIGH | Official Netlify docs, Vite static deploy guide |

**Overall stack confidence: HIGH.** All core libraries are current, actively maintained, and verified against official sources. The only MEDIUM confidence item is ExcelJS — acceptable risk given 4.1M weekly downloads and no known security CVEs, mitigated by dynamic import to isolate it.

---

## Sources

- React versions: https://react.dev/versions
- Vite 8 release: https://voidzero.dev/posts/announcing-vite-8-beta
- Tailwind CSS v4: https://tailwindcss.com/blog/tailwindcss-v4
- shadcn/ui changelog: https://ui.shadcn.com/docs/changelog
- React Hook Form npm: https://www.npmjs.com/package/react-hook-form
- Zod npm: https://www.npmjs.com/package/zod
- Zustand GitHub: https://github.com/pmndrs/zustand
- TanStack Table npm: https://www.npmjs.com/package/@tanstack/react-table
- ExcelJS npm: https://www.npmjs.com/package/exceljs
- SheetJS CVE: https://security.snyk.io/vuln/SNYK-JS-XLSX-5457926
- SheetJS npm freeze issue: https://github.com/SheetJS/sheetjs/issues/2667
- React Router v7 SPA: https://reactrouter.com/how-to/spa
- Netlify + Vite: https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/
