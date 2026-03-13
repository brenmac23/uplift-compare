import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProjectInputs } from '../scoring/types';
import { SEED_PROJECTS } from '../data/seedProjects';

/**
 * A single project stored in the uplift tool.
 * Seed projects are read-only (cannot be deleted); user-created projects can be deleted.
 */
export interface Project {
  /** Unique identifier (UUID for user projects, stable string for seed projects). */
  id: string;
  /** True for projects included in the default seed data; false for user-created projects. */
  isSeeded: boolean;
  /** Raw scoring inputs for this project. */
  inputs: ProjectInputs;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
}

interface AppState {
  schemaVersion: number;
  projects: Project[];
  addProject: (inputs: ProjectInputs) => void;
  updateProject: (id: string, inputs: ProjectInputs) => void;
  deleteProject: (id: string) => void;
  resetToDefaults: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      schemaVersion: 2,
      projects: SEED_PROJECTS,

      addProject: (inputs) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              id: crypto.randomUUID(),
              isSeeded: false,
              inputs,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateProject: (id, inputs) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, inputs } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id || p.isSeeded),
        })),

      resetToDefaults: () => set({ projects: SEED_PROJECTS }),
    }),
    {
      name: 'uplift-storage',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (version === 1) {
          return {
            ...(persistedState as object),
            schemaVersion: 2,
            projects: SEED_PROJECTS,
          };
        }
        return persistedState as AppState;
      },
    }
  )
);
