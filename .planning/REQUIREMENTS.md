# Requirements: Uplift Compare

**Defined:** 2026-03-13
**Core Value:** Instant, accurate side-by-side comparison of how a production fares under both the existing and proposed uplift scoring systems

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Scoring Engine

- [x] **SCORE-01**: App encodes the existing uplift points test rules (85 max, 40 min to pass, A1 mandatory 3 points)
- [x] **SCORE-02**: App encodes the proposed uplift points test rules (70 max, 20 min for QNZPE <$100m, 30 min for QNZPE >=$100m)
- [x] **SCORE-03**: User enters raw production data (percentages, dollar amounts, personnel counts) and app auto-calculates points for both systems
- [x] **SCORE-04**: Shared input fields feed both scoring systems where criteria overlap
- [x] **SCORE-05**: App displays pass/fail verdict per test per project
- [x] **SCORE-06**: App displays score breakdown by section with per-criterion detail
- [x] **SCORE-07**: Mandatory criteria (A1 sustainability in existing test) are visually highlighted
<!-- SCORE-03, SCORE-04, SCORE-06, SCORE-07 type contracts defined in Plan 01 (ProjectInputs, ScoringResult, CriterionResult) -->

### Projects & Data

- [ ] **PROJ-01**: App ships with 50 seeded fictional projects (mix of films and TV, fake titles, no NZ references or real franchises)
- [ ] **PROJ-02**: Seed data distribution: half pass existing test, half fail; half over $100m QNZPE, all over $20m QNZPE
- [ ] **PROJ-03**: Seed data follows realism rules (all have A1, none have C3/C10, B1 rare, big budget = low qualifying persons, Section E rare/big budget only, most reach 80% on C2 especially smaller budgets)
- [ ] **PROJ-04**: User can create new projects via input form
- [ ] **PROJ-05**: Project detail screen shows side-by-side comparison with dropdown to switch between projects
- [ ] **PROJ-06**: Summary screen shows all projects with descriptions and pass/fail status for each test
- [ ] **PROJ-07**: User can filter and sort the project list (by pass/fail, type, budget)
- [ ] **PROJ-08**: Summary screen shows aggregate statistics (pass rates per test)
- [ ] **PROJ-09**: User can import project data from JSON/clipboard

### Export & Display

- [ ] **DISP-01**: User can export project data to Excel format
- [ ] **DISP-02**: App uses light theme with aesthetic, tidy design
- [ ] **DISP-03**: Visual pass/fail indicators (colour + text, not colour alone)
- [ ] **DISP-04**: Each criterion has tooltip/help text explaining the rule in plain English
- [ ] **DISP-05**: Score sections are collapsible/expandable

### Infrastructure

- [ ] **INFRA-01**: App deploys on Netlify as a static site
- [ ] **INFRA-02**: Data persists in browser localStorage

## v2 Requirements

### Scoring Enhancements

- **SCORE-08**: Score delta column showing difference between existing and proposed scores
- **SCORE-09**: "What changed" criterion highlighting showing where thresholds differ between tests

### Display Enhancements

- **DISP-06**: "Which test is harder for me" summary callout on detail view

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication | No multi-user need, localStorage sufficient |
| Backend/database | Netlify static hosting constraint |
| Sharing/collaboration | Excel export is the sharing mechanism |
| NZFC submission | Analysis tool only, not official submission |
| Mobile native app | Web responsive is sufficient |
| PDF export | Excel is what producers use for analysis |
| Real NZ names or real franchises | Legal risk, explicitly forbidden |
| More than two scoring systems | Scope is existing vs. proposed only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCORE-01 | Phase 1 | Complete |
| SCORE-02 | Phase 1 | Complete |
| SCORE-03 | Phase 1 | Complete |
| SCORE-04 | Phase 1 | Complete |
| SCORE-05 | Phase 1 | Complete |
| SCORE-06 | Phase 1 | Complete |
| SCORE-07 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Pending |
| PROJ-01 | Phase 2 | Pending |
| PROJ-02 | Phase 2 | Pending |
| PROJ-03 | Phase 2 | Pending |
| PROJ-04 | Phase 2 | Pending |
| INFRA-01 | Phase 2 | Pending |
| PROJ-05 | Phase 3 | Pending |
| PROJ-06 | Phase 3 | Pending |
| PROJ-07 | Phase 3 | Pending |
| PROJ-08 | Phase 3 | Pending |
| PROJ-09 | Phase 3 | Pending |
| DISP-02 | Phase 3 | Pending |
| DISP-03 | Phase 3 | Pending |
| DISP-04 | Phase 3 | Pending |
| DISP-05 | Phase 3 | Pending |
| DISP-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation*
