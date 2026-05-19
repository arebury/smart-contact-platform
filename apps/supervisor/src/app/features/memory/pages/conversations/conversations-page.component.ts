import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CheckCheck, LucideAngularModule, MessagesSquare, Sparkles } from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import {
  BulkActionBarComponent,
  type BulkActionEntityLabels,
} from '@shared/components/bulk-action-bar/bulk-action-bar.component';
import { PageHeaderComponent } from '@shared/components';

import { BulkTranscriptionModalComponent } from '../../components/bulk-transcription-modal/bulk-transcription-modal.component';
import { ConversationFiltersComponent } from '../../components/conversation-filters/conversation-filters.component';
import { ConversationPlayerModalComponent } from '../../components/conversation-player-modal/conversation-player-modal.component';
import { ConversationTableComponent } from '../../components/conversation-table/conversation-table.component';
import type { Conversation } from '../../data/conversation.types';
import { ConversationsStore } from '../../state/conversations.store';

/**
 * Pantalla principal del módulo Memory (`/conversaciones`).
 *
 * Iter 1 (S36): page-header + tabla densa con mock data.
 * Iter 2 (S37): + columna Estado + sticky header + hover.
 * Iter 3 (S37): + ConversationFilters top-bar (services / date / origin /
 *               destination / groups / agents).
 * Iter 5 (S38): + ConversationPlayerModal (audio simulado + tabs
 *               transcripción/análisis con state machine).
 * Iter 6a (S38): + selección múltiple. Row click toggle selección (Audit A5
 *                del React); cluster status icons sigue abriendo modal.
 *                `<sc-bulk-action-bar>` overlay con CTA stub.
 * Iter 6b (S38): + BulkTranscriptionModal v11 (state machine 6 escenarios,
 *                3 destinos MECE, toggle locked, warning costes).
 *
 * NO incluye todavía: sticky toast post-confirmación, filtros por columna,
 * estado "en proceso". Ver `docs/memory-migration-inventory.md` §10.
 */
@Component({
  selector: 'sc-memory-conversations-page',
  imports: [
    TranslateModule,
    ButtonModule,
    LucideAngularModule,
    PageHeaderComponent,
    BulkActionBarComponent,
    BulkTranscriptionModalComponent,
    ConversationFiltersComponent,
    ConversationTableComponent,
    ConversationPlayerModalComponent,
  ],
  templateUrl: './conversations-page.component.html',
  styleUrl: './conversations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationsPageComponent {
  private readonly conversationsStore = inject(ConversationsStore);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly conversations = this.conversationsStore.filteredConversations;
  protected readonly filters = this.conversationsStore.filters;
  protected readonly selectedIds = this.conversationsStore.selectedIds;
  protected readonly selectedCount = this.conversationsStore.selectedCount;
  protected readonly allFilteredSelected = this.conversationsStore.allFilteredSelected;
  protected readonly availableAiCategories = this.conversationsStore.availableAiCategories;
  protected readonly pageIcon = MessagesSquare;
  protected readonly bulkIcon = Sparkles;
  protected readonly markReadIcon = CheckCheck;

  protected readonly bulkEntity: BulkActionEntityLabels = {
    singular: 'conversación',
    plural: 'conversaciones',
    suffixSingular: 'seleccionada',
    suffixPlural: 'seleccionadas',
  };

  protected readonly playerOpen = signal(false);
  protected readonly playerConversation = signal<Conversation | null>(null);

  protected readonly bulkModalOpen = signal(false);
  protected readonly bulkSnapshot = signal<readonly Conversation[]>([]);

  protected onFiltersChange(filters: ReturnType<ConversationsStore['filters']>): void {
    this.conversationsStore.setFilters(filters);
  }

  protected onSelectionToggled(id: string): void {
    this.conversationsStore.toggleSelection(id);
  }

  protected onAllToggled(): void {
    if (this.allFilteredSelected()) {
      this.conversationsStore.clearSelection();
    } else {
      this.conversationsStore.selectAllFiltered();
    }
  }

  protected onClearSelection(): void {
    this.conversationsStore.clearSelection();
  }

  protected onBulkTranscribe(): void {
    const selected = this.conversationsStore
      .conversations()
      .filter((c) => this.selectedIds().has(c.id));
    this.bulkSnapshot.set(selected);
    this.bulkModalOpen.set(true);
  }

  protected onBulkMarkRead(): void {
    // Decisión 15.46 Memory: "Marcar como leídas" reset visual del estado
    // post-procesamiento (amarillas → blanco, fallidas dejan "Solo fallidas"
    // queue aunque su icono siga). Stub iter 8: toast + clear selection.
    // El estado visual real (processingIds, sticky toasts) llega en iter
    // dispatch real (§10 #5/#9 inventory).
    const n = this.selectedCount();
    this.conversationsStore.clearSelection();
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('memory.bulk.mark_read_toast', { n }),
      life: 2500,
    });
  }

  protected onBulkModalClose(): void {
    this.bulkModalOpen.set(false);
  }

  protected onBulkModalConfirm(event: {
    includeAnalysis: boolean;
    eligibleIds: readonly string[];
  }): void {
    this.bulkModalOpen.set(false);
    this.conversationsStore.clearSelection();
    // Sticky toast post-confirmación (iter futura). Hoy un toast simple
    // confirma el dispatch fire-and-forget. Ver memory-migration-inventory §10.
    const summary = this.translate.instant('memory.bulk_modal.dispatched_toast', {
      n: event.eligibleIds.length,
      mode: event.includeAnalysis
        ? this.translate.instant('memory.bulk_modal.dispatched_with_analysis')
        : this.translate.instant('memory.bulk_modal.dispatched_no_analysis'),
    });
    this.messages.add({ severity: 'info', summary, life: 3000 });
  }

  protected onConversationOpen(conv: Conversation): void {
    this.playerConversation.set(conv);
    this.playerOpen.set(true);
  }

  protected onPlayerClose(): void {
    this.playerOpen.set(false);
  }
}
