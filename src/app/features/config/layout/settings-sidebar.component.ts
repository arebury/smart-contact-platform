import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Database, LucideAngularModule, Settings, Shield } from 'lucide-angular';

interface SettingsNavItem {
  readonly path: string;
  readonly labelKey: string;
  readonly hintKey: string;
  readonly icon: typeof Settings;
}

/**
 * Inner navigation rail for `/config/*`. Sits between the global app
 * sidebar and the page content (Figma node 224:9167). Fixed width,
 * sticky to the top of the scrollable content area, scrollable
 * internally if the nav grows past the viewport.
 *
 * Items mirror the config children that have real pages today
 * (Seguridad, AED, Sistema). Placeholder routes (Personalización,
 * Integraciones) stay out until they're built — surfacing them here
 * twice (main sidebar + settings sidebar) without a destination
 * inflates the inventory.
 */
@Component({
  selector: 'aed-settings-sidebar',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './settings-sidebar.component.html',
  styleUrl: './settings-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsSidebarComponent {
  protected readonly items: readonly SettingsNavItem[] = [
    {
      path: '/config/seguridad',
      labelKey: 'config.seguridad.title',
      hintKey: 'config.sidebar.seguridad_hint',
      icon: Shield,
    },
    {
      path: '/config/aed',
      labelKey: 'config.aed.title',
      hintKey: 'config.sidebar.aed_hint',
      icon: Database,
    },
    {
      path: '/config/sistema',
      labelKey: 'config.sistema.title',
      hintKey: 'config.sidebar.sistema_hint',
      icon: Settings,
    },
  ];
}
