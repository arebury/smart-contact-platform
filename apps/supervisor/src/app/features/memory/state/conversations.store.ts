import { computed, Injectable, signal } from '@angular/core';

import { MOCK_CONVERSATIONS } from '../data/conversations-mock';
import type { Conversation } from '../data/conversation.types';
import {
  EMPTY_FILTERS,
  type MemoryConversationFilters,
} from '../data/conversation-filters.types';

/**
 * Signal store de conversaciones Memory.
 *
 * Iter 1 (S36): expone la lista mock readonly.
 * Iter 3 (S37): + estado de filtros + `filteredConversations` computed
 *               aplicando services / date / origin / destination /
 *               groups / agents.
 *
 * Sin selección, sin acciones bulk, sin localStorage por ahora —
 * iteraciones siguientes.
 */
@Injectable({ providedIn: 'root' })
export class ConversationsStore {
  private readonly _conversations = signal<readonly Conversation[]>(MOCK_CONVERSATIONS);
  private readonly _filters = signal<MemoryConversationFilters>(EMPTY_FILTERS);

  readonly conversations = this._conversations.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly filteredConversations = computed(() => {
    const all = this._conversations();
    const f = this._filters();
    return all.filter((c) => matchesFilters(c, f));
  });

  setFilters(filters: MemoryConversationFilters): void {
    this._filters.set(filters);
  }

  resetFilters(): void {
    this._filters.set(EMPTY_FILTERS);
  }
}

function matchesFilters(c: Conversation, f: MemoryConversationFilters): boolean {
  if (f.services.length > 0 && !f.services.includes(c.service)) return false;
  if (f.groups.length > 0 && !f.groups.includes(c.group)) return false;
  if (f.agents.length > 0 && !f.agents.includes(c.origin)) return false;
  if (f.origin && !c.origin.toLowerCase().includes(f.origin.toLowerCase())) return false;
  if (f.destination && !c.destination.toLowerCase().includes(f.destination.toLowerCase())) {
    return false;
  }
  if (f.date && !sameDateAsMockDateString(f.date, c.date)) return false;
  return true;
}

/**
 * Compara una `Date` JS contra el `date` string de la mock conversation
 * (formato `"dd/mm/yyyy"` heredado del prototipo). Comparación por
 * componentes para evitar líos de timezone.
 */
function sameDateAsMockDateString(date: Date, mockDate: string): boolean {
  const [dd, mm, yyyy] = mockDate.split('/').map((n) => Number(n));
  return (
    date.getDate() === dd &&
    date.getMonth() + 1 === mm &&
    date.getFullYear() === yyyy
  );
}
