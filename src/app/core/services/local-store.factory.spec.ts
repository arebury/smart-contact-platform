import { TestBed } from '@angular/core/testing';
import { createLocalStore } from './local-store.factory';

interface Foo {
  id: number;
  name: string;
}

describe('createLocalStore', () => {
  const STORAGE_KEY = 'aed_test_foos';
  const VERSION_KEY = 'aed_test_foos_v';

  const seed: readonly Foo[] = [
    { id: 1, name: 'one' },
    { id: 2, name: 'two' },
  ];

  function buildStore(version = 1) {
    return createLocalStore<Foo>({
      storageKey: STORAGE_KEY,
      versionKey: VERSION_KEY,
      currentVersion: version,
      defaults: seed,
    });
  }

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    TestBed.configureTestingModule({});
  });

  it('starts with the seed when storage is empty', () => {
    const store = buildStore();
    expect(store.items()).toEqual(seed);
  });

  it('addItem appends with a fresh id and persists', () => {
    const store = buildStore();
    const created = store.addItem({ name: 'three' });
    expect(created).toEqual({ id: 3, name: 'three' });
    expect(store.items().length).toBe(3);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]').length).toBe(3);
  });

  it('updateItem patches the matching item only', () => {
    const store = buildStore();
    store.updateItem(1, { name: 'ONE' });
    expect(store.getItem(1)?.name).toBe('ONE');
    expect(store.getItem(2)?.name).toBe('two');
  });

  it('deleteItem removes by id', () => {
    const store = buildStore();
    store.deleteItem(1);
    expect(store.items().map((i) => i.id)).toEqual([2]);
  });

  it('deleteItems removes a batch in one commit', () => {
    const store = buildStore();
    store.addItem({ name: 'three' });
    store.deleteItems([1, 3]);
    expect(store.items().map((i) => i.id)).toEqual([2]);
  });

  it('rebuilds from defaults when the stored version is older', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 99, name: 'stale' }]));
    localStorage.setItem(VERSION_KEY, '0');
    const store = buildStore(1);
    expect(store.items()).toEqual(seed);
  });

  it('falls back to defaults on corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    localStorage.setItem(VERSION_KEY, '1');
    const store = buildStore();
    expect(store.items()).toEqual(seed);
  });
});
