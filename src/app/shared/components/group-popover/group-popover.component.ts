import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { GroupRef } from '@shared/data/groups-ref';

const VISIBLE_LIMIT = 5;
const HOVER_LEAVE_DELAY_MS = 150;

/**
 * Inline cell that shows the group count and reveals a small floating list
 * on hover or keyboard focus. The list shows up to 5 group names plus a
 * "+N más" tail when the agent has more.
 *
 * Floats above the table (DD#8): the panel is `position: absolute` from the
 * trigger and never participates in the table flow, so opening it cannot
 * push rows down. Hover and focus both open it (UX rule: don't rely only
 * on hover, accessible via keyboard too).
 */
@Component({
  selector: 'aed-group-popover',
  imports: [TranslateModule],
  templateUrl: './group-popover.component.html',
  styleUrl: './group-popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupPopoverComponent {
  readonly groups = input.required<readonly GroupRef[]>();

  protected readonly open = signal(false);
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly count = computed(() => this.groups().length);
  protected readonly visible = computed(() => this.groups().slice(0, VISIBLE_LIMIT));
  protected readonly overflowCount = computed(() => Math.max(0, this.count() - VISIBLE_LIMIT));

  protected onEnter(): void {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    if (this.count() > 0) this.open.set(true);
  }

  protected onLeave(): void {
    // Tiny delay so the user can move from trigger to panel without flicker.
    this.leaveTimer = setTimeout(() => this.open.set(false), HOVER_LEAVE_DELAY_MS);
  }

  protected onFocus(): void {
    if (this.count() > 0) this.open.set(true);
  }

  protected onBlur(): void {
    this.open.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this.open.set(false);
    }
  }
}
