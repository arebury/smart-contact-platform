import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface ColorDotOption {
  /** Stable id stored in the data model. */
  readonly value: string;
  /** Label used for tooltip + a11y. */
  readonly label: string;
  /** CSS color (or `var(--…)`) painted as the dot. */
  readonly color: string;
}

/**
 * Inline row of selectable color dots — mirrors the React prototype's
 * `ColorPicker` used by the Labels form. Two-way bindable via `[(value)]`.
 */
@Component({
  selector: 'sc-color-dot-picker',
  standalone: true,
  templateUrl: './color-dot-picker.component.html',
  styleUrl: './color-dot-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorDotPickerComponent {
  readonly options = input.required<readonly ColorDotOption[]>();
  readonly value = model.required<string>();

  protected select(option: ColorDotOption): void {
    this.value.set(option.value);
  }
}
