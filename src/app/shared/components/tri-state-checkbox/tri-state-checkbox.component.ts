import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

export type TriState = 'none' | 'some' | 'all';

let triStateIdCounter = 0;

/**
 * Tri-state checkbox driven by an explicit `state` input.
 *
 * Cycle behavior on click:
 *   - 'none' → emits true  (the user wants "select everything")
 *   - 'all'  → emits false (the user wants "clear")
 *   - 'some' → emits false (mixed → first click clears, second click selects all)
 *
 * Built on a real `<input type="checkbox">` so it inherits keyboard support
 * (Space toggles, Tab focuses) and screen-reader semantics. The browser does
 * not let `indeterminate` be set declaratively — we reflect it imperatively
 * via the view-child reference whenever `state` changes.
 *
 * Output is `cycle(next: boolean)` rather than a tri-state because the
 * caller (e.g. a column header bulk-toggle) maps a single boolean to its
 * own batch operation. The component never emits `'some'` — that is only
 * an input state to drive the visual.
 */
@Component({
  selector: 'aed-tri-state-checkbox',
  standalone: true,
  templateUrl: './tri-state-checkbox.component.html',
  styleUrl: './tri-state-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriStateCheckboxComponent implements AfterViewInit {
  readonly state = input.required<TriState>();
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);

  /** Emits the next intended boolean state — see cycle behavior above. */
  readonly cycle = output<boolean>();

  protected readonly inputId = `aed-tri-state-${++triStateIdCounter}`;
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  constructor() {
    effect(() => {
      const ref = this.inputRef();
      const s = this.state();
      ref.nativeElement.indeterminate = s === 'some';
      ref.nativeElement.checked = s === 'all';
    });
  }

  ngAfterViewInit(): void {
    // Initial sync — the effect runs after view init, but we keep this
    // explicit so the very first paint already shows the right state.
    const ref = this.inputRef();
    const s = this.state();
    ref.nativeElement.indeterminate = s === 'some';
    ref.nativeElement.checked = s === 'all';
  }

  protected onChange(event: Event): void {
    event.preventDefault();
    if (this.disabled()) return;
    const s = this.state();
    // 'none' → true, 'all' → false, 'some' → false
    this.cycle.emit(s === 'none');
  }
}
