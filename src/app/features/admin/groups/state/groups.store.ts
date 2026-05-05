import { Injectable } from '@angular/core';

import { createLocalStore, LocalStore } from '@core/services';
import { Group, GROUPS_SEED } from '../data/groups-data';

function nextCode(items: readonly Group[]): string {
  const maxN = items.reduce((max, g) => {
    const n = Number(g.code);
    return Number.isFinite(n) && n > max ? n : max;
  }, 20000);
  return String(maxN + 1);
}

@Injectable({ providedIn: 'root' })
export class GroupsStore {
  private readonly store: LocalStore<Group> = createLocalStore<Group>({
    storageKey: 'smartcontact_groups',
    versionKey: 'smartcontact_groups_v',
    currentVersion: 1,
    defaults: GROUPS_SEED,
  });

  readonly groups = this.store.items;

  addGroup(data: Omit<Group, 'id' | 'code'>): Group {
    return this.store.addItem({ ...data, code: nextCode(this.groups()) });
  }

  updateGroup(id: number, updates: Partial<Group>): void {
    this.store.updateItem(id, updates);
  }

  deleteGroup(id: number): void {
    this.store.deleteItem(id);
  }

  deleteGroups(ids: readonly number[]): void {
    this.store.deleteItems(ids);
  }

  getGroup(id: number): Group | undefined {
    return this.store.getItem(id);
  }

  duplicate(id: number): Group | undefined {
    const source = this.getGroup(id);
    if (!source) return undefined;
    const { id: _id, code: _code, ...rest } = source;
    return this.addGroup({
      ...rest,
      name: `${source.name} (copia)`,
      isDraft: true,
    });
  }
}
