import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import {
  BulkEditMenuComponent,
  type BulkEditCommit,
  type BulkEditFieldOption,
} from '@sc/design-system/components/bulk-edit-menu/bulk-edit-menu.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-bulk-edit-menu-gallery',
  standalone: true,
  imports: [BulkEditMenuComponent, GalleryFooterComponent],
  templateUrl: './bulk-edit-menu-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkEditMenuGalleryComponent {
  protected readonly fields: readonly BulkEditFieldOption[] = [
    {
      key: 'estado',
      label: 'Estado',
      values: [
        { value: 'activo', label: 'Activo' },
        { value: 'pausado', label: 'Pausado' },
        { value: 'archivado', label: 'Archivado' },
      ],
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      values: [
        { value: 'baja', label: 'Baja' },
        { value: 'media', label: 'Media' },
        { value: 'alta', label: 'Alta' },
      ],
    },
    {
      key: 'tipo',
      label: 'Tipo',
      values: [
        { value: 'inbound', label: 'Inbound' },
        { value: 'outbound', label: 'Outbound' },
        { value: 'mixto', label: 'Mixto' },
      ],
    },
  ];

  protected readonly lastCommit = signal<BulkEditCommit | null>(null);

  protected onCommit(c: BulkEditCommit): void {
    this.lastCommit.set(c);
  }
}
