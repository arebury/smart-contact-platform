import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageSquare } from 'lucide-angular';

import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

/**
 * Pantalla principal del módulo Memory (`/conversaciones`).
 *
 * Hoy es placeholder mientras se migra el prototipo React. La vista
 * funcional será la tabla densa de conversaciones con filtros, selección
 * múltiple y reproductor modal. Ver `ConversationsView.tsx` en
 * `arebury/Memory/legacy-react/src/app/components/`.
 */
@Component({
  selector: 'sc-memory-conversations-page',
  imports: [TranslateModule, EmptyStateComponent],
  templateUrl: './conversations-page.component.html',
  styleUrl: './conversations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationsPageComponent {
  protected readonly conversationsIcon = MessageSquare;
}
