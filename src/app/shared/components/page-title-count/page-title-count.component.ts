import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Inline count rendered inside a list-page `<h1>`. Shows a single number
 * when nothing is filtered (`X`) and a "filtered de total" pair when a
 * search/filter is active (`X de Y`). Replaces the old bottom-of-table
 * `<aed-result-counter>` (DD#34): dense, glanceable, lives where the
 * heading already is — no extra row, no tiny grey body slop.
 */
@Component({
  selector: 'aed-page-title-count',
  standalone: true,
  templateUrl: './page-title-count.component.html',
  styleUrl: './page-title-count.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleCountComponent {
  readonly total = input.required<number>();
  readonly filtered = input.required<number>();

  protected readonly isFiltered = computed(() => this.filtered() !== this.total());
}
