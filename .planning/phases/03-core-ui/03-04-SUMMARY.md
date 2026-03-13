---
phase: 03-core-ui
plan: "04"
subsystem: ui
tags: [react, typescript, shadcn, zustand, tailwind, modal, file-import]

# Dependency graph
requires:
  - phase: 03-core-ui-03
    provides: DetailPage with three-column layout and live scoring
  - phase: 02-data-layer
    provides: Zustand store with addProject action and project persistence
provides:
  - CreateProjectModal dialog (shadcn Dialog) with name, QNZPE in millions, and production type fields
  - ImportButton for JSON file import with ProjectInputs validation and lenient defaults
  - Updated addProject store action accepting optional pre-generated UUID for post-create navigation
  - NavBar wired with New Project modal state and ImportButton component
  - 6 visual/UX fixes from human verification: QNZPE in millions, dropdowns for % and Investment fields, row alignment, badge alignment, sticky header clearance
affects: [04-polish, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Generate UUID before calling addProject to enable immediate navigation to new project"
    - "Lenient JSON import: validate required fields, fill optional fields with defaults"
    - "Hidden file input triggered by visible Button for accessible file picking"

key-files:
  created:
    - src/components/CreateProjectModal.tsx
    - src/components/ImportButton.tsx
  modified:
    - src/store/useAppStore.ts
    - src/components/NavBar.tsx

key-decisions:
  - "addProject signature updated to accept optional id param — generate UUID in modal/import before calling store to enable navigate-to-new-project pattern"
  - "QNZPE displayed and entered in millions in the create form (user types 100, store receives 100_000_000)"
  - "Commercial Agreement % and Infrastructure Investment use Select dropdowns (not free-number inputs) matching the detail page scoring tiers"
  - "6 visual fixes applied post-verification in a single fix commit rather than separate task commits"

patterns-established:
  - "Pre-generate UUID before store action when immediate navigation to new entity is needed"
  - "JSON import: validate required-field shape, back-fill missing optional fields with zero/false/none defaults"

requirements-completed: [PROJ-09, DISP-02]

# Metrics
duration: ~15min
completed: 2026-03-13
---

# Phase 3 Plan 04: Create Modal, JSON Import, NavBar Wiring, and UI Verification Summary

**New Project modal and JSON import wired into NavBar with pre-generated UUID navigation, plus 6 post-verification UI fixes covering input units, dropdown fields, row/badge alignment, and sticky header clearance**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-13
- **Completed:** 2026-03-13
- **Tasks:** 2 (1 auto + 1 checkpoint verified)
- **Files modified:** 6

## Accomplishments
- Created `CreateProjectModal` using shadcn Dialog — name, QNZPE in $M, production type select — generates UUID before `addProject` to enable immediate navigation to new project's detail page
- Created `ImportButton` with hidden file input, FileReader, JSON parsing, `isValidProjectInputs` shape check, and lenient default back-fill for optional fields
- Updated `addProject` store action to accept optional `id?: string`, using `id ?? crypto.randomUUID()` internally
- Wired NavBar: "New Project" triggers modal open state, "Import" replaced with ImportButton component, old CreateProjectForm deleted
- Applied 6 post-verification fixes: QNZPE input in millions, Commercial Agreement % as dropdown, Infrastructure Investment as dropdown, detail section row alignment, summary PASS/FAIL badge alignment, sticky header clears navbar
- Human visual verification checkpoint passed — all screens functional, design polished

## Task Commits

Each task was committed atomically:

1. **Task 1: Update store, create modal and import, wire into NavBar** - `1e3d122` (feat)
2. **Task 1 fixes: 6 UI issues from visual verification** - `0fd0e20` (fix)
3. **Task 2: Visual verification checkpoint** - approved by human

## Files Created/Modified
- `src/components/CreateProjectModal.tsx` - shadcn Dialog modal for creating new projects with pre-generated UUID navigation
- `src/components/ImportButton.tsx` - JSON file import with shape validation and lenient defaults
- `src/store/useAppStore.ts` - addProject updated to accept optional pre-generated id param
- `src/components/NavBar.tsx` - wired New Project modal state and ImportButton, removed old placeholder buttons

## Decisions Made
- Pre-generate UUID in modal before calling `addProject` so the modal can navigate to `/project/${id}` immediately after closing — avoids needing to return the new ID from the store action
- QNZPE entered in millions in the create form (user types `100`, stored as `100_000_000`) — consistent with how the detail page displays it
- Commercial Agreement % and Infrastructure Investment use Select dropdowns rather than free-number inputs — aligns with the scoring tier structure in the detail page
- 6 visual fixes committed as a single follow-up fix commit rather than re-doing the task commit

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] QNZPE create form accepted raw number, not millions**
- **Found during:** Task 2 (visual verification)
- **Issue:** User expects to type a number like "100" for $100M, but the field was storing the raw value without the x1,000,000 multiplication
- **Fix:** CreateProjectModal multiplies the entered value by 1,000,000 before passing to addProject
- **Files modified:** src/components/CreateProjectModal.tsx
- **Committed in:** 0fd0e20

**2. [Rule 1 - Bug] Commercial Agreement % and Infrastructure Investment were free-number inputs**
- **Found during:** Task 2 (visual verification)
- **Issue:** These fields have discrete scoring tiers — free number entry was misleading and inconsistent with the detail page
- **Fix:** Replaced with Select dropdowns matching the tier options
- **Files modified:** src/components/CreateProjectModal.tsx
- **Committed in:** 0fd0e20

**3. [Rule 1 - Bug] Detail page sections not aligned row-by-row**
- **Found during:** Task 2 (visual verification)
- **Issue:** Criterion rows in existing and proposed columns were not vertically aligned
- **Fix:** Applied consistent grid/row alignment to section rendering
- **Files modified:** src/components/DetailPage related files
- **Committed in:** 0fd0e20

**4. [Rule 1 - Bug] Summary table PASS/FAIL badges not aligned**
- **Found during:** Task 2 (visual verification)
- **Issue:** Badge cells had inconsistent vertical alignment in table rows
- **Fix:** Applied consistent cell alignment styles
- **Files modified:** Summary table component
- **Committed in:** 0fd0e20

**5. [Rule 1 - Bug] Sticky header overlapped by navbar**
- **Found during:** Task 2 (visual verification)
- **Issue:** Sticky score headers in detail page were hidden under the fixed navbar when scrolling
- **Fix:** Added top offset matching navbar height to sticky header position
- **Files modified:** DetailPage header styling
- **Committed in:** 0fd0e20

---

**Total deviations:** 5 auto-fixed bugs (all caught during human verification checkpoint, applied in single fix commit 0fd0e20)
**Impact on plan:** All fixes improve correctness and usability. No scope creep — all changes relate to requirements DISP-02 and PROJ-09.

## Issues Encountered
None beyond the 5 UI bugs caught during visual verification.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 is fully complete — all 4 plans done, all requirements met (PROJ-09, DISP-02 confirmed)
- App is fully functional: summary screen with filters and stat cards, detail screen with live three-column scoring, create modal, JSON import
- Ready for Phase 4 (polish/deployment)

---
*Phase: 03-core-ui*
*Completed: 2026-03-13*
