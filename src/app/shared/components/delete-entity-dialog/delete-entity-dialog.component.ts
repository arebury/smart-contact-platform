import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, AlertTriangle, Check, Copy, X } from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';

import { ClipboardService } from '@core/services/clipboard.service';

export interface DeletableEntity {
  readonly id: number;
  readonly name: string;
}

/**
 * Shared confirmation dialog for entity deletion (Users, Groups, Agents,
 * Templates…). Two modes:
 *
 *   - **single**: the user must re-type the entity name (with a copy-name
 *     button as a Fitts shortcut). Confirms only the bound id.
 *   - **bulk**: a wall of removable chips lets the user prune the list
 *     before confirming. Emits the surviving ids on confirm.
 *
 * Mirrors the React prototype's `DeleteEntityDialog` (DD#163, DD#172).
 */
@Component({
  selector: 'aed-delete-entity-dialog',
  standalone: true,
  imports: [DialogModule, FormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './delete-entity-dialog.component.html',
  styleUrl: './delete-entity-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteEntityDialogComponent {
  private readonly clipboard = inject(ClipboardService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly visible = input.required<boolean>();
  readonly mode = input.required<'single' | 'bulk'>();
  readonly items = input.required<readonly DeletableEntity[]>();
  readonly entitySingular = input.required<string>();
  readonly entityPlural = input.required<string>();
  /** Optional extra paragraph shown under the single-mode body. */
  readonly singleDetailMessage = input<string | null>(null);
  /** Optional footer paragraph for bulk mode. */
  readonly bulkFooterMessage = input<string | null>(null);

  readonly cancelled = output<void>();
  /** Emits the ids that survived chip pruning (bulk) or `null` for single. */
  readonly confirm = output<readonly number[] | null>();

  protected readonly alertIcon = AlertTriangle;
  protected readonly copyIcon = Copy;
  protected readonly checkIcon = Check;
  protected readonly closeIcon = X;

  protected readonly confirmText = signal('');
  protected readonly copied = signal(false);
  protected readonly visibleIds = signal<ReadonlySet<number>>(new Set());

  protected readonly visibleItems = computed(() =>
    this.items().filter((item) => this.visibleIds().has(item.id)),
  );

  protected readonly singleTarget = computed(() =>
    this.mode() === 'single' ? (this.items()[0]?.name ?? '') : '',
  );

  protected readonly canConfirm = computed(() => {
    if (this.mode() === 'single') {
      return this.confirmText() === this.singleTarget();
    }
    return this.visibleItems().length > 0;
  });

  constructor() {
    // Reset internal state every time the items list changes (i.e. a new
    // delete is requested) so the chip pruning and typed name don't bleed
    // across openings.
    effect(
      () => {
        const next = new Set(this.items().map((item) => item.id));
        this.visibleIds.set(next);
        this.confirmText.set('');
        this.copied.set(false);
      },
      { allowSignalWrites: true },
    );
  }

  protected onCopy(): void {
    void this.clipboard.copy(this.singleTarget()).then((ok) => {
      if (ok) {
        this.copied.set(true);
        this.messages.add({
          severity: 'success',
          summary: this.translate.instant('common.copied_to_clipboard'),
          life: 2000,
        });
        setTimeout(() => this.copied.set(false), 2000);
      } else {
        this.messages.add({
          severity: 'error',
          summary: this.translate.instant('common.copy_failed'),
          life: 3000,
        });
      }
    });
  }

  protected removeChip(id: number): void {
    const next = new Set(this.visibleIds());
    next.delete(id);
    // Keep the dialog open even when the last chip is pruned. The user
    // sees an empty-state message and Confirm stays disabled (canConfirm
    // tracks `visibleItems().length > 0`); they can still cancel
    // explicitly. Auto-closing here was a footgun — users lost their
    // delete action by accident.
    this.visibleIds.set(next);
  }

  /** Re-stage every original item — recovery from "I pruned everything by accident". */
  protected resetChips(): void {
    this.visibleIds.set(new Set(this.items().map((item) => item.id)));
  }

  protected onConfirm(): void {
    if (!this.canConfirm()) return;
    if (this.mode() === 'single') {
      this.confirm.emit(null);
    } else {
      this.confirm.emit(Array.from(this.visibleIds()));
    }
  }
}
