import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

export type ScInputSize = 'sm' | 'md' | 'lg';

export type ScInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'search';

let scInputIdCounter = 0;

/**
 * Smart Contact text input. Wraps PrimeNG's `pInputText` directive with the
 * SCDS field-pattern chrome (label + required mark + helper + error).
 *
 * Pairs con FormsModule (`[(ngModel)]`), Reactive Forms (`[formControl]`)
 * y signals (`[(value)]`) indistintamente — todos empujan al mismo valor
 * interno via `ControlValueAccessor`. Para casos input + addon (icono,
 * botón, prefix/suffix) ver `<p-inputgroup>` o futuro `sc-input-group`
 * (gap conocido del catálogo: customs-catalog.md §5.1).
 */
@Component({
  selector: 'sc-input',
  standalone: true,
  imports: [InputTextModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  host: {
    class: 'sc-input',
    '[class.sc-input--sm]': "size() === 'sm'",
    '[class.sc-input--lg]': "size() === 'lg'",
    '[class.sc-input--invalid]': 'isInvalid()',
    '[class.sc-input--disabled]': 'disabled()',
    '[class.sc-input--filled]': 'filled()',
  },
})
export class InputComponent implements ControlValueAccessor {
  // ─── Inputs ────────────────────────────────────────────────────────
  readonly size = input<ScInputSize>('md');
  readonly label = input<string>();
  readonly required = input<boolean>(false);
  readonly helperText = input<string>();
  readonly error = input<string>();

  readonly type = input<ScInputType>('text');
  readonly placeholder = input<string>();
  readonly disabled = model<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly inputId = input<string>();
  readonly name = input<string>();
  readonly autocomplete = input<string>();
  readonly maxlength = input<number>();
  /** Hint al teclado virtual mobile (`numeric`, `tel`, `email`, `decimal`, etc.).
   * No fuerza validación — solo cambia el layout del teclado en iOS/Android. */
  readonly inputmode = input<string>();
  /** Background "filled" variant (Figma node 1729:42481): bg slate-50. */
  readonly filled = input<boolean>(false);

  // ─── Two-way value binding (signal-friendly) ───────────────────────
  /** Current value. Use `[(value)]="signalName"` from consumers. */
  readonly value = model<string>('');

  // ─── Internal ──────────────────────────────────────────────────────
  protected readonly resolvedId = computed(
    () => this.inputId() ?? `sc-input-${++scInputIdCounter}`,
  );

  /** Whether `<input>` is in invalid state — driven by `[error]` first, then ControlValueAccessor's touched+invalid. */
  protected readonly isInvalid = computed(() => {
    if (this.error()) return true;
    const ctrl = this._ngControl?.control;
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  });

  /** Text under the input: error wins over helperText. */
  protected readonly footerText = computed(() => this.error() || this.helperText() || '');

  // ControlValueAccessor support — backs `[(ngModel)]` and Reactive Forms.
  private _onChange: (v: string) => void = () => {};
  private _onTouched: () => void = () => {};
  private readonly _injector = inject(Injector);
  private get _ngControl(): NgControl | null {
    try {
      return this._injector.get(NgControl, null, { self: true, optional: true });
    } catch {
      return null;
    }
  }

  writeValue(v: string | null | undefined): void {
    this.value.set(v ?? '');
  }
  registerOnChange(fn: (v: string) => void): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  setDisabledState(state: boolean): void {
    this.disabled.set(state);
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this._onChange(next);
  }

  protected onBlur(): void {
    this._onTouched();
  }
}
