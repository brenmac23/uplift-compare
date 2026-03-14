---
phase: 6
slug: tiered-field-logic
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (already configured) |
| **Config file** | `vite.config.ts` (vitest inline config) |
| **Quick run command** | `npx vitest run src/data/__tests__/seedProjects.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/data/__tests__/seedProjects.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 0 | DIST-01, DIST-02, DIST-03, DIST-04, DIST-05 | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | TIER-01, DIST-05 | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | ✅ partial | ⬜ pending |
| 06-02-02 | 02 | 1 | TIER-02, DIST-01, DIST-03, DIST-04 | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | ✅ partial | ⬜ pending |
| 06-02-03 | 02 | 1 | TIER-03 | unit | `npx vitest run src/data/__tests__/seedProjects.test.ts` | ✅ partial | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/data/__tests__/seedProjects.test.ts` — add distribution assertions for DIST-01 through DIST-05:
  - DIST-01: All projects have picturePostPercent either <= 10 or >= 75; soundPostPercent same; at least 40% in high cluster
  - DIST-02: B8 and B9 are not coupled to B6/B7 cluster assignment
  - DIST-03: Every project: btlAdditionalCount >= btlKeyCount; if btlKeyCount === 0 then btlAdditionalCount === 0
  - DIST-04: Projects with shootingNZPercent < 75 have lower crewPercent >= 80 rate than projects with shootingNZPercent >= 90
  - DIST-05: Average atlCount for tentpole/large tier < average atlCount for small tier

*Existing tests cover: 50 projects, unique ids, sustainability plan, maori fields, studioLease count, Section E limits, crewPercent >= 80 rate — these remain unchanged.*

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
