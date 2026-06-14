import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ScToggleSwitchComponent as ToggleSwitchComponent } from '@smartcontact-hub/components';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-toggleswitch-gallery',
  standalone: true,
  imports: [ToggleSwitchComponent, GalleryFooterComponent],
  templateUrl: './toggleswitch-gallery.component.html',
  styleUrl: './toggleswitch-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleSwitchGalleryComponent {
  // 1. Basic
  protected readonly basicOn = signal(true);
  protected readonly basicOff = signal(false);

  // 3. Form row (status active/inactive pattern)
  protected readonly status = signal<'active' | 'inactive'>('active');

  // 4. Permission row pattern
  protected readonly manageDevices = signal(true);
  protected readonly selfActivate = signal(false);

  // 5. Theme toggle pattern
  protected readonly darkMode = signal(false);

  protected onStatusChange(checked: boolean): void {
    this.status.set(checked ? 'active' : 'inactive');
  }
}
