/**
 * Entry point for seed data generation.
 *
 * Usage: npm run seed
 *   → Generates 50 deterministic projects using the PRNG seed and writes
 *     src/data/seedProjects.ts. Prints a distribution report to stdout.
 *
 * Determinism guarantee: All randomness flows through a single createPrng(SEED)
 * closure. Same SEED → identical output on every run, on every machine.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { createPrng } from './generator/prng';
import { SEED, PROJECT_COUNT } from './generator/types';
import { FILM_NAMES, TV_NAMES } from './generator/projectNames';
import { pickBudgetTier } from './generator/tiers';
import { generateProject } from './generator/index';
import { scoreExisting } from '../src/scoring/scoreExisting';
import { scoreProposed } from '../src/scoring/scoreProposed';
import type { ProjectInputs } from '../src/scoring/types';

// ── Initialise PRNG ──────────────────────────────────────────────────────────
const rand = createPrng(SEED);

// ── Determine production types for all 50 projects ──────────────────────────
// 60% film / 40% TV target
const productionTypes = Array.from({ length: PROJECT_COUNT }, () =>
  rand() < 0.6 ? 'film' : 'tv'
) as Array<'film' | 'tv'>;

const filmCount = productionTypes.filter((t) => t === 'film').length;
const tvCount = PROJECT_COUNT - filmCount;

// ── Shuffle name pools using Fisher-Yates (consumes PRNG in deterministic order) ──
function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const shuffledFilmNames = shuffle(FILM_NAMES, rand).slice(0, filmCount);
const shuffledTvNames = shuffle(TV_NAMES, rand).slice(0, tvCount);

// Build per-project name assignment in the order projects will be created
const filmNameQueue = [...shuffledFilmNames];
const tvNameQueue = [...shuffledTvNames];

// ── Generate all 50 projects ─────────────────────────────────────────────────
const results: Array<{
  project: { id: string; isSeeded: boolean; createdAt: string; inputs: Record<string, unknown> };
  existingScore: number;
  existingPassed: boolean;
  proposedPassed: boolean;
}> = [];

for (let i = 0; i < PROJECT_COUNT; i++) {
  const productionType = productionTypes[i];
  const name = productionType === 'film' ? filmNameQueue.shift()! : tvNameQueue.shift()!;
  const tierConfig = pickBudgetTier(rand);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = generateProject(rand, i, name, productionType, tierConfig) as any;
  results.push(result);
}

// ── SCEN-01 fallback override ─────────────────────────────────────────────────
// If no project naturally passes existing but fails proposed, override the last
// project (index 49) with a Section-E-heavy tentpole profile designed to achieve
// exactly this scenario. All rand() calls have been consumed before this point,
// so PRNG determinism for all other projects is preserved.
//
// Designed profile: existing = 40 (A1+B1+B2+B6+B7+C5+C6+C7+C8+C9+D1+E) = 40
// Proposed threshold: 30 (qnzpe >= $100m). Proposed score = 28 < 30 → FAILS.
{
  const naturalScen01 = results.filter(r => r.existingPassed && !r.proposedPassed).length;
  if (naturalScen01 === 0) {
    const overrideIndex = PROJECT_COUNT - 1; // last project (index 49)
    const overrideInputs: ProjectInputs = {
      projectName: results[overrideIndex].project.inputs['projectName'] as string,
      productionType: 'film',
      qnzpe: 220_000_000, // tentpole: >= $100m for proposed threshold 30
      // Section A: sustainability (existing A1=3pts mandatory)
      hasSustainabilityPlan: true,
      // Section B: production activity
      hasPreviousQNZPE: true,            // existing B2=2pts, proposed A1=2pts
      hasAssociatedContent: false,
      shootingNZPercent: 80,             // existing B4=1pt (>=75), proposed A3=1pt
      // Section E (existing only): 8pts total — the key asymmetry
      hasKnowledgeTransfer: true,        // existing E1=2pts (no proposed equivalent)
      commercialAgreementPercent: 1,     // existing E2=3pts (no proposed equivalent)
      infrastructureInvestment: 2_000_000, // existing E3=3pts (no proposed equivalent)
      // Tier 2: post-production gives same pts to both systems
      hasStudioLease: true,              // existing B1=2pts (no proposed equivalent)
      regionalPercent: 0,
      picturePostPercent: 80,            // existing B6=3pts, proposed A5=3pts
      soundPostPercent: 80,              // existing B7=3pts, proposed A6=3pts
      vfxPercent: 20,
      conceptPhysicalPercent: 20,
      castPercent: 65,                   // <80: existing C1=0, proposed B1=2pts
      crewPercent: 65,                   // <80: existing C2=0, proposed B2=0
      btlKeyCount: 4,                    // existing C5=4pts, proposed B4=4pts
      btlAdditionalCount: 8,             // existing C6=4pts (capped), proposed B5=4pts (capped)
      hasLeadCast: true,                 // existing C7=3pts, proposed B6=4pts
      supportingCastCount: 3,            // existing C8=3pts, proposed B7=3pts
      castingLevel: 'director',          // existing C9=2pts, proposed B8=2pts
      atlCount: 0,                       // existing C4=0, proposed B3=0
      // Tier 3: skills — minimal to keep proposed score low
      hasSustainabilityOfficer: false,
      hasCarbonReview: false,
      hasMasterclass: true,              // existing D1=2pts (no proposed equivalent)
      hasEdSeminars: false,
      attachmentCount: 0,
      internshipCount: 0,
      // Tier 3: marketing — none (keeps proposed D score at 0)
      premiereType: 'none',
      hasFilmMarketing: false,
      hasTourismMarketing: false,
      hasTourismPartnership: false,
      // Proposed-only fields — false (keeps proposed C/D scores low)
      hasIndustrySeminars: false,
      hasNZPremiere: false,
      hasIntlPromotion: false,
      hasLocationAnnouncement: false,
      // Maori: none
      maoriCrewPercent: 0,
      hasLeadCastMaori: false,
    };

    const overrideExisting = scoreExisting(overrideInputs);
    const overrideProposed = scoreProposed(overrideInputs);

    // Verify the override achieves SCEN-01 before applying
    if (overrideExisting.passed && !overrideProposed.passed) {
      results[overrideIndex] = {
        project: {
          ...results[overrideIndex].project,
          inputs: overrideInputs as unknown as Record<string, unknown>,
        },
        existingScore: overrideExisting.totalPoints,
        existingPassed: overrideExisting.passed,
        proposedPassed: overrideProposed.passed,
      };
      console.log(`SCEN-01 override applied to project ${overrideIndex + 1}: existing=${overrideExisting.totalPoints}, proposed=${overrideProposed.totalPoints}`);
    } else {
      console.warn(`SCEN-01 override profile check: existing=${overrideExisting.totalPoints} (passed=${overrideExisting.passed}), proposed=${overrideProposed.totalPoints} (passed=${overrideProposed.passed})`);
      console.warn('Override did NOT achieve SCEN-01 — profile needs adjustment');
    }
  }
}

// ── Distribution statistics ───────────────────────────────────────────────────
const projects = results.map((r) => r.project);
const scores = results.map((r) => r.existingScore);

const bigBudgetCount = projects.filter((p) => (p.inputs as Record<string, unknown>)['qnzpe'] as number >= 100_000_000).length;
const passCount = results.filter((r) => r.existingScore >= 40).length;
const borderlineCount = results.filter((r) => r.existingScore >= 38 && r.existingScore <= 42).length;
const minScore = Math.min(...scores);
const maxScore = Math.max(...scores);
const studioLeaseCount = projects.filter((p) => (p.inputs as Record<string, unknown>)['hasStudioLease']).length;
const sectionECount = projects.filter((p) => {
  const inp = p.inputs as Record<string, unknown>;
  return inp['hasKnowledgeTransfer'] || (inp['commercialAgreementPercent'] as number) > 0 || (inp['infrastructureInvestment'] as number) > 0;
}).length;
const highCrewCount = projects.filter((p) => (p.inputs as Record<string, unknown>)['crewPercent'] as number >= 80).length;

// Median and stddev
const sortedScores = [...scores].sort((a, b) => a - b);
const median = sortedScores.length % 2 === 0
  ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
  : sortedScores[Math.floor(sortedScores.length / 2)];
const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
const stddev = Math.sqrt(variance);

// SCEN counters
const scen01Count = results.filter(r => r.existingPassed && !r.proposedPassed).length;
const maoriActiveCount = projects.filter(p => {
  const inp = p.inputs as Record<string, unknown>;
  return (inp['maoriCrewPercent'] as number) >= 10 || inp['hasLeadCastMaori'] === true;
}).length;

// Tier counts
const tierCounts = { small: 0, mid: 0, large: 0, tentpole: 0 };
for (const p of projects) {
  const qnzpe = (p.inputs as Record<string, unknown>)['qnzpe'] as number;
  if (qnzpe < 50_000_000) tierCounts.small++;
  else if (qnzpe < 100_000_000) tierCounts.mid++;
  else if (qnzpe < 200_000_000) tierCounts.large++;
  else tierCounts.tentpole++;
}

// ── Print distribution report ─────────────────────────────────────────────────
console.log('');
console.log('=== Seed Data Distribution Report ===');
console.log(`Total projects: ${PROJECT_COUNT}`);
console.log(`Film: ${filmCount} | TV: ${tvCount}`);
console.log(`Budget tiers: small=${tierCounts.small} mid=${tierCounts.mid} large=${tierCounts.large} tentpole=${tierCounts.tentpole}`);
console.log(`Pass rate (existing): ${passCount}/50 (${Math.round((passCount / 50) * 100)}%)`);
console.log(`Score range: ${minScore}-${maxScore}`);
console.log(`Borderline (38-42): ${borderlineCount}`);
console.log(`hasSustainabilityPlan=true: 50/50`);
console.log(`Maori active: ${maoriActiveCount}/50`);
console.log(`hasStudioLease=true: ${studioLeaseCount}`);
console.log(`Section E active: ${sectionECount}`);
console.log(`crewPercent>=80: ${highCrewCount}`);
console.log(`qnzpe>=$100m: ${bigBudgetCount}`);
console.log(`Median score: ${median}`);
console.log(`Mean score: ${mean.toFixed(1)}`);
console.log(`Stddev: ${stddev.toFixed(2)}`);
console.log(`--- SCEN Scenarios ---`);
console.log(`SCEN-01 (pass-existing, fail-proposed): ${scen01Count}`);
console.log(`SCEN-02 (Maori active): ${maoriActiveCount}`);
console.log(`SCEN-03 (pass existing): ${passCount}/50 (target 28-30)`);
console.log(`SCEN-04 (stddev 4-12): ${stddev.toFixed(2)}`);
console.log('=====================================');
console.log('');

// ── Generate output file ──────────────────────────────────────────────────────
const outputPath = resolve(import.meta.dirname, '../src/data/seedProjects.ts');

const projectLines = projects.map((project) => {
  const inp = project.inputs as Record<string, unknown>;
  return `  {
    id: ${JSON.stringify(project.id)},
    isSeeded: ${project.isSeeded},
    createdAt: ${JSON.stringify(project.createdAt)},
    inputs: ${JSON.stringify(project.inputs, null, 6).split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n')},
  }`;
});

const fileContent = `/**
 * Auto-generated seed data. DO NOT EDIT MANUALLY.
 * Regenerate with: npm run seed
 *
 * PRNG seed: 0x${SEED.toString(16).toUpperCase()} (${SEED})
 * Generated: ${new Date().toISOString().slice(0, 10)}
 * Projects: ${PROJECT_COUNT}
 */

import type { Project } from '../store/useAppStore';

export const SEED_PROJECTS: Project[] = [
${projectLines.join(',\n')}
];
`;

writeFileSync(outputPath, fileContent, 'utf8');
console.log(`Written: ${outputPath}`);
