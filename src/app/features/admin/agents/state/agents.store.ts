import { computed, Injectable } from '@angular/core';

import { createLocalStore, LocalStore } from '../../../../core/services/local-store.factory';
import { Agent, AGENTS_SEED } from '../data/agents-data';

/**
 * Agents store — currently a thin wrapper over the local-store factory used by
 * the Labels feature for cascading delete + agent counts. The Agents feature
 * (list page, create/edit form, presence, channels…) will expand this service
 * with domain-specific methods when it lands.
 */
@Injectable({ providedIn: 'root' })
export class AgentsStore {
  private readonly store: LocalStore<Agent> = createLocalStore<Agent>({
    storageKey: 'smartcontact_agents',
    versionKey: 'smartcontact_agents_v',
    currentVersion: 1,
    defaults: AGENTS_SEED,
  });

  readonly agents = this.store.items;

  /**
   * Returns a Map<labelId, agentCount> derived from the agents list. Used by
   * the Labels page to inform the user how many agents lose a tag on delete.
   */
  readonly agentCountByLabel = computed(() => {
    const map = new Map<number, number>();
    for (const agent of this.agents()) {
      for (const labelId of agent.labels ?? []) {
        map.set(labelId, (map.get(labelId) ?? 0) + 1);
      }
    }
    return map;
  });

  updateAgent(id: number, updates: Partial<Agent>): void {
    this.store.updateItem(id, updates);
  }

  /** Strip a list of label ids from every agent that references them. */
  removeLabelsFromAllAgents(labelIds: readonly number[]): void {
    if (labelIds.length === 0) return;
    const removalSet = new Set(labelIds);
    for (const agent of this.agents()) {
      const current = agent.labels ?? [];
      if (!current.some((id) => removalSet.has(id))) continue;
      this.store.updateItem(agent.id, {
        labels: current.filter((id) => !removalSet.has(id)),
      });
    }
  }
}
