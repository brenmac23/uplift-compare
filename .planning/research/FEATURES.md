# Feature Research

**Domain:** Probabilistic seed data generation for NZ screen production scoring tool
**Researched:** 2026-03-14
**Confidence:** HIGH (domain rules provided directly by NZ screen production expert; existing codebase read in full)

---

## Context

This is a subsequent-milestone research file for **v1.1 Realistic Seed Data**. v1.0 is shipped.
The focus is exclusively on what is needed to regenerate `src/data/seedProjects.ts` so the 50
seeded projects reflect how a line producer actually works through the NZ Uplift points test.

The existing `SEED_PROJECTS` array is hand-authored with uniform distributions and independent
field generation. The v1.1 generator will be a TypeScript script that produces 50 `Project`
objects conforming to the existing `ProjectInputs` interface, passing all existing tests in
`src/data/__tests__/seedProjects.test.ts`, and additionally passing new tests for the v1.1
domain rules.

The "users" for this feature set are: (1) the developer writing and running the generator, and
(2) the domain experts reviewing the committed output data for plausibility.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must exist for the seed data to be considered realistic. Missing any of these
produces data that a domain expert would immediately flag as implausible.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Three-tier decision order | A line producer works Fundamentals first, Less Fundamental second, Point-chasing third. Generating fields without this order produces implausible combinations — e.g. a project that chases sustainability A2/A3 but has low ATL count, or point-chases marketing without covering shooting %. | MEDIUM | Tier 1: A1, B2/B3, B4, C4, C5, C7, C9. Tier 2: B1, B5, B6-B9, C1, C2, C6, C8. Tier 3: A2/A3, D1/D2, D3/D4, E1-E3, F1-F4. |
| Budget-stratified talent scoring ($50m inflection) | Above ~$50m QNZPE, studios import ATL talent and lead cast from overseas; NZ local crew fills BTL. Below $50m, NZ talent is more prevalent across all levels. Treating all budgets identically makes high-budget projects unrealistically NZ-heavy in lead positions. | MEDIUM | `atlCount` and `hasLeadCast` skew lower for qnzpe >= $50m. `btlKeyCount` and `crewPercent` stay high regardless of budget. Inflection at $50m per domain expert. |
| Bimodal picture/sound post-production | Productions either do post in NZ (high %) or they do not (low/zero %). A uniform random distribution produces an implausible middle cluster at 40-60%. Picture and sound post are also correlated — if you post picture in NZ you almost always post sound in NZ too. | MEDIUM | `picturePostPercent` and `soundPostPercent`: generate as a correlated pair. Bimodal: ~70% of projects in 75-95% band, ~30% in 0-20% band. Avoid the 30-70% range entirely. |
| Non-bimodal VFX and concept/physical | VFX and concept/physical effects contracts are more fragmented and can be partially NZ-sourced. These do not follow the same bimodal pattern. | LOW | `vfxPercent` and `conceptPhysicalPercent` can range freely across 0-90%. Some projects have zero VFX (realistic for drama). |
| BTL additional count >= BTL key count | `btlAdditionalCount` is almost always >= `btlKeyCount`. The additional BTL pool is a superset of the key positions. Generating additional < key is structurally implausible. | LOW | Enforce: `btlAdditionalCount >= btlKeyCount` for every project. Both still capped at their respective scoring maximums. |
| Shooting/crew percent correlation | A project shooting < 75% of days in NZ has fewer NZ crew days, so the crew % of qualifying persons falls. Generating `crewPercent = 90` on a `shootingNZPercent = 60` project is implausible. Post-production is independent of shooting % (per domain expert rule 10). | MEDIUM | If `shootingNZPercent < 75`, `crewPercent` skews toward 60-82 rather than 82-95. Post-production fields remain independent. |
| ~60% pass existing test | The existing test (40pt threshold) should pass approximately 60% of generated projects. v1.0 targets ~50%. 60% matches domain expert expectation of who realistically applies for the uplift. | LOW | Validate via `scoreExisting()` after generation. Target 55-65% band (27-33 of 50 projects). Regenerate or post-process if outside this band. |
| Soft cap at ~50 points | Real producers stop optimising beyond ~50 points — there is no economic benefit beyond the 40pt pass threshold, and compliance costs increase. Very few projects should score 65+. | LOW | Tier 3 fields should be generated sparsely — not all passing projects max every optional category. |
| At least 1 passes-existing-fails-proposed scenario | The core purpose of the comparison tool is demonstrating that the proposed test changes who passes. Without at least one such project the tool does not illustrate the policy impact at all. | LOW | Validate post-generation. The most reliable guarantee is one deterministic project hand-constructed with appropriate inputs, then 49 probabilistic projects. |
| Māori criteria at ~1-2% frequency | C3 (Māori crew %) and C10 (lead cast Māori) are rare. Domain expert: approximately 1 project in 50. v1.0 has both always false. | LOW | 1 project (2%) should have `maoriCrewPercent >= 10` and `hasLeadCastMaori = true` on the same project. The remaining 49 stay false. |
| Creative project names | Current names are generic placeholders. Names should feel like real international co-productions shot in NZ — evocative, genre-diverse, with no real NZ people or real franchise IPs (per PROJECT.md constraint). | LOW | A curated name list of 60+ options drawn without replacement. No procedural generation needed. Purely cosmetic — no scoring impact. |
| All existing validator tests remain green | `src/data/__tests__/seedProjects.test.ts` must pass without modification. Constraints: 50 projects, unique `seed-NNN` IDs, `isSeeded=true`, `hasSustainabilityPlan=true`, budget ranges, production type mix, studio lease count (3-5), Section E budget restriction, crew percent floor (40+ projects at >= 80%). | LOW | Non-negotiable. The generator must satisfy all existing constraints before adding new ones. |

### Differentiators (Competitive Advantage)

Features that improve quality beyond "passes the tests" — making the data more convincing to a
domain expert reviewing the full 50-project dataset.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Deterministic output via seeded PRNG | Using a fixed-seed pseudo-random number generator means the same seed always produces the same 50 projects. Domain experts can re-run the generator; diffs are clean; CI output is reproducible. | LOW | JavaScript `Math.random()` is not seedable. A ~10-line mulberry32 or xorshift PRNG seeded with a fixed integer constant is sufficient. No npm dependency required. |
| hasPreviousQNZPE / hasAssociatedContent correlation | A franchise sequel (`hasAssociatedContent`) is more likely to also have prior NZ production history (`hasPreviousQNZPE`). Generating these independently produces implausible combinations. | LOW | If `hasAssociatedContent=true`, weight `hasPreviousQNZPE=true` at ~80%. If false, weight at ~40%. |
| Budget-realistic QNZPE distribution (multi-modal) | Rather than a hard 25/25 split at $100m, generate QNZPE from a realistic distribution: a cluster of smaller productions ($20m-$80m), a mid-budget cluster ($80m-$180m), and a handful of large tentpoles ($180m-$350m). | LOW | Produces a more natural histogram while still satisfying the existing test constraint (20-30 projects >= $100m). |
| Regional filming correlated with shooting % | A project barely reaching 75% NZ shooting is unlikely to have significant regional filming. High NZ shooting % projects are more plausibly spread across regions. | LOW | If `shootingNZPercent < 75`, `regionalPercent` rarely exceeds 15%. If `shootingNZPercent >= 90`, `regionalPercent` can range 10-40%. |
| Studio lease budget-gated at $100m | `hasStudioLease` is rare (3-5 of 50) and only plausible for large productions requiring dedicated stage facilities. | LOW | Only generate `hasStudioLease=true` for projects with `qnzpe >= $100m`. Strengthens the existing count constraint. |
| Generator validation report (stdout) | After generation, the script logs a distribution summary: pass rates for both tests, budget histogram, bimodal post distribution, tier-3 adoption rates, Māori criteria count. Lets the developer verify plausibility without running the full test suite. | LOW | ~20 lines of post-generation logging. High developer value for tuning generation parameters. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Non-deterministic generation on every run | "More varied" data with no need to commit a fixed output | Non-deterministic output means `seedProjects.ts` changes every time the script runs. Committed diffs become noise. CI output varies. Domain expert review of the committed file becomes meaningless. | Seeded PRNG with a fixed integer seed. To get different output, change the seed constant — the change is explicit and reviewable. |
| Storing computed scores in the seed data | "Avoid recomputing 50 projects on every load" | The existing architecture derives scores from inputs at render time and explicitly does not store them. Scores in seed data would silently diverge from engine output if scoring rules change. This is the primary anti-pattern from the original architecture research. | Keep scores computed from inputs. 50 projects × 2 scoring functions runs in microseconds on any modern device. |
| External faker/chance/Faker.js dependency | "Easy realistic names and numeric values" | Adds a dev dependency to a one-time generation task. The output is a static file committed to the repo — the dependency only runs during authoring and does not need maintenance. Faker's naming APIs do not map to NZ screen production naming conventions anyway. | Hand-curate a 60+ name list. Implement PRNG inline (~10 lines). Zero dependencies. |
| UI controls to adjust generation parameters | "Let stakeholders tune the distribution interactively" | Seed data is a static file consumed by the store. Interactive generation requires UI overlay, state management, and regeneration plumbing — significant scope for something that is purely a developer authoring concern. | If distribution needs changing, the developer edits generator constants and re-runs the script. One-time authoring workflow, not user-facing. |
| Procedural project name generation | "Unlimited unique names without a hand-curated list" | Combinatorial generation (adjective + noun + subtitle) produces names that feel mechanical and generic. Real production names carry genre signals and cultural resonance that cannot be derived from word lists. | A curated list of 60-70 hand-chosen names drawn without replacement. Can be extended trivially if more than 50 seeds are ever needed. |
| Per-criterion probability tables in JSON/YAML config | "Easier to tune without touching TypeScript" | Config files add an indirection layer. For a one-time generation script targeting a static file, inline constants are simpler, more readable, and easier for a reviewer to follow. | Inline probability constants with clear comments, grouped by tier so the three-tier logic is visually obvious in the code. |

---

## Feature Dependencies

```
Seeded PRNG (foundation)
    └──required by──> Three-tier decision order
                          └──required by──> Budget-stratified talent ($50m)
                          └──required by──> Bimodal picture/sound post
                          └──required by──> Shooting/crew correlation
                          └──required by──> BTL additional >= BTL key
                          └──required by──> Regional/shooting correlation (differentiator)

Three-tier decision order
    └──required by──> Soft cap at ~50 points
    └──required by──> ~60% pass existing test

Budget-stratified talent
    └──contributes to──> passes-existing-fails-proposed scenario
                         (high existing NZ-talent score + imported ATL = lower proposed score
                          under the new proposed test weighting)

All numeric generation features
    └──validate against──> scoreExisting() [existing engine]
    └──validate against──> scoreProposed() [existing engine]
                               └──must produce──> passes-existing-fails-proposed (1+ projects)
                               └──must produce──> ~60% pass existing (55-65%)
                               └──must produce──> Māori criteria 1 project

hasPreviousQNZPE / hasAssociatedContent correlation (differentiator)
    └──enhances──> Three-tier decision order (Tier 1 historical fields)

Generator validation report
    └──observes──> All generation features (no production dependency)

Creative project names
    └──independent──> All numeric generation (drawn after all inputs are set)
```

### Dependency Notes

- **Seeded PRNG must be implemented first.** Every probabilistic choice must flow through it. All other generation features depend on determinism.
- **Tier evaluation is sequential, not parallel.** Tier 1 fields must be resolved before Tier 2 can reference them. For example, `crewPercent` (Tier 2) needs `shootingNZPercent` (Tier 1) to apply the correlation correctly.
- **Score validation is post-generation.** `scoreExisting()` and `scoreProposed()` run on completed `ProjectInputs` objects. If distribution targets are missed, the generator may need to retry or post-process specific projects.
- **The passes-existing-fails-proposed scenario is easiest to guarantee with one deterministic project.** Constructing one project explicitly and generating 49 probabilistically avoids the risk of the scenario being missed by chance.
- **Creative names are resolved last.** They are drawn from a fixed list without replacement after all inputs are finalized — no dependency on any numeric field.

---

## MVP Definition

### Launch With (v1.1)

All items below are required for the milestone. The output is a committed `seedProjects.ts`
replacing the current hand-authored file.

- [x] Seeded PRNG implementation — required for deterministic, reviewable output
- [x] Three-tier decision order — required for domain plausibility
- [x] Budget-stratified talent scoring ($50m inflection) — required (current data treats all budgets identically)
- [x] Bimodal picture/sound post-production — required (current data has uniform mid-range values)
- [x] BTL additional >= BTL key enforcement — required (current data is inconsistent)
- [x] Shooting/crew percent correlation — required (current data generates these independently)
- [x] ~60% pass existing test (was ~50%) — required per milestone goal
- [x] Soft cap at ~50 points — required (current data has many projects clustered near maximum)
- [x] At least 1 passes-existing-fails-proposed scenario — required (core tool purpose)
- [x] Māori criteria at ~1-2% (1 project) — required (always false in v1.0)
- [x] Creative project names — required (explicitly listed in PROJECT.md v1.1 milestone target)
- [x] All existing `seedProjects.test.ts` tests remain green — non-negotiable

### Add After Validation (v1.x)

Add these once v1.1 P1 items are complete and a domain expert has reviewed the output.

- [ ] hasPreviousQNZPE / hasAssociatedContent correlation — add if reviewer flags implausible combinations
- [ ] Budget-realistic QNZPE distribution (multi-modal) — add if the 25/25 split looks artificial in review
- [ ] Regional filming / shooting % correlation — add if reviewer surfaces obvious implausibility
- [ ] Studio lease budget gate (>= $100m only) — add if reviewer flags small-budget studio lease projects
- [ ] Generator validation report (stdout) — add to ease future parameter tuning

### Future Consideration (v2+)

- [ ] More than 50 seed projects — only if the tool expands to a larger dataset
- [ ] Seed data parameterised by jurisdiction or year — out of scope (tool is NZ-specific and current)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Seeded PRNG | HIGH | LOW | P1 |
| Three-tier decision order | HIGH | MEDIUM | P1 |
| Budget-stratified talent ($50m inflection) | HIGH | MEDIUM | P1 |
| Bimodal picture/sound post-production | HIGH | MEDIUM | P1 |
| BTL additional >= BTL key | MEDIUM | LOW | P1 |
| Shooting/crew correlation | MEDIUM | LOW | P1 |
| ~60% pass existing test | HIGH | LOW | P1 |
| Soft cap ~50 points | MEDIUM | LOW | P1 |
| passes-existing-fails-proposed scenario | HIGH | LOW | P1 |
| Māori criteria at ~1-2% | MEDIUM | LOW | P1 |
| Creative project names | MEDIUM | LOW | P1 |
| All existing tests remain green | HIGH | LOW | P1 |
| hasPreviousQNZPE / hasAssociatedContent correlation | LOW | LOW | P2 |
| Budget-realistic QNZPE distribution (multi-modal) | LOW | LOW | P2 |
| Regional / shooting % correlation | LOW | LOW | P2 |
| Studio lease budget gate | LOW | LOW | P2 |
| Generator validation report (stdout) | MEDIUM | LOW | P2 |

**Priority key:**
- P1: Must have for v1.1 — blocks milestone completion
- P2: Should have — add after P1 is committed and reviewed
- P3: Nice to have — future consideration

---

## Criterion-by-Criterion Generation Reference

Direct per-field notes for the implementation phase. Arranged by tier.

### Tier 1 — Fundamentals (Fixed / Near-Fixed)

| Field | Generation Rule |
|-------|----------------|
| `hasSustainabilityPlan` | Always `true`. Mandatory in existing test. No realistic applicant omits this. |
| `hasPreviousQNZPE` | ~45% true overall. If `hasAssociatedContent=true`, weight to ~80% true. |
| `hasAssociatedContent` | ~30% true. Sequels and franchise entries are a minority of productions. |
| `shootingNZPercent` | Tiered distribution: ~60% of projects at 90%+ (committed NZ shoot), ~25% at 75-89%, ~15% below 75 (partial or co-productions). |
| `atlCount` | Budget-gated. qnzpe < $50m → mostly 2-3. qnzpe >= $50m → mostly 1-2 (imported stars reduce NZ ATL count). Range 0-3. |
| `btlKeyCount` | Mostly 3-4 regardless of budget (NZ key crew is available across all budget tiers). |
| `hasLeadCast` | Budget-gated. qnzpe < $50m → ~85% true. qnzpe >= $50m → ~55% true (imported leads are common above inflection point). |
| `castingLevel` | ~50% 'director', ~25% 'associate', ~25% 'none'. Independent of budget. |

### Tier 2 — Less Fundamental

| Field | Generation Rule |
|-------|----------------|
| `hasStudioLease` | ~8% true (4 of 50). Only for projects with qnzpe >= $100m. Very rare. |
| `regionalPercent` | Correlated with `shootingNZPercent`. Shooting < 75 → 0-15%. Shooting >= 75 → 0-40% (with 25%+ being the scoring threshold). |
| `picturePostPercent` | Bimodal pair with `soundPostPercent`. ~70% of projects: 75-95%. ~30%: 0-20%. Do not generate 30-70%. |
| `soundPostPercent` | Same bimodal pair. If `picturePostPercent >= 75`, then `soundPostPercent >= 75` (small variance ±5% allowed). |
| `vfxPercent` | Uniform random 0-90%. Some productions have zero VFX (realistic for drama). Scoring tiers: 50% = 1pt, 75% = 2pts, 90% = 3pts (existing). |
| `conceptPhysicalPercent` | Uniform random 0-90%. More variable than picture/sound. |
| `castPercent` | ~70% at 80%+ (most casts qualify). ~30% below 80% (international co-productions). |
| `crewPercent` | Correlated with `shootingNZPercent`. Shooting < 75 → 60-82%. Shooting >= 75 → 80-95%. Post-production is independent. |
| `btlAdditionalCount` | Always >= `btlKeyCount`. Typically btlKeyCount to btlKeyCount + 6. Range roughly 4-12. |
| `supportingCastCount` | ~60% at 2-3, ~30% at 1, ~10% at 0. Independent of budget. |
| `maoriCrewPercent` | 0 for 49 projects. One designated project: 10-15%. |
| `hasLeadCastMaori` | false for 49 projects. Same single project as Māori crew: true. |

### Tier 3 — Point-Chasing (Sparse, Probabilistic)

| Field | Generation Rule |
|-------|----------------|
| `hasSustainabilityOfficer` | ~55% true. A2 is an additional compliance cost — not all productions bother. |
| `hasCarbonReview` | ~40% true. Higher third-party cost than officer appointment; lower uptake. |
| `hasMasterclass` | ~50% true. Discretionary effort. |
| `hasIndustrySeminars` | ~50% true. Proposed C1 only. Discretionary. |
| `hasEdSeminars` | ~60% true. Slightly more common — lower burden than masterclass/seminars. |
| `attachmentCount` | ~55% of projects provide enough placements to qualify. Count varies by QNZPE band threshold (>$100m requires more). |
| `internshipCount` | ~45% of projects provide enough to qualify. Count varies by QNZPE band (3 bands: <$50m, $50m-$150m, >$150m). |
| `hasKnowledgeTransfer` | ~15% true. Only on qnzpe >= $100m projects (Section E budget gate). Rare commitment. |
| `commercialAgreementPercent` | ~10% > 0. Only on qnzpe >= $100m. Represents a commercial R&D agreement. |
| `infrastructureInvestment` | ~10% > 0. Only on qnzpe >= $100m. Combined with above: max 8 Section E active projects across the 50. |
| `premiereType` | ~30% 'world', ~30% 'nz', ~40% 'none'. (Existing test only.) |
| `hasNZPremiere` | ~45% true. (Proposed test D1 part 1 only, independent from `premiereType`.) |
| `hasIntlPromotion` | ~35% true. (Proposed test D1 part 2 only.) |
| `hasFilmMarketing` | ~35% true. Partnership with NZFC required — selective. |
| `hasTourismMarketing` | ~25% true. (Existing F3 only.) Rare high-cost partnership. |
| `hasTourismPartnership` | ~25% true. High-value Tourism NZ partnership. Both tests. |
| `hasLocationAnnouncement` | ~40% true. (Proposed D3 only.) Lower bar than marketing partnerships. |

---

## Validation Test Extensions

New test cases to add to `src/data/__tests__/seedProjects.test.ts` as part of v1.1. These enforce
the domain rules that the v1.1 generator introduces.

| Test | What It Checks |
|------|---------------|
| `~60% pass existing (55-65%)` | `scoreExisting().passed` count between 27 and 33 of 50 |
| `at least 1 passes-existing-fails-proposed` | At least one project where existing passes and proposed fails |
| `exactly 1 project has Māori criteria` | `maoriCrewPercent >= 10` and `hasLeadCastMaori === true` on the same project |
| `btlAdditionalCount >= btlKeyCount for all` | Enforce the BTL correlation for every project |
| `no project has picture or sound post in 30-70%` | Validate the bimodal gap — no middle-cluster values |
| `picture and sound post are correlated` | If `picturePostPercent >= 75`, then `soundPostPercent >= 75`; and vice versa |
| `low shooting implies lower crew %` | If `shootingNZPercent < 75`, then `crewPercent < 88` |
| `hasStudioLease only on qnzpe >= $100m` | No small-budget project has studio lease (strengthens existing count test) |
| `no project scores above 65 on existing test` | Soft-cap check; very few should approach the 85pt maximum |

---

## Sources

- `src/data/seedProjects.ts` — current v1.0 seed data, hand-authored, read in full
- `src/data/__tests__/seedProjects.test.ts` — existing validator tests, all constraints read
- `src/scoring/types.ts` — `ProjectInputs` interface, all fields read field-by-field
- `src/scoring/scoreExisting.ts` — existing scoring logic, read in full
- `.planning/PROJECT.md` — v1.1 milestone goal and out-of-scope constraints
- `.planning/research/SUMMARY.md` — v1.0 architecture and pitfall context
- Domain expert (NZ screen production) — all ten domain rules provided in milestone context

---

## Appendix: v1.0 Feature Landscape (Pre-existing)

The following features were researched and implemented in v1.0. They are included for reference
but are not in scope for the v1.1 milestone.

**Table stakes (all shipped):** Dual scoring engine, pass/fail verdict, score breakdown by section,
shared input form, project list/summary view, project detail view, create/import project, 50 seeded
projects, accurate rule encoding, visual pass/fail indicator, light theme, Netlify deployment,
password gate, criterion tooltips, collapsible sections, Excel export, filter/sort, statistics panel.

See `git log` for v1.0 completion history.

---
*Feature research for: v1.1 Realistic Seed Data Generation*
*Researched: 2026-03-14*
