import { computed, Injectable, signal } from '@angular/core';

import { MOCK_ENTITIES } from '../data/entities-mock';
import type { Entity } from '../data/entity.types';

/**
 * Signal store de entidades Memory.
 *
 * Iter 10a (S38): listado + delete + computeds para system / user.
 * Iter 10b: + addEntity + updateEntity (Create Modal + Edit Sidepanel).
 *
 * System entities (`isSystem: true`) son inmutables — `deleteEntity`
 * las ignora silenciosamente como defensive filter.
 */
@Injectable({ providedIn: 'root' })
export class EntitiesStore {
  private readonly _entities = signal<readonly Entity[]>(MOCK_ENTITIES);

  readonly entities = this._entities.asReadonly();

  readonly systemEntities = computed(() =>
    this._entities().filter((e) => e.isSystem),
  );

  readonly userEntities = computed(() =>
    this._entities().filter((e) => !e.isSystem),
  );

  readonly hasUserEntities = computed(() => this.userEntities().length > 0);

  getEntity(id: string): Entity | undefined {
    return this._entities().find((e) => e.id === id);
  }

  deleteEntity(id: string): void {
    const target = this.getEntity(id);
    if (!target || target.isSystem) return;
    this._entities.update((list) => list.filter((e) => e.id !== id));
  }
}
