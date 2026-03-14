# Phase 6: Tiered Field Logic - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

All 50 generated projects have field values that reflect how a line producer actually works through the uplift test — each tier referencing the previous tier's outputs for correlation. Covers three-tier generation (Fundamentals → Less Fundamental → Point-chasing) and all cross-field correlations (shooting/crew, BTL, bimodal post-production, budget-talent, VFX independence). Distribution targets and special scenarios are Phase 7.

</domain>

<decisions>
## Implementation Decisions

### Post-production coupling (B6/B7)
- Picture post (B6) and sound post (B7) are **strongly coupled** — both high or both low for the same project
- Occasional splits allowed (not 100% coupling), but the default is they move together
- "Low" cluster means ~0% (post done entirely offshore)
- "High" cluster means genuinely high: 85-100% range
- Budget tier does **not** affect the high/low split — roughly equal across all tiers

### Point-chasing behavior (Tier 3)
- Producers **actively calculate** their score gap and cherry-pick the cheapest remaining criteria
- Tier 3 fields (A2/A3, D1-D4, E1-E3, F1-F4) are **not organic** — they are only pursued for points
- If a producer doesn't need the points, they won't do masterclasses, premieres, etc.
- Target score is **~45 points** (not 50) — beyond 45 there's no additional benefit, and further points cost money or creative compromise
- Pass threshold is 40; producers aim for ~45 as a safety buffer
- Spread of ambition: some producers barely clear 40, others build a buffer to ~45 in case another criterion falls through
- No producer deliberately overshoots significantly beyond 45

### Section E strategy
- Section E is a **last resort** for high-budget projects that can't reach 40 through cheaper Tier 3 options
- These are expensive commitments (infrastructure investment, commercial agreements)
- More "we were building infrastructure anyway" than active point-chasing
- Only **2-3 projects** out of 50 should have any Section E activity (~5% probability)
- Only available to high-budget projects (QNZPE >= $100m)

### BTL crew shaping (C5/C6)
- **Budget inverse correlation**: tentpole/large productions fly in their own HODs, scoring lower on C5; smaller productions use more local key crew
- **Post-production presence expands C5 range**: if NZ post is happening (B6/B7 high), C5 range is 0-7; if no NZ post, C5 range is 0-4
- **Higher QNZPE tends toward lower C5 values** within whatever range applies
- **Shooting % correlation**: higher shooting NZ % (B4) correlates with higher crew counts, but high-budget projects may still fly in C6 roles
- **C6 tracks with C5 but is generally higher** — C6 roles are less likely to be imported than C5 roles
- Hard constraint: C6 >= C5; C5=0 implies C6=0

### Claude's Discretion
- Exact probability curves and distribution shapes for each field
- Correlations table data structure (maps, lookup functions, etc.)
- How to implement the bimodal distribution (e.g., coin flip then sample from high/low cluster)
- Point-chasing algorithm (greedy by cheapest, random selection, etc.)
- Tier 1 and Tier 2 field generation order within each tier
- How to track running score between tiers

</decisions>

<specifics>
## Specific Ideas

- Point-chasing target is 45, not the previously assumed 50 — this is a correction from the user based on real producer behavior
- The "safety buffer" concept means some producers target 42-43 while others target 45 — model this as a per-project ambition level
- Section E should only fire when a high-budget project genuinely can't reach 40 through cheaper means — it's the fallback, not a regular path

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/generator/correlations.ts`: Empty stub (`CORRELATIONS = {}`) — Phase 6 populates this with correlation tables keyed by BudgetTier and ProductionType
- `scripts/generator/tiers.ts`: `pickBudgetTier()`, `sampleQnzpe()`, `triangular()` — budget tier selection and QNZPE sampling already working
- `scripts/generator/types.ts`: `BudgetTier`, `ProductionType`, `BudgetTierConfig` types ready for use
- `scripts/generator/index.ts`: `generateProject()` — current flat logic to be replaced with tiered generation
- `scripts/generator/prng.ts`: Mulberry32 PRNG factory — all randomness flows through this

### Established Patterns
- `src/scoring/scoreExisting.ts`: Import and call to verify scores after generation — already used in `generateProject()`
- `src/scoring/types.ts`: `ProjectInputs` interface — the contract every generated field set must satisfy
- Film/TV split is 60/40 probabilistic, assigned early in generation (already in index.ts entry point)

### Integration Points
- `generateProject()` in `scripts/generator/index.ts` is the single function to refactor — all tier logic lives here or in modules it calls
- `CORRELATIONS` object in `correlations.ts` is the stub to populate with tier-keyed lookup data
- Running score tracking feeds into Tier 3 decisions — `scoreExisting()` already imported

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-tiered-field-logic*
*Context gathered: 2026-03-14*
