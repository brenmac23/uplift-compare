---
phase: 02-data-layer
plan: "03"
subsystem: ui
tags: [react-router-dom, HashRouter, netlify, zustand, vite]

# Dependency graph
requires:
  - phase: 02-data-layer/02-01
    provides: useAppStore with projects CRUD and resetToDefaults
  - phase: 02-data-layer/02-02
    provides: 50 seed projects in SEED_PROJECTS
provides:
  - HashRouter app shell with root route rendering ProjectListPage
  - ProjectListPage showing all projects from store with Reset to defaults button
  - CreateProjectForm with name/QNZPE/productionType fields and inline validation
  - netlify.toml build config for Vite (command/publish)
  - react-router-dom v7 installed
affects: [03-ui-shell, 04-deployment]

# Tech tracking
tech-stack:
  added: [react-router-dom@7]
  patterns: [HashRouter for client-side routing (Netlify-compatible), form validation with inline error messages]

key-files:
  created:
    - src/App.tsx (replaced with HashRouter shell)
    - src/pages/ProjectListPage.tsx
    - src/components/CreateProjectForm.tsx
    - netlify.toml
  modified:
    - package.json
    - package-lock.json
    - src/scoring/__tests__/scoreExisting.test.ts
    - src/scoring/__tests__/scoreProposed.test.ts
    - src/scoring/__tests__/sharedInputs.test.ts
    - src/store/__tests__/useAppStore.test.ts

key-decisions:
  - "HashRouter used (not BrowserRouter) — works on Netlify without redirect config"
  - "netlify.toml uses npm run build / dist — no redirects needed with HashRouter"
  - "CreateProjectForm defaults all scoring inputs to zero/false/none — only name, QNZPE, productionType from form"

patterns-established:
  - "Page components in src/pages/, shared components in src/components/"
  - "useAppStore selector pattern: useAppStore((s) => s.field) for derived subscriptions"

requirements-completed: [INFRA-01, PROJ-04]

# Metrics
duration: 3min
completed: 2026-03-13
---

# Phase 2 Plan 03: Frontend Shell & Netlify Deploy Summary

**HashRouter app shell with ProjectListPage (50 seed projects), CreateProjectForm (name/QNZPE/productionType), and netlify.toml — build verified, awaiting GitHub push and Netlify deploy**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T15:43:37Z
- **Completed:** 2026-03-13T15:46:17Z
- **Tasks:** 1 of 2 complete (Task 2 is a human-action checkpoint)
- **Files modified:** 10

## Accomplishments
- Replaced Vite default App.tsx with HashRouter shell routing to ProjectListPage at root path
- Created ProjectListPage reading all projects from useAppStore — shows count, project list, Reset to defaults button
- Created CreateProjectForm with three fields (name, QNZPE, productionType), inline validation, and addProject call
- Configured netlify.toml for Vite builds (no redirects needed — HashRouter is client-side)
- npm run build succeeds (282KB JS bundle), all 252 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Install react-router-dom, HashRouter shell, project list, create form, netlify config** - `f24362b` (feat)
2. **chore: .gitignore update** - `265b692` (chore)

**Plan metadata:** (pending — awaiting Task 2 checkpoint resolution)

## Files Created/Modified
- `src/App.tsx` - Replaced with HashRouter wrapping root route to ProjectListPage
- `src/pages/ProjectListPage.tsx` - Project list with count display and Reset to defaults button
- `src/components/CreateProjectForm.tsx` - Form with name/QNZPE/productionType fields and validation
- `netlify.toml` - Vite build configuration for Netlify (command + publish dir)
- `package.json` / `package-lock.json` - react-router-dom v7 added
- `src/scoring/__tests__/scoreExisting.test.ts` - Added missing productionType field to test inputs
- `src/scoring/__tests__/scoreProposed.test.ts` - Added missing productionType field, removed unused EXISTING_ONLY_IDS
- `src/scoring/__tests__/sharedInputs.test.ts` - Added missing productionType field
- `src/store/__tests__/useAppStore.test.ts` - Removed unused SEED_PROJECTS import

## Decisions Made
- HashRouter selected over BrowserRouter — no server-side redirect config needed on Netlify
- netlify.toml has no [[redirects]] section — HashRouter handles all routing client-side
- Form defaults all scoring inputs to zero/false/none — only identity fields come from user input

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added missing productionType field to scoring test baseline inputs**
- **Found during:** Task 1 (build verification)
- **Issue:** productionType was added to ProjectInputs in Plan 02-01 but scoring test files (scoreExisting.test.ts, scoreProposed.test.ts, sharedInputs.test.ts) weren't updated — TypeScript compilation failed with TS2741 errors
- **Fix:** Added `productionType: 'film'` to each test baseline input object (passerInputs, allMax, BASE_INPUTS, MINIMAL_INPUTS, MAX_INPUTS, baseline)
- **Files modified:** src/scoring/__tests__/scoreExisting.test.ts, src/scoring/__tests__/scoreProposed.test.ts, src/scoring/__tests__/sharedInputs.test.ts
- **Verification:** npm run build succeeds, all 252 tests pass
- **Committed in:** f24362b (Task 1 commit)

**2. [Rule 1 - Bug] Removed unused imports/variables causing TS6133 errors**
- **Found during:** Task 1 (build verification)
- **Issue:** SEED_PROJECTS import unused in useAppStore.test.ts; EXISTING_ONLY_IDS constant unused in scoreProposed.test.ts — TypeScript strict mode errors
- **Fix:** Removed SEED_PROJECTS import from useAppStore.test.ts; removed EXISTING_ONLY_IDS constant from scoreProposed.test.ts
- **Files modified:** src/store/__tests__/useAppStore.test.ts, src/scoring/__tests__/scoreProposed.test.ts
- **Verification:** TypeScript compilation succeeds with zero errors
- **Committed in:** f24362b (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 - Bug)
**Impact on plan:** Both fixes were pre-existing TypeScript errors exposed by tsc -b during build. No new scope introduced.

## Issues Encountered
- GitHub CLI (gh) not installed — Task 2 (push to GitHub + Netlify deploy) requires user action

## User Setup Required

Task 2 is a human-action checkpoint. The user must:
1. Create a GitHub repo and push this code
2. Connect to Netlify (Dashboard or CLI) and deploy

## Next Phase Readiness
- Frontend shell is ready — HashRouter, ProjectListPage, CreateProjectForm all built and verified
- App builds cleanly and loads 50 seed projects
- Awaiting Netlify deployment to confirm end-to-end production pipeline
- Phase 3 (UI shell) can begin after deployment confirmed

## Self-Check

### Files exist:
- src/App.tsx: FOUND
- src/pages/ProjectListPage.tsx: FOUND
- src/components/CreateProjectForm.tsx: FOUND
- netlify.toml: FOUND

### Commits exist:
- f24362b: FOUND
- 265b692: FOUND

## Self-Check: PASSED

---
*Phase: 02-data-layer*
*Completed: 2026-03-13*
