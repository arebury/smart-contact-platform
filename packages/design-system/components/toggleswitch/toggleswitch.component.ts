import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

let toggleIdCounter = 0;

/**
 * Accessible toggle switch. Wrapper Extended sobre `<p-toggleswitch>` —
 * heredamos keyboard support (Space toggles, Tab focuses), screen-reader
 * semantics (`role="switch"`), form association y validación nativas.
 *
 * API pública estable: `[checked]`, `[disabled]`, `[ariaLabel]`,
 * `[ariaLabelledBy]`, `(checkedChange)`. Los 21 consumers AED no se enteran
 * del refactor interno.
 *
 * Bind el `id` de un label externo via `[ariaLabelledBy]` cuando el toggle
 * está pareado con texto descriptivo al lado (form-row pattern: label +
 * helper viven aparte, no envolviendo).
 *
 * Figma reference: `❖ ToggleSwitch` (node 6738:22645) del Smart Contact
 * Prime kit. Refactor S32 — antes era CSS puro sobre `<input
 * type="checkbox">`. Migrado a `<p-toggleswitch>` para minimizar custom y
 * aprovechar lógica nativa PrimeNG (memoria `minimal-customization`).
 */
@Component({
  selector: 'sc-toggleswitch',
  standalone: true,
  imports: [FormsModule, ToggleSwitchModule],
  templateUrl: './toggleswitch.component.html',
  styleUrl: './toggleswitch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleSwitchComponent {
  readonly checked = input.required<boolean>();
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);
  readonly ariaLabelledBy = input<string | null>(null);

  readonly checkedChange = output<boolean>();

  protected readonly inputId = `sc-toggle-${++toggleIdCounter}`;

  protected onChange(value: boolean): void {
    this.checkedChange.emit(value);
  }
}
