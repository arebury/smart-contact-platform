import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
 *
 * NO incluye todavía: selección múltiple, filtros por columna, row click →
 * player modal. Vienen en iteraciones siguientes.
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

  protected readonly phoneIcon = Phone;
  protected readonly chatIcon = MessageSquare;
  protected readonly recordingIcon = Mic;
  protected readonly transcriptionIcon = FileText;
  protected readonly analysisIcon = Sparkles;
  protected readonly failedIcon = AlertTriangle;
}
