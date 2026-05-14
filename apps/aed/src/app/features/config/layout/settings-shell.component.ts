import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageHeaderService } from '@core/services';
import { PageHeaderComponent } from '@shared/components';

import { SettingsSidebarComponent } from './settings-sidebar.component';

/**
 * Layout shell for `/config/*` routes (Figma node 224:9167).
 *
 * Three rows: a static page header at the top (read from
 * `PageHeaderService` — each leaf route writes its own title / icon /
 * subtitle), then a sticky rail + main router-outlet pair below. Matches
 * the /admin form layout where `sticky-form-header` spans full width.
 *
 * Main paints the muted page surface so individual pages can drop their
 * own background and inherit the canvas.
 */
@Component({
  selector: 'sc-settings-shell',
  imports: [PageHeaderComponent, RouterOutlet, SettingsSidebarComponent],
  templateUrl: './settings-shell.component.html',
  styleUrl: './settings-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsShellComponent {
  protected readonly headerService = inject(PageHeaderService);

  protected readonly headerState = computed(() => this.headerService.state());
}
