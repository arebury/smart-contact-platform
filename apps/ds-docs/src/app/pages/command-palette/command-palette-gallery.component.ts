import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-command-palette-gallery',
  standalone: true,
  imports: [GalleryFooterComponent],
  templateUrl: './command-palette-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteGalleryComponent {}
