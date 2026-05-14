import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AlertTriangle } from 'lucide-angular';

import { ConfirmHostService } from '@core/services';
import { ModalComponent } from '../modal/modal.component';

/**
 * Single host that renders every programmatic confirmation across the app
 * (route-guard discard, future logout, etc.) through the canonical
 * `sc-modal` shell. Reads its state from `ConfirmHostService` and routes
 * button clicks back into it. Mounted once in `app.component.html`.
 */
@Component({
  selector: 'sc-confirm-host',
  imports: [ModalComponent],
  templateUrl: './confirm-host.component.html',
  styleUrl: './confirm-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmHostComponent {
  protected readonly host = inject(ConfirmHostService);
  protected readonly alertIcon = AlertTriangle;

  protected readonly emphasizeReject = computed(() => this.host.state()?.emphasis === 'reject');

  protected readonly acceptClass = computed(() => {
    const s = this.host.state();
    const tone = s?.acceptTone ?? 'primary';
    if (s?.emphasis === 'reject') {
      return tone === 'danger' ? 'btn btn--danger-subtle' : 'btn btn--secondary';
    }
    return tone === 'danger' ? 'btn btn--danger' : 'btn btn--primary';
  });

  protected readonly rejectClass = computed(() =>
    this.host.state()?.emphasis === 'reject' ? 'btn btn--primary' : 'btn btn--secondary',
  );
}
