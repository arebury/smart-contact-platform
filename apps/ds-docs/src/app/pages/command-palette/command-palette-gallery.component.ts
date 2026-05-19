import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-command-palette-gallery',
  standalone: true,
  imports: [ButtonModule, GalleryFooterComponent],
  templateUrl: './command-palette-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteGalleryComponent {
  protected openAed(): void {
    window.open('https://aed.smartcontact.netlify.app', '_blank', 'noopener');
  }
}
