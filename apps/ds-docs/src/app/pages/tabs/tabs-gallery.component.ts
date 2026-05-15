import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'sc-ds-docs-tabs-gallery',
  standalone: true,
  imports: [TabsModule],
  templateUrl: './tabs-gallery.component.html',
  styleUrl: './tabs-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsGalleryComponent {
  protected readonly activeTab = signal<string>('agents');
}
