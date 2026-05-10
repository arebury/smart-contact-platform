import { computed, Directive, input, output } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | null;

/**
 * Makes a sortable table header keyboard-accessible (WCAG AA compliant)
 * and adds the `aria-sort` attribute screen readers expect.
 *
 * Usage:
 *
 *     <th
 *       class="table__th-sort"
 *       [aedSortable]="currentSortDir('name')"
 *       (activate)="toggleSort('name')"
 *     >
 *       {{ 'agents.table.name' | translate }}
 *     </th>
 *
 * The directive sets `role="button"`, `tabindex="0"`, `scope="col"`,
 * and binds Enter / Space keyboard activation to the same handler the
 * `(activate)` output exposes for clicks. Pass the column's current
 * sort direction (`'asc' | 'desc' | null`) so `aria-sort` updates as
 * the user re-sorts.
 */
@Directive({
  selector: '[aedSortable]',
  standalone: true,
  host: {
    role: 'button',
    tabindex: '0',
    scope: 'col',
    '[attr.aria-sort]': 'ariaSort()',
    '(click)': 'activate.emit()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
})
export class SortableHeaderDirective {
  readonly aedSortable = input.required<SortDirection>();
  readonly activate = output<void>();

  protected readonly ariaSort = computed(() => {
    const dir = this.aedSortable();
    if (dir === 'asc') return 'ascending';
    if (dir === 'desc') return 'descending';
    return 'none';
  });

  protected onKey(event: KeyboardEvent): void {
    event.preventDefault();
    this.activate.emit();
  }
}
