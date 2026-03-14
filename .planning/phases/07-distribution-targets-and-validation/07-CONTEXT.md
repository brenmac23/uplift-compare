# Phase 7: Distribution Targets and Validation - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

The full 50-project dataset satisfies measurable statistical targets and includes the specific scenario types required to demonstrate the comparison tool's analytical purpose. Covers special scenarios (SCEN-01 through SCEN-04): passes-existing-fails-proposed, Maori criteria activation, ~60% pass rate, and soft score clustering. Does NOT change the three-tier pipeline structure, PRNG, or correlation architecture from Phases 5-6.

</domain>

<decisions>
## Implementation Decisions

### Passes-existing-fails-proposed scenario (SCEN-01)
- Hybrid approach: tune parameters to produce this scenario naturally; if tuning fails, reserve a fallback project index with overrides
- Claude's discretion on the production profile — just ensure it's plausible (e.g., a high-budget project heavy on existing-only criteria)
- Target 2-3 such projects if they emerge naturally, but guarantee at least 1
- If fails-existing-passes-proposed projects emerge naturally from tuning, keep them — don't suppress the reverse scenario

### Maori criteria activation (SCEN-02)
- Probabilistic: each project has ~2% chance of being Maori-active
- No guarantee of exactly 1 — whatever the PRNG produces at 2% probability is fine (could be 0, 1, or 2)
- Claude's discretion on values (maoriCrewPercent level, whether hasLeadCastMaori is paired with crew %, etc.)

### Validation and tuning approach
- Build an automated tuning script that converges on pass rate (~60%) and score distribution shape (median ~48)
- Claude's discretion on tuning mechanism (config overlay, source modification, or parameter injection)
- Distribution report stays focused on existing scoring — proposed scoring verification happens in test assertions only
- Other SCEN targets (SCEN-01, SCEN-02) are checked/reported but not auto-tuned

### Score distribution shape (SCEN-04)
- Target: median ~48, range 35-58
- Natural bell-curve spread — most projects land 45-52, tails at 35-40 and 55-58
- Standard deviation assertion: stddev of existing scores must be between 4-12 (catches both artificial cliffs and unrealistic spread)
- No project should exceed ~60 without a plausible reason

### Pass rate testing (SCEN-03)
- Test assertion: 25-35 projects pass existing test (50-70% range)
- Tuning target is tighter (~28-30) but test allows buffer for resilience

### Claude's Discretion
- Which parameters to auto-tune vs. verify-only
- Tuning script architecture and convergence algorithm
- Exact Maori field values and combination (C3 only, C10 only, or both)
- Production profile for passes-existing-fails-proposed scenario
- Whether to enhance the distribution report with a histogram

</decisions>

<specifics>
## Specific Ideas

- The 2% Maori probability is chosen to yield ~1 project in 50 on average — accept whatever the deterministic PRNG produces
- The passes-existing-fails-proposed scenario is most plausible for high-budget (≥$100m) projects because proposed has a 30pt threshold vs existing's 40pt — different criteria weightings create the gap
- Score distribution should look like what a real population of productions would produce — not a designed mathematical shape

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/generator/correlations.ts`: All correlation constants (AMBITION_TARGET_WEIGHTS, SELECTION_PROBS, POST_PRODUCTION_CONFIG, etc.) — Phase 7 tunes these
- `scripts/generator/tier3.ts`: Greedy point-chasing algorithm with configurable selection probabilities — key tuning lever
- `scripts/generator/index.ts`: `generateProject()` pipeline — Maori fields at lines 94-95 need replacing with probabilistic logic
- `scripts/generateSeedData.ts`: Entry point with distribution report (lines 61-102) — needs SCEN-01 through SCEN-04 additions
- `src/scoring/scoreExisting.ts` and `src/scoring/scoreProposed.ts`: Both scorers needed for SCEN-01 verification

### Established Patterns
- All randomness via Mulberry32 PRNG — Maori activation must consume rand() in deterministic order
- Pre-read pattern for conditional fields (consume rand() even when branch not taken) — preserves PRNG offsets
- Distribution report prints to stdout after each `npm run seed` run

### Integration Points
- `src/data/__tests__/seedProjects.test.ts`: Existing 197 assertions must stay green; new assertions for SCEN-01 through SCEN-04 added here
- `scoreProposed()` not currently imported in generator — needs importing for SCEN-01 detection
- Tuning script is a new entry point (e.g., `scripts/tuneSeedData.ts`) separate from `generateSeedData.ts`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-distribution-targets-and-validation*
*Context gathered: 2026-03-14*
