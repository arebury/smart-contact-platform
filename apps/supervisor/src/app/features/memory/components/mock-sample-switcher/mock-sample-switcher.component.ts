import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Check, Database, LucideAngularModule } from 'lucide-angular';
import { PopoverModule } from 'primeng/popover';

import { ConversationsStore } from '../../state/conversations.store';

/**
 * MockSampleSwitcher · prototype-only (S39).
 *
 * Switcher en la esquina superior derecha de `ConversationsPage` que
 * permite ciclar entre conjuntos curados de mock-data ("Todo procesado",
 * "Todo por procesar", "Solo chats"…) sin recargar datos manualmente.
 *
 * Réplica del prototipo React `MockSampleSwitcher.tsx`. El control es
 * un chip dashed amber (señal visual "este componente NO es de
 * producción") + popover con la lista de samples.
 *
 * ⚠️ PURGA PRE-DEPLOY · stakeholder no técnico:
 *   Eliminar este componente, su uso en `ConversationsPage` header
 *   y `data/mock-samples.ts` antes del primer deploy con cliente
 *   real. Sec 17 P3 (canon React).
 */
@Component({
  selector: 'sc-memory-mock-sample-switcher',
  imports: [LucideAngularModule, PopoverModule],
  templateUrl: './mock-sample-switcher.component.html',
  styleUrl: './mock-sample-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MockSampleSwitcherComponent {
  private readonly store = inject(ConversationsStore);

  protected readonly databaseIcon = Database;
  protected readonly checkIcon = Check;
  protected readonly samples = this.store.samples;

  protected readonly currentId = this.store.currentSampleId;
  protected readonly currentSample = computed(
    () => this.samples.find((s) => s.id === this.currentId()) ?? this.samples[0],
  );

  protected selectSample(id: string): void {
    this.store.setSample(id);
  }
}
