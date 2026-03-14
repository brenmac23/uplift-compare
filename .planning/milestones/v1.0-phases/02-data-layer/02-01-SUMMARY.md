---
phase: 02-data-layer
plan: "01"
subsystem: store
tags: [zustand, persistence, project-entity, crud, migration, tdd]
dependency_graph:
  requires: []
  provides: [Project type, useAppStore CRUD, schema-v2, seedProjects stub]
  affects: [src/scoring/types.ts, src/store/useAppStore.ts, src/data/seedProjects.ts]
tech_stack:
  added: []
  patterns: [zustand-persist-v2, crypto.randomUUID, tdd-red-green]
key_files:
  created:
    - src/data/seedProjects.ts
  modified:
    - src/scoring/types.ts
    - src/store/useAppStore.ts
    - src/store/__tests__/useAppStore.test.ts
decisions:
  - "Use setState in beforeEach to reset Zustand in-memory state — clearStorage+rehydrate alone does not reset in-memory Zustand state between tests"
  - "persist version bumped from 1 to 2 with migrate() that injects SEED_PROJECTS for v1 → v2 transition"
  - "seedProjects.ts is a stub (empty array) to unblock TypeScript compilation — Plan 02 replaces with 50 real projects"
metrics:
  duration: 3 min
  completed: 2026-03-13
  tasks_completed: 1
  files_changed: 4
---

# Phase 2 Plan 1: Project Entity and Store CRUD Summary

**One-liner:** Zustand store expanded to v2 with Project entity (UUID id, isSeeded flag, createdAt), full CRUD actions (add/update/delete with seed protection, resetToDefaults), and v1-to-v2 schema migration.

## What Was Built

### ProductionType field on ProjectInputs
Added `productionType: 'film' | 'tv'` to `ProjectInputs` in `src/scoring/types.ts`, placed after `projectName` in the Identity section. All existing scoring test fixtures now include `productionType: 'film'` via the `makeInputs` helper in test files.

### Project entity
Exported `Project` interface from `src/store/useAppStore.ts`:
```typescript
export interface Project {
  id: string;
  isSeeded: boolean;
  inputs: ProjectInputs;
  createdAt: string;
}
```

### Store CRUD actions
- `addProject(inputs)` — appends a new `Project` with `crypto.randomUUID()` id, `isSeeded: false`, and `new Date().toISOString()` createdAt
- `updateProject(id, inputs)` — replaces inputs for the matching project
- `deleteProject(id)` — removes project only if `!p.isSeeded` (seed projects protected)
- `resetToDefaults()` — sets `projects` back to `SEED_PROJECTS`

### Schema migration
Persist version bumped from 1 to 2. `migrate()` function handles v1 → v2 by injecting `SEED_PROJECTS` and setting `schemaVersion: 2`.

### Seed stub file
`src/data/seedProjects.ts` created as an empty `Project[]` array to allow TypeScript to compile. Plan 02 will replace this with 50 real seeded projects.

## Test Results

All 236 tests pass:
- 220 existing scoring engine tests (all still green after productionType added)
- 16 new store tests covering all CRUD actions, seed protection, and migration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test isolation — Zustand in-memory state bleeds between tests**
- **Found during:** Task 1 (GREEN phase, first run)
- **Issue:** `clearStorage` + `rehydrate` in `beforeEach` clears localStorage but does not reset Zustand's in-memory state. Tests accumulated projects from previous tests, causing assertions like `toHaveLength(2)` to receive 6.
- **Fix:** Changed `beforeEach` to call `useAppStore.setState({ schemaVersion: 2, projects: [...SEED_PROJECTS] })` directly, which resets in-memory state. Migration test still uses `localStorage.setItem` + `rehydrate` to test the actual migration path.
- **Files modified:** `src/store/__tests__/useAppStore.test.ts`
- **Commit:** 5de7343 (included in GREEN phase commit)

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/scoring/types.ts | FOUND |
| src/store/useAppStore.ts | FOUND |
| src/data/seedProjects.ts | FOUND |
| src/store/__tests__/useAppStore.test.ts | FOUND |
| .planning/phases/02-data-layer/02-01-SUMMARY.md | FOUND |
| Commit 913ae83 (RED) | FOUND |
| Commit 5de7343 (GREEN) | FOUND |
