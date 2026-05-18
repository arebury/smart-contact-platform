import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  AlertTriangle,
  FileText,
  LucideAngularModule,
  MessageSquare,
  Mic,
  Phone,
  Sparkles,
} from 'lucide-angular';

import type { Conversation } from '../../data/conversation.types';

/**
 * Tabla densa de conversaciones Memory.
 *
 * Iter 1 (S36): 9 columnas básicas + chrome `.table sc-table-zebra` AED.
 * Iter 2 (S37): + columna Estado (icons procesamiento: channel + recording
 *               + transcription + analysis + failed) + sticky header + hover.
 * Iter 5 (S38): + abre player modal (originalmente desde row click).
 * Iter 6a (S38): + columna checkbox de selección al inicio. Row click pasa
 *                a togglear selección (replicando Audit A5 del prototipo
 *                Memory React). El cluster de status icons en columna Estado
 *                es el affordance EXPLÍCITO que abre el player modal.
 *
 * Filtros por columna llegan en iter futura.
 */
@Component({
  selector: 'sc-memory-conversation-table',
  imports: [TranslateModule, LucideAngularModule],
  templateUrl: './conversation-table.component.html',
  styleUrl: './conversation-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationTableComponent {
  readonly conversations = input.required<readonly Conversation[]>();
  readonly selectedIds = input.required<ReadonlySet<string>>();
  readonly allSelected = input.required<boolean>();

  readonly conversationOpen = output<Conversation>();
  readonly selectionToggled = output<string>();
  readonly allToggled = output<void>();

  protected isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  protected onRowClick(conv: Conversation): void {
    this.selectionToggled.emit(conv.id);
  }

  protected onRowKeydown(event: KeyboardEvent, conv: Conversation): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectionToggled.emit(conv.id);
    }
  }

  protected onCheckboxChange(event: Event, conv: Conversation): void {
    event.stopPropagation();
    this.selectionToggled.emit(conv.id);
  }

  protected onCheckboxKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.stopPropagation();
    }
  }

  protected onStatusClick(event: Event, conv: Conversation): void {
    event.stopPropagation();
    this.conversationOpen.emit(conv);
  }

  protected onStatusKeydown(event: KeyboardEvent, conv: Conversation): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      this.conversationOpen.emit(conv);
    }
  }

  protected onHeaderCheckboxChange(event: Event): void {
    event.stopPropagation();
    this.allToggled.emit();
  }

  protected readonly phoneIcon = Phone;
  protected readonly chatIcon = MessageSquare;
  protected readonly recordingIcon = Mic;
  protected readonly transcriptionIcon = FileText;
  protected readonly analysisIcon = Sparkles;
  protected readonly failedIcon = AlertTriangle;
}
