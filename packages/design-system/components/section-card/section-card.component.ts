import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { IconComponent } from '@shared/components';
import { SC_ICON_SIZE_LG } from '@shared/utils/icon-size';

/**
 * Bordered card with a tinted header strip used to group form fields.
 * Mirrors the prototype's `SectionCard` from `shared/FormComponents.tsx`.
 *
 * Optional `[collapsible]` mode (DD#57) turns the header into a button
 * and toggles body visibility. Use `[initiallyCollapsed]` to start
 * folded — useful for "advanced settings" sections that should hide
 * noise for the typical user.
 */
@Component({
  selector: 'sc-section-card',
  imports: [TranslateModule, IconComponent],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardComponent {
  readonly titleKey = input.required<string>();
  readonly hintKey = input<string | null>(null);
  /** Anchor id used by `sc-form-section-nav` to scroll-spy / jump to this section. */
  readonly anchorId = input<string | null>(null);
  /** Optional leading icon for the title row. Pass any Material Symbols icon name. */
  readonly icon = input<string | null>(null);
  /** When true, the header acts as a toggle and the body collapses. */
  readonly collapsible = input<boolean>(false);
  /** Initial collapsed state when `collapsible` is true. Ignored otherwise. */
  readonly initiallyCollapsed = input<boolean>(false);

  protected readonly chevronDownIcon = 'expand_more';
  protected readonly chevronRightIcon = 'chevron_right';
  protected readonly iconSizeLg = SC_ICON_SIZE_LG;

  private readonly userToggled = signal<boolean | null>(null);

  /** Effective open state — user toggle wins, otherwise defaults to `!initiallyCollapsed`. */
  protected readonly open = computed(() => {
    const u = this.userToggled();
    if (u !== null) return u;
    return !this.initiallyCollapsed();
  });

  protected toggle(): void {
    if (!this.collapsible()) return;
    this.userToggled.set(!this.open());
  }
}
