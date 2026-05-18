import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { LabelChipComponent } from '@sc/design-system/components/label-chip/label-chip.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-label-chip-gallery',
  standalone: true,
  imports: [LabelChipComponent, GalleryFooterComponent],
  templateUrl: './label-chip-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelChipGalleryComponent {
  /**
   * `color` debería ser de tipo `LabelColor` (definido en `@features/admin/...`).
   * Aquí lo dejamos como `string` para no acoplar ds-docs a AED — Angular acepta
   * el cast en template via `$any()`. La cobertura visual es la misma; la deuda
   * de mover `LabelColor` a SCDS está registrada en
   * `inconsistencies-backlog.md` (entry nueva S33).
   */
  protected readonly colors: readonly { name: string; color: string }[] = [
    { name: 'Marketing', color: 'red' },
    { name: 'Outbound', color: 'orange' },
    { name: 'Soporte', color: 'amber' },
    { name: 'Atención cliente', color: 'green' },
    { name: 'Operaciones', color: 'teal' },
    { name: 'Comercial', color: 'cyan' },
    { name: 'Producto', color: 'blue' },
    { name: 'Legal', color: 'violet' },
    { name: 'Finanzas', color: 'rose' },
    { name: 'Otros', color: 'gray' },
  ];

  protected readonly removed = signal<readonly string[]>([]);

  /** Refs para la sección "sizes" — evitan object-literal en template. */
  protected readonly redLabel = { name: 'Marketing', color: 'red' };
  protected readonly greenLabel = { name: 'Atención cliente', color: 'green' };

  protected onRemove(name: string): void {
    this.removed.update((arr) => [...arr, name]);
  }
}
