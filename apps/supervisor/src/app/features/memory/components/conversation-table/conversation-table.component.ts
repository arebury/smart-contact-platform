import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import type { Conversation } from '../../data/conversation.types';

/**
 * Tabla densa de conversaciones Memory. Primera iteración (S36):
 * renderiza 9 columnas básicas (hora, fecha, servicio, origen, grupo,
 * destino, duración, espera, id) con la chrome AED `.table sc-table-zebra`.
 *
 * NO incluye todavía: selección múltiple, columna de estado (icons
 * procesamiento), sticky header, filtros por columna, row click →
 * player modal. Vienen en iteraciones siguientes.
 */
@Component({
  selector: 'sc-memory-conversation-table',
  imports: [TranslateModule],
  templateUrl: './conversation-table.component.html',
  styleUrl: './conversation-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationTableComponent {
  readonly conversations = input.required<readonly Conversation[]>();
}
