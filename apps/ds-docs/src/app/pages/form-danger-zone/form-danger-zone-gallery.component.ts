import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { FormDangerZoneComponent } from '@sc/design-system/components/form-danger-zone/form-danger-zone.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-form-danger-zone-gallery',
  standalone: true,
  imports: [FormDangerZoneComponent, GalleryFooterComponent],
  templateUrl: './form-danger-zone-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDangerZoneGalleryComponent {
  protected readonly lastAction = signal<string | null>(null);

  protected onAction(label: string): void {
    this.lastAction.set(label);
  }
}
