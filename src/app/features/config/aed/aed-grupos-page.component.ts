import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, UsersRound } from 'lucide-angular';

/**
 * Grupos defaults page — `/config/aed/grupos`.
 * Placeholder while the parámetros panel is built (Figma node 224:9482).
 */
@Component({
  selector: 'aed-aed-grupos-page',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './aed-sub-placeholder.component.html',
  styleUrl: './aed-sub-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AedGruposPageComponent {
  protected readonly icon = UsersRound;
  protected readonly headingKey = 'config.aed.subpages.grupos.heading';
  protected readonly subtitleKey = 'config.aed.subpages.grupos.subtitle';
  protected readonly emptyTitleKey = 'config.aed.subpages.empty_title';
  protected readonly emptyBodyKey = 'config.aed.subpages.grupos.empty_body';
}
