import { computed, Injectable, signal } from '@angular/core';

import { MOCK_RULES } from '../data/rules-mock';
import type { Rule } from '../data/rule.types';

/**
 * Signal store de reglas Memory.
 *
 * Iter 9a (S38): expone la lista mock readonly + computeds para las 2
 * secciones del listado (Activas ordenables / Inactivas+Borradores).
 *
 * Iter 9b: + reorderActive (drag-drop priorización), toggleActive, deleteRule.
 * Iter 9c: + CRUD vía constructor.
 * Iter 9d: + duplicateRule, conflict detection.
 */
@Injectable({ providedIn: 'root' })
export class RulesStore {
  private readonly _rules = signal<readonly Rule[]>(MOCK_RULES);

  readonly rules = this._rules.asReadonly();

  /** Reglas activas ordenadas por prioridad ascendente (1 = más alta). */
  readonly activeRules = computed(() => {
    return [...this._rules()]
      .filter((r) => r.active && !r.isDraft)
      .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
  });

  /** Reglas inactivas + borradores, sin orden de prioridad. */
  readonly inactiveOrDraftRules = computed(() => {
    return [...this._rules()]
      .filter((r) => !r.active || r.isDraft)
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  });

  readonly hasActive = computed(() => this.activeRules().length > 0);
  readonly isEmpty = computed(() => this._rules().length === 0);

  /**
   * Reorderar las reglas activas según un nuevo array de ids. Recompone
   * `priority` 1..N sobre la lista activa según el orden recibido.
   * Las inactivas/borradores no se tocan.
   */
  reorderActive(orderedIds: readonly number[]): void {
    this._rules.update((rules) => {
      const newPrioByid = new Map<number, number>();
      orderedIds.forEach((id, idx) => newPrioByid.set(id, idx + 1));
      const now = new Date().toISOString();
      return rules.map((r) => {
        if (!newPrioByid.has(r.id)) return r;
        const newPrio = newPrioByid.get(r.id);
        if (r.priority === newPrio) return r;
        return { ...r, priority: newPrio, lastModified: now };
      });
    });
  }

  /**
   * Toggle active/inactive. Si pasa de inactive→active, asigna priority
   * al final del orden actual (último). Si pasa active→inactive, deja
   * `priority` undefined y recompacta el resto de activas.
   */
  toggleActive(id: number): void {
    this._rules.update((rules) => {
      const target = rules.find((r) => r.id === id);
      if (!target) return rules;
      const now = new Date().toISOString();

      if (target.active) {
        // active → inactive: quitar priority + recompactar resto
        const updated = rules.map((r) =>
          r.id === id
            ? { ...r, active: false, priority: undefined, lastModified: now }
            : r,
        );
        // Recompactar prioridades de las activas restantes (1..N)
        const remainingActive = updated
          .filter((r) => r.active && !r.isDraft)
          .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
        return updated.map((r) => {
          if (!r.active || r.isDraft) return r;
          const idx = remainingActive.findIndex((a) => a.id === r.id);
          return idx >= 0 ? { ...r, priority: idx + 1 } : r;
        });
      } else {
        // inactive/draft → active: append al final del orden
        const maxPrio = rules
          .filter((r) => r.active && !r.isDraft)
          .reduce((max, r) => Math.max(max, r.priority ?? 0), 0);
        return rules.map((r) =>
          r.id === id
            ? {
                ...r,
                active: true,
                isDraft: false,
                priority: maxPrio + 1,
                lastModified: now,
              }
            : r,
        );
      }
    });
  }

  getRule(id: number): Rule | undefined {
    return this._rules().find((r) => r.id === id);
  }

  /**
   * Crear una regla nueva. Asigna id auto-incremental + lastModified now.
   * Si `active: true`, asigna priority al final del orden actual.
   */
  addRule(partial: Omit<Rule, 'id' | 'lastModified' | 'priority'>): Rule {
    const now = new Date().toISOString();
    const nextId = this._rules().reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const maxPrio = this._rules()
      .filter((r) => r.active && !r.isDraft)
      .reduce((max, r) => Math.max(max, r.priority ?? 0), 0);
    const newRule: Rule = {
      ...partial,
      id: nextId,
      lastModified: now,
      priority: partial.active && !partial.isDraft ? maxPrio + 1 : undefined,
    };
    this._rules.update((rules) => [...rules, newRule]);
    return newRule;
  }

  /**
   * Actualizar una regla existente. Si toggle active cambia, recompacta
   * prioridades como en `toggleActive`. Marca lastModified.
   */
  updateRule(id: number, patch: Partial<Rule>): void {
    this._rules.update((rules) => {
      const now = new Date().toISOString();
      const target = rules.find((r) => r.id === id);
      if (!target) return rules;
      // Si pasa a active y no tiene priority, asignar al final
      const wasActive = target.active && !target.isDraft;
      const willBeActive = (patch.active ?? target.active) && !(patch.isDraft ?? target.isDraft);
      let nextPriority = patch.priority ?? target.priority;
      if (!wasActive && willBeActive && nextPriority === undefined) {
        const maxPrio = rules
          .filter((r) => r.active && !r.isDraft && r.id !== id)
          .reduce((max, r) => Math.max(max, r.priority ?? 0), 0);
        nextPriority = maxPrio + 1;
      }
      if (wasActive && !willBeActive) {
        nextPriority = undefined;
      }
      return rules.map((r) =>
        r.id === id
          ? { ...r, ...patch, priority: nextPriority, lastModified: now }
          : r,
      );
    });
  }

  deleteRule(id: number): void {
    this._rules.update((rules) => {
      const filtered = rules.filter((r) => r.id !== id);
      // Recompactar prioridades de las activas restantes (1..N)
      const remainingActive = filtered
        .filter((r) => r.active && !r.isDraft)
        .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
      return filtered.map((r) => {
        if (!r.active || r.isDraft) return r;
        const idx = remainingActive.findIndex((a) => a.id === r.id);
        return idx >= 0 ? { ...r, priority: idx + 1 } : r;
      });
    });
  }
}
