---
phase: 2
slug: data-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 |
| **Config file** | `vitest.config.ts` (root, `globals: true`, `environment: jsdom`) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PROJ-04 | unit | `npx vitest run src/store/__tests__/useAppStore.test.ts` | Extend existing | ⬜ pending |
| 02-02-01 | 02 | 1 | PROJ-01, PROJ-02, PROJ-03 | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | INFRA-01 | smoke (manual) | Manual: open deployed URL, count projects | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/data/__tests__/seedProjects.test.ts` — stubs for PROJ-01, PROJ-02, PROJ-03
- [ ] Extend `src/store/__tests__/useAppStore.test.ts` — stubs for PROJ-04 (addProject, deleteProject, resetToDefaults)

*Existing vitest infrastructure covers framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App loads on Netlify with 50 projects | INFRA-01 | Requires deployed environment | Open deployed URL, verify 50 projects visible, no console errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
