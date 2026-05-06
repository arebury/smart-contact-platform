import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule, ArrowRight, Copy, X } from 'lucide-angular';

import { ModalComponent } from '../modal/modal.component';

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
  selector: 'aed-impact-preview-dialog',
  standalone: true,
  imports: [LucideAngularModule, ModalComponent],
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

  protected readonly arrowIcon = ArrowRight;
  protected readonly duplicateIcon = Copy;
  protected readonly closeIcon = X;

  protected readonly removedIds = signal<ReadonlySet<number>>(new Set());

  protected readonly survivingItems = computed(() =>
    this.items().filter((item) => !this.removedIds().has(item.id)),
  );

  protected readonly canConfirm = computed(() => this.survivingItems().length > 0);

  constructor() {
    // Reset chip pruning whenever a new operation is requested.
    effect(
      () => {
        this.items();
        this.removedIds.set(new Set());
      },
      { allowSignalWrites: true },
    );
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
