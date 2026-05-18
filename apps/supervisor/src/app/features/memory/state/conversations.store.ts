import { Injectable, signal } from '@angular/core';

import { MOCK_CONVERSATIONS } from '../data/conversations-mock';
import type { Conversation } from '../data/conversation.types';

/**
 * Signal store de conversaciones Memory.
 *
 * Primera iteración (S36): expone la lista mock readonly. Sin selección,
 * sin filtros, sin acciones bulk — esas vienen en iteraciones siguientes.
 * Sin localStorage tampoco: los mocks viven en memoria y se reinician
 * con cada recarga (igual que el prototipo React durante development).
 */
@Injectable({ providedIn: 'root' })
export class ConversationsStore {
  private readonly _conversations = signal<readonly Conversation[]>(MOCK_CONVERSATIONS);

  readonly conversations = this._conversations.asReadonly();
}
