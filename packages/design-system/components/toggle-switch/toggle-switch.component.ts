import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

let toggleIdCounter = 0;

/**
 * Accessible toggle switch — replaces the inline `<input type="checkbox">`
 * styled-as-toggle pattern that was duplicated across the form pages.
 *
 * Built on top of a real `<input type="checkbox">` so it inherits keyboard
 * support (Space toggles, Tab focuses), screen-reader semantics, and form
 * association — the visible track + thumb are pure CSS painted on top.
 *
 * Bind the `id` of an external label via `[ariaLabelledBy]` when the
 * toggle is paired with descriptive text alongside (the form fields do
 * this — the label and helper text live next to the switch, not inside
 * a wrapping `<label>`).
 */
@Component({
  selector: 'sc-toggle-switch',
  standalone: true,
  templateUrl: './toggle-switch.component.html',
  styleUrl: './toggle-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleSwitchComponent {
  readonly checked = input.required<boolean>();
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);
  readonly ariaLabelledBy = input<string | null>(null);

  readonly checkedChange = output<boolean>();

  protected readonly inputId = `sc-toggle-${++toggleIdCounter}`;

  protected onChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checkedChange.emit(value);
  }
}
