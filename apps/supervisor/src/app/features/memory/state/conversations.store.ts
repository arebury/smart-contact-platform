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
 * Iter 3 (S37): + estado de filtros + `filteredConversations` computed.
 * Iter 6a (S38): + selección múltiple (`selectedIds` + helpers). Toggle por
 *                row click ó checkbox. Select-all aplica sobre el subset
 *                filtrado (no sobre la lista completa).
 *
 * Sin localStorage por ahora — la selección no persiste entre reloads
 * (paridad con el prototipo React, donde tampoco).
 */
@Injectable({ providedIn: 'root' })
export class ConversationsStore {
  private readonly _conversations = signal<readonly Conversation[]>(MOCK_CONVERSATIONS);
  private readonly _filters = signal<MemoryConversationFilters>(EMPTY_FILTERS);
  private readonly _selectedIds = signal<ReadonlySet<string>>(new Set());

  readonly conversations = this._conversations.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly selectedIds = this._selectedIds.asReadonly();

  readonly filteredConversations = computed(() => {
    const all = this._conversations();
    const f = this._filters();
    return all.filter((c) => matchesFilters(c, f));
  });

  /**
   * Categorías IA únicas detectadas en el mock entero (no en el filtrado).
   * Alimenta el `CategoryFilterPanel` para que el supervisor pueda seleccionar
   * cualquier categoría existente aunque haya filtrado previamente fuera de
   * esa categoría — replicar React `useCategories()` context fue innecesario
   * aquí porque las categorías viven dentro de las conversations mismas.
   */
  readonly availableAiCategories = computed(() => {
    const set = new Set<string>();
    for (const c of this._conversations()) {
      for (const cat of c.aiCategories ?? []) set.add(cat);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  });

  readonly selectedCount = computed(() => this._selectedIds().size);

  /**
   * Subset filtrado que entraría en un select-all. Excluye nada — siguiendo
   * la decisión Memory 15.45 ("ninguna fila se bloquea"). El filtrado por
   * estado (en proceso, retención vencida) vive en el modal bulk, no aquí.
   */
  readonly allFilteredSelected = computed(() => {
    const filtered = this.filteredConversations();
    if (filtered.length === 0) return false;
    const selected = this._selectedIds();
    return filtered.every((c) => selected.has(c.id));
  });

  setFilters(filters: MemoryConversationFilters): void {
    this._filters.set(filters);
  }

  resetFilters(): void {
    this._filters.set(EMPTY_FILTERS);
  }

  toggleSelection(id: string): void {
    this._selectedIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  selectAllFiltered(): void {
    const ids = this.filteredConversations().map((c) => c.id);
    this._selectedIds.set(new Set(ids));
  }

  clearSelection(): void {
    this._selectedIds.set(new Set());
  }
}

function matchesFilters(c: Conversation, f: MemoryConversationFilters): boolean {
  // Header top-bar filters (iter 3)
  if (f.services.length > 0 && !f.services.includes(c.service)) return false;
  if (f.groups.length > 0 && !f.groups.includes(c.group)) return false;
  if (f.agents.length > 0 && !f.agents.includes(c.origin)) return false;
  if (f.origin && !c.origin.toLowerCase().includes(f.origin.toLowerCase())) return false;
  if (f.destination && !c.destination.toLowerCase().includes(f.destination.toLowerCase())) {
    return false;
  }
  if (f.date && !sameDateAsMockDateString(f.date, c.date)) return false;

  // Tipo/Estado popover filters (iter 7)
  if (c.type === 'interna' && !f.types.interna) return false;
  if (c.type === 'externa' && !f.types.externa) return false;

  if (c.channel === 'llamada' && !f.channels.llamada) return false;
  if (c.channel === 'chat' && !f.channels.chat) return false;

  if (c.direction === 'entrante' && !f.directions.entrante) return false;
  if (c.direction === 'saliente' && !f.directions.saliente) return false;

  // Rules: cada toggle activo exige que la conversación cumpla esa dimensión
  if (f.rules.recording && !c.hasRecording) return false;
  if (f.rules.transcription && !c.hasTranscription) return false;
  if (f.rules.classification && !c.hasAnalysis) return false;

  // Status onlyFailed: solo conversaciones con transcripción fallida
  if (f.status.onlyFailed && !c.hasFailedTranscription) return false;

  // Multi-rec
  const recCount = c.recordings?.length ?? 0;
  if (f.multirec.onlyMulti && recCount <= 1) return false;
  if (f.multirec.onlyPartial) {
    if (recCount <= 1) return false;
    const transcribed = c.recordings?.filter((r) => r.hasTranscription === true).length ?? 0;
    if (transcribed === 0 || transcribed === recCount) return false;
  }

  // Categorías IA (iter 8): intersección — la conversación debe tener al
  // menos una de las categorías seleccionadas. Sin selección = sin filtro.
  if (f.aiCategories.length > 0) {
    const convCats = c.aiCategories ?? [];
    const hasMatch = convCats.some((cat) => f.aiCategories.includes(cat));
    if (!hasMatch) return false;
  }

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
