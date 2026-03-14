# Scoring Specification: NZ Screen Production Rebate 5% Uplift Points Tests

**Produced:** 2026-03-13
**Source documents:**
- `Existing_Production_Rebate_5_Uplift_points_test.docx` (NZFC recommendation)
- `Proposed_Production_Rebate_5_Uplift_points_test.docx`

**Status:** Awaiting human verification against source documents

---

## Overview

| Property | Existing Test | Proposed Test |
|----------|---------------|---------------|
| Maximum points | 85 | 70 |
| Minimum to pass | 40 | 20 (QNZPE < $100m) or 30 (QNZPE ≥ $100m) |
| Mandatory section | A1 (Sustainability) — must earn ≥ 1pt | None |
| Sections | A (7), B (21), C (31), D (6), E (8), F (12) | A (20), B (32), C (6), D (12) |

**Scoring patterns used:**

| Pattern | Description | Helper |
|---------|-------------|--------|
| Tiered | Value meets/exceeds highest threshold → earn that tier's points (not cumulative) | `scoreHighestTier()` |
| Counted | Count of qualifying persons × points-each, capped at maximum | `scoreCountCapped()` |
| Binary | Yes/No → fixed points or 0 | Inline condition |
| Selector | Mutually exclusive options with different point values | Inline condition |
| Flat threshold | Single threshold — meets it or doesn't | Inline condition |

---

## Existing Test

### Section A: Sustainability (7 pts max)

*This section is mandatory. Failing A1 causes the production to fail the test regardless of total score.*

| ID | Criterion | Pattern | Rule | Points |
|----|-----------|---------|------|--------|
| A1 | Sustainability Action Plan and Sustainability Report | Binary | hasSustainabilityPlan = true → 3pts | 3 (mandatory) |
| A2 | Sustainability Officer | Binary | hasSustainabilityOfficer = true → 2pts | 2 |
| A3 | Carbon Emissions Review | Binary | hasCarbonReview = true → 2pts | 2 |

**Section total:** 7 pts max

---

### Section B: New Zealand Production Activity (21 pts max)

| ID | Criterion | Pattern | Rule | Points |
|----|-----------|---------|------|--------|
| B1 | NZ Studio Lease | Binary | hasStudioLease = true → 2pts | 2 |
| B2 | Previous QNZPE ≥ $100m | Binary | hasPreviousQNZPE = true → 2pts | 2 |
| B3 | Associated Content (sequel/prequel/spin-off within 3 years) | Binary | hasAssociatedContent = true → 1pt | 1 |
| B4 | Shooting in NZ (% of principal photography days) | Tiered | shootingNZPercent ≥ 90% → 2pts; ≥ 75% → 1pt; < 75% → 0 | 0–2 |
| B5 | Shooting in Regions (% of NZ principal photography) | Flat threshold | regionalPercent ≥ 25% → 2pts; < 25% → 0 | 0 or 2 |
| B6 | Picture Post-Production in NZ (% of post expenditure) | Tiered | picturePostPercent ≥ 75% → 3pts; ≥ 50% → 2pts; ≥ 30% → 1pt; < 30% → 0 | 0–3 |
| B7 | Sound Post-Production in NZ | Tiered | soundPostPercent ≥ 75% → 3pts; ≥ 50% → 2pts; ≥ 30% → 1pt; < 30% → 0 | 0–3 |
| B8 | Digital or Visual Effects in NZ | Tiered | vfxPercent ≥ 90% → 3pts; ≥ 75% → 2pts; ≥ 50% → 1pt; < 50% → 0 | 0–3 |
| B9 | Concept Design and Physical Effects in NZ | Tiered | conceptPhysicalPercent ≥ 90% → 3pts; ≥ 75% → 2pts; ≥ 50% → 1pt; < 50% → 0 | 0–3 |

**Section total:** 21 pts max (2+2+1+2+2+3+3+3+3)

---

### Section C: New Zealand Personnel (31 pts max)

| ID | Criterion | Pattern | Rule | Points |
|----|-----------|---------|------|--------|
| C1 | Cast ≥ 80% QPs | Flat threshold | castPercent ≥ 80 → 2pts; < 80 → 0 | 0 or 2 |
| C2 | Crew ≥ 80% QPs | Flat threshold | crewPercent ≥ 80 → 1pt; < 80 → 0 | 0 or 1 |
| C3 | Māori crew ≥ 10% (of QP crew) | Flat threshold | maoriCrewPercent ≥ 10 → 1pt; < 10 → 0 | 0 or 1 |
| C4 | Above-the-Line Crew (Director/Producer/Exec Producer/Assoc Producer/Co-Producer/Writer/Showrunner) | Counted | min(atlCount, 3) × 3pts | 0, 3, 6, or 9 |
| C5 | BTL Key Crew (DOP/1st AD/Editor/VFX Sup/Costume Designer/Composer/Prod Designer) | Counted | scoreCountCapped(btlKeyCount, 1, 4) | 0–4 |
| C6 | BTL Additional Crew (2nd AD/Supervising Art Director/Financial Controller/Prod Accountant/Sound Designer/Sound Editor/Sound Mixer/SFX Supervisor/Line Producer or UPM/Art Director/Hair/Makeup/Stunt Coordinator/Choreographer) | Counted | scoreCountCapped(btlAdditionalCount, 0.5, 4) | 0–4 |
| C7 | Lead Cast (1 QP) | Binary | hasLeadCast = true → 3pts | 0 or 3 |
| C8 | Supporting Cast (up to 3 QPs) | Counted | scoreCountCapped(supportingCastCount, 1, 3) | 0–3 |
| C9 | Casting Director or Associate (QP, credited) | Selector | castingLevel = 'director' → 2pts; 'associate' → 1pt; 'none' → 0 | 0, 1, or 2 |
| C10 | Lead Cast or ATL Crew is Māori | Binary | hasLeadCastMaori = true → 2pts | 0 or 2 |

**Section total:** 31 pts max (2+1+1+9+4+4+3+3+2+2)

---

### Section D: Skills and Talent Development (6 pts max)

Attachment/internship criteria are binary — either the required minimum count is met or not.

| ID | Criterion | Pattern | Condition | Points |
|----|-----------|---------|-----------|--------|
| D1 | Masterclass(es) to NZ Screen Sector | Binary | hasMasterclass = true → 2pts | 0 or 2 |
| D2 | Educational Seminars | Binary | hasEdSeminars = true → 1pt | 0 or 1 |
| D3 | Paid Attachment Positions for QPs | Binary | attachmentCount ≥ threshold → 2pts; threshold = 2 if qnzpe ≤ 100m, 4 if qnzpe > 100m | 0 or 2 |
| D4 | Paid Internships | Binary | internshipCount ≥ threshold → 1pt; threshold = 4 if qnzpe ≤ $50m, 8 if qnzpe ≤ $150m, 10 if qnzpe > $150m | 0 or 1 |

**Section total:** 6 pts max (2+1+2+1)

---

### Section E: Innovation and Infrastructure (8 pts max)

| ID | Criterion | Pattern | Rule | Points |
|----|-----------|---------|------|--------|
| E1 | Transfer of Knowledge of Production Method or Technology | Binary | hasKnowledgeTransfer = true → 2pts | 0 or 2 |
| E2 | Commercial Agreement for New Production Method/Technology (% of QNZPE) | Tiered (not cumulative) | commercialAgreementPercent ≥ 1% → 3pts; ≥ 0.5% → 2pts; ≥ 0.25% → 1pt; < 0.25% → 0 | 0–3 |
| E3 | Investment in NZ Infrastructure (NZD) | Tiered (not cumulative) | infrastructureInvestment ≥ $2m → 3pts; ≥ $1m → 2pts; ≥ $500k → 1pt; < $500k → 0 | 0–3 |

**Section total:** 8 pts max (2+3+3)

*E2 and E3 are explicitly not cumulative per the source document — highest qualifying tier only.*

---

### Section F: Marketing, Promoting, and Showcasing New Zealand (12 pts max)

| ID | Criterion | Pattern | Rule | Points |
|----|-----------|---------|------|--------|
| F1 | Premiere | Selector | premiereType = 'world' → 3pts; 'nz' → 2pts; 'none' → 0 | 0, 2, or 3 |
| F2 | Film Marketing Partnership with NZFC | Binary | hasFilmMarketing = true → 3pts | 0 or 3 |
| F3 | Tourism Marketing Partnership with TNZ | Binary | hasTourismMarketing = true → 3pts | 0 or 3 |
| F4 | Bespoke Partnership with Tourism NZ | Binary | hasTourismPartnership = true → 3pts | 0 or 3 |

**Section total:** 12 pts max (3+3+3+3)

---

### Existing Test Pass Condition

```
passed = totalPoints >= 40 AND a1.mandatoryMet === true
```

where `a1.mandatoryMet = hasSustainabilityPlan === true`

---

## Proposed Test

### Section A: New Zealand Production Activity (20 pts max)

| ID | Criterion | Pattern | Rule | Points |
|----|-----------|---------|------|--------|
| A1 | Previous QNZPE ≥ $100m | Binary | hasPreviousQNZPE = true → 2pts | 0 or 2 |
| A2 | Associated Content (sequel/prequel/spin-off within 5 years) | Binary | hasAssociatedContent = true → 2pts | 0 or 2 |
| A3 | Shooting in NZ | Tiered | shootingNZPercent ≥ 90% → 2pts; ≥ 75% → 1pt; < 75% → 0 | 0–2 |
| A4 | Shooting in Regions | Tiered | regionalPercent ≥ 25% → 2pts; ≥ 10% → 1pt; < 10% → 0 | 0–2 |
| A5 | Picture Post-Production in NZ | Tiered | picturePostPercent ≥ 75% → 3pts; ≥ 50% → 2pts; ≥ 30% → 1pt; < 30% → 0 | 0–3 |
| A6 | Sound Post-Production in NZ | Tiered | soundPostPercent ≥ 75% → 3pts; ≥ 50% → 2pts; ≥ 30% → 1pt; < 30% → 0 | 0–3 |
| A7 | Digital or Visual Effects in NZ | Tiered | vfxPercent ≥ 75% → 3pts; ≥ 50% → 2pts; ≥ 30% → 1pt; < 30% → 0 | 0–3 |
| A8 | Concept Design and Physical Effects in NZ | Tiered | conceptPhysicalPercent ≥ 75% → 3pts; ≥ 50% → 2pts; ≥ 30% → 1pt; < 30% → 0 | 0–3 |

**Section total:** 20 pts max (2+2+2+2+3+3+3+3)

*Note: Proposed VFX/concept thresholds are lower than existing (30/50/75% vs 50/75/90%), making these criteria easier to score in the proposed system. Regional filming adds a 10% lower tier that doesn't exist in the existing system.*

---

### Section B: New Zealand Personnel (32 pts max)

| ID | Criterion | Pattern | Rule | Points |
|----|-----------|---------|------|--------|
| B1 | Cast | Tiered | castPercent ≥ 80% → 3pts; ≥ 60% → 2pts; < 60% → 0 | 0, 2, or 3 |
| B2 | Crew ≥ 80% QPs | Flat threshold | crewPercent ≥ 80 → 3pts; < 80 → 0 | 0 or 3 |
| B3 | Above-the-Line Crew | Counted | scoreCountCapped(atlCount, 3, 9) | 0, 3, 6, or 9 |
| B4 | BTL Key Crew | Counted | scoreCountCapped(btlKeyCount, 1, 4) | 0–4 |
| B5 | BTL Additional Crew (up to 8 QPs at 0.5pt each) | Counted | scoreCountCapped(btlAdditionalCount, 0.5, 4) | 0–4 |
| B6 | Lead Cast (1 QP) | Binary | hasLeadCast = true → 4pts | 0 or 4 |
| B7 | Supporting Cast (up to 3 QPs) | Counted | scoreCountCapped(supportingCastCount, 1, 3) | 0–3 |
| B8 | Casting Director or Associate | Selector | castingLevel = 'director' → 2pts; 'associate' → 1pt; 'none' → 0 | 0, 1, or 2 |

**Section total:** 32 pts max (3+3+9+4+4+4+3+2)

*Key changes from existing C: Cast adds 60% tier (2pts). Crew doubles from 1pt to 3pts. Lead cast increases from 3pts to 4pts. BTL additional changes from 1pt each to 0.5pts each (same cap of 4pts). No Māori-specific criteria.*

---

### Section C: Skills and Talent Development (6 pts max)

| ID | Criterion | Pattern | Condition | Points |
|----|-----------|---------|-----------|--------|
| C1 | Seminars — Screen Industry | Binary | hasIndustrySeminars = true → 1pt | 0 or 1 |
| C2 | Seminars — Education Sector | Binary | hasEdSeminars = true → 1pt | 0 or 1 |
| C3 | Paid Attachment Positions | Binary | attachmentCount ≥ threshold → 2pts; threshold = 2 if qnzpe ≤ $100m, 4 if qnzpe > $100m | 0 or 2 |
| C4 | Paid Internships | Binary | internshipCount ≥ threshold → 2pts; threshold = 2 if qnzpe ≤ $100m, 4 if qnzpe > $100m | 0 or 2 |

**Section total:** 6 pts max (1+1+2+2)

*Note: Proposed internship threshold is much lower than existing (2 vs 4 for sub-$100m, 4 vs 10 for large budget). Proposed awards 2pts for internships vs existing 1pt. Masterclass replaced by industry seminar (1pt).*

---

### Section D: Marketing, Promoting, and Showcasing New Zealand (12 pts max)

| ID | Criterion | Pattern | Rule | Points |
|----|-----------|---------|------|--------|
| D1 | Premiere | Two independent binaries | hasNZPremiere = true → 2pts; hasIntlPromotion = true → 2pts; both → 4pts | 0, 2, or 4 |
| D2 | Bespoke Marketing Partnership with NZFC | Binary | hasFilmMarketing = true → 3pts | 0 or 3 |
| D3 | Location Announcement | Binary | hasLocationAnnouncement = true → 1pt | 0 or 1 |
| D4 | Bespoke Partnership with Tourism NZ | Binary | hasTourismPartnership = true → 4pts | 0 or 4 |

**Section total:** 12 pts max (4+3+1+4)

*Note: Premiere restructured — proposed D1 is two independent yes/no inputs vs existing F1 single selector. Tourism partnership increases from 3pts (F4) to 4pts (D4). Location announcement is new (proposed only). TNZ marketing partnership (existing F3) is removed.*

---

### Proposed Test Pass Condition

```
passThreshold = qnzpe >= 100_000_000 ? 30 : 20
passed = totalPoints >= passThreshold
```

*No mandatory criteria in the proposed test. `mandatoryMet` always returns true.*

---

## One-System-Only Criteria

### Existing-Only (returns 'N/A' in proposed scoring results)

| Criterion ID | Label | Points | Reason |
|-------------|-------|--------|--------|
| Existing A1 | Sustainability Action Plan & Report | 3 (mandatory) | Sustainability section removed in proposed |
| Existing A2 | Sustainability Officer | 2 | Sustainability section removed in proposed |
| Existing A3 | Carbon Emissions Review | 2 | Sustainability section removed in proposed |
| Existing B1 | NZ Studio Lease | 2 | Not carried forward to proposed |
| Existing C3 | Māori Crew ≥10% | 1 | No Māori-specific criteria in proposed |
| Existing C10 | Lead Cast/ATL Crew is Māori | 2 | No Māori-specific criteria in proposed |
| Existing D1 | Masterclass | 2 | Replaced by industry seminar (C1) in proposed |
| Existing E1 | Knowledge Transfer | 2 | Innovation section removed in proposed |
| Existing E2 | Commercial Agreement | 0–3 | Innovation section removed in proposed |
| Existing E3 | Infrastructure Investment | 0–3 | Innovation section removed in proposed |
| Existing F3 | Tourism Marketing Partnership | 3 | Not directly carried to proposed (separate D3+D4) |

### Proposed-Only (returns 'N/A' in existing scoring results)

| Criterion ID | Label | Points | Reason |
|-------------|-------|--------|--------|
| Proposed C1 | Industry Seminars | 1 | Replaces masterclass; different structure |
| Proposed D3 | Location Announcement | 1 | New criterion in proposed |

### Shared Inputs with Different Thresholds (each engine applies own rules)

| Input Field | Existing Criterion | Proposed Criterion | Key Difference |
|------------|-------------------|-------------------|----------------|
| `shootingNZPercent` | B4: 75%→1pt, 90%→2pts | A3: 75%→1pt, 90%→2pts | Same thresholds |
| `regionalPercent` | B5: 25%→2pts (flat) | A4: 10%→1pt, 25%→2pts (tiered) | Proposed adds 10% tier |
| `picturePostPercent` | B6: 30/50/75% tiers | A5: 30/50/75% tiers | Same thresholds |
| `soundPostPercent` | B7: 30/50/75% tiers | A6: 30/50/75% tiers | Same thresholds |
| `vfxPercent` | B8: 50/75/90% tiers | A7: 30/50/75% tiers | Proposed has lower thresholds |
| `conceptPhysicalPercent` | B9: 50/75/90% tiers | A8: 30/50/75% tiers | Proposed has lower thresholds |
| `castPercent` | C1: 80%→2pts (flat) | B1: 60%→2pts, 80%→3pts (tiered) | Proposed adds 60% tier; higher reward |
| `crewPercent` | C2: 80%→1pt | B2: 80%→3pts | Same threshold; proposed awards 3x more |
| `atlCount` | C4: ×3pts, cap 9 | B3: ×3pts, cap 9 | Same |
| `btlKeyCount` | C5: ×1pt, cap 4 | B4: ×1pt, cap 4 | Same |
| `btlAdditionalCount` | C6: ×0.5pt, cap 4 | B5: ×0.5pt, cap 4 | Same |
| `hasLeadCast` | C7: 3pts | B6: 4pts | Proposed awards 1pt more |
| `supportingCastCount` | C8: ×1pt, cap 3 | B7: ×1pt, cap 3 | Same |
| `castingLevel` | C9: director=2, associate=1 | B8: director=2, associate=1 | Same |
| `hasAssociatedContent` | B3: 1pt | A2: 2pts | Proposed awards 2x more; window extends from 3→5 years |
| `hasPreviousQNZPE` | B2: 2pts | A1: 2pts | Same |
| `hasEdSeminars` | D2: 1pt | C2: 1pt | Same points; slightly different seminar requirements |
| `attachmentCount` | D3: 2pts, thresholds 2/4 | C3: 2pts, thresholds 2/4 | Same |
| `internshipCount` | D4: 1pt, thresholds 4/8/10 | C4: 2pts, thresholds 2/4 | Proposed easier; awards 2x more |
| `hasFilmMarketing` | F2: 3pts | D2: 3pts | Same |
| `hasTourismPartnership` | F4: 3pts | D4: 4pts | Proposed awards 1pt more |

---

## Worked Examples

### Example 1: Existing Test — Known Passer (mid-budget NZ film)

**Inputs:**

| Field | Value |
|-------|-------|
| qnzpe | $60,000,000 |
| hasSustainabilityPlan | true |
| hasSustainabilityOfficer | true |
| hasCarbonReview | false |
| hasStudioLease | false |
| hasPreviousQNZPE | false |
| hasAssociatedContent | false |
| shootingNZPercent | 85 |
| regionalPercent | 30 |
| picturePostPercent | 60 |
| soundPostPercent | 40 |
| vfxPercent | 20 |
| conceptPhysicalPercent | 0 |
| castPercent | 85 |
| crewPercent | 90 |
| maoriCrewPercent | 5 |
| atlCount | 2 |
| btlKeyCount | 3 |
| btlAdditionalCount | 2 |
| hasLeadCast | true |
| supportingCastCount | 2 |
| castingLevel | 'associate' |
| hasLeadCastMaori | false |
| hasMasterclass | true |
| hasEdSeminars | true |
| attachmentCount | 2 |
| internshipCount | 5 |
| hasKnowledgeTransfer | false |
| commercialAgreementPercent | 0 |
| infrastructureInvestment | 0 |
| premiereType | 'nz' |
| hasFilmMarketing | true |
| hasTourismMarketing | false |
| hasTourismPartnership | false |
| hasNZPremiere | false |
| hasIntlPromotion | false |
| hasLocationAnnouncement | false |

**Line-by-line calculation (Existing):**

| Section | Criterion | Calculation | Score |
|---------|-----------|-------------|-------|
| A | A1 Sustainability Plan (mandatory) | hasSustainabilityPlan = true → 3pts | 3 |
| A | A2 Sustainability Officer | hasSustainabilityOfficer = true → 2pts | 2 |
| A | A3 Carbon Review | hasCarbonReview = false → 0pts | 0 |
| **A total** | | | **5** |
| B | B1 Studio Lease | hasStudioLease = false → 0 | 0 |
| B | B2 Previous QNZPE | hasPreviousQNZPE = false → 0 | 0 |
| B | B3 Associated Content | hasAssociatedContent = false → 0 | 0 |
| B | B4 Shooting in NZ | 85% ≥ 75%, < 90% → tier [75, 1] → 1pt | 1 |
| B | B5 Regional filming | 30% ≥ 25% → 2pts | 2 |
| B | B6 Picture post | 60% ≥ 50%, < 75% → tier [50, 2] → 2pts | 2 |
| B | B7 Sound post | 40% ≥ 30%, < 50% → tier [30, 1] → 1pt | 1 |
| B | B8 VFX | 20% < 50% → 0 | 0 |
| B | B9 Concept/physical | 0% < 50% → 0 | 0 |
| **B total** | | | **6** |
| C | C1 Cast 80% | 85% ≥ 80% → 2pts | 2 |
| C | C2 Crew 80% | 90% ≥ 80% → 1pt | 1 |
| C | C3 Māori crew | 5% < 10% → 0 | 0 |
| C | C4 ATL crew | scoreCountCapped(2, 3, 9) = 6pts | 6 |
| C | C5 BTL key crew | scoreCountCapped(3, 1, 4) = 3pts | 3 |
| C | C6 BTL additional | scoreCountCapped(2, 0.5, 4) = 1pt | 1 |
| C | C7 Lead cast | hasLeadCast = true → 3pts | 3 |
| C | C8 Supporting cast | scoreCountCapped(2, 1, 3) = 2pts | 2 |
| C | C9 Casting | castingLevel = 'associate' → 1pt | 1 |
| C | C10 Lead cast Māori | hasLeadCastMaori = false → 0 | 0 |
| **C total** | | | **19** |
| D | D1 Masterclass | hasMasterclass = true → 2pts | 2 |
| D | D2 Ed seminars | hasEdSeminars = true → 1pt | 1 |
| D | D3 Attachments | attachmentCount=2, qnzpe=$60m ≤ $100m → threshold=2; 2 ≥ 2 → 2pts | 2 |
| D | D4 Internships | internshipCount=5, qnzpe=$60m ≤ $50m? No. ≤ $150m? Yes → threshold=8; 5 < 8 → 0 | 0 |
| **D total** | | | **5** |
| E | E1 Knowledge transfer | hasKnowledgeTransfer = false → 0 | 0 |
| E | E2 Commercial agreement | 0% < 0.25% → 0 | 0 |
| E | E3 Infrastructure | $0 < $500k → 0 | 0 |
| **E total** | | | **0** |
| F | F1 Premiere | premiereType = 'nz' → 2pts | 2 |
| F | F2 Film marketing | hasFilmMarketing = true → 3pts | 3 |
| F | F3 Tourism marketing | hasTourismMarketing = false → 0 | 0 |
| F | F4 Tourism partnership | hasTourismPartnership = false → 0 | 0 |
| **F total** | | | **5** |

**Result:**
- Total: 5 + 6 + 19 + 5 + 0 + 5 = **40 pts**
- Mandatory (A1) met: **YES**
- Pass threshold: 40
- **RESULT: PASS** (40 ≥ 40 AND mandatory met)

---

### Example 2: Existing Test — Known Failer (no sustainability plan)

Same inputs as Example 1, except `hasSustainabilityPlan = false`.

**Key calculation change:**
- A1 score: 0 (mandatory criterion not met)
- Section A total: 0 + 2 + 0 = 2 (A2 still scored if hasSustainabilityOfficer is true)

Wait — actually if `hasSustainabilityPlan = false`, let's set `hasSustainabilityOfficer = false` too for a clear fail:

**Modified inputs (fails on mandatory):**

| Field | Value |
|-------|-------|
| hasSustainabilityPlan | **false** |
| hasSustainabilityOfficer | false |
| hasCarbonReview | false |
| (all other fields same as Example 1) | |

**Section A:**
- A1: false → 0 (**mandatory NOT met**)
- A2: false → 0
- A3: false → 0
- **A total: 0**

**All other sections identical to Example 1.**
- Total without A: 6 + 20 + 5 + 0 + 5 = 36
- Grand total: **36 pts**
- Mandatory (A1) met: **NO**

**RESULT: FAIL** (36 < 40 AND mandatory not met — fails on both counts)

---

### Example 3: Proposed Test — Known Passer (same mid-budget production)

Using the same inputs as Example 1.

**Line-by-line calculation (Proposed):**

| Section | Criterion | Calculation | Score |
|---------|-----------|-------------|-------|
| A | A1 Previous QNZPE | hasPreviousQNZPE = false → 0 | 0 |
| A | A2 Associated Content | hasAssociatedContent = false → 0 | 0 |
| A | A3 Shooting in NZ | 85% ≥ 75%, < 90% → 1pt | 1 |
| A | A4 Regional filming | 30% ≥ 25% → 2pts (hits top tier) | 2 |
| A | A5 Picture post | 60% ≥ 50%, < 75% → 2pts | 2 |
| A | A6 Sound post | 40% ≥ 30%, < 50% → 1pt | 1 |
| A | A7 VFX | 20% < 30% → 0 (different threshold from existing!) | 0 |
| A | A8 Concept/physical | 0% < 30% → 0 | 0 |
| **A total** | | | **6** |
| B | B1 Cast | 85% ≥ 80% → 3pts (hits top tier) | 3 |
| B | B2 Crew | 90% ≥ 80% → 3pts (3× existing C2!) | 3 |
| B | B3 ATL crew | scoreCountCapped(2, 3, 9) = 6pts | 6 |
| B | B4 BTL key | scoreCountCapped(3, 1, 4) = 3pts | 3 |
| B | B5 BTL additional | scoreCountCapped(2, 0.5, 4) = 1pt | 1 |
| B | B6 Lead cast | hasLeadCast = true → 4pts | 4 |
| B | B7 Supporting cast | scoreCountCapped(2, 1, 3) = 2pts | 2 |
| B | B8 Casting | castingLevel = 'associate' → 1pt | 1 |
| **B total** | | | **23** |
| C | C1 Industry seminars | hasIndustrySeminars = false → 0 (note: separate from hasMasterclass) | 0 |
| C | C2 Ed seminars | hasEdSeminars = true → 1pt | 1 |
| C | C3 Attachments | attachmentCount=2, qnzpe=$60m ≤ $100m → threshold=2; 2 ≥ 2 → 2pts | 2 |
| C | C4 Internships | internshipCount=5, qnzpe=$60m ≤ $100m → threshold=2; 5 ≥ 2 → 2pts | 2 |
| **C total** | | | **5** |
| D | D1 Premiere | hasNZPremiere = false → 0; hasIntlPromotion = false → 0; total 0 | 0 |
| D | D2 Film marketing | hasFilmMarketing = true → 3pts | 3 |
| D | D3 Location announcement | hasLocationAnnouncement = false → 0 | 0 |
| D | D4 Tourism partnership | hasTourismPartnership = false → 0 | 0 |
| **D total** | | | **3** |

**Result:**
- Total: 6 + 23 + 5 + 3 = **37 pts**
- qnzpe = $60m < $100m → passThreshold = 20
- **RESULT: PASS** (37 ≥ 20)

---

### Example 4: Proposed Test — Known Failer (low-budget, minimal activity)

**Inputs (low-budget minimal production):**

| Field | Value |
|-------|-------|
| qnzpe | $25,000,000 |
| hasPreviousQNZPE | false |
| hasAssociatedContent | false |
| shootingNZPercent | 50 |
| regionalPercent | 5 |
| picturePostPercent | 10 |
| soundPostPercent | 10 |
| vfxPercent | 0 |
| conceptPhysicalPercent | 0 |
| castPercent | 50 |
| crewPercent | 70 |
| atlCount | 0 |
| btlKeyCount | 0 |
| btlAdditionalCount | 0 |
| hasLeadCast | false |
| supportingCastCount | 0 |
| castingLevel | 'none' |
| hasIndustrySeminars | false |
| hasEdSeminars | false |
| attachmentCount | 0 |
| internshipCount | 0 |
| hasNZPremiere | false |
| hasIntlPromotion | false |
| hasFilmMarketing | false |
| hasLocationAnnouncement | false |
| hasTourismPartnership | false |

**Line-by-line calculation (Proposed):**

| Section | Criterion | Calculation | Score |
|---------|-----------|-------------|-------|
| A | A1 Previous QNZPE | false → 0 | 0 |
| A | A2 Associated Content | false → 0 | 0 |
| A | A3 Shooting in NZ | 50% < 75% → 0 | 0 |
| A | A4 Regional filming | 5% < 10% → 0 | 0 |
| A | A5 Picture post | 10% < 30% → 0 | 0 |
| A | A6 Sound post | 10% < 30% → 0 | 0 |
| A | A7 VFX | 0% < 30% → 0 | 0 |
| A | A8 Concept/physical | 0% < 30% → 0 | 0 |
| **A total** | | | **0** |
| B | B1 Cast | 50% < 60% → 0 | 0 |
| B | B2 Crew | 70% < 80% → 0 | 0 |
| B | B3 ATL | scoreCountCapped(0, 3, 9) = 0 | 0 |
| B | B4 BTL key | scoreCountCapped(0, 1, 4) = 0 | 0 |
| B | B5 BTL additional | scoreCountCapped(0, 0.5, 4) = 0 | 0 |
| B | B6 Lead cast | false → 0 | 0 |
| B | B7 Supporting cast | scoreCountCapped(0, 1, 3) = 0 | 0 |
| B | B8 Casting | 'none' → 0 | 0 |
| **B total** | | | **0** |
| C | C1 Industry seminars | false → 0 | 0 |
| C | C2 Ed seminars | false → 0 | 0 |
| C | C3 Attachments | 0 < 2 → 0 | 0 |
| C | C4 Internships | 0 < 2 → 0 | 0 |
| **C total** | | | **0** |
| D | D1 Premiere | false + false → 0 | 0 |
| D | D2 Film marketing | false → 0 | 0 |
| D | D3 Location announcement | false → 0 | 0 |
| D | D4 Tourism partnership | false → 0 | 0 |
| **D total** | | | **0** |

**Result:**
- Total: 0 + 0 + 0 + 0 = **0 pts**
- qnzpe = $25m < $100m → passThreshold = 20
- **RESULT: FAIL** (0 < 20)

---

## Input Field to Criterion Mapping Summary

| ProjectInputs Field | Existing Criterion | Proposed Criterion | Notes |
|---------------------|-------------------|--------------------|-------|
| `qnzpe` | D3/D4 thresholds | C3/C4 thresholds + pass threshold | In whole NZD dollars |
| `hasSustainabilityPlan` | A1 (mandatory) | N/A | — |
| `hasSustainabilityOfficer` | A2 | N/A | — |
| `hasCarbonReview` | A3 | N/A | — |
| `hasStudioLease` | B1 | N/A | — |
| `hasPreviousQNZPE` | B2 | A1 | — |
| `hasAssociatedContent` | B3 (1pt) | A2 (2pts) | — |
| `shootingNZPercent` | B4 | A3 | Same thresholds |
| `regionalPercent` | B5 (flat 25%) | A4 (tiered 10%/25%) | — |
| `picturePostPercent` | B6 | A5 | Same thresholds |
| `soundPostPercent` | B7 | A6 | Same thresholds |
| `vfxPercent` | B8 (50/75/90%) | A7 (30/50/75%) | Proposed easier |
| `conceptPhysicalPercent` | B9 (50/75/90%) | A8 (30/50/75%) | Proposed easier |
| `castPercent` | C1 (80%→2pts) | B1 (60%→2pts, 80%→3pts) | Proposed adds tier |
| `crewPercent` | C2 (80%→1pt) | B2 (80%→3pts) | Proposed triples |
| `maoriCrewPercent` | C3 | N/A | — |
| `atlCount` | C4 (×3, cap 9) | B3 (×3, cap 9) | Same |
| `btlKeyCount` | C5 (×1, cap 4) | B4 (×1, cap 4) | Same |
| `btlAdditionalCount` | C6 (×0.5, cap 4) | B5 (×0.5, cap 4) | Same |
| `hasLeadCast` | C7 (3pts) | B6 (4pts) | Proposed +1pt |
| `supportingCastCount` | C8 (×1, cap 3) | B7 (×1, cap 3) | Same |
| `castingLevel` | C9 | B8 | Same values |
| `hasLeadCastMaori` | C10 | N/A | — |
| `hasMasterclass` | D1 (2pts) | N/A | — |
| `hasIndustrySeminars` | N/A | C1 (1pt) | Proposed only |
| `hasEdSeminars` | D2 (1pt) | C2 (1pt) | Same points |
| `attachmentCount` | D3 (2pts, 2/4) | C3 (2pts, 2/4) | Same |
| `internshipCount` | D4 (1pt, 4/8/10) | C4 (2pts, 2/4) | Proposed easier + 2x points |
| `hasKnowledgeTransfer` | E1 | N/A | — |
| `commercialAgreementPercent` | E2 | N/A | — |
| `infrastructureInvestment` | E3 | N/A | — |
| `premiereType` | F1 (nz=2, world=3) | N/A | — |
| `hasNZPremiere` | N/A | D1 part 1 (2pts) | Proposed only |
| `hasIntlPromotion` | N/A | D1 part 2 (2pts) | Proposed only |
| `hasFilmMarketing` | F2 (3pts) | D2 (3pts) | Same |
| `hasTourismMarketing` | F3 (3pts) | N/A | — |
| `hasTourismPartnership` | F4 (3pts) | D4 (4pts) | Proposed +1pt |
| `hasLocationAnnouncement` | N/A | D3 (1pt) | Proposed only |

---

*Verify this document against both source .docx files before approving.*
*Section totals: Existing = 7+21+31+6+8+12 = 85 ✓. Proposed = 20+32+6+12 = 70 ✓.*
