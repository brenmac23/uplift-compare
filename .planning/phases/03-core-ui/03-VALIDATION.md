---
phase: 3
slug: core-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.0 |
| **Config file** | `vitest.config.ts` (exists, `environment: 'jsdom'`, `globals: true`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-W0-01 | W0 | 0 | INFRA | setup | `npm test` | ❌ W0 | ⬜ pending |
| 03-01-01 | 01 | 1 | PROJ-05 | smoke (render) | `npm test -- src/pages/__tests__/DetailPage.test.tsx` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | PROJ-06 | smoke (render) | `npm test -- src/pages/__tests__/SummaryPage.test.tsx` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | PROJ-07 | unit (hook) | `npm test -- src/hooks/__tests__/useFilteredProjects.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | PROJ-08 | unit (hook) | `npm test -- src/hooks/__tests__/useFilteredProjects.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | PROJ-09 | unit | `npm test -- src/components/__tests__/ImportButton.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-06 | 01 | 1 | DISP-03 | unit | `npm test -- src/components/__tests__/PassFailBadge.test.tsx` | ❌ W0 | ⬜ pending |
| 03-01-07 | 01 | 1 | DISP-04 | smoke (render) | included in DetailPage test | ❌ W0 | ⬜ pending |
| 03-01-08 | 01 | 1 | DISP-05 | smoke (render) | included in DetailPage test | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install React Testing Library: `npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom`
- [ ] `src/setupTests.ts` — jest-dom imports for matcher extensions
- [ ] Update `vitest.config.ts` to include `setupFiles: ['./src/setupTests.ts']`
- [ ] `src/pages/__tests__/DetailPage.test.tsx` — stub for PROJ-05, DISP-04, DISP-05
- [ ] `src/pages/__tests__/SummaryPage.test.tsx` — stub for PROJ-06
- [ ] `src/hooks/__tests__/useFilteredProjects.test.ts` — stub for PROJ-07, PROJ-08
- [ ] `src/components/__tests__/PassFailBadge.test.tsx` — stub for DISP-03
- [ ] `src/components/__tests__/ImportButton.test.ts` — stub for PROJ-09

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Light theme with modern polished aesthetic | DISP-02 | Visual design quality — cannot be meaningfully automated | Open app in browser, verify light theme, rounded cards with shadows, blue/orange pass/fail badges, overall polished appearance |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
