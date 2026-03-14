---
phase: 01
slug: scoring-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` — Wave 0 creates this |
| **Quick run command** | `npx vitest run src/scoring` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/scoring`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 0 | SCORE-01,02 | setup | `npx vitest run` | W0 | pending |
| TBD | 01 | 1 | SCORE-01 | unit | `npx vitest run src/scoring/__tests__/scoreExisting.test.ts` | W0 | pending |
| TBD | 01 | 1 | SCORE-02 | unit | `npx vitest run src/scoring/__tests__/scoreProposed.test.ts` | W0 | pending |
| TBD | 01 | 1 | SCORE-03,04 | unit | `npx vitest run src/scoring/__tests__/sharedInputs.test.ts` | W0 | pending |
| TBD | 01 | 1 | SCORE-05 | unit | included in scoreExisting/scoreProposed tests | W0 | pending |
| TBD | 01 | 1 | SCORE-06 | unit | included in scoreExisting/scoreProposed tests | W0 | pending |
| TBD | 01 | 1 | SCORE-07 | unit | `npx vitest run src/scoring/__tests__/scoreExisting.test.ts` | W0 | pending |
| TBD | 01 | 1 | INFRA-02 | smoke | `npx vitest run src/store/__tests__/useAppStore.test.ts` | W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration
- [ ] `package.json` with `"test": "vitest run"` script
- [ ] `npm install -D vitest @vitest/coverage-v8` — framework install
- [ ] `src/scoring/__tests__/scoreExisting.test.ts` — stubs for SCORE-01, SCORE-05, SCORE-06, SCORE-07
- [ ] `src/scoring/__tests__/scoreProposed.test.ts` — stubs for SCORE-02, SCORE-05, SCORE-06
- [ ] `src/scoring/__tests__/sharedInputs.test.ts` — stubs for SCORE-03, SCORE-04
- [ ] `src/store/__tests__/useAppStore.test.ts` — stubs for INFRA-02
- [ ] `.planning/phases/01-scoring-engine/SCORING_SPEC.md` — human-validated spec (pre-condition for all tests)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SCORING_SPEC.md accuracy vs .docx source documents | SCORE-01, SCORE-02 | Requires human reading of policy documents | Compare each criterion in SCORING_SPEC.md against the corresponding section in both .docx files |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
