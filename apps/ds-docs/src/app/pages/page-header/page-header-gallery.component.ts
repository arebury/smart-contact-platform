import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ScPageHeaderComponent as PageHeaderComponent } from '@smartcontact-hub/components';
import { IconComponent } from '@sc/design-system';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-page-header-gallery',
  standalone: true,
  imports: [PageHeaderComponent, ButtonModule, GalleryFooterComponent, IconComponent],
  templateUrl: './page-header-gallery.component.html',
  styleUrl: './page-header-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderGalleryComponent {
  protected readonly usersIcon = 'group';
  protected readonly settingsIcon = 'settings';
  protected readonly templatesIcon = 'description';
  protected readonly plusIcon = 'add';
}
