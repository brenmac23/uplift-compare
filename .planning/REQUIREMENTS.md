# Requirements: Uplift Compare

**Defined:** 2026-03-14
**Core Value:** Instant, accurate side-by-side comparison of how a production fares under both the existing and proposed uplift scoring systems

## v1.1 Requirements

Requirements for Realistic Seed Data milestone. Each maps to roadmap phases.

### Generator Infrastructure

- [ ] **GEN-01**: Generator uses a seeded PRNG for deterministic, reproducible output
- [ ] **GEN-02**: Generator tracks running score after each tier to guide subsequent tier decisions
- [ ] **GEN-03**: Generator prints validation report (distribution stats, pass rates, score ranges) to stdout
- [ ] **GEN-04**: Generator outputs static TypeScript file replacing existing seedProjects.ts

### Three-Tier Field Generation

- [ ] **TIER-01**: Tier 1 (Fundamentals) generates A1, B2, B3, B4, C4, C5, C7, C9 based on production nature and budget
- [ ] **TIER-02**: Tier 2 (Less Fundamental) generates B1, B5, B6-B9, C1, C2, C6, C8 with correlations to Tier 1 values
- [ ] **TIER-03**: Tier 3 (Point-chasing) generates A2/A3, D1-D4, E1-E3, F1-F4 sparsely, guided by score gap to ~40pt target

### Distribution Realism

- [ ] **DIST-01**: Post-production fields (B6/B7) are bimodal — picture and sound are coupled, avoiding implausible mid-range values
- [ ] **DIST-02**: VFX (B8) and concept/physical effects (B9) are independently random, not coupled to picture/sound
- [ ] **DIST-03**: BTL additional crew (C6) is almost always >= BTL key crew (C5); C5=0 implies C6=0
- [ ] **DIST-04**: Low shooting % (B4) correlates with low crew % (C2)
- [ ] **DIST-05**: Higher QNZPE inversely correlates with qualifying person scores (C4, C5, C7, C8, C1)

### Special Scenarios

- [ ] **SCEN-01**: At least one project passes the existing test but fails the proposed test
- [ ] **SCEN-02**: Approximately 1-2% of projects (1 out of 50) have active Māori criteria (C3/C10)
- [ ] **SCEN-03**: Approximately 60% of projects pass the existing test
- [ ] **SCEN-04**: Projects soft-cap around ~50 points — point-chasing becomes unlikely as score exceeds target

### Project Names

- [ ] **NAME-01**: Projects have creative fictional names (no real NZ names or real franchises)

## Future Requirements

None — this is a focused refinement milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Runtime generation | Pre-generate at dev time and commit static file — simpler, deterministic |
| Outcome-first generation | Let pass/fail emerge organically from tuned parameters, not pre-assigned targets |
| UI changes to seed data display | Existing UI works with any valid ProjectInputs array |
| New scoring criteria or rules | Scoring engine is v1.0 validated, unchanged |
| Proposed-test-aware generation | Line producers only think about the existing test; proposed scores fall where they may |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GEN-01 | Phase 5 | Pending |
| GEN-02 | Phase 5 | Pending |
| GEN-03 | Phase 5 | Pending |
| GEN-04 | Phase 5 | Pending |
| NAME-01 | Phase 5 | Pending |
| TIER-01 | Phase 6 | Pending |
| TIER-02 | Phase 6 | Pending |
| TIER-03 | Phase 6 | Pending |
| DIST-01 | Phase 6 | Pending |
| DIST-02 | Phase 6 | Pending |
| DIST-03 | Phase 6 | Pending |
| DIST-04 | Phase 6 | Pending |
| DIST-05 | Phase 6 | Pending |
| SCEN-01 | Phase 7 | Pending |
| SCEN-02 | Phase 7 | Pending |
| SCEN-03 | Phase 7 | Pending |
| SCEN-04 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation — traceability complete*
