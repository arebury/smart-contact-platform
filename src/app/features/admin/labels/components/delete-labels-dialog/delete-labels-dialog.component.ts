import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';

import { LabelChipComponent } from '@shared/components/label-chip/label-chip.component';
import { Label } from '../../data/labels-data';

/**
 * Confirmation dialog for deleting one or many labels. Renders as a single
 * sentence in single mode, or a stack of chips with totals in bulk mode.
 *
 * Backed by `p-dialog` so we inherit the focus-trap, ESC-to-close and
 * accessibility plumbing from PrimeNG.
 */
@Component({
  selector: 'aed-delete-labels-dialog',
  standalone: true,
  imports: [DialogModule, LabelChipComponent, LucideAngularModule, TranslateModule],
  templateUrl: './delete-labels-dialog.component.html',
  styleUrl: './delete-labels-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteLabelsDialogComponent {
  readonly labels = input.required<readonly Label[]>();
  readonly visible = input.required<boolean>();
  /** Map of labelId -> agent count, supplied by the page. */
  readonly agentCountByLabel = input<ReadonlyMap<number, number>>(new Map());

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected readonly trashIcon = Trash2;

  protected readonly isSingle = computed(() => this.labels().length === 1);

  protected readonly totalAffectedAgents = computed(() => {
    const counts = this.agentCountByLabel();
    return this.labels().reduce((sum, label) => sum + (counts.get(label.id) ?? 0), 0);
  });
}
