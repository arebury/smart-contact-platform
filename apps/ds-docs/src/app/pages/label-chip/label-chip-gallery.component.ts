import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { LabelChipComponent, type LabelChipModel } from '@sc/design-system';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-label-chip-gallery',
  standalone: true,
  imports: [LabelChipComponent, GalleryFooterComponent],
  templateUrl: './label-chip-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelChipGalleryComponent {
  /** Los 8 valores reales de la paleta `--sc-label-<color>-*`. */
  protected readonly colors: readonly LabelChipModel[] = [
    { name: 'Marketing', color: 'red' },
    { name: 'Outbound', color: 'orange' },
    { name: 'Soporte', color: 'amber' },
    { name: 'Atención cliente', color: 'green' },
    { name: 'Operaciones', color: 'teal' },
    { name: 'Producto', color: 'blue' },
    { name: 'Legal', color: 'purple' },
    { name: 'Otros', color: 'gray' },
  ];

  protected readonly removed = signal<readonly string[]>([]);

  protected readonly redLabel: LabelChipModel = { name: 'Marketing', color: 'red' };
  protected readonly greenLabel: LabelChipModel = { name: 'Atención cliente', color: 'green' };

  protected onRemove(name: string): void {
    this.removed.update((arr) => [...arr, name]);
  }
}
