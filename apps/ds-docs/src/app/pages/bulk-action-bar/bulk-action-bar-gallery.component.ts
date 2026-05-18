import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import {
  BulkActionBarComponent,
  type BulkActionEntityLabels,
} from '@sc/design-system/components/bulk-action-bar/bulk-action-bar.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-bulk-action-bar-gallery',
  standalone: true,
  imports: [BulkActionBarComponent, GalleryFooterComponent],
  templateUrl: './bulk-action-bar-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkActionBarGalleryComponent {
  protected readonly selectedIds = signal<readonly number[]>([]);
  protected readonly availableRows: readonly { id: number; name: string }[] = [
    { id: 1, name: 'Marta Ramírez' },
    { id: 2, name: 'Lucas Vega' },
    { id: 3, name: 'Sofía Costa' },
    { id: 4, name: 'Daniel Pino' },
    { id: 5, name: 'Carla Sanz' },
  ];

  protected readonly count = computed(() => this.selectedIds().length);

  protected readonly agentEntity: BulkActionEntityLabels = {
    singular: 'agente',
    plural: 'agentes',
    suffixSingular: 'seleccionado',
    suffixPlural: 'seleccionados',
  };

  protected readonly femaleEntity: BulkActionEntityLabels = {
    singular: 'etiqueta',
    plural: 'etiquetas',
    suffixSingular: 'seleccionada',
    suffixPlural: 'seleccionadas',
  };

  protected toggle(id: number): void {
    this.selectedIds.update((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  }

  protected isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  protected clear(): void {
    this.selectedIds.set([]);
  }
}
