# Uplift Compare

## What This Is

A web application that compares how screen productions score under the existing vs. proposed New Zealand Screen Production Rebate 5% Uplift points tests. Users enter production details (budget, personnel, activities) and the app calculates scores under both systems side by side, showing whether each project passes or fails each test. Ships with 50 seeded fictional projects and supports creating new ones.

## Core Value

Instant, accurate side-by-side comparison of how a production fares under both the existing and proposed uplift scoring systems — making the impact of the rule change tangible and concrete.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Side-by-side scoring engine for existing (85 max, 40 min pass) and proposed (70 max, 20/30 min pass based on QNZPE) uplift tests
- [ ] Input form where users enter raw production data (percentages, dollar amounts, personnel counts) and the app calculates points for both systems
- [ ] Minimum required input fields — shared inputs feed both scoring systems where criteria overlap
- [ ] Project detail screen with dropdown to switch between projects
- [ ] Summary screen showing all projects with descriptions and pass/fail status for each test
- [ ] 50 seeded fictional projects (mix of films and TV, fake titles only, no NZ references or real franchises)
- [ ] Seed data distribution: half pass existing test, half fail; half over $100m QNZPE, all over $20m QNZPE
- [ ] Seed data realism: all have A1 (existing), none have C3/C10 (existing), B1 rare, big budget = low qualifying persons, Section E rare and for big budgets, most projects reach 80% on C2 especially smaller ones
- [ ] Users can create new projects
- [ ] Export project data to Excel format
- [ ] Light theme with aesthetic, tidy design (using frontend design plugin)
- [ ] Deploys on Netlify (static site, no backend)
- [ ] Data stored in browser localStorage

### Out of Scope

- Backend/database — static site with localStorage only
- User authentication — no login needed
- Multi-user collaboration — single-browser usage
- Mobile-native app — web only (responsive is fine)
- Actual NZFC submission — this is a comparison/analysis tool only

## Context

The New Zealand Film Commission (NZFC) administers a 5% Uplift on the Screen Production Rebate. Productions must pass a points test to qualify. The government is proposing changes to this points test. This tool helps stakeholders understand how the rule changes would affect different types of productions.

**Existing test:** 85 max points, 40 minimum to pass (must include mandatory 3 points from Section A1 sustainability). Sections: A (Sustainability, 7pts), B (NZ Production Activity, 21pts), C (NZ Personnel, 31pts), D (Skills & Talent Development, 6pts), E (Innovation & Infrastructure, 8pts), F (Marketing & Showcasing NZ, 12pts).

**Proposed test:** 70 max points, 20 minimum to pass for QNZPE up to $100m, 30 minimum for QNZPE $100m+. No mandatory sustainability section. Sections restructured: A (NZ Production Activity, 20pts), B (NZ Personnel, 32pts), C (Skills & Talent Development, 6pts), D (Marketing & Showcasing NZ, 12pts).

Key differences: sustainability section removed as mandatory, thresholds changed for several criteria (e.g. VFX from 50/75/90% to 30/50/75%), tiered pass mark based on budget, associated content window extended from 3 to 5 years, cast threshold lowered (60%/80% tiers vs 80% only), crew points increased, new location announcement criterion, premiere restructured.

Both source documents (Existing and Proposed) are .docx files in the project root.

## Constraints

- **Tech stack**: React + Vite — modern SPA for Netlify deployment
- **Hosting**: Netlify — static files only, no server-side processing
- **Data persistence**: Browser localStorage — no backend database
- **Design**: Light theme, clean aesthetic using frontend design plugin

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite | Modern tooling, fast builds, strong ecosystem for forms/tables | — Pending |
| Browser localStorage | No backend needed for Netlify static deploy | — Pending |
| Raw data input with auto-calculation | More realistic scoring — users enter percentages/amounts, app calculates points | — Pending |
| Side-by-side comparison view | Best for direct visual comparison of two scoring systems | — Pending |

---
*Last updated: 2026-03-13 after initialization*
