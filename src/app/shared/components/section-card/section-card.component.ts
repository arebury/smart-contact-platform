import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChevronDown, ChevronRight, LucideAngularModule, Plus } from 'lucide-angular';

type LucideIcon = typeof Plus;

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
  selector: 'aed-section-card',
  imports: [TranslateModule, LucideAngularModule],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardComponent {
  readonly titleKey = input.required<string>();
  readonly hintKey = input<string | null>(null);
  /** Anchor id used by `aed-form-section-nav` to scroll-spy / jump to this section. */
  readonly anchorId = input<string | null>(null);
  /** Optional leading icon for the title row. Pass any Lucide icon directly. */
  readonly icon = input<LucideIcon | null>(null);
  /** When true, the header acts as a toggle and the body collapses. */
  readonly collapsible = input<boolean>(false);
  /** Initial collapsed state when `collapsible` is true. Ignored otherwise. */
  readonly initiallyCollapsed = input<boolean>(false);

  protected readonly chevronDownIcon = ChevronDown;
  protected readonly chevronRightIcon = ChevronRight;

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
