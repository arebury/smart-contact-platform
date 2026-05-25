import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { IconComponent } from '../icon/icon.component';
import { SC_ICON_SIZE_DEFAULT, SC_ICON_SIZE_DISPLAY_SM } from '@shared/utils/icon-size';

/**
 * Centered empty-state card shown by list pages when there are zero rows
 * (initial seed empty, or filter wiped everything). Big circular icon,
 * title, descriptive body, optional primary CTA.
 *
 * Reserves a tall `min-height` so the page header doesn't shift when the
 * list flips between empty and populated.
 */
@Component({
  selector: 'sc-empty-state',
  imports: [IconComponent, TranslateModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input.required<string>();
  readonly titleKey = input.required<string>();
  readonly bodyKey = input.required<string>();
  /** When set, renders a primary action button labeled with this i18n key. */
  readonly ctaKey = input<string | null>(null);

  readonly cta = output<void>();

  protected readonly plusIcon = 'add';
  protected readonly iconSizeDefault = SC_ICON_SIZE_DEFAULT;
  protected readonly iconSizeDisplay = SC_ICON_SIZE_DISPLAY_SM;

  protected onCtaClick(): void {
    this.cta.emit();
  }
}
