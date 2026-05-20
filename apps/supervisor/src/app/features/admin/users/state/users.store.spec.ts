import { TestBed } from '@angular/core/testing';

import { DEFAULT_PERMISSIONS, DEFAULT_SECTIONS } from '../data/users-data';
import { UsersStore } from './users.store';

describe('UsersStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  function makeUserSeed() {
    return {
      name: 'Test User',
      email: 'test@example.com',
      identifier: '',
      type: 'agent' as const,
      status: 'active' as const,
      sections: { ...DEFAULT_SECTIONS },
      permissions: { ...DEFAULT_PERMISSIONS },
      assignedGroups: [],
      assignedServices: [],
    };
  }

  it('seeds with the default roster', () => {
    const store = TestBed.inject(UsersStore);
    expect(store.users().length).toBeGreaterThan(0);
  });

  describe('addUser', () => {
    it('inserts a fresh user with id, code (Uxxx), and createdAt', () => {
      const store = TestBed.inject(UsersStore);
      const before = store.users().length;
      const created = store.addUser(makeUserSeed());
      expect(store.users().length).toBe(before + 1);
      expect(created.id).toBeGreaterThan(0);
      expect(created.code).toMatch(/^U\d{3}$/);
      expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('generates a code higher than every existing code', () => {
      const store = TestBed.inject(UsersStore);
      const maxBefore = store
        .users()
        .reduce((max, u) => Math.max(max, Number(u.code.replace(/^U/, ''))), 0);
      const created = store.addUser(makeUserSeed());
      expect(Number(created.code.replace(/^U/, ''))).toBeGreaterThan(maxBefore);
    });
  });

  describe('updateUser', () => {
    it('patches by id', () => {
      const store = TestBed.inject(UsersStore);
      const target = store.users()[0]!;
      store.updateUser(target.id, { name: 'Renamed User' });
      expect(store.getUser(target.id)?.name).toBe('Renamed User');
    });
  });

  describe('deleteUser / deleteUsers', () => {
    it('removes a single user by id', () => {
      const store = TestBed.inject(UsersStore);
      const target = store.users()[0]!;
      store.deleteUser(target.id);
      expect(store.getUser(target.id)).toBeUndefined();
    });

    it('removes a batch of users', () => {
      const store = TestBed.inject(UsersStore);
      const [a, b] = store.users();
      store.deleteUsers([a!.id, b!.id]);
      expect(store.getUser(a!.id)).toBeUndefined();
      expect(store.getUser(b!.id)).toBeUndefined();
    });
  });

  // El método duplicate() del store fue eliminado en S47 al rediseñar el
  // flow: ahora "Duplicar" navega a /admin/usuarios/crear?seedFromId={id}
  // y el form-page precarga el payload sin persistir hasta Guardar.
});
