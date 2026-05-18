import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-confirm-host-gallery',
  standalone: true,
  imports: [GalleryFooterComponent],
  templateUrl: './confirm-host-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmHostGalleryComponent {}
