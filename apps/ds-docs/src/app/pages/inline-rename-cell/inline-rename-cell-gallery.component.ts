import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { InlineRenameCellComponent } from '@sc/design-system/components/inline-rename-cell/inline-rename-cell.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-inline-rename-cell-gallery',
  standalone: true,
  imports: [InlineRenameCellComponent, GalleryFooterComponent],
  templateUrl: './inline-rename-cell-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineRenameCellGalleryComponent {
  protected readonly name = signal('Agente sin nombre (copia)');
  protected readonly editing = signal(true);
  protected readonly lastEvent = signal<string | null>(null);

  protected onCommit(next: string): void {
    this.name.set(next);
    this.editing.set(false);
    this.lastEvent.set(`commit → "${next}"`);
  }

  protected onCancel(): void {
    this.editing.set(false);
    this.lastEvent.set('cancelled');
  }

  protected restart(): void {
    this.lastEvent.set(null);
    this.editing.set(true);
  }
}
