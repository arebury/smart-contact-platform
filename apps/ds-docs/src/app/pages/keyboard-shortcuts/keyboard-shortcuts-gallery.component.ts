import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-keyboard-shortcuts-gallery',
  standalone: true,
  imports: [ButtonModule, GalleryFooterComponent],
  templateUrl: './keyboard-shortcuts-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardShortcutsGalleryComponent {
  protected openAed(): void {
    window.open('https://aed.smartcontact.netlify.app', '_blank', 'noopener');
  }
}
