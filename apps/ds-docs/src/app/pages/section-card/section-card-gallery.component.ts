import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionCardComponent } from '@sc/design-system/components/section-card/section-card.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-section-card-gallery',
  standalone: true,
  imports: [SectionCardComponent, GalleryFooterComponent],
  templateUrl: './section-card-gallery.component.html',
  styleUrl: './section-card-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardGalleryComponent {
  protected readonly identityIcon = 'badge';
  protected readonly settingsIcon = 'settings';
  protected readonly permissionsIcon = 'verified_user';
}
