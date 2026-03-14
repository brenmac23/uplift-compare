# Phase 5: Generator Infrastructure - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

A runnable `npm run seed` script exists that produces a syntactically valid `src/data/seedProjects.ts` with 50 deterministically generated projects. Includes seeded PRNG, generator types, correlations table structure, curated project names, and entry point that writes valid output. Tiered field logic and distribution targets are Phase 6 and Phase 7 respectively.

</domain>

<decisions>
## Implementation Decisions

### Project name flavor
- Separate name pools for film (cinematic-sounding titles) and TV (series-sounding titles)
- Genre variety across the pool — action, sci-fi, fantasy, drama, horror, comedy represented
- Mixed tone — some serious/prestige names, some lighter/quirkier names
- No need to avoid proximity to real titles (e.g., "The Dark Horizon" is fine)
- ~80 names total (buffer beyond the 50 needed), split roughly 60/40 film/TV to match production type ratio

### Budget tier definitions
- 4 tiers: Small (<$50m), Mid ($50m-$99m), Large ($100m-$199m), Tentpole ($200m-$250m)
- Floor: $20m minimum QNZPE
- Ceiling: $250m maximum QNZPE
- Distribution within tiers is clustered (not uniform) — e.g., small-budget projects cluster around $30-40m
- `BudgetTier` type encodes these four tiers; all correlation tables key off this type

### Film vs TV split
- Each project has a 60% chance of being film, 40% TV (probabilistic, not quota-based)
- Both film and TV appear across all budget tiers
- TV shows skew toward higher crew percentage (more local crew embedded for longer shoots)
- TV shows are less likely to travel outside NZ (higher shootingNZPercent)
- Production type assignment happens early in generation so downstream tier logic can reference it

### Claude's Discretion
- Exact seed constant value (document in code comment)
- Clustering algorithm within budget tiers (e.g., beta distribution, truncated normal)
- Output file formatting (comments, structure, header)
- Correlations table data structure (maps, objects, functions)
- Constraint matrix format and location

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Research documents a thorough build order (types -> prng -> correlations -> projectNames -> tiers -> verify -> index -> entry point) that should be followed.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/scoring/types.ts`: `ProjectInputs` interface — the contract every generated project must satisfy
- `src/scoring/scoreExisting.ts` and `src/scoring/scoreProposed.ts`: generator imports these read-only to verify scores
- `src/data/seedProjects.ts`: current hand-authored file — generator output replaces this with identical shape and export (`SEED_PROJECTS`)

### Established Patterns
- `Project` type from `src/store/useAppStore.ts`: `{ id, isSeeded, createdAt, inputs }` — generator must produce this shape
- IDs follow `seed-NNN` pattern (zero-padded 3 digits)
- All seeded projects have `isSeeded: true` and fixed `createdAt`

### Integration Points
- `npm run seed` script (new) via `tsx scripts/generateSeedData.ts`
- Output overwrites `src/data/seedProjects.ts` — identical export contract
- `src/data/__tests__/seedProjects.test.ts` is the quality gate — all 12 existing assertions must pass

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-generator-infrastructure*
*Context gathered: 2026-03-14*
