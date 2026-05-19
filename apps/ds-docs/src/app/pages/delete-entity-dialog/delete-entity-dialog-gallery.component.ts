import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DeleteEntityDialogComponent,
  type DeletableEntity,
} from '@sc/design-system/components/delete-entity-dialog/delete-entity-dialog.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-delete-entity-dialog-gallery',
  standalone: true,
  imports: [DeleteEntityDialogComponent, GalleryFooterComponent],
  templateUrl: './delete-entity-dialog-gallery.component.html',
  styleUrl: './delete-entity-dialog-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteEntityDialogGalleryComponent {
  protected readonly singleVisible = signal(false);
  protected readonly bulkVisible = signal(false);
  protected readonly bulkLargeVisible = signal(false);

  protected readonly singleItem: readonly DeletableEntity[] = [{ id: 1, name: 'María García' }];

  protected readonly bulkItems: readonly DeletableEntity[] = [
    { id: 1, name: 'María García' },
    { id: 2, name: 'Carlos Ruiz' },
    { id: 3, name: 'Ana Soto' },
  ];

  protected readonly bulkLargeItems: readonly DeletableEntity[] = Array.from(
    { length: 12 },
    (_, i) => ({ id: i + 1, name: `Agente #${i + 1}` }),
  );

  protected onSingleConfirm(): void {
    this.singleVisible.set(false);
    console.log('[delete-entity-dialog gallery] single delete confirmed');
  }

  protected onBulkConfirm(ids: readonly number[] | null): void {
    this.bulkVisible.set(false);
    this.bulkLargeVisible.set(false);
    console.log('[delete-entity-dialog gallery] bulk delete confirmed for:', ids);
  }
}
