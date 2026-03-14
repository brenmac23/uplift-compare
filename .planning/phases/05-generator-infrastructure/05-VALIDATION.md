---
phase: 5
slug: generator-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` (globals: true, environment: jsdom) |
| **Quick run command** | `npx vitest run src/data/__tests__/seedProjects.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/data/__tests__/seedProjects.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | GEN-01 | smoke | `npm run seed && cp src/data/seedProjects.ts /tmp/seed1.ts && npm run seed && diff /tmp/seed1.ts src/data/seedProjects.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GEN-02 | unit | `npx vitest run scripts/generator/__tests__/index.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GEN-03 | smoke | `npm run seed 2>&1 \| grep "Pass rate"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GEN-04 | integration | `npx vitest run src/data/__tests__/seedProjects.test.ts` | ✅ | ⬜ pending |
| TBD | TBD | TBD | NAME-01 | integration | `npx vitest run src/data/__tests__/seedProjects.test.ts` | ✅ (partial) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/generator/__tests__/index.test.ts` — unit tests for generateProject() and PRNG determinism (GEN-01, GEN-02)
- [ ] `scripts/` directory — does not exist yet, must be created
- [ ] tsx devDependency — `npm install --save-dev tsx` must run before any task executes the seed script

*Existing `src/data/__tests__/seedProjects.test.ts` covers GEN-04 and NAME-01 integration — 12 assertions already written.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Generated file compiles with app | GEN-04 | Full build validation | Run `npm run build` after seed generation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
