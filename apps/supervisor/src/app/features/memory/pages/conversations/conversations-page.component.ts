import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessagesSquare } from 'lucide-angular';

import { PageHeaderComponent } from '@shared/components';

import { ConversationTableComponent } from '../../components/conversation-table/conversation-table.component';
import { ConversationsStore } from '../../state/conversations.store';

/**
 * Pantalla principal del módulo Memory (`/conversaciones`).
 *
 * Primera iteración (S36): page-header + tabla densa de conversaciones
 * con mock data (15 entries). Sin filtros, sin selección múltiple, sin
 * player modal — vienen en iteraciones siguientes (ver
 * `docs/memory-migration-inventory.md`).
 *
 * Referencia visual y funcional: `ConversationsView.tsx` +
 * `ConversationTable.tsx` en `arebury/Memory/legacy-react/`.
 */
@Component({
  selector: 'sc-memory-conversations-page',
  imports: [TranslateModule, PageHeaderComponent, ConversationTableComponent],
  templateUrl: './conversations-page.component.html',
  styleUrl: './conversations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationsPageComponent {
  private readonly conversationsStore = inject(ConversationsStore);

  protected readonly conversations = this.conversationsStore.conversations;
  protected readonly pageIcon = MessagesSquare;
}
