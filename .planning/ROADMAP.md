# Roadmap: Uplift Compare

## Overview

Build a static React SPA that computes and compares NZ Screen Production Rebate Uplift scores under the existing and proposed rules. The critical path runs engine-first: validate scoring logic before any UI is built, then layer data persistence and seed data, then build all screens together, then add export. Every phase has a hard dependency on the one before it.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Scoring Engine** - Pure scoring functions with unit tests and validated rule encoding for both tests (completed 2026-03-13)
- [x] **Phase 2: Data Layer** - Zustand store, localStorage persistence, seed data generation and validation (completed 2026-03-13)
- [ ] **Phase 3: Core UI** - All three screens (form, detail, summary) with live scoring and full interactivity
- [ ] **Phase 4: Export and Polish** - Excel export, help tooltips, and final visual refinement

## Phase Details

### Phase 1: Scoring Engine
**Goal**: The two scoring systems are correctly encoded as pure functions, validated against source documents, and covered by unit tests
**Depends on**: Nothing (first phase)
**Requirements**: SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05, SCORE-06, SCORE-07, INFRA-02
**Success Criteria** (what must be TRUE):
  1. Given a known set of production inputs, `scoreExisting()` returns the correct point total and pass/fail verdict matching a manual calculation from the source document
  2. Given a known set of production inputs, `scoreProposed()` returns the correct point total and correctly applies the tiered pass threshold (20 pts for QNZPE <$100m, 30 pts for QNZPE >=$100m)
  3. The A1 sustainability criterion in the existing test is flagged as mandatory in the returned result structure
  4. Shared input fields (QNZPE, crew %, cast %) are consumed by both scoring functions from a single `ProjectInputs` type — no duplication
  5. The Zustand store initialises with a `schemaVersion` field and the app can boot without crashing on a fresh localStorage
**Plans:** 4/4 plans complete

Plans:
- [ ] 01-01-PLAN.md — Project scaffold, types, helpers, scoring spec, and human verification
- [ ] 01-02-PLAN.md — TDD: scoreExisting() — existing uplift points test engine
- [ ] 01-03-PLAN.md — TDD: scoreProposed() — proposed uplift points test engine
- [ ] 01-04-PLAN.md — Zustand store skeleton, shared inputs integration tests, barrel export

### Phase 2: Data Layer
**Goal**: The app ships with 50 correctly distributed seeded projects, persists all data to localStorage, and supports creating new projects
**Depends on**: Phase 1
**Requirements**: PROJ-01, PROJ-02, PROJ-03, PROJ-04, INFRA-01
**Success Criteria** (what must be TRUE):
  1. On first load, 50 fictional projects appear in the app — none with NZ references or real franchise names
  2. Of the 50 seed projects: approximately half pass the existing test, half fail; half have QNZPE >=$100m; all have QNZPE >=$20m
  3. A user can create a new project via the input form and it persists across a browser refresh
  4. The app deploys to Netlify and loads correctly with all 50 projects intact
**Plans:** 3/3 plans complete

Plans:
- [ ] 02-01-PLAN.md — Store expansion: Project entity, CRUD actions, productionType field, schema migration v1->v2
- [ ] 02-02-PLAN.md — Seed data: 50 fictional projects with distribution verification tests
- [ ] 02-03-PLAN.md — HashRouter, minimal project list page, Netlify deployment

### Phase 3: Core UI
**Goal**: Users can navigate all screens, see side-by-side scoring breakdowns, and interact with the full project list
**Depends on**: Phase 2
**Requirements**: PROJ-05, PROJ-06, PROJ-07, PROJ-08, PROJ-09, DISP-02, DISP-03, DISP-04, DISP-05
**Success Criteria** (what must be TRUE):
  1. On the project detail screen, a user sees both the existing and proposed scores side by side with a pass/fail verdict for each, and can switch between projects via a dropdown
  2. On the summary screen, a user sees all projects listed with their pass/fail status for each test and can filter by pass/fail status, production type, or budget tier
  3. The summary screen shows aggregate statistics (e.g. "32/50 pass existing test, 41/50 pass proposed test")
  4. Pass/fail indicators use both colour and text label — a user without colour vision can distinguish pass from fail
  5. Each scoring criterion has a tooltip explaining the rule in plain English, and score sections can be collapsed and expanded
**Plans**: TBD

### Phase 4: Export and Polish
**Goal**: Users can export project data to Excel and the app is visually complete
**Depends on**: Phase 3
**Requirements**: DISP-01
**Success Criteria** (what must be TRUE):
  1. A user can click an export button and receive a downloadable .xlsx file containing the project's scoring data
  2. The export works without a server request — the file is generated entirely in the browser
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scoring Engine | 4/4 | Complete   | 2026-03-13 |
| 2. Data Layer | 3/3 | Complete   | 2026-03-13 |
| 3. Core UI | 0/TBD | Not started | - |
| 4. Export and Polish | 0/TBD | Not started | - |
