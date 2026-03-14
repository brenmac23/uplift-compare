---
phase: 7
slug: distribution-targets-and-validation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test -- seedProjects` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- seedProjects`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 0 | SCEN-01 | unit | `npm run test -- seedProjects` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 0 | SCEN-02 | unit | `npm run test -- seedProjects` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 0 | SCEN-03 | unit | `npm run test -- seedProjects` | ❌ W0 | ⬜ pending |
| 07-01-04 | 01 | 0 | SCEN-04 | unit | `npm run test -- seedProjects` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 1 | SCEN-02 | unit | `npm run test -- seedProjects` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 1 | SCEN-03, SCEN-04 | unit | `npm run test -- seedProjects` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 2 | SCEN-01 | unit | `npm run test -- seedProjects` | ❌ W0 | ⬜ pending |
| 07-03-02 | 03 | 2 | SCEN-03 | unit | `npm run test -- seedProjects` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] 4 new `it()` blocks in `src/data/__tests__/seedProjects.test.ts` — SCEN-01 through SCEN-04 assertions
- [ ] 2 existing Maori assertions relaxed in `seedProjects.test.ts` — accommodate SCEN-02
- [ ] `scoreProposed` imported in `seedProjects.test.ts` — needed for SCEN-01 test
- [ ] Median + stddev stats added to `generateSeedData.ts` distribution report — observe SCEN-04 during tuning

*All Wave 0 items are additions to existing files — no new test framework config needed.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
