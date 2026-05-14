import { TestBed } from '@angular/core/testing';

import { DEFAULT_AGENT_PERMISSIONS } from '../data/agents-data';
import { AgentsStore } from './agents.store';

/**
 * Sample test for an admin store. Covers the seed, the CRUD surface,
 * the `nextCode` collision logic, the duplicate flow, and the two
 * cross-cutting batch operations (`bulkUpdate`, `removeLabelsFromAllAgents`).
 *
 * Pattern matches `labels.store.spec.ts` — same `localStorage.clear()`
 * + `TestBed.configureTestingModule({})` boilerplate so the
 * `providedIn: 'root'` store gets a fresh local-storage instance per
 * test.
 */
describe('AgentsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  function makeAgentSeed() {
    return {
      name: 'Test Agent',
      extension: '9999',
      extensionType: 'webrtc' as const,
      agentType: 'normal' as const,
      channels: ['phone' as const],
      status: 'active' as const,
      presenceStatus: 'disponible' as const,
      groups: [],
      permissions: { ...DEFAULT_AGENT_PERMISSIONS },
    };
  }

  it('seeds with the default roster', () => {
    const store = TestBed.inject(AgentsStore);
    expect(store.agents().length).toBeGreaterThan(0);
  });

  describe('addAgent', () => {
    it('inserts and assigns a fresh id + code', () => {
      const store = TestBed.inject(AgentsStore);
      const before = store.agents().length;
      const created = store.addAgent(makeAgentSeed());
      expect(store.agents().length).toBe(before + 1);
      expect(created.id).toBeGreaterThan(0);
      expect(created.code).toMatch(/^\d+$/);
    });

    it('generates a code higher than every existing code', () => {
      const store = TestBed.inject(AgentsStore);
      const maxBefore = store.agents().reduce((max, a) => Math.max(max, Number(a.code)), 0);
      const created = store.addAgent(makeAgentSeed());
      expect(Number(created.code)).toBeGreaterThan(maxBefore);
    });
  });

  describe('updateAgent', () => {
    it('patches by id', () => {
      const store = TestBed.inject(AgentsStore);
      const target = store.agents()[0]!;
      store.updateAgent(target.id, { name: 'Renamed Agent' });
      expect(store.getAgent(target.id)?.name).toBe('Renamed Agent');
    });
  });

  describe('deleteAgent / deleteAgents', () => {
    it('removes a single agent by id', () => {
      const store = TestBed.inject(AgentsStore);
      const target = store.agents()[0]!;
      store.deleteAgent(target.id);
      expect(store.getAgent(target.id)).toBeUndefined();
    });

    it('removes a batch of agents by id', () => {
      const store = TestBed.inject(AgentsStore);
      const [a, b] = store.agents();
      store.deleteAgents([a!.id, b!.id]);
      expect(store.getAgent(a!.id)).toBeUndefined();
      expect(store.getAgent(b!.id)).toBeUndefined();
    });
  });

  describe('duplicate', () => {
    it('returns a copy with prefixed name + cleared extension/pin + draft flag', () => {
      const store = TestBed.inject(AgentsStore);
      const source = store.agents()[0]!;
      const copy = store.duplicate(source.id);
      expect(copy).toBeTruthy();
      expect(copy!.name).toBe(`Copia de ${source.name}`);
      expect(copy!.extension).toBe('');
      expect(copy!.pin).toBe('');
      expect(copy!.status).toBe('inactive');
      expect(copy!.isDraft).toBe(true);
      expect(copy!.id).not.toBe(source.id);
    });

    it('returns undefined when the source id does not exist', () => {
      const store = TestBed.inject(AgentsStore);
      expect(store.duplicate(999_999)).toBeUndefined();
    });
  });

  describe('updatePresence', () => {
    it('updates only the presenceStatus field', () => {
      const store = TestBed.inject(AgentsStore);
      const target = store.agents()[0]!;
      const beforeName = target.name;
      store.updatePresence(target.id, 'comida');
      const after = store.getAgent(target.id)!;
      expect(after.presenceStatus).toBe('comida');
      expect(after.name).toBe(beforeName);
    });
  });

  describe('bulkUpdate', () => {
    it('applies a status change to every selected id', () => {
      const store = TestBed.inject(AgentsStore);
      const [a, b] = store.agents();
      store.bulkUpdate([a!.id, b!.id], 'status', 'inactive');
      expect(store.getAgent(a!.id)?.status).toBe('inactive');
      expect(store.getAgent(b!.id)?.status).toBe('inactive');
    });

    it('applies a recording permission change without clobbering other permissions', () => {
      const store = TestBed.inject(AgentsStore);
      const target = store.agents()[0]!;
      const before = target.permissions;
      store.bulkUpdate([target.id], 'recording', true);
      const after = store.getAgent(target.id)!;
      expect(after.permissions.recording).toBe(true);
      // Other permission keys should be unchanged
      expect(after.permissions.callsEnabled).toBe(before.callsEnabled);
      expect(after.permissions.manageDevices).toBe(before.manageDevices);
    });

    it('is a no-op for an empty id list', () => {
      const store = TestBed.inject(AgentsStore);
      const snapshot = store.agents().map((a) => a.id);
      store.bulkUpdate([], 'status', 'inactive');
      expect(store.agents().map((a) => a.id)).toEqual(snapshot);
    });
  });

  describe('removeLabelsFromAllAgents', () => {
    it('strips the given label ids from every agent that referenced them', () => {
      const store = TestBed.inject(AgentsStore);
      // Seed an agent with a couple of labels for the test
      const created = store.addAgent({ ...makeAgentSeed(), labels: [1, 2, 3] });
      store.removeLabelsFromAllAgents([1, 3]);
      expect(store.getAgent(created.id)?.labels).toEqual([2]);
    });

    it('leaves agents without those labels untouched', () => {
      const store = TestBed.inject(AgentsStore);
      const target = store.agents()[0]!;
      const before = target.labels ?? [];
      store.removeLabelsFromAllAgents([999_999]); // an id no agent has
      expect(store.getAgent(target.id)?.labels ?? []).toEqual([...before]);
    });

    it('is a no-op for an empty label list', () => {
      const store = TestBed.inject(AgentsStore);
      const snapshot = JSON.stringify(store.agents());
      store.removeLabelsFromAllAgents([]);
      expect(JSON.stringify(store.agents())).toBe(snapshot);
    });
  });

  describe('agentCountByLabel', () => {
    it('counts agents per label id', () => {
      const store = TestBed.inject(AgentsStore);
      store.addAgent({ ...makeAgentSeed(), labels: [42] });
      store.addAgent({ ...makeAgentSeed(), labels: [42, 43] });
      const map = store.agentCountByLabel();
      expect(map.get(42)).toBe(2);
      expect(map.get(43)).toBe(1);
    });
  });
});
