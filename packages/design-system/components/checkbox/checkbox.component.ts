import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

export type TriState = 'none' | 'some' | 'all';
export type ScCheckboxSize = 'sm' | 'md' | 'lg';

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
  selector: 'sc-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  readonly state = input.required<TriState>();
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);
  /** Size variant (Figma `Size=Small/Normal/Large`). Default 'md' (17.5px). */
  readonly size = input<ScCheckboxSize>('md');
  /** Filled background variant (Figma `Filled=True`): bg slate-50 cuando unchecked. */
  readonly filled = input<boolean>(false);

  /** Emits the next intended boolean state — see cycle behavior above. */
  readonly cycle = output<boolean>();

  protected readonly inputId = `sc-tri-state-${++triStateIdCounter}`;
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  constructor() {
    effect(() => {
      const ref = this.inputRef();
      const s = this.state();
      ref.nativeElement.indeterminate = s === 'some';
      ref.nativeElement.checked = s === 'all';
    });
  }

  protected onChange(event: Event): void {
    event.preventDefault();
    if (this.disabled()) return;
    const s = this.state();
    // 'none' → true, 'all' → false, 'some' → false
    this.cycle.emit(s === 'none');
  }
}
