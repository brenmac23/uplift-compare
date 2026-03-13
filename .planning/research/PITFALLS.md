# Domain Pitfalls: Uplift Compare

**Domain:** Dual-system scoring calculator / policy comparison tool
**Researched:** 2026-03-13
**Overall confidence:** HIGH (pitfalls derived from well-documented React form and scoring calculator failure modes, cross-validated across multiple sources)

---

## Critical Pitfalls

Mistakes that cause rewrites or fundamental correctness problems.

---

### Pitfall 1: Misreading the Spec — Scoring Logic Implemented Wrong From the Start

**What goes wrong:** The two scoring documents (existing and proposed) are dense policy language with tiered thresholds, conditionals, and exceptions. Developers implement what they *think* the rules say, not what they actually say. With two different systems sharing overlapping terminology (e.g. "qualifying NZ crew", "associated content"), interpretations diverge silently. The app calculates wrong numbers for weeks before anyone checks against the source.

**Why it happens:** Policy documents written for regulators, not developers. Criteria like "80% NZ cast" could mean lead cast, speaking cast, or all on-screen cast — the document disambiguates but the developer doesn't notice. Two systems using similar section names (e.g. "Section B — NZ Personnel" in both) creates a false sense that they map neatly. They don't.

**Consequences:** Seed data scores are wrong. User-entered projects score wrong. The comparative value of the tool is destroyed if stakeholders discover the numbers don't match their manual calculations. Rewriting the scoring engine after UI is built is expensive.

**Prevention:**
- Before writing a single line of scoring logic, produce a written spec document translating both policy documents into developer-facing rules: exact numeric thresholds, which inputs map to which criteria, how tiered scoring works (e.g. VFX: 30%=X pts, 50%=Y pts, 75%=Z pts), and what the pass conditions are.
- Get a domain expert (or the project owner) to review that spec document against the source .docx files before implementation begins.
- Write unit tests for the scoring engine that hard-code known-correct inputs and expected outputs. Test edge cases: exactly at a threshold (e.g. exactly 30% VFX), just below a threshold, max possible score, min pass score.
- Implement scoring as pure functions completely separate from UI — they are independently testable.

**Warning signs:**
- "I think this means..." in a comment next to a scoring rule
- Scoring functions referencing UI state directly rather than clean input objects
- No unit tests for the scoring engine

**Phase:** Address in Phase 1 (scoring engine). Do not start seed data or UI until scoring logic is validated.

---

### Pitfall 2: Stored Derived State — Score in localStorage, Not Inputs

**What goes wrong:** The app stores calculated scores in localStorage alongside (or instead of) raw input data. When the scoring rules are corrected or updated, all stored project scores are now stale. There is no way to recalculate them without re-entering every project.

**Why it happens:** It seems efficient to cache scores. Calculating scores is fast enough to do on every render, but the team treats it like expensive computation worth persisting. Or the initial data model includes `existingScore: number` and `proposedScore: number` fields that get stored.

**Consequences:** The app cannot be corrected without wiping all user data. Seed data becomes unfixable. This is particularly damaging when — not if — a scoring rule interpretation is corrected post-launch.

**Prevention:**
- Only store raw inputs in localStorage: the percentages, dollar amounts, personnel counts, boolean flags the user actually entered.
- Derive all scores at render time from stored inputs via pure scoring functions.
- The data model in localStorage contains zero calculated fields.
- Pass/fail status is also derived, never stored.

**Warning signs:**
- A `score` or `points` or `passes` field in the localStorage schema
- Scoring functions called in `useEffect` that write back to state
- "Recalculate all" button being considered as a feature

**Phase:** Address in Phase 1 (data model design). A wrong data model is expensive to fix later.

---

### Pitfall 3: Scoring Engine Entangled With UI — Pure Logic Mixed Into Components

**What goes wrong:** Scoring logic lives inside React components: `if (formValues.vfxPercentage >= 30) { setExistingScore(prev => prev + 2) }`. It is impossible to test in isolation. Small UI refactors break scoring. Debugging requires rendering the full component tree.

**Why it happens:** It feels natural to write scoring logic where the data lives — inside the component. The first implementation works, so the pattern proliferates.

**Consequences:** Untestable scoring engine. Regressions introduced by UI changes. Impossible to validate correctness without UI. Impossible for another developer to understand the scoring rules by reading the code.

**Prevention:**
- Scoring is implemented as two pure TypeScript modules: `scoreExisting(inputs: ProjectInputs): ExistingScoreResult` and `scoreProposed(inputs: ProjectInputs): ProposedScoreResult`.
- These functions take a plain object and return a plain object. No React, no hooks, no state.
- Components call these functions with form values and use the results for display only.
- Use `useMemo` when wrapping the call in a component to avoid recalculation on every keystroke if performance is observed to be an issue — but measure first.

**Warning signs:**
- Scoring `if` statements inside JSX or event handlers
- `useState` calls like `const [sectionBScore, setSectionBScore] = useState(0)` that are updated in response to form changes
- `useEffect(() => { setSectionBScore(calculateB(form)) }, [form])` — this is the anti-pattern explicitly called out by the React team

**Phase:** Address in Phase 1. Enforce with code review.

---

### Pitfall 4: Shared Input Fields Modelled Incorrectly Across Two Systems

**What goes wrong:** Many inputs feed both scoring systems (e.g. crew nationality percentages, QNZPE budget amount). The app stores two copies of overlapping inputs — one under the existing test form and one under the proposed test form. Users must enter the same data twice. Or worse, the systems diverge when they should agree.

**Why it happens:** The two forms are built independently, section by section, because the scoring sections differ. Fields that appear in both systems are naturally encountered twice and given separate state variables.

**Consequences:** Poor UX. Data inconsistency bugs. The single comparative value proposition ("same inputs, two systems") is undermined.

**Prevention:**
- Before building the form, map all inputs to a single `ProjectInputs` type. Label each field with which scoring system(s) use it. Many fields are shared; some are system-specific.
- A single unified form populates a single `ProjectInputs` object. Both scoring functions receive the same object.
- System-specific inputs that genuinely only appear in one test are clearly marked in the data model and UI.

**Warning signs:**
- Two separate form state objects, one per scoring system
- Input labels like "NZ Crew % (Existing)" and "NZ Crew % (Proposed)" for the same concept
- Any field that is entered twice by the user

**Phase:** Address in Phase 1 (data model) and Phase 2 (form architecture).

---

### Pitfall 5: localStorage Schema Changes Break Saved Data

**What goes wrong:** The `ProjectInputs` schema changes between development iterations — a field is renamed, a new required field is added, a section is restructured. Existing localStorage data from earlier sessions no longer matches the expected shape. The app crashes or silently reads `undefined` for new fields, producing wrong scores.

**Why it happens:** The data model evolves during development. Early in the project, it changes frequently. No migration strategy is in place because "we'll deal with that later."

**Consequences:** Data corruption for users who have created projects. The 50 seed projects are unreadable after a schema change unless the seed data is also regenerated. During development, the team wastes time wiping localStorage manually.

**Prevention:**
- Add a `schemaVersion: number` field to the localStorage root object from day one.
- On app load, check `schemaVersion` against the expected current version. If mismatched, either run a migration function or clear and re-seed.
- During development, increment `schemaVersion` whenever the schema changes. This forces clean state automatically.
- For production (post-launch), write a migration function that transforms old shapes to new ones rather than wiping data.
- Keep the seed data as a versioned TypeScript constant, not a pre-baked JSON blob. This means it can be regenerated trivially.

**Warning signs:**
- No `schemaVersion` field in localStorage
- Errors like "Cannot read property 'x' of undefined" after pulling new code
- Manual "clear localStorage and refresh" instructions in the team's dev notes

**Phase:** Address at project setup, before any localStorage writes.

---

## Moderate Pitfalls

Mistakes that degrade quality, correctness, or maintainability.

---

### Pitfall 6: Floating-Point Errors in Percentage Comparisons

**What goes wrong:** The scoring rules use percentage thresholds: "30%", "50%", "75%", "80%". When a user enters `30` as a percentage, the comparison `inputValue >= 30` works fine. But if any intermediate calculation is involved — converting from a decimal, dividing totals, accumulating fractions — floating-point drift causes `0.3000000000000004 >= 0.3` to evaluate differently than expected. A project that should score exactly at threshold does not.

**Why it happens:** JavaScript's IEEE 754 floating-point representation cannot exactly represent many decimal fractions. `0.1 + 0.2 === 0.3` is `false` in JavaScript.

**Prevention:**
- Accept raw percentage inputs as integers or explicit decimals from the user (e.g. "30" not "0.3").
- When comparing against thresholds, use `Math.round(value * 100) / 100` or similar normalisation before comparison, not raw division results.
- For the thresholds in this domain (all round numbers to 1-2 decimal places), integer arithmetic on scaled values (multiply by 100, work in integer cents) avoids the problem entirely.
- Unit tests must include edge cases: exactly at threshold, 0.01% below threshold, 0.01% above threshold.

**Warning signs:**
- Intermediate division without normalisation before a threshold comparison
- No unit tests for boundary cases (exactly at 30%, 50%, 80%)

**Phase:** Address in Phase 1 (scoring engine unit tests will catch this).

---

### Pitfall 7: Tiered Scoring Logic Implemented as Cumulative Rather Than Tiered

**What goes wrong:** The proposed test has tiered scoring for criteria like VFX — e.g. 2pts at 30%, 4pts at 50%, 6pts at 75%. This is commonly (and wrongly) implemented as: "if ≥30%, add 2; if ≥50%, add another 2; if ≥75%, add another 2" — producing 6 by accumulation. But the tiers are exclusive levels: you get the points for the highest tier you satisfy, not cumulative points for all tiers below it. The reverse mistake also occurs.

**Why it happens:** The spec language is ambiguous. "Up to 2 points for 30%, up to 4 points for 50%..." can be read either way without careful attention.

**Prevention:**
- During spec translation (see Pitfall 1), explicitly resolve: are these tiers cumulative or exclusive? For each tiered criterion, document which model applies.
- Implement tiered scoring as: evaluate from highest tier to lowest, return the matching point value. This is explicit and readable.
- Unit tests covering: one tier satisfied only, middle tier satisfied, highest tier satisfied.

**Warning signs:**
- `if (vfx >= 30) score += 2; if (vfx >= 50) score += 2;` — this is the accumulation error pattern
- No unit test covering "exactly at 50%, just below 75%"

**Phase:** Address in Phase 1 (scoring engine).

---

### Pitfall 8: The Proposed Test's Tiered Pass Mark Implemented as a Single Threshold

**What goes wrong:** The proposed test has two pass thresholds: 20 points if QNZPE is under $100m, 30 points if QNZPE is $100m or above. The most common mistake is hardcoding `passThreshold = 20` or `passThreshold = 30` rather than deriving it from the QNZPE input.

**Why it happens:** The existing test has a single threshold (40 points). Developers mentally model the pass check as a simple `score >= threshold`, and forget to make the proposed test's threshold dynamic.

**Prevention:**
- The proposed scoring result type explicitly includes `passThreshold: 20 | 30` as a field, derived from QNZPE at calculation time. The component displays this field so the user can see which threshold applies to their project.
- Unit tests: one project just above $100m QNZPE, one just below.

**Warning signs:**
- `const PROPOSED_PASS_THRESHOLD = 20` as a constant anywhere in the codebase
- The pass check for proposed is not reading from the QNZPE input

**Phase:** Address in Phase 1 (scoring engine).

---

### Pitfall 9: Form Validation Blocking Score Display

**What goes wrong:** The app applies strict form validation — "you must enter a value for every field before we calculate" — meaning users can't see scores until every input is filled. This kills the exploratory use case: "what happens if I enter just the VFX percentage, what does that get me?" Policy stakeholders want to explore, not submit completed forms.

**Why it happens:** React Hook Form's default model is "validate on submit." Pairing with Zod encourages a "all-or-nothing" validation schema. The developer treats the form like a data-collection form rather than a calculator.

**Prevention:**
- Treat all inputs as optional with sensible defaults (zero). Missing inputs score zero points for that criterion.
- Show scores in real time as inputs change. The score is always visible — it's just zero for uncompleted sections.
- Validation should only prevent saving (if saving is destructive) or flag impossible values (e.g. a percentage over 100), not block score display.
- Use `watch()` from React Hook Form to derive live scores without waiting for submission.

**Warning signs:**
- `onSubmit` handler being where scores are first calculated
- "Form is invalid, please complete all fields" error blocking the results panel

**Phase:** Address in Phase 2 (form + results architecture).

---

### Pitfall 10: Seed Data Realism Rules Are Not Enforceable at Runtime

**What goes wrong:** The seed data requirements are specific and interrelated: "big budget = low qualifying persons", "most projects reach 80% on C2 especially smaller ones", "Section E rare and for big budgets". These are hard to manually verify across 50 records. Seed data is hand-crafted and many of the realism constraints are violated, but nobody checks.

**Why it happens:** With 50 records and complex constraints, manual verification is tedious. The developer creates data that looks plausible but doesn't satisfy all constraints.

**Prevention:**
- Write a seed data validator that runs the scoring engine on all 50 seed projects and checks: exactly 25 pass existing, exactly 25 fail existing; all have QNZPE > $20m; all 50 pass the QNZPE test for the proposed system's lower threshold; none have C3/C10 scores under the existing system; A1 is present in all.
- Run this validator as part of development (not a production concern) every time seed data changes.
- Generate seed data programmatically with constrained random values rather than hand-crafting 50 JSON objects.

**Warning signs:**
- Seed data as a single large JSON file with no generation script
- No automated check that seed data satisfies the distribution requirements

**Phase:** Address in Phase 3 (seed data generation).

---

### Pitfall 11: SheetJS Bundle Weight Loaded Eagerly

**What goes wrong:** SheetJS (`xlsx`) is a 400kb+ minified library. If imported at the top of a file that loads on app startup, it adds 400kb to the initial bundle. Since Excel export is an infrequent action, this is pure waste.

**Why it happens:** `import * as XLSX from 'xlsx'` at the top of the export component, which loads on first render.

**Prevention:**
- Use dynamic import: `const XLSX = await import('xlsx')` inside the export handler function. Vite handles this as a code-split chunk loaded only when the user triggers export.
- Confirm with Vite bundle analysis (`npx vite-bundle-visualizer`) that xlsx is not in the main bundle.

**Warning signs:**
- `import * as XLSX from 'xlsx'` at the top of any component file
- Initial bundle size exceeding 400kb

**Phase:** Address in Phase 4 (export feature).

---

## Minor Pitfalls

Mistakes that create friction or minor correctness issues.

---

### Pitfall 12: Percentage Inputs Accept Impossible Values Without Warning

**What goes wrong:** A user enters 110 for "% NZ crew". The scoring engine clamps at 100% or caps point awards, but the stored input is 110. The displayed percentage looks wrong. Or the user enters a decimal (0.8 intending 80%) and the threshold comparison treats it as 0.8%.

**Prevention:**
- Validate inputs as `min: 0, max: 100` for percentage fields, with immediate inline feedback (not blocking).
- Display the input units clearly ("Enter as a whole number, e.g. 80 for 80%").
- Normalise on blur: if the user enters 0.8 in a percentage field, prompt "Did you mean 80%?"

**Phase:** Address in Phase 2 (form field components).

---

### Pitfall 13: Project List Performance Degrades If localStorage Grows Large

**What goes wrong:** 50 seed projects plus user-created projects, each with full input objects, could stress localStorage reads on every render. The summary screen renders all projects simultaneously, recalculating scores for each on every render.

**Why it happens:** 50 records is well within localStorage's 5MB limit (each project JSON is small — well under 5KB), but score recalculation for 50 projects on every summary screen render could cause perceptible lag on low-end devices.

**Prevention:**
- `useMemo` on the scored project list in the summary screen, keyed to the projects array.
- 50 records is not a virtualization concern — do not over-engineer with react-window.
- Measure actual performance before optimising. Likely a non-issue with 50 records and fast pure functions.

**Phase:** Address in Phase 2 (summary screen) if performance is observed during development.

---

### Pitfall 14: "Associated Content" Window Extension Silently Ignored

**What goes wrong:** The proposed test extends the associated content window from 3 to 5 years. This may affect whether certain historical productions are counted as associated content. If the form asks for "associated content count" as a raw number, users might enter different numbers for existing vs. proposed depending on which years they're counting. The form doesn't guide this.

**Prevention:**
- For any criterion where the proposed test changes a time window or eligibility definition compared to the existing test, add a contextual note in the UI explaining the difference. Help text: "Under the proposed test, content from the past 5 years counts (vs 3 years under the existing test)."
- Do not attempt to calculate this automatically — the user knows which of their productions qualify under each window. Expose the input clearly.

**Phase:** Address in Phase 2 (form UI and help text).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Scoring engine implementation | Misread spec, tiered vs cumulative, wrong pass threshold | Pre-code spec doc + unit tests before UI |
| Data model design | Stored derived state, shared inputs duplicated | Model inputs only; single ProjectInputs type |
| Form architecture | Validation blocking live scores, shared field divergence | Calculate on watch(), single form state |
| Seed data generation | Distribution constraints violated, no validator | Generation script + automated constraint check |
| localStorage setup | Schema changes break data, no migration | Schema version from day one |
| Excel export | SheetJS in main bundle | Dynamic import in export handler |
| Summary screen | Score recalculation on every render | useMemo on scored list |

---

## Sources

- React derived state anti-pattern: https://medium.com/@dreamerkumar/stop-using-useeffect-for-derived-state-a-react-anti-pattern-thats-killing-your-app-s-performance-8dcb83b48805
- React official: You Probably Don't Need Derived State: https://legacy.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
- JavaScript floating-point precision: https://www.xjavascript.com/blog/how-can-i-deal-with-floating-point-number-precision-in-javascript/
- localStorage schema versioning: https://blog.logrocket.com/persist-state-redux-persist-redux-toolkit-react/ (migration patterns)
- localStorage limits and performance: https://rxdb.info/articles/localstorage.html
- SheetJS bundle size: https://dev.to/jasurkurbanov/how-to-export-data-to-excel-from-api-using-reactjs-incl-custom-headers-5ded
- React Hook Form advanced usage: https://react-hook-form.com/advanced-usage
- Complex form business rules: https://medium.com/akeneo-labs/how-we-used-the-react-hook-forms-for-the-rules-engine-fd32337b5460
- State management for forms: https://prateeksurana.me/blog/why-you-should-avoid-using-state-for-computed-properties/
