import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-keyboard-shortcuts-gallery',
  standalone: true,
  imports: [GalleryFooterComponent],
  templateUrl: './keyboard-shortcuts-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardShortcutsGalleryComponent {}
