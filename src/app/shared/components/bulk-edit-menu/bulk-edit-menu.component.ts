import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

export interface BulkEditFieldOption {
  /** Stable key passed back to the caller. */
  readonly key: string;
  /** Translated label shown in the field selector. */
  readonly label: string;
  /** Choices for this field. The first one becomes the default. */
  readonly values: readonly BulkEditValueOption[];
}

export interface BulkEditValueOption {
  readonly value: string;
  readonly label: string;
}

export interface BulkEditCommit {
  readonly fieldKey: string;
  readonly fieldLabel: string;
  readonly value: string;
  readonly valueLabel: string;
}

/**
 * Inline `Cambiar [field] a [value] [Aplicar]` editor that lives in the
 * bulk action bar. Caller supplies the fields and value choices; this
 * component orchestrates the picker and emits a single `commit` once
 * Aplicar is pressed.
 *
 * The actual mutation typically opens an `ImpactPreviewDialog` on top so the
 * user can prune affected rows before applying. This menu intentionally does
 * not own that dialog — caller can pipe `commit` straight into the preview.
 */
@Component({
  selector: 'aed-bulk-edit-menu',
  imports: [LucideAngularModule],
  templateUrl: './bulk-edit-menu.component.html',
  styleUrl: './bulk-edit-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkEditMenuComponent {
  readonly fields = input.required<readonly BulkEditFieldOption[]>();
  /** Retained for source compatibility; no longer rendered. */
  readonly buttonLabel = input<string>('Editar');

  readonly commit = output<BulkEditCommit>();

  protected readonly chevronIcon = ChevronDown;

  protected readonly selectedFieldKey = signal<string>('');
  protected readonly selectedValue = signal<string>('');

  protected readonly selectedField = computed(
    () => this.fields().find((f) => f.key === this.selectedFieldKey()) ?? this.fields()[0],
  );

  protected readonly canApply = computed(() => {
    const field = this.selectedField();
    if (!field) return false;
    return field.values.some((v) => v.value === this.selectedValue());
  });

  constructor() {
    effect(() => {
      const first = this.fields()[0];
      if (!first) return;
      if (!this.selectedFieldKey()) this.selectedFieldKey.set(first.key);
      if (!this.selectedValue()) this.selectedValue.set(first.values[0]?.value ?? '');
    });
  }

  protected onFieldChange(event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    this.selectedFieldKey.set(key);
    const next = this.fields().find((f) => f.key === key)?.values[0]?.value ?? '';
    this.selectedValue.set(next);
  }

  protected onValueChange(event: Event): void {
    this.selectedValue.set((event.target as HTMLSelectElement).value);
  }

  protected onApply(): void {
    const field = this.selectedField();
    if (!field) return;
    const value = this.selectedValue();
    const valueOpt = field.values.find((v) => v.value === value);
    if (!valueOpt) return;
    this.commit.emit({
      fieldKey: field.key,
      fieldLabel: field.label,
      value: valueOpt.value,
      valueLabel: valueOpt.label,
    });
  }
}
