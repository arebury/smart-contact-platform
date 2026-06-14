import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ScGroupPopoverComponent as GroupPopoverComponent } from '@smartcontact-hub/components';
import { type GroupRef } from '@sc/design-system';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-group-popover-gallery',
  standalone: true,
  imports: [GroupPopoverComponent, GalleryFooterComponent],
  templateUrl: './group-popover-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupPopoverGalleryComponent {
  protected readonly empty: readonly GroupRef[] = [];

  protected readonly twoGroups: readonly GroupRef[] = [
    { id: 1, name: 'Marketing', active: true },
    { id: 2, name: 'Soporte', active: true },
  ];

  protected readonly manyGroups: readonly GroupRef[] = [
    { id: 1, name: 'Marketing', active: true },
    { id: 2, name: 'Soporte', active: true },
    { id: 3, name: 'Comercial', active: true },
    { id: 4, name: 'Outbound', active: true },
    { id: 5, name: 'Producto', active: true },
    { id: 6, name: 'Operaciones', active: true },
    { id: 7, name: 'Finanzas', active: true },
    { id: 8, name: 'Legal', active: true },
  ];
}
