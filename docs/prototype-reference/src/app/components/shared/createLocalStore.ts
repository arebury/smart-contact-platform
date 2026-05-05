import { useCallback, useSyncExternalStore } from "react";

/**
 * Generic local-storage-backed store factory (DD#297)
 *
 * Encapsulates the repeated pub/sub + localStorage + useSyncExternalStore
 * pattern shared across useAgentsStore, useGroupsStore, useLabelsStore,
 * useTemplatesStore and useUsersStore.
 *
 * Returns a stable `useStore` hook plus low-level helpers for custom methods.
 */

interface StoreConfig<T> {
  storageKey: string;
  versionKey: string;
  currentVersion: number;
  defaults: T[];
}

export function createLocalStore<T extends { id: number }>(config: StoreConfig<T>) {
  const { storageKey, versionKey, currentVersion, defaults } = config;

  /* ── Tiny pub/sub ── */
  const listeners = new Set<() => void>();
  function emitChange() {
    listeners.forEach((l) => l());
  }

  /* ── localStorage I/O with versioning ── */
  function readFromStorage(): T[] {
    try {
      const version = localStorage.getItem(versionKey);
      if (version && Number(version) >= currentVersion) {
        const raw = localStorage.getItem(storageKey);
        if (raw) return JSON.parse(raw) as T[];
      } else {
        localStorage.removeItem(storageKey);
        localStorage.setItem(versionKey, String(currentVersion));
      }
    } catch {
      /* corrupted — fall back to defaults */
    }
    return defaults;
  }

  function writeToStorage(items: T[]) {
    localStorage.setItem(storageKey, JSON.stringify(items));
    localStorage.setItem(versionKey, String(currentVersion));
    cachedSnapshot = items;
    emitChange();
  }

  let cachedSnapshot: T[] = readFromStorage();

  function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => { listeners.delete(callback); };
  }

  function getSnapshot(): T[] {
    return cachedSnapshot;
  }

  /* ── Expose low-level API for custom methods ── */
  function getRawSnapshot() { return cachedSnapshot; }

  /* ── Base hook ── */
  function useStore() {
    const items = useSyncExternalStore(subscribe, getSnapshot);

    const setItems = useCallback((updater: (prev: T[]) => T[]) => {
      const next = updater(cachedSnapshot);
      writeToStorage(next);
    }, []);

    const addItem = useCallback(
      (item: Omit<T, "id">, idFactory?: (prev: T[]) => Partial<T>): T => {
        const maxId = cachedSnapshot.reduce((m, i) => Math.max(m, i.id), 0);
        const extra = idFactory ? idFactory(cachedSnapshot) : {};
        const newItem = { ...item, id: maxId + 1, ...extra } as T;
        writeToStorage([...cachedSnapshot, newItem]);
        return newItem;
      },
      []
    );

    const updateItem = useCallback(
      (id: number, updates: Partial<T>) => {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
        );
      },
      [setItems]
    );

    const deleteItem = useCallback(
      (id: number) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      },
      [setItems]
    );

    const deleteItems = useCallback(
      (ids: number[]) => {
        const idSet = new Set(ids);
        setItems((prev) => prev.filter((i) => !idSet.has(i.id)));
      },
      [setItems]
    );

    const getItem = useCallback(
      (id: number): T | undefined => {
        return items.find((i) => i.id === id);
      },
      [items]
    );

    return { items, setItems, addItem, updateItem, deleteItem, deleteItems, getItem };
  }

  return { useStore, writeToStorage, getRawSnapshot };
}
