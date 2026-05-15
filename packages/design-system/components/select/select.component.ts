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
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { SelectModule } from 'primeng/select';

export type ScSelectSize = 'sm' | 'md' | 'lg';

let scSelectIdCounter = 0;

/**
 * Smart Contact select / dropdown. Wraps PrimeNG `<p-select>` with the
 * SCDS field-pattern chrome (label + required + helper + error). Mirrors
 * `sc-input` so the field family reads consistent.
 *
 * Aligned 1:1 with Figma `Smart Contact Prime → ❖ Select` (node
 * 6738:22642): border slate-300, radius 6px, padding 10.5/7, dropdown
 * area 35px wide, chevron 14px slate-400, label slate-700 14px, helper
 * slate-700 12px, gap 7px between label/input/helper.
 *
 * Options can be a plain `string[]` or an array of `{ label, value }`
 * objects. `optionLabel` / `optionValue` let you point to custom keys
 * when objects don't use that exact shape.
 */
@Component({
  selector: 'sc-select',
  standalone: true,
  imports: [SelectModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  host: {
    class: 'sc-select',
    '[class.sc-select--sm]': "size() === 'sm'",
    '[class.sc-select--lg]': "size() === 'lg'",
    '[class.sc-select--invalid]': 'isInvalid()',
    '[class.sc-select--disabled]': 'disabled()',
    '[class.sc-select--filled]': 'filled()',
  },
})
export class SelectComponent implements ControlValueAccessor {
  // ─── Chrome (mirrors sc-input) ─────────────────────────────────────
  readonly size = input<ScSelectSize>('md');
  readonly label = input<string>();
  readonly required = input<boolean>(false);
  readonly helperText = input<string>();
  readonly error = input<string>();
  readonly placeholder = input<string>('');
  readonly disabled = model<boolean>(false);
  readonly inputId = input<string>();
  readonly name = input<string>();

  // ─── Select-specific ───────────────────────────────────────────────
  /** Items to pick from. Plain string[] or array of objects. */
  readonly options = input<readonly unknown[]>([]);
  /** Key for the visible label when `options` are objects. */
  readonly optionLabel = input<string>('label');
  /** Key for the bound value when `options` are objects. If unset, the whole object is bound. */
  readonly optionValue = input<string>();
  /** Show an "×" to clear selection. */
  readonly showClear = input<boolean>(false);
  /** Enable search/filter inside the dropdown. */
  readonly filter = input<boolean>(false);
  /** Field(s) used for filtering when `filter` is true. */
  readonly filterBy = input<string>();
  /** Empty-state copy when filter returns no rows. */
  readonly emptyFilterMessage = input<string>('Sin resultados');
  /** Empty-state copy when `options` is empty. */
  readonly emptyMessage = input<string>('Sin opciones');
  /** Background "filled" variant (Figma node 6195:7785): bg slate-50. */
  readonly filled = input<boolean>(false);

  // ─── Two-way value binding ─────────────────────────────────────────
  readonly value = model<unknown>(undefined);

  // ─── Derived ───────────────────────────────────────────────────────
  protected readonly resolvedId = computed(
    () => this.inputId() ?? `sc-select-${++scSelectIdCounter}`,
  );

  protected readonly isInvalid = computed(() => {
    if (this.error()) return true;
    const ctrl = this._ngControl?.control;
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  });

  protected readonly footerText = computed(() => this.error() || this.helperText() || '');

  /** Map our sm/md/lg to PrimeNG's small/large (md = no size attr). */
  protected readonly pSize = computed<'small' | 'large' | undefined>(() => {
    const s = this.size();
    return s === 'sm' ? 'small' : s === 'lg' ? 'large' : undefined;
  });

  /** PrimeNG's `[options]` is typed `any[]` (mutable); cast our readonly array. */
  protected readonly optionsMutable = computed(() => this.options() as unknown[]);

  /**
   * `true` cuando `options` es un array de primitives (string/number/boolean).
   * En ese caso PrimeNG espera que NO se le pase `optionLabel`/`optionValue` —
   * si los pasamos con un string array, intenta resolver `.label` en cada
   * string y todas las opciones renderizan vacías (bug visible en grupos:
   * tipoVoz, prioridad, estrategia con string[] mostraban "empty empty…").
   */
  protected readonly hasPrimitiveOptions = computed(() => {
    const opts = this.options();
    return opts.length > 0 && opts.every((o) => o === null || typeof o !== 'object');
  });

  protected readonly resolvedOptionLabel = computed(() =>
    this.hasPrimitiveOptions() ? undefined : this.optionLabel(),
  );

  protected readonly resolvedOptionValue = computed(() =>
    this.hasPrimitiveOptions() ? undefined : this.optionValue(),
  );

  // ─── ControlValueAccessor ──────────────────────────────────────────
  private _onChange: (v: unknown) => void = () => {};
  private _onTouched: () => void = () => {};
  private readonly _injector = inject(Injector);
  private get _ngControl(): NgControl | null {
    try {
      return this._injector.get(NgControl, null, { self: true, optional: true });
    } catch {
      return null;
    }
  }

  writeValue(v: unknown): void {
    this.value.set(v);
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  setDisabledState(state: boolean): void {
    this.disabled.set(state);
  }

  protected onModelChange(v: unknown): void {
    this.value.set(v);
    this._onChange(v);
  }

  protected onBlur(): void {
    this._onTouched();
  }
}
