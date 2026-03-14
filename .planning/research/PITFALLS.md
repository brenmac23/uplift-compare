# Pitfalls Research

**Domain:** Realistic probabilistic seed data generation for an existing scoring/comparison system
**Researched:** 2026-03-14
**Confidence:** HIGH — derived directly from the existing codebase, test suite, and scoring engine; no novel external dependencies

---

## Critical Pitfalls

---

### Pitfall 1: BTL Additional Count Uncorrelated With BTL Key Count

**What goes wrong:** `btlAdditionalCount` is generated independently of `btlKeyCount`. A project ends up with 8 additional BTL crew but only 1 key BTL crew. In reality a production would never chase additional crew points without first saturating key crew positions — key BTL roles (DOP, Editor, VFX Supervisor, etc.) are filled first, and additional crew follows from the same pool. The generated data looks implausible to any producer reviewing it.

**Why it happens:** Each field is assigned a random value in its own range without awareness of the relationship to adjacent fields. The generator treats `btlKeyCount` and `btlAdditionalCount` as independent draws.

**How to avoid:** Generate in dependency order. Assign `btlKeyCount` first (0-4, weighted toward 4 for larger budgets). Only then assign `btlAdditionalCount`, using `btlKeyCount` as a floor signal: if `btlKeyCount < 3`, keep `btlAdditionalCount` low (0-4); if `btlKeyCount === 4`, allow `btlAdditionalCount` up to 8. The scoring system caps additional at 8 positions for 4pts, so values above 8 are wasted — cap the generator at 8.

**Warning signs:**
- Any project where `btlAdditionalCount > btlKeyCount * 2` and `btlKeyCount < 3`
- btlAdditionalCount values generated from an independent uniform draw

**Phase to address:** Phase 1 (generation logic). Correlation must be built into the initial generator design, not patched after data is produced.

---

### Pitfall 2: Post-Production Fields All Correlated Together — Missing Bimodal Reality

**What goes wrong:** `picturePostPercent`, `soundPostPercent`, `vfxPercent`, and `conceptPhysicalPercent` are all assigned similar values — all high or all low — because the generator uses a single budget-correlated draw and applies it to all four. Real productions vary: picture and sound post almost always go together and tend to be high (a production doing NZ post-production does both), while VFX and concept/physical effects are project-type specific. A drama series might have high picture/sound but near-zero VFX. A blockbuster has high VFX but might outsource concept design. The bimodal distribution requirement (some high, some low) collapses into a uniform band.

**Why it happens:** It seems natural to say "if a production invests in NZ post-production, it invests in all aspects." The generator copies one value to all four fields or adds small noise around a single base.

**How to avoid:** Treat the four fields in two independent groups:
- **Group 1 (coupled):** `picturePostPercent` and `soundPostPercent` — draw a single base value and apply it to both with ±5% jitter. These fields should be bimodal: ~60% of projects in the 75-90% range, ~30% in 40-60%, ~10% below 40%.
- **Group 2 (independent):** `vfxPercent` and `conceptPhysicalPercent` — draw independently. VFX should be bimodal (either heavy VFX production or not). Concept/physical effects should be random within a 20-80% range regardless of other post fields.

**Warning signs:**
- All four post-production fields within 10% of each other for most projects
- No projects with high picture/sound but low VFX
- VFX distribution is flat (uniform) rather than bimodal

**Phase to address:** Phase 1 (generation logic).

---

### Pitfall 3: Score Soft Cap Implemented as Hard Rejection — Projects Cluster at 49-51

**What goes wrong:** The soft ~50pt cap is implemented by regenerating a project if its existing score exceeds 50. Because the scoring space above 40 is wide, the generator produces many projects in the 50-70 range, and rejects them until it lands one at or below 50. The result: many projects in the 48-50 range, a cliff at 51, and zero projects above 55. This looks artificial — a real population has a smooth tail above 50, just thinner.

**Why it happens:** "Soft cap" is interpreted as a hard ceiling. The rejection-sampling loop discards projects scoring above a threshold, creating a discrete cliff in the distribution.

**How to avoid:** Model the cap as a probabilistic preference, not a constraint. Generate the full project first. Then apply a probability modifier: if `existingScore > 50`, accept the project with probability `max(0.1, 1 - (existingScore - 50) * 0.15)`. This means scores of 51 have ~85% acceptance, 55 have ~25% acceptance, 60 have ~10% acceptance. The distribution tapers naturally. Alternatively: generate inputs using a tiered approach where "point-chasing" behaviours (tourism partnership, multiple marketing commitments, all Section E fields) have low base probability — this naturally limits scores without needing post-hoc rejection.

**Warning signs:**
- Histogram of existing scores showing a sharp cliff at 50 or 51
- Score range of 40-55 for all passing projects, no scores 56+
- Generator using a hard `if score > 50, regenerate` loop

**Phase to address:** Phase 1 (generation algorithm design).

---

### Pitfall 4: Pass Rate Targeting Through Post-Hoc Score Manipulation

**What goes wrong:** After generating all 50 projects, the pass rate is 68% (34/50) instead of the target ~60%. To fix it, the generator randomly flips `hasSustainabilityPlan` to false on some projects to fail them, or subtracts points from shootingNZPercent to push them below threshold. This produces projects with internally inconsistent inputs: high crewPercent and full ATL crew (signs of a serious production) but no sustainability plan.

**Why it happens:** The target pass rate is treated as a post-hoc constraint to satisfy, not a structural outcome to engineer. The generator produces inputs independently, scores them, and then manipulates individual fields to hit the number.

**How to avoid:** Design the generator so that pass rate emerges from input distributions, not from post-hoc adjustment. Specifically: assign the "fail mode" of a project before generating inputs. Roughly 40% of projects should be seeded as "low engagement" profiles — projects with low ATL counts, minimal post-production, low shooting percentage. These naturally score below 40 without manipulation. The remaining 60% are "engaged" profiles that naturally score 40+. This is how real-world production decisions work: some productions genuinely under-invest in NZ activity.

**Warning signs:**
- Generator modifying already-generated fields to adjust final score
- Fails concentrated on fields that "look least noticeable" (hasCarbonReview, hasMasterclass) rather than distributed across all failure modes
- All failing projects failing by the same mechanism (e.g. all fail on sustainability, or all fail on crew percentage)

**Phase to address:** Phase 1 (generator architecture — profile-based generation, not adjustment-based).

---

### Pitfall 5: Passes-Existing-Fails-Proposed Scenario Never Occurs Naturally

**What goes wrong:** The generation produces 50 projects, none of which passes the existing test but fails the proposed test. This scenario — which is the whole analytical point of the v1.1 milestone — requires a specific pattern: a project strong in Section E (Innovation/Infrastructure, existing only), Section A (sustainability bonus under existing), or Section F legacy marketing criteria that do not carry over to the proposed system. The generator does not model the point-value differences between systems, so it never produces this combination.

**Why it happens:** The generator models "good production" holistically without understanding that the two scoring systems reward different criteria. Section E (8pts max, existing only) has no equivalent in proposed. A project banking 6-7 points from Section E can pass existing (40pt threshold) while accumulating only 20-25 points under proposed (where those criteria don't exist), potentially failing the 30pt threshold for high-QNZPE productions.

**How to avoid:** Explicitly design one or two "Section E heavy" project profiles. These are large-budget productions ($100m+) that invest in infrastructure and knowledge transfer (E1-E3) and rely on those points to pass existing, but score only on shared criteria for proposed. Verify via `scoreExisting(inputs).passed && !scoreProposed(inputs).passed` after generation. If none occur naturally, force one using this profile structure — but the force should be an explicitly modelled project type, not a post-hoc field tweak.

**Warning signs:**
- `scoreExisting(p).passed && !scoreProposed(p).passed` is false for all 50 seed projects
- Section E fields (`hasKnowledgeTransfer`, `commercialAgreementPercent`, `infrastructureInvestment`) always zero or always maximum with no middle ground
- No audit of proposed scores during generation — only existing scores are checked

**Phase to address:** Phase 1 (generation logic — include Section-E-heavy profile type). Verify in Phase 2 (testing).

---

### Pitfall 6: Existing Test Distribution Assertions Broken by New Data

**What goes wrong:** The existing `seedProjects.test.ts` has hard assertions: 20-30 passing existing test, at least 40 projects with `crewPercent >= 80`, 3-5 with `hasStudioLease`, at most 8 with Section E active, 5+ borderline (38-42pts), QNZPE >= $20m for all. The new generation logic produces data satisfying the target requirements but violating one of these existing constraints — for example, 19 passing instead of 20, or only 38 projects with high crew percent. The test suite fails.

**Why it happens:** The v1.1 requirements add new constraints (60% pass rate, bimodal post-production, soft cap) without a complete accounting of how they interact with the existing test assertions. The new requirements are treated as additive; the existing assertions are treated as background. In practice they compete: the ~60% pass rate target (30/50) sits at the top of the existing test's 20-30 passing window. If the new bimodal distributions pull projects into lower score bands, fewer than 20 may pass.

**How to avoid:** Before writing the new generator, compile a complete constraint matrix — every assertion in `seedProjects.test.ts` alongside every v1.1 requirement. Identify conflicts. Specifically: the existing test says 20-30 pass existing; the v1.1 requirement says ~60%. 30/50 = 60% — this is the exact top of the range. Generate to hit 28-30 passing to stay safely within bounds. The borderline requirement (5+ in 38-42pts range) must also be preserved. After generation, run `npm test` before considering the task done.

**Warning signs:**
- Working from the v1.1 requirements document alone without re-reading `seedProjects.test.ts`
- Any test failure on `seedProjects.test.ts` after regeneration

**Phase to address:** Phase 1 planning — produce the constraint matrix before writing any generation code. Phase 2 verification — run full test suite before committing.

---

### Pitfall 7: Determinism Not Decided — Seeds Break on Re-Run

**What goes wrong:** The generator uses `Math.random()` without a seeded PRNG. Every time the generation script runs, it produces different data. The test suite passes Monday, fails Wednesday on the same code. Screenshots in documentation show different project names each time. The `createdAt` timestamps drift. The `id` values (seed-001 through seed-050) may be assigned in different orders, breaking any tests that reference specific project data by ID.

**Why it happens:** `Math.random()` is the path of least resistance. The generator is written for correctness first, determinism is treated as "we'll add that later." By the time the output looks right, re-seeding the PRNG feels like extra complexity.

**How to avoid:** Make the generation deterministic from the start using a seeded PRNG — a simple mulberry32 or sfc32 implementation (10 lines of JavaScript, no dependency needed). Use a fixed seed constant (e.g. `42`). This means every run of the generation script produces identical output. The output TypeScript file is stable and can be committed with a known hash. The test suite tests against a known-stable dataset. If the 50 projects need to be regenerated (e.g. requirements change), bump the seed constant, not the algorithm, to avoid introducing drift accidentally.

**Warning signs:**
- `Math.random()` anywhere in the generation script
- Test output for `seedProjects.test.ts` varying between runs
- No seed constant documented in the generator

**Phase to address:** Phase 1 (generator foundation) — decide determinism strategy before writing any random draws.

---

### Pitfall 8: shootingNZPercent and crewPercent Uncorrelated

**What goes wrong:** A project is generated with `shootingNZPercent = 20` (only 20% of principal photography in NZ) but `crewPercent = 92` (92% NZ crew). This is implausible — productions with minimal NZ shoot days do not employ 92% NZ crew. The generated data reveals the generator's independence assumption to any producer reviewing the dataset.

**Why it happens:** `shootingNZPercent` and `crewPercent` are assigned in separate sections of the generator (Section B and Section C respectively), with no cross-section dependency tracking. Each section looks internally plausible, but the combination is not.

**How to avoid:** Establish `shootingNZPercent` as a primary signal in the generator's first pass. Use it to set a baseline expectation for crew and cast percentages: if `shootingNZPercent < 50`, draw `crewPercent` from a lower range (60-75%) and `castPercent` from a lower range (70-80%). If `shootingNZPercent >= 75`, allow `crewPercent` in the 80-95% range. The test constraint `crewPercent >= 80 for at least 40 projects` must be preserved — so most projects need high shooting NZ percentages by design.

**Warning signs:**
- Projects with `shootingNZPercent < 60` and `crewPercent > 85`
- `crewPercent` values that do not co-vary with `shootingNZPercent` in any visible pattern

**Phase to address:** Phase 1 (generation logic).

---

### Pitfall 9: Project Names Accidentally Use Real Titles or Trademarks

**What goes wrong:** The name generator produces "Shadow Protocol" — which is a real NZ production. Or it produces "Glitch" — which is a Netflix series. Or it produces names that sound like they could be real NZ franchises ("The Dark Tower NZ", "Pacific Protocol"). The PROJECT.md explicitly forbids real NZ names or real franchises for legal risk reasons.

**Why it happens:** Generic thriller/sci-fi/drama vocabulary (Shadow, Protocol, Echo, Void, Crimson, Horizon) overlaps heavily with real titles. With 50 names to generate, probability of collision is non-trivial. The current v1.0 seed data already uses names like "Shattered Horizon" and "The Ashen Protocol" that walk close to genre conventions.

**How to avoid:** Build a name generation system using combinatorial structures that are demonstrably fictional: two-word combinations from curated word lists (abstract nouns + geological features, colour terms + theoretical concepts, verb forms + celestial objects). Before committing the final 50 names, run each through a web search (or note in a comment that it was manually checked). Avoid: "The [Adjective] Protocol", "Operation [Noun]", "[Colour] [Thing]" — these patterns produce too many real-title collisions. Preferred: three-word combinations that sound cinematic but specific enough to be unique.

**Warning signs:**
- Any project name matching a real film or TV title (check against IMDB)
- Names using "Protocol", "Shadow", "Ghost", "Signal" without other distinguishing words
- All 50 names following the same two-word pattern

**Phase to address:** Phase 1 (name generation) with a manual review step before committing.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hard-code 50 project objects as TypeScript literal | No generation script needed | Cannot be regenerated; constraints are invisible; next-milestone updates require touching 50 objects manually | Never — a generation script is essential for a v1.1 milestone |
| Use `Math.random()` without seed | Simple to write | Non-deterministic test failures; screenshots drift; impossible to reproduce bugs | Never for static seed data |
| Score projects after generation and discard failures (rejection sampling) | Simple logic | Generator is slow; final distribution is unknown until run; hard cap artifacts | Acceptable for low-rejection-rate fields; not acceptable for pass rate targeting |
| Copy v1.0 seed data and change 20 records | Fast to ship | Distribution constraints not satisfied; still hand-crafted; doesn't address any v1.1 goal | Never |
| Generate all fields independently (no correlations) | Easiest to implement | Plausibility fails immediately on inspection by a domain expert | Never for this domain — producers will notice |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Existing `seedProjects.test.ts` | Adding new constraints without re-reading the full existing assertion list | Read every test assertion before writing the generator; build a constraint matrix |
| `scoreExisting()` / `scoreProposed()` | Calling the scoring engine during generation with stale imports or wrong types | Import directly from `src/scoring/index.ts`; verify TypeScript types at generation time |
| `createdAt` timestamps in seed data | Using `new Date().toISOString()` which varies per run | Hardcode a stable date (`2026-01-01T00:00:00.000Z`) for all seed projects |
| localStorage schema version | Regenerated seed data with different field values triggering a migration | No structural change — same `ProjectInputs` fields, just different values; no schema version bump needed |
| `SEED_PROJECTS` export | Generation script writing to a `.ts` file with wrong formatting | Use a template string with consistent indentation; run `npm run lint` after generation |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rejection sampling with high rejection rate | Generator runs for seconds or loops indefinitely | Keep acceptance rates above 50% for all constraints; prefer profile-based generation | If pass rate target is tight and inputs are not structured toward it |
| Scoring all 50 projects in a test loop with full engine | Test suite slows measurably | Not a real risk — `scoreExisting` is a pure function on a small object; 50 calls is negligible | Never at this scale |
| Running generation script in the browser | Production bundle includes generation code | Keep the generator as a Node.js script in `scripts/`; it never ships to the client | If generator is imported into src/ accidentally |

---

## "Looks Done But Isn't" Checklist

- [ ] **Pass rate:** 60% pass rate means exactly 30 projects. Verify with `SEED_PROJECTS.filter(p => scoreExisting(p.inputs).passed).length === 30` (or 28-30 to stay within the 20-30 test window)
- [ ] **Passes-existing-fails-proposed:** Run `SEED_PROJECTS.some(p => scoreExisting(p.inputs).passed && !scoreProposed(p.inputs).passed)` — must be true
- [ ] **Borderline projects:** `SEED_PROJECTS.filter(p => { const r = scoreExisting(p.inputs); return r.totalPoints >= 38 && r.totalPoints <= 42; }).length >= 5` — must be true
- [ ] **BTL correlation:** No project has `btlAdditionalCount > 4 && btlKeyCount < 2`
- [ ] **Post-production bimodal:** Score distribution of `picturePostPercent` shows two clusters, not a uniform band — visually inspect a sorted list
- [ ] **Crew/shooting correlation:** No project has `shootingNZPercent < 60 && crewPercent > 85`
- [ ] **Section E gating:** All projects with `hasKnowledgeTransfer || commercialAgreementPercent > 0 || infrastructureInvestment > 0` have `qnzpe >= 100_000_000`
- [ ] **Determinism:** Run the generator twice without code changes — output file diff is empty
- [ ] **Soft cap:** At least one project has `existingScore > 55` (cap is soft, not hard)
- [ ] **No real title collisions:** All 50 project names have been manually verified against real productions
- [ ] **Full test suite passes:** `npm test` exits zero after regeneration

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| BTL correlation missing | LOW | Add conditional draw for `btlAdditionalCount`; regenerate |
| Post-production fields all uniform | LOW | Split into two groups; regenerate |
| Hard cap artifact visible in distribution | MEDIUM | Replace hard reject with probability weighting; regenerate; recheck all test assertions |
| No passes-existing-fails-proposed scenario | LOW | Add one explicit Section-E-heavy project profile; regenerate |
| Test suite breaks on regeneration | MEDIUM | Audit constraint matrix; adjust generator parameters (not the tests); regenerate |
| Non-deterministic generation | LOW | Add seeded PRNG before any other fix; regenerate once to establish baseline |
| Real title collision in names | LOW | Replace the colliding name(s); no regeneration of inputs needed |
| Pass rate drifted (27 or 33 passing) | MEDIUM | Adjust the ratio of engaged vs. low-engagement project profiles; regenerate; rerun tests |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| BTL correlation | Phase 1: Generator design | Manual inspection + no project fails the BTL correlation check |
| Post-production bimodal | Phase 1: Generator design | Visual inspection of sorted `picturePostPercent` values |
| Score soft cap — hard rejection artifact | Phase 1: Generator design | Histogram of existing scores shows smooth tail above 50 |
| Pass rate via post-hoc manipulation | Phase 1: Profile-based architecture | Generator audit — no field modified after initial draw |
| Passes-existing-fails-proposed missing | Phase 1: Include Section-E-heavy profile; Phase 2: Verify | `SEED_PROJECTS.some(p => scoreExisting(p.inputs).passed && !scoreProposed(p.inputs).passed)` |
| Existing test assertions broken | Phase 1: Constraint matrix; Phase 2: Full test run | `npm test` exits zero |
| Determinism | Phase 1: Seeded PRNG foundation | Two generator runs produce identical output |
| shooting/crew correlation | Phase 1: Generator design | No projects with `shootingNZPercent < 60 && crewPercent > 85` |
| Project name collisions | Phase 1: Name generation + manual review | All 50 names verified against real productions |

---

## Sources

- Existing test assertions: `src/data/__tests__/seedProjects.test.ts` (direct inspection)
- Existing scoring engine: `src/scoring/scoreExisting.ts`, `src/scoring/scoreProposed.ts` (direct inspection)
- Scoring spec: `src/scoring/spec.ts` — all threshold values used in pitfall analysis
- v1.1 requirements: `.planning/PROJECT.md` (Target features for Realistic Seed Data milestone)
- v1.0 seed data (hand-crafted pattern): `src/data/seedProjects.ts` (first 200 lines)
- Seeded PRNG patterns: mulberry32 / sfc32 are well-documented zero-dependency algorithms (4-12 lines each); no external source needed
- Rejection sampling failure modes: standard probabilistic data generation knowledge — no specific citation, HIGH confidence

---

*Pitfalls research for: probabilistic seed data generation added to existing scoring/comparison system*
*Researched: 2026-03-14*
