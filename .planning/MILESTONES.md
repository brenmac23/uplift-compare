# Milestones

## v1.1 Realistic Seed Data (Shipped: 2026-03-14)

**Phases completed:** 3 phases, 7 plans
**Stats:** 48 files changed, +10,343 / -3,043 lines, 10,926 LOC TypeScript, 275 tests
**Timeline:** 2026-03-14 (single day)
**Git range:** feat(05-01) → feat(07-02)

**Key accomplishments:**
- Deterministic seed generator with Mulberry32 PRNG — `npm run seed` produces identical output from fixed seed
- Three-tier field generation pipeline (Fundamentals → Correlations → Point-chasing) modelling how a line producer actually works through the uplift test
- Bimodal post-production, budget-inverse talent scoring, shooting/crew covariance, and BTL crew correlation across all 50 projects
- Score-gap greedy algorithm with soft ~50pt cap — Tier 3 fields chase ambition targets cheapest-first
- All 4 special scenarios verified: passes-existing-fails-proposed (SCEN-01), Maori activation (SCEN-02), ~60% pass rate (SCEN-03), soft score cap (SCEN-04)
- 82 creative fictional project names (50 films + 32 TV series) with no real NZ names or franchises

---

## v1.0 MVP (Shipped: 2026-03-13)

**Phases completed:** 4 phases, 13 plans
**Stats:** 134 files, 9,420 LOC TypeScript, 263 tests
**Timeline:** 2026-03-13 (single day)
**Git range:** feat(01-01) → feat(04-02)

**Key accomplishments:**
- Dual scoring engine encoding existing (85pt/33 criteria) and proposed (70pt/24 criteria) uplift tests as pure functions
- 50 seeded fictional projects with realistic distribution across budget tiers and pass/fail outcomes
- Full SPA with summary table (filters, aggregate stats), three-column detail screen with live scoring, and project creation/import
- Browser-side Excel export via SheetJS with complete scoring breakdowns
- Client-side password gate and localStorage persistence — deploys as static site on Netlify

---

