import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  schemaVersion: number;
  // Phase 2 will add: projects, addProject, updateProject, etc.
}

export const useAppStore = create<AppState>()(
  persist(
    () => ({
      schemaVersion: 1,
    }),
    {
      name: 'uplift-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Phase 2 will add: migrate, partialize
    }
  )
);
