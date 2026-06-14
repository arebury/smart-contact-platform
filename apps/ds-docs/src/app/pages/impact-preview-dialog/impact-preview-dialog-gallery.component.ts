import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import {
  ScImpactPreviewDialogComponent as ImpactPreviewDialogComponent,
  type ImpactBadge,
  type ImpactItem,
} from '@smartcontact-hub/components';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-impact-preview-dialog-gallery',
  standalone: true,
  imports: [ImpactPreviewDialogComponent, ButtonModule, GalleryFooterComponent],
  templateUrl: './impact-preview-dialog-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpactPreviewDialogGalleryComponent {
  protected readonly bulkVisible = signal(false);
  protected readonly duplicateVisible = signal(false);

  protected readonly items: readonly ImpactItem[] = [
    { id: 1, name: 'Inés Ramírez', hint: '(3 grupos)' },
    { id: 2, name: 'Lucas Vega', hint: '(1 grupo)' },
    { id: 3, name: 'Sofía Costa', hint: '(2 grupos)' },
    { id: 4, name: 'Daniel Pino' },
    { id: 5, name: 'Carla Sanz', hint: '(5 grupos)' },
  ];

  protected readonly bulkBadge: ImpactBadge = {
    fieldLabel: 'Estado',
    currentValueLabel: 'Activo',
    newValueLabel: 'Pausado',
  };

  protected readonly lastResult = signal<string | null>(null);

  protected onConfirm(label: string, ids: readonly number[]): void {
    this.lastResult.set(`${label}: ${ids.join(', ')}`);
    this.bulkVisible.set(false);
    this.duplicateVisible.set(false);
  }

  protected onCancel(label: string): void {
    this.lastResult.set(`${label}: cancelled`);
    this.bulkVisible.set(false);
    this.duplicateVisible.set(false);
  }
}
