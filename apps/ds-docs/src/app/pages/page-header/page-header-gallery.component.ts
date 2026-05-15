import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideAngularModule, Users, Settings, FileText, Plus } from 'lucide-angular';
import { PageHeaderComponent } from '@sc/design-system/components/page-header/page-header.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-page-header-gallery',
  standalone: true,
  imports: [PageHeaderComponent, GalleryFooterComponent, LucideAngularModule],
  templateUrl: './page-header-gallery.component.html',
  styleUrl: './page-header-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderGalleryComponent {
  protected readonly usersIcon = Users;
  protected readonly settingsIcon = Settings;
  protected readonly templatesIcon = FileText;
  protected readonly plusIcon = Plus;
}
