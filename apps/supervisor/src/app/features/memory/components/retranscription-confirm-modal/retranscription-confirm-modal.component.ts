import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AlertTriangle, Loader2, LucideAngularModule, RotateCcw } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';

import { ModalComponent } from '@shared/components/modal/modal.component';

/**
 * RetranscriptionConfirmModal · Memory §10 #1 (S46).
 *
 * Réplica 1:1 Angular+SCDS de `RetranscriptionConfirmModal.tsx`. Modal
 * destructivo: la re-transcripción borra la transcripción actual y los
 * análisis derivados. Patrón "type CONFIRMAR" gate (mismo que
 * delete-entity-dialog) para evitar clicks accidentales.
 *
 * El parent dispatcha (reusa `ConversationsStore.dispatchTranscription`);
 * este componente solo gate-checks la confirmación.
 */
@Component({
  selector: 'sc-memory-retranscription-confirm-modal',
  imports: [ButtonModule, FormsModule, LucideAngularModule, ModalComponent, TranslateModule],
  templateUrl: './retranscription-confirm-modal.component.html',
  styleUrl: './retranscription-confirm-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetranscriptionConfirmModalComponent {
  readonly visible = input<boolean>(false);

  readonly cancelled = output<void>();
  readonly confirmed = output<void>();

  protected readonly confirmText = signal('');
  protected readonly isValid = computed(() => this.confirmText() === 'CONFIRMAR');

  protected readonly retransIcon = RotateCcw;
  protected readonly alertIcon = AlertTriangle;
  protected readonly loaderIcon = Loader2;

  constructor() {
    effect(() => {
      if (!this.visible()) {
        this.confirmText.set('');
      }
    });
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  protected onConfirm(): void {
    if (!this.isValid()) return;
    this.confirmed.emit();
  }
}
