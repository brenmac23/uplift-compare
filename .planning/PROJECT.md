# Uplift Compare

## What This Is

A web application that compares how screen productions score under the existing vs. proposed New Zealand Screen Production Rebate 5% Uplift points tests. Users enter production details and see scores calculated under both systems side by side, with pass/fail verdicts, filtering, and Excel export. Ships with 50 seeded fictional projects and supports creating new ones. Protected by a client-side password gate.

## Core Value

Instant, accurate side-by-side comparison of how a production fares under both the existing and proposed uplift scoring systems — making the impact of the rule change tangible and concrete.

## Requirements

### Validated

- ✓ Side-by-side scoring engine for existing (85 max, 40 min pass) and proposed (70 max, 20/30 min pass based on QNZPE) uplift tests — v1.0
- ✓ Input form where users enter raw production data and app calculates points for both systems — v1.0
- ✓ Shared input fields feed both scoring systems where criteria overlap — v1.0
- ✓ Project detail screen with dropdown to switch between projects — v1.0
- ✓ Summary screen with all projects, pass/fail status, filters, and aggregate statistics — v1.0
- ✓ 50 seeded fictional projects with realistic distribution — v1.0
- ✓ Users can create new projects and import from JSON — v1.0
- ✓ Export project data to Excel format (browser-side) — v1.0
- ✓ Light theme with aesthetic design (Tailwind v4 + shadcn/ui) — v1.0
- ✓ Deploys on Netlify as static site — v1.0
- ✓ Data stored in browser localStorage — v1.0
- ✓ Pass/fail indicators use colour + text (accessible) — v1.0
- ✓ Criterion tooltips explaining rules in plain English — v1.0
- ✓ Collapsible/expandable score sections — v1.0
- ✓ Mandatory criteria (A1 sustainability) visually highlighted — v1.0
- ✓ Client-side password gate — v1.0

### Active

(None — define with `/gsd:new-milestone`)

### Out of Scope

- Backend/database — static site with localStorage only
- User authentication — password gate is sufficient
- Multi-user collaboration — single-browser usage
- Mobile-native app — web only (responsive is fine)
- Actual NZFC submission — this is a comparison/analysis tool only
- PDF export — Excel is what producers use for analysis
- Real NZ names or real franchises — legal risk, explicitly forbidden

## Context

Shipped v1.0 with 9,420 LOC TypeScript across 134 files.
Tech stack: React 19, Vite 8, Zustand 5, Tailwind CSS v4, shadcn/ui, SheetJS.
263 unit tests covering scoring logic, data layer, and export assembly.
Deployed on Netlify with VITE_APP_PASSWORD environment variable for access control.

## Constraints

- **Tech stack**: React 19 + Vite 8 + TypeScript
- **Hosting**: Netlify — static files only, no server-side processing
- **Data persistence**: Browser localStorage with Zustand persist middleware
- **Design**: Light theme using Tailwind CSS v4 + shadcn/ui

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite | Modern tooling, fast builds, strong ecosystem for forms/tables | ✓ Good |
| Browser localStorage | No backend needed for Netlify static deploy | ✓ Good |
| Raw data input with auto-calculation | More realistic scoring — users enter percentages/amounts, app calculates points | ✓ Good |
| Side-by-side comparison view | Best for direct visual comparison of two scoring systems | ✓ Good |
| Engine-first build order | Scoring correctness validated before any UI work begins | ✓ Good |
| Zustand 5 with persist middleware | No manual localStorage wiring, schema migration support built in | ✓ Good |
| HashRouter (not BrowserRouter) | Works on Netlify without redirect config | ✓ Good |
| SheetJS from CDN tarball | npm registry version unavailable; frozen at 0.18.5 | ✓ Good |
| QNZPE stored as whole NZD dollars | Readable comparisons (100_000_000 for $100m) | ✓ Good |
| Password gate wraps HashRouter | No routes render while locked; sessionStorage avoids flash | ✓ Good |
| Scores recomputed from raw inputs | Never stored as source of truth; always derived | ✓ Good |
| legacy-peer-deps for @tailwindcss/vite | vite@8 vs vite ^5-7 peer dep; no downgrade needed | ⚠️ Revisit |

---
*Last updated: 2026-03-14 after v1.0 milestone*
