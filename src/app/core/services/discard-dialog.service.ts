import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

/**
 * Programmatic "¿Descartar cambios?" confirmation. Used by the form-dirty
 * route guard and by anything else that needs to ask the user before
 * throwing away unsaved work.
 *
 * Mirrors the React prototype's `DiscardDialog` (DD#136) but delegates the
 * actual rendering to `<p-confirmDialog>` which is mounted globally in the
 * app shell.
 */
@Injectable({ providedIn: 'root' })
export class DiscardDialogService {
  private readonly confirmation = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);

  /** Resolves `true` if the user chose to discard, `false` if they kept editing. */
  confirm(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmation.confirm({
        header: this.translate.instant('common.discard_title'),
        message: this.translate.instant('common.discard_body'),
        acceptLabel: this.translate.instant('common.discard_confirm'),
        rejectLabel: this.translate.instant('common.discard_keep'),
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-text',
        defaultFocus: 'reject',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
