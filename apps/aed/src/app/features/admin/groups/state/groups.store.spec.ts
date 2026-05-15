import { TestBed } from '@angular/core/testing';

import { GroupsStore } from './groups.store';

describe('GroupsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  function makeGroupSeed() {
    return {
      name: 'Test Group',
      phone: '',
      priority: 'Media' as const,
      typification: false,
      channels: ['phone' as const],
      strategy: 'aleatoria',
      chatStrategy: 'aleatoria',
      capacityValue: 0,
      assignedAgents: [],
    };
  }

  it('seeds with the default groups', () => {
    const store = TestBed.inject(GroupsStore);
    expect(store.groups().length).toBeGreaterThan(0);
  });

  describe('addGroup', () => {
    it('inserts a fresh group with id and numeric code', () => {
      const store = TestBed.inject(GroupsStore);
      const before = store.groups().length;
      const created = store.addGroup(makeGroupSeed());
      expect(store.groups().length).toBe(before + 1);
      expect(created.id).toBeGreaterThan(0);
      expect(created.code).toMatch(/^\d+$/);
    });

    it('generates a code higher than every existing code', () => {
      const store = TestBed.inject(GroupsStore);
      const maxBefore = store.groups().reduce((max, g) => Math.max(max, Number(g.code)), 0);
      const created = store.addGroup(makeGroupSeed());
      expect(Number(created.code)).toBeGreaterThan(maxBefore);
    });
  });

  describe('updateGroup', () => {
    it('patches by id', () => {
      const store = TestBed.inject(GroupsStore);
      const target = store.groups()[0]!;
      store.updateGroup(target.id, { name: 'Renamed Group' });
      expect(store.getGroup(target.id)?.name).toBe('Renamed Group');
    });
  });

  describe('deleteGroup / deleteGroups', () => {
    it('removes a single group by id', () => {
      const store = TestBed.inject(GroupsStore);
      const target = store.groups()[0]!;
      store.deleteGroup(target.id);
      expect(store.getGroup(target.id)).toBeUndefined();
    });

    it('removes a batch of groups', () => {
      const store = TestBed.inject(GroupsStore);
      const [a, b] = store.groups();
      store.deleteGroups([a!.id, b!.id]);
      expect(store.getGroup(a!.id)).toBeUndefined();
      expect(store.getGroup(b!.id)).toBeUndefined();
    });
  });

  describe('duplicate', () => {
    it('returns a copy with "Copia de" prefix and draft flag', () => {
      const store = TestBed.inject(GroupsStore);
      const source = store.groups()[0]!;
      const copy = store.duplicate(source.id);
      expect(copy).toBeTruthy();
      expect(copy!.name).toBe(`Copia de ${source.name}`);
      expect(copy!.isDraft).toBe(true);
      expect(copy!.id).not.toBe(source.id);
    });

    it('returns undefined when the source id does not exist', () => {
      const store = TestBed.inject(GroupsStore);
      expect(store.duplicate(999_999)).toBeUndefined();
    });
  });

  describe('bulkUpdate', () => {
    it('applies a priority change to every selected id', () => {
      const store = TestBed.inject(GroupsStore);
      const [a, b] = store.groups();
      store.bulkUpdate([a!.id, b!.id], 'priority', 'Alta');
      expect(store.getGroup(a!.id)?.priority).toBe('Alta');
      expect(store.getGroup(b!.id)?.priority).toBe('Alta');
    });

    it('applies a strategy change without touching other fields', () => {
      const store = TestBed.inject(GroupsStore);
      const target = store.groups()[0]!;
      const beforeName = target.name;
      store.bulkUpdate([target.id], 'strategy', 'lineal');
      const after = store.getGroup(target.id)!;
      expect(after.strategy).toBe('lineal');
      expect(after.name).toBe(beforeName);
    });

    it('is a no-op for an empty id list', () => {
      const store = TestBed.inject(GroupsStore);
      const snapshot = store.groups().map((g) => g.id);
      store.bulkUpdate([], 'priority', 'Alta');
      expect(store.groups().map((g) => g.id)).toEqual(snapshot);
    });
  });
});
