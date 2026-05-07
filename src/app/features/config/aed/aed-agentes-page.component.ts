import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, UserRound } from 'lucide-angular';

/**
 * Agentes defaults page — `/config/aed/agentes`.
 * Placeholder while the parámetros panel is built (Figma node 224:9167).
 */
@Component({
  selector: 'aed-aed-agentes-page',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './aed-sub-placeholder.component.html',
  styleUrl: './aed-sub-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AedAgentesPageComponent {
  protected readonly icon = UserRound;
  protected readonly headingKey = 'config.aed.subpages.agentes.heading';
  protected readonly subtitleKey = 'config.aed.subpages.agentes.subtitle';
  protected readonly emptyTitleKey = 'config.aed.subpages.empty_title';
  protected readonly emptyBodyKey = 'config.aed.subpages.agentes.empty_body';
}
