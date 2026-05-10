import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SettingsSidebarComponent } from './settings-sidebar.component';

/**
 * Layout shell for `/config/*` routes (Figma node 224:9167).
 *
 * Two columns: a fixed-width settings sidebar that sticks to the top
 * of the scrollable shell content, and a main container that hosts
 * the active config page via `<router-outlet>`. The main container
 * paints the muted page surface so individual pages can drop their
 * own background and inherit the canvas.
 */
@Component({
    selector: 'aed-settings-shell',
    imports: [RouterOutlet, SettingsSidebarComponent],
    templateUrl: './settings-shell.component.html',
    styleUrl: './settings-shell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsShellComponent {}
