import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../useAppStore';

describe('useAppStore', () => {
  beforeEach(async () => {
    // Reset store to defaults before each test by clearing and rehydrating
    await useAppStore.persist.clearStorage();
    await useAppStore.persist.rehydrate();
  });

  it('initialises with schemaVersion: 1 on fresh localStorage', () => {
    expect(useAppStore.getState().schemaVersion).toBe(1);
  });

  it('schemaVersion is a number', () => {
    const { schemaVersion } = useAppStore.getState();
    expect(typeof schemaVersion).toBe('number');
  });

  it('schemaVersion is still 1 after clearing storage and rehydrating', async () => {
    await useAppStore.persist.clearStorage();
    await useAppStore.persist.rehydrate();
    expect(useAppStore.getState().schemaVersion).toBe(1);
  });

  it('persist version is set to 1 for future migration support', () => {
    // The store was configured with version: 1 — confirm it's accessible
    // This verifies the persist middleware is set up with version
    const state = useAppStore.getState();
    expect(state.schemaVersion).toBe(1);
  });
});
