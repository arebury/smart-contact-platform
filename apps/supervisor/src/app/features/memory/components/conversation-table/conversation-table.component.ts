import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import type { Conversation } from '../../data/conversation.types';
import { MemoryStatusIconComponent } from '../memory-status-icon/memory-status-icon.component';

/**
 * Tabla densa de conversaciones Memory.
 *
 * Iter 1 (S36): 9 columnas básicas + chrome `.table sc-table-zebra` AED.
 * Iter 2 (S37): + columna Estado (cluster 3-5 lucide icons separados) +
 *               sticky header + hover.
 * Iter 5 (S38): + abre player modal (originalmente desde row click).
 * Iter 6a (S38): + columna checkbox de selección al inicio. Row click pasa
 *                a togglear selección (replicando Audit A5 del prototipo
 *                Memory React).
 * Iter S40 (#15): cluster lucide cambiado por `<sc-memory-status-icon>` —
 *                pictograma única canal+processing-state (SVGs custom de
 *                diseño Memory) + overlays failed (bottom-right) y
 *                multi-recording count (top-right). Sigue `sistema-de-
 *                diseno.md §Iconografía` (sec 15.21 audit prototipo).
 */
@Component({
  selector: 'sc-memory-conversation-table',
  imports: [TranslateModule, MemoryStatusIconComponent],
  templateUrl: './conversation-table.component.html',
  styleUrl: './conversation-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationTableComponent {
  readonly conversations = input.required<readonly Conversation[]>();
  readonly selectedIds = input.required<ReadonlySet<string>>();
  readonly allSelected = input.required<boolean>();
  /** IDs en proceso de transcripción (mock dispatch). Pintan fila amber. */
  readonly processingIds = input<ReadonlySet<string>>(new Set());
  /** IDs en proceso de análisis IA. Pintan fila cyan. */
  readonly analyzingIds = input<ReadonlySet<string>>(new Set());

  readonly conversationOpen = output<Conversation>();
  readonly selectionToggled = output<string>();
  readonly allToggled = output<void>();

  protected isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  protected isProcessing(id: string): boolean {
    return this.processingIds().has(id);
  }

  protected isAnalyzing(id: string): boolean {
    return this.analyzingIds().has(id);
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

  protected recordingsCount(conv: Conversation): number {
    return conv.recordings?.length ?? 0;
  }
}
