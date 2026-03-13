import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { Project } from '@/store/useAppStore';
import { scoreExisting, scoreProposed } from '@/scoring/index';
import type { ScoringResult } from '@/scoring/types';

// ── Filter Types ──────────────────────────────────────────────────────────────

export type PassFailFilter =
  | 'all'
  | 'existing-pass'
  | 'existing-fail'
  | 'proposed-pass'
  | 'proposed-fail'
  | 'both-pass';

export type TypeFilter = 'all' | 'film' | 'tv';

export type BudgetFilter = 'all' | 'under-100m' | 'over-100m';

// ── Result Types ──────────────────────────────────────────────────────────────

export interface ScoredProject {
  project: Project;
  existing: ScoringResult;
  proposed: ScoringResult;
}

export interface AggregateStats {
  total: number;
  existingPass: number;
  proposedPass: number;
  bothPass: number;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useFilteredProjects(
  passFilter: PassFailFilter,
  typeFilter: TypeFilter,
  budgetFilter: BudgetFilter
): { filtered: ScoredProject[]; stats: AggregateStats } {
  const projects = useAppStore((s) => s.projects);

  // Step 1: Score all projects
  const scored = useMemo<ScoredProject[]>(
    () =>
      projects.map((project) => ({
        project,
        existing: scoreExisting(project.inputs),
        proposed: scoreProposed(project.inputs),
      })),
    [projects]
  );

  // Step 2: Apply filters to get filtered list
  const filtered = useMemo<ScoredProject[]>(() => {
    return scored.filter(({ project, existing, proposed }) => {
      // Pass/fail filter
      if (passFilter === 'existing-pass' && !existing.passed) return false;
      if (passFilter === 'existing-fail' && existing.passed) return false;
      if (passFilter === 'proposed-pass' && !proposed.passed) return false;
      if (passFilter === 'proposed-fail' && proposed.passed) return false;
      if (passFilter === 'both-pass' && (!existing.passed || !proposed.passed)) return false;

      // Type filter
      if (typeFilter === 'film' && project.inputs.productionType !== 'film') return false;
      if (typeFilter === 'tv' && project.inputs.productionType !== 'tv') return false;

      // Budget filter (100_000_000 = $100m)
      if (budgetFilter === 'under-100m' && project.inputs.qnzpe >= 100_000_000) return false;
      if (budgetFilter === 'over-100m' && project.inputs.qnzpe < 100_000_000) return false;

      return true;
    });
  }, [scored, passFilter, typeFilter, budgetFilter]);

  // Step 3: Compute aggregate stats from the FILTERED list
  // (per CONTEXT.md locked decision: stats reflect the current view)
  const stats = useMemo<AggregateStats>(() => {
    const total = filtered.length;
    let existingPass = 0;
    let proposedPass = 0;
    let bothPass = 0;

    for (const { existing, proposed } of filtered) {
      if (existing.passed) existingPass++;
      if (proposed.passed) proposedPass++;
      if (existing.passed && proposed.passed) bothPass++;
    }

    return { total, existingPass, proposedPass, bothPass };
  }, [filtered]);

  return { filtered, stats };
}
