import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

export interface BulkActionEntityLabels {
  readonly singular: string;
  readonly plural: string;
  /** Spanish gender suffix; defaults to "seleccionado/seleccionados" (masculine). */
  readonly suffixSingular?: string;
  readonly suffixPlural?: string;
}

/**
 * Fixed-bottom action bar that surfaces when items are selected in list pages
 * (DD#298). Shows a "{n} {entity} {selected}" summary plus a clear button on
 * the left, and arbitrary projected actions on the right.
 *
 * Sits flush with the sidebar via `--sc-sidebar-width`.
 */
@Component({
  selector: 'aed-bulk-action-bar',
  imports: [LucideAngularModule],
  templateUrl: './bulk-action-bar.component.html',
  styleUrl: './bulk-action-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkActionBarComponent {
  readonly count = input.required<number>();
  readonly entity = input.required<BulkActionEntityLabels>();

  readonly clear = output<void>();

  protected readonly closeIcon = X;

  protected readonly visible = computed(() => this.count() > 0);

  protected readonly summary = computed(() => {
    const c = this.count();
    const e = this.entity();
    const label = c === 1 ? e.singular : e.plural;
    const suffix =
      c === 1 ? (e.suffixSingular ?? 'seleccionado') : (e.suffixPlural ?? 'seleccionados');
    return `${c} ${label} ${suffix}`;
  });
}
