# Feature Landscape

**Domain:** Regulatory points-test scoring and comparison tool (NZ Screen Production Rebate 5% Uplift)
**Researched:** 2026-03-13
**Confidence:** HIGH for domain reasoning from first principles; MEDIUM for comparison-tool UX patterns (WebSearch verified against NN/G and LogRocket); LOW for existence of directly analogous tools (none found)

---

## Context

This is a two-system scoring comparator. Users enter raw production data once and the app
calculates pass/fail results under the existing and proposed Uplift points tests side by side.
The primary audience is industry stakeholders (producers, production companies, rebate consultants)
assessing the impact of a proposed regulatory change. There is no login, no backend, and no
real-money submission — this is an analysis and advocacy tool.

No directly comparable public tool was found. The closest analogues are:

- Film jurisdiction comparison tools (Entertainment Partners, Cast & Crew Multi-Jurisdiction)
  which compare incentive rates across states/countries rather than two versions of one test
- Immigration points calculators (e.g. NZ residence visa tools) — single-system, no side-by-side
- Tax eligibility wizards — linear pass/fail, no dual-system comparison

This means the feature landscape is informed by UX patterns from comparison tables, eligibility
calculators, and score breakdown tools rather than an identical domain.

---

## Table Stakes

Features users expect. Missing = tool feels broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Dual scoring engine: existing + proposed | Core value of the tool — without this it is just a single calculator | High | Two distinct rule sets, different section structures, different thresholds, different pass marks |
| Pass/fail verdict per test, per project | Users need a binary answer, not just a raw score | Low | Requires threshold logic: existing ≥40, proposed ≥20 (QNZPE <$100m) or ≥30 (QNZPE ≥$100m) |
| Score breakdown by section | Users must understand *why* they passed or failed, not just the total | Medium | Per-section subtotals displayed for both systems; criteria within each section itemised |
| Raw data input with auto-calculation | PROJECT.md specifies this — users enter percentages/amounts and points are derived | High | Shared inputs must feed both systems; mapping raw data to points requires encoding all criteria thresholds |
| Shared input fields across both tests | Where criteria overlap (e.g. VFX spend %, cast nationality %), a single input should feed both scorers | Medium | Requires careful analysis of which inputs are common vs. system-specific |
| Project list / summary view | 50 seeded projects plus user-created — users need to navigate between them | Medium | Summary screen showing all projects, pass/fail badges per test, project title, basic descriptor |
| Project detail view | Drilling into a specific project to see its full input data and score breakdown | Low | Standard detail/master pattern |
| Create new project | Users can model their own production | Medium | Form with all required input fields; validation required |
| Seeded fictional projects (50) | Without seed data the tool launches empty — useless for demonstrating impact | High | Seeding is one-time work but requires care: specific pass/fail distribution, budget distribution, criterion presence rules per PROJECT.md |
| Accurate rule encoding | Scoring must match the official documents exactly; wrong points = tool is actively harmful | High | Must be validated against source .docx files; any ambiguity needs to be surfaced |
| Visual pass/fail indicator | Badge, colour, icon — users need to see status at a glance without reading numbers | Low | Green/red or pass/fail label; do not rely on colour alone (accessibility) |
| Light theme, clean design | Specified in requirements; aesthetic credibility matters for stakeholder audience | Low | Design plugin handles most of this |
| Netlify static deployment | Hard requirement — no backend | Low | React + Vite produces static output; just a deploy config |

---

## Differentiators

Features that go beyond expectations. Not required for the tool to work, but add meaningful value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Export to Excel | Stakeholders need to share results, paste into reports, or use in further analysis | Medium | `xlsx` or `exceljs` library handles .xlsx generation client-side; no server needed; PROJECT.md explicitly requires this |
| Score delta column | Show the *difference* between existing and proposed scores for a project at a glance | Low | Derived from the two totals; highlights winners and losers of the change |
| "What changed" criterion highlighting | Flag criteria where the threshold has changed between tests (e.g. VFX from 50% to 30%) so users understand which inputs are driving the difference | Medium | Requires annotating the rule difference alongside the criterion display |
| Filter/sort project list | Filter by pass/fail (either test), production type (film/TV), budget tier — makes the 50-project dataset navigable | Medium | Client-side filtering on localStorage data; straightforward but needs UI |
| Seed data statistics panel | Show aggregate stats: "X of 50 projects pass the existing test, Y pass the proposed test" — makes the policy impact immediately visible | Low | Pure derived computation from the seed dataset |
| Criterion-level tooltip / help text | Each criterion row has a "?" that explains the rule in plain English | Medium | Reduces need to read source documents; especially useful for the proposed test which differs meaningfully |
| Import project from JSON/clipboard | Power users could copy data from another source or share a project URL/JSON with a colleague | High | Requires serialisation format design; not in scope per PROJECT.md but a natural extension |
| Section collapse / expand | Long scoring breakdowns become scannable if sections are collapsible | Low | Accordion pattern; reduces visual noise on the detail view |
| Highlight mandatory criteria | In the existing test, A1 (sustainability) is mandatory — show this distinctly so users understand why they fail even with high totals | Low | Visual treatment only; logic already needed for scoring |
| "Which test is harder for me" summary callout | A sentence at the top of the detail view: "This production scores X under the existing test (PASS) and Y under the proposed test (FAIL)" | Low | Purely presentational; data already computed |

---

## Anti-Features

Things to deliberately NOT build. Each one either violates the stated constraints or adds
complexity that undermines the tool's focused purpose.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User authentication / accounts | Out of scope (PROJECT.md); adds backend; no multi-user value here | localStorage is sufficient for single-browser usage |
| Backend / database | Netlify static hosting constraint; adds ops burden | localStorage covers all persistence needs |
| Sharing / collaboration | Out of scope; complex to implement correctly | Export to Excel is the sharing mechanism |
| Submission to NZFC | Explicitly out of scope — this is analysis only; impersonating a submission tool creates liability | Add a clear disclaimer that this is not an official NZFC tool |
| Mobile-native app | Out of scope; web responsive is sufficient for a stakeholder analysis tool | Responsive design handles tablets; phone use is not the primary use case |
| Real NZ production names or real franchise titles | Legal risk; PROJECT.md explicitly forbids this | Fictional titles only |
| More than two scoring systems | Scope creep; the tool is specifically existing vs. proposed | The 50-project dataset and UI are designed for exactly two columns |
| AI / NLP criterion interpretation | Massively over-engineered; criteria are well-defined and finite | Hard-code the rules from the source documents |
| Undo / revision history | No value for a tool this simple; localStorage has no natural branching model | Clear form + revert to seed is sufficient |
| PDF export | More complex than Excel; Excel is what producers actually use for analysis | Excel export satisfies the need |
| Offline PWA / service worker | Overkill for a static analysis tool; Netlify serves it fast | Plain static deployment |
| Real-time collaboration (websockets, etc.) | Out of scope; no backend | Export covers the "show someone else" workflow |

---

## Feature Dependencies

```
Dual scoring engine
  ├── Raw data input form (feeds both scorers)
  │     └── Shared input fields (one input, two consumers)
  ├── Pass/fail verdict (consumes engine output)
  ├── Score breakdown by section (consumes engine output)
  │     ├── Criterion-level tooltip (decorates breakdown)
  │     ├── Mandatory criterion highlighting (decorates breakdown)
  │     └── "What changed" highlighting (compares rule sets)
  └── Score delta column (compares the two totals)

Project list / summary view
  ├── Seeded fictional projects (populates list at launch)
  ├── Create new project → Raw data input form (reuses same form)
  ├── Pass/fail badges (consumes engine output per project)
  ├── Filter/sort (consumes project list)
  └── Seed data statistics panel (aggregates over project list)

Export to Excel
  └── Project data + score results (consumes engine output + inputs)
```

---

## MVP Recommendation

The tool is small enough that "MVP" is effectively the full feature set from PROJECT.md.
The following ordering minimises wasted work:

**Phase 1 — Core engine (no UI):**
1. Encode both rule sets as pure functions: `scoreExisting(inputs)`, `scoreProposed(inputs)`
2. Define the shared input schema (what raw fields are needed to compute all criteria)
3. Write unit tests against known pass/fail cases

**Phase 2 — Data layer:**
4. Design localStorage schema
5. Write 50 seeded projects; validate distribution against PROJECT.md rules
6. CRUD operations for projects

**Phase 3 — UI:**
7. Project list / summary view with pass/fail badges
8. Project detail view with side-by-side score breakdown
9. Input form for create/edit
10. Score delta column
11. Mandatory criterion highlighting (existing test A1)

**Phase 4 — Polish and export:**
12. Export to Excel
13. Filter/sort on project list
14. Criterion-level help text tooltips
15. Seed data statistics panel

**Defer (post-ship validation):**
- "What changed" criterion highlighting (useful but requires writing diff annotations for every criterion)
- Section collapse / expand (low complexity but adds interaction layer)
- Import from JSON (high complexity, unclear demand)

---

## Sources

- PROJECT.md — authoritative requirements and scoring rule descriptions for this project
- [Comparison Tables for Products, Services, and Features — NN/G](https://www.nngroup.com/articles/comparison-tables/) — comparison table UX patterns
- [How to design feature comparison tables that simplify decision-making — LogRocket](https://blog.logrocket.com/ux-design/ui-design-comparison-features/) — key UX pitfalls (information overload, mobile, visual hierarchy)
- [103 Comparison Tool Design Examples — Baymard](https://baymard.com/ecommerce-design-examples/39-comparison-tool) — usability research noting 38% of top sites have comparison tools but users have severe difficulties; informed anti-feature decisions
- [Accessing the 5% Uplift — NZFC](https://www.nzfilm.co.nz/incentives-co-productions/nzspr-international-productions/accessing-5-uplift) — confirms no existing official calculator tool found; NZFC provides guidance docs only
- [Implementing CSV Data Export in React — DEV Community](https://dev.to/graciesharma/implementing-csv-data-export-in-react-without-external-libraries-3030) — confirms Excel/CSV export is straightforward in React, LOW complexity
- [Entertainment Partners Multi-Jurisdiction Comparison Tool](https://www.ep.com/production-incentives/us/) — closest analogous domain tool found; does jurisdiction comparison not dual-system test comparison
