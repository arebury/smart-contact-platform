import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import {
  ColumnSelectorComponent,
  type ColumnDef,
} from '@sc/design-system/components/column-selector/column-selector.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-column-selector-gallery',
  standalone: true,
  imports: [ColumnSelectorComponent, GalleryFooterComponent],
  templateUrl: './column-selector-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnSelectorGalleryComponent {
  protected readonly columns: readonly ColumnDef[] = [
    { key: 'name', label: 'Nombre', locked: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' },
    { key: 'groups', label: 'Grupos' },
    { key: 'status', label: 'Estado' },
    { key: 'lastSeen', label: 'Última conexión', defaultVisible: false },
    { key: 'createdAt', label: 'Creado', defaultVisible: false },
  ];

  protected readonly visibleKeys = signal<readonly string[]>([]);
}
