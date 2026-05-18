import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessagesSquare } from 'lucide-angular';

import { PageHeaderComponent } from '@shared/components';

import { ConversationFiltersComponent } from '../../components/conversation-filters/conversation-filters.component';
import { ConversationTableComponent } from '../../components/conversation-table/conversation-table.component';
import { ConversationsStore } from '../../state/conversations.store';

/**
 * Pantalla principal del módulo Memory (`/conversaciones`).
 *
 * Iter 1 (S36): page-header + tabla densa con mock data.
 * Iter 2 (S37): + columna Estado + sticky header + hover.
 * Iter 3 (S37): + ConversationFilters top-bar (services / date / origin /
 *               destination / groups / agents). Tabla recibe
 *               `filteredConversations` del store.
 *
 * NO incluye todavía: selección múltiple, filtros por columna, player modal,
 * bulk actions. Ver `docs/memory-migration-inventory.md` § plan iteraciones.
 */
@Component({
  selector: 'sc-memory-conversations-page',
  imports: [
    TranslateModule,
    PageHeaderComponent,
    ConversationFiltersComponent,
    ConversationTableComponent,
  ],
  templateUrl: './conversations-page.component.html',
  styleUrl: './conversations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationsPageComponent {
  private readonly conversationsStore = inject(ConversationsStore);

  protected readonly conversations = this.conversationsStore.filteredConversations;
  protected readonly filters = this.conversationsStore.filters;
  protected readonly pageIcon = MessagesSquare;

  protected onFiltersChange(filters: ReturnType<ConversationsStore['filters']>): void {
    this.conversationsStore.setFilters(filters);
  }
}
