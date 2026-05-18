import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GroupPopoverComponent } from '@sc/design-system/components/group-popover/group-popover.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

/**
 * `GroupRef` vive en `@shared/data/groups-ref` (AED). Para evitar acople en
 * ds-docs definimos un shape local y lo casteamos via `$any()` en template.
 * La deuda de mover `GroupRef` a SCDS queda en `inconsistencies-backlog.md`.
 */
@Component({
  selector: 'sc-ds-docs-group-popover-gallery',
  standalone: true,
  imports: [GroupPopoverComponent, GalleryFooterComponent],
  templateUrl: './group-popover-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupPopoverGalleryComponent {
  protected readonly empty: readonly { id: string; name: string }[] = [];

  protected readonly twoGroups: readonly { id: string; name: string }[] = [
    { id: 'g1', name: 'Marketing' },
    { id: 'g2', name: 'Soporte' },
  ];

  protected readonly manyGroups: readonly { id: string; name: string }[] = [
    { id: 'g1', name: 'Marketing' },
    { id: 'g2', name: 'Soporte' },
    { id: 'g3', name: 'Comercial' },
    { id: 'g4', name: 'Outbound' },
    { id: 'g5', name: 'Producto' },
    { id: 'g6', name: 'Operaciones' },
    { id: 'g7', name: 'Finanzas' },
    { id: 'g8', name: 'Legal' },
  ];
}
