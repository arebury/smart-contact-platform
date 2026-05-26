import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { PageHeaderService } from '@core/services';

import { SettingsSidebarComponent } from './settings-sidebar.component';

/**
 * Layout shell for `/config/aed/*` routes (Figma node 224:9167).
 *
 * Rail (izquierda, navegación AED) + columna de contenido. La identidad la
 * dan el breadcrumb de la TopBar + el rail (que resalta la sección activa);
 * la columna de contenido abre con un título + descripción **ligeros** (no la
 * banda full-width de antes — S62: alineado con el modelo "todo arriba" del
 * resto de la app, sin banda que cruce sobre el rail). El título sigue
 * leyéndose de `PageHeaderService` (cada sub-ruta escribe el suyo).
 */
@Component({
  selector: 'sc-settings-shell',
  imports: [RouterOutlet, SettingsSidebarComponent, TranslateModule],
  templateUrl: './settings-shell.component.html',
  styleUrl: './settings-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsShellComponent {
  protected readonly headerService = inject(PageHeaderService);

  protected readonly headerState = computed(() => this.headerService.state());
}
