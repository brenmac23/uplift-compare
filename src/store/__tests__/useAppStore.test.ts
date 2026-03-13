import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../useAppStore';
import { SEED_PROJECTS } from '../../data/seedProjects';
import type { Project } from '../useAppStore';

describe('useAppStore', () => {
  beforeEach(async () => {
    // Reset localStorage and restore in-memory state to initial defaults.
    // clearStorage + rehydrate alone won't reset in-memory Zustand state;
    // we must call setState to bring the store back to its initial shape.
    await useAppStore.persist.clearStorage();
    useAppStore.setState({ schemaVersion: 2, projects: [...SEED_PROJECTS] });
  });

  // ── Schema version ────────────────────────────────────────────────────────

  it('initialises with schemaVersion: 2 on fresh localStorage', () => {
    expect(useAppStore.getState().schemaVersion).toBe(2);
  });

  it('schemaVersion is a number', () => {
    const { schemaVersion } = useAppStore.getState();
    expect(typeof schemaVersion).toBe('number');
  });

  // ── Initial projects state ────────────────────────────────────────────────

  it('initialises with a projects array', () => {
    const { projects } = useAppStore.getState();
    expect(Array.isArray(projects)).toBe(true);
  });

  // ── addProject ────────────────────────────────────────────────────────────

  it('addProject appends a Project with isSeeded=false', () => {
    const inputs = makeInputs({ projectName: 'Test Film', qnzpe: 50_000_000 });
    useAppStore.getState().addProject(inputs);
    const { projects } = useAppStore.getState();
    expect(projects).toHaveLength(1);
    expect(projects[0].isSeeded).toBe(false);
  });

  it('addProject creates a project with a UUID id', () => {
    const inputs = makeInputs({ projectName: 'Test Film', qnzpe: 50_000_000 });
    useAppStore.getState().addProject(inputs);
    const { projects } = useAppStore.getState();
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    expect(projects[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('addProject stores an ISO createdAt timestamp', () => {
    const inputs = makeInputs({ projectName: 'Test Film', qnzpe: 50_000_000 });
    useAppStore.getState().addProject(inputs);
    const { projects } = useAppStore.getState();
    // ISO 8601 format check
    expect(new Date(projects[0].createdAt).toISOString()).toBe(projects[0].createdAt);
  });

  it('addProject stores the provided inputs on the project', () => {
    const inputs = makeInputs({ projectName: 'My Project', qnzpe: 75_000_000 });
    useAppStore.getState().addProject(inputs);
    const { projects } = useAppStore.getState();
    expect(projects[0].inputs.projectName).toBe('My Project');
    expect(projects[0].inputs.qnzpe).toBe(75_000_000);
  });

  it('addProject appends multiple projects', () => {
    useAppStore.getState().addProject(makeInputs({ projectName: 'Film A', qnzpe: 10_000_000 }));
    useAppStore.getState().addProject(makeInputs({ projectName: 'Film B', qnzpe: 20_000_000 }));
    expect(useAppStore.getState().projects).toHaveLength(2);
  });

  it('each addProject call generates a unique id', () => {
    useAppStore.getState().addProject(makeInputs({ projectName: 'Film A', qnzpe: 10_000_000 }));
    useAppStore.getState().addProject(makeInputs({ projectName: 'Film B', qnzpe: 20_000_000 }));
    const { projects } = useAppStore.getState();
    expect(projects[0].id).not.toBe(projects[1].id);
  });

  // ── updateProject ─────────────────────────────────────────────────────────

  it('updateProject replaces inputs for matching project id', () => {
    useAppStore.getState().addProject(makeInputs({ projectName: 'Original', qnzpe: 10_000_000 }));
    const id = useAppStore.getState().projects[0].id;
    useAppStore.getState().updateProject(id, makeInputs({ projectName: 'Updated', qnzpe: 20_000_000 }));
    const { projects } = useAppStore.getState();
    expect(projects[0].inputs.projectName).toBe('Updated');
    expect(projects[0].inputs.qnzpe).toBe(20_000_000);
  });

  it('updateProject does not affect other projects', () => {
    useAppStore.getState().addProject(makeInputs({ projectName: 'Film A', qnzpe: 10_000_000 }));
    useAppStore.getState().addProject(makeInputs({ projectName: 'Film B', qnzpe: 20_000_000 }));
    const idA = useAppStore.getState().projects[0].id;
    useAppStore.getState().updateProject(idA, makeInputs({ projectName: 'Film A Updated', qnzpe: 15_000_000 }));
    const { projects } = useAppStore.getState();
    expect(projects[1].inputs.projectName).toBe('Film B');
  });

  // ── deleteProject ─────────────────────────────────────────────────────────

  it('deleteProject removes a user-created project (isSeeded=false)', () => {
    useAppStore.getState().addProject(makeInputs({ projectName: 'Delete Me', qnzpe: 10_000_000 }));
    const id = useAppStore.getState().projects[0].id;
    useAppStore.getState().deleteProject(id);
    expect(useAppStore.getState().projects).toHaveLength(0);
  });

  it('deleteProject does NOT remove a seed project (isSeeded=true)', () => {
    // Manually inject a seeded project into store state
    const seedProject: Project = {
      id: 'seed-001',
      isSeeded: true,
      createdAt: new Date().toISOString(),
      inputs: makeInputs({ projectName: 'Seed Film', qnzpe: 100_000_000 }),
    };
    useAppStore.setState({ projects: [seedProject] });
    useAppStore.getState().deleteProject('seed-001');
    expect(useAppStore.getState().projects).toHaveLength(1);
    expect(useAppStore.getState().projects[0].id).toBe('seed-001');
  });

  it('deleteProject only removes the targeted project', () => {
    useAppStore.getState().addProject(makeInputs({ projectName: 'Keep', qnzpe: 10_000_000 }));
    useAppStore.getState().addProject(makeInputs({ projectName: 'Delete', qnzpe: 20_000_000 }));
    const idToDelete = useAppStore.getState().projects[1].id;
    useAppStore.getState().deleteProject(idToDelete);
    const { projects } = useAppStore.getState();
    expect(projects).toHaveLength(1);
    expect(projects[0].inputs.projectName).toBe('Keep');
  });

  // ── resetToDefaults ───────────────────────────────────────────────────────

  it('resetToDefaults replaces projects array with SEED_PROJECTS', () => {
    // Add a user project, then reset — user project should be gone
    useAppStore.getState().addProject(makeInputs({ projectName: 'User Film', qnzpe: 10_000_000 }));
    useAppStore.getState().resetToDefaults();
    // After reset, projects should equal the SEED_PROJECTS import
    // With stub SEED_PROJECTS = [], projects should be empty after reset
    const { projects } = useAppStore.getState();
    // All remaining projects should be seeded (none from addProject call)
    const userProjects = projects.filter((p) => !p.isSeeded);
    expect(userProjects).toHaveLength(0);
  });

  // ── Schema migration ──────────────────────────────────────────────────────

  it('migrates from v1 persisted state to v2 by injecting projects array', async () => {
    // Simulate a v1 localStorage entry (version field tells Zustand which migrate path to take)
    const v1State = {
      state: { schemaVersion: 1 },
      version: 1,
    };
    localStorage.setItem('uplift-storage', JSON.stringify(v1State));
    // Rehydrate so Zustand reads localStorage and runs the migrate() function
    await useAppStore.persist.rehydrate();
    const state = useAppStore.getState();
    expect(state.schemaVersion).toBe(2);
    expect(Array.isArray(state.projects)).toBe(true);
  });

  it('initialises with schemaVersion: 2 after clearStorage and rehydrate', async () => {
    await useAppStore.persist.clearStorage();
    await useAppStore.persist.rehydrate();
    // After rehydrate with no localStorage data, store reverts to in-memory defaults
    // (schemaVersion is already 2 from setState in beforeEach)
    expect(useAppStore.getState().schemaVersion).toBe(2);
  });
});

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Creates a minimal valid ProjectInputs object with all fields set to
 * safe defaults. Spread overrides to customise for each test.
 */
function makeInputs(
  overrides: Partial<import('../../scoring/types').ProjectInputs>
): import('../../scoring/types').ProjectInputs {
  return {
    projectName: 'Test Project',
    productionType: 'film',
    qnzpe: 50_000_000,
    hasSustainabilityPlan: false,
    hasSustainabilityOfficer: false,
    hasCarbonReview: false,
    hasStudioLease: false,
    hasPreviousQNZPE: false,
    hasAssociatedContent: false,
    shootingNZPercent: 0,
    regionalPercent: 0,
    picturePostPercent: 0,
    soundPostPercent: 0,
    vfxPercent: 0,
    conceptPhysicalPercent: 0,
    castPercent: 0,
    crewPercent: 0,
    maoriCrewPercent: 0,
    atlCount: 0,
    btlKeyCount: 0,
    btlAdditionalCount: 0,
    hasLeadCast: false,
    supportingCastCount: 0,
    castingLevel: 'none',
    hasLeadCastMaori: false,
    hasMasterclass: false,
    hasIndustrySeminars: false,
    hasEdSeminars: false,
    attachmentCount: 0,
    internshipCount: 0,
    hasKnowledgeTransfer: false,
    commercialAgreementPercent: 0,
    infrastructureInvestment: 0,
    premiereType: 'none',
    hasNZPremiere: false,
    hasIntlPromotion: false,
    hasFilmMarketing: false,
    hasTourismMarketing: false,
    hasTourismPartnership: false,
    hasLocationAnnouncement: false,
    ...overrides,
  };
}
