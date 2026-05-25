import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { DialogComponent } from '../dialog/dialog.component';
import { IconComponent } from '../icon/icon.component';
import { SC_ICON_SIZE_MD, SC_ICON_SIZE_SM } from '@shared/utils/icon-size';

export interface ImpactItem {
  readonly id: number;
  readonly name: string;
  /** Optional secondary text (e.g. "(3 grupos)"). */
  readonly hint?: string;
}

export interface ImpactBadge {
  readonly fieldLabel: string;
  readonly currentValueLabel?: string;
  readonly newValueLabel: string;
}

/**
 * Confirmation surface that previews a bulk operation (edit / duplicate)
 * before it commits. Items can be removed individually with hover-revealed
 * X buttons; the dialog auto-closes if every chip is pruned.
 *
 * Mirrors the React prototype's `ImpactPreviewDialog` (DD#298).
 */
@Component({
  selector: 'sc-impact-preview-dialog',
  imports: [ButtonModule, IconComponent, DialogComponent],
  templateUrl: './impact-preview-dialog.component.html',
  styleUrl: './impact-preview-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpactPreviewDialogComponent {
  readonly visible = input.required<boolean>();
  readonly mode = input.required<'bulkEdit' | 'duplicate'>();
  readonly title = input.required<string>();
  readonly items = input.required<readonly ImpactItem[]>();
  readonly badge = input<ImpactBadge | null>(null);
  readonly confirmLabel = input<string>('Aplicar');
  readonly cancelLabel = input<string>('Cancelar');

  readonly cancelled = output<void>();
  /** Emits the surviving ids in the order they were originally given. */
  readonly confirm = output<readonly number[]>();

  protected readonly arrowIcon = 'arrow_forward';
  protected readonly duplicateIcon = 'content_copy';
  protected readonly closeIcon = 'close';
  protected readonly iconSizeMd = SC_ICON_SIZE_MD;
  protected readonly iconSizeSm = SC_ICON_SIZE_SM;

  protected readonly removedIds = signal<ReadonlySet<number>>(new Set());

  protected readonly survivingItems = computed(() =>
    this.items().filter((item) => !this.removedIds().has(item.id)),
  );

  protected readonly canConfirm = computed(() => this.survivingItems().length > 0);

  constructor() {
    // Reset chip pruning whenever a new operation is requested.
    effect(() => {
      this.items();
      this.removedIds.set(new Set());
    });
  }

  protected remove(id: number): void {
    // The "remove" button on a chip is disabled when only one item is
    // left (template-side guard), so this method is unreachable when
    // pruning would leave the list empty. Drop the previous auto-close
    // — same reasoning as DeleteEntityDialog (PR #10): users were
    // losing the operation by accident.
    const next = new Set(this.removedIds());
    next.add(id);
    this.removedIds.set(next);
  }

  protected onConfirm(): void {
    if (!this.canConfirm()) return;
    this.confirm.emit(this.survivingItems().map((item) => item.id));
  }
}
