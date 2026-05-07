import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Phone } from 'lucide-angular';

/**
 * Servicio defaults page — `/config/aed/servicio`.
 * Placeholder while the parámetros panel is built (Figma node 258:9396).
 */
@Component({
  selector: 'aed-aed-servicio-page',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './aed-sub-placeholder.component.html',
  styleUrl: './aed-sub-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AedServicioPageComponent {
  protected readonly icon = Phone;
  protected readonly headingKey = 'config.aed.subpages.servicio.heading';
  protected readonly subtitleKey = 'config.aed.subpages.servicio.subtitle';
  protected readonly emptyTitleKey = 'config.aed.subpages.empty_title';
  protected readonly emptyBodyKey = 'config.aed.subpages.servicio.empty_body';
}
