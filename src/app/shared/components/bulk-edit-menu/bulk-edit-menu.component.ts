import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule, Pencil, ChevronDown, ArrowRight } from 'lucide-angular';
import { PopoverModule } from 'primeng/popover';

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
 * Compact "Editar" trigger that opens a popover with a field selector and a
 * value picker. The caller decides what fields are available and what the
 * value choices are; this component just orchestrates the picker and emits
 * a single `commit` once the user has chosen.
 *
 * The actual mutation typically opens an `ImpactPreviewDialog` on top so the
 * user can prune affected rows before applying. This menu intentionally does
 * not own that dialog — caller can pipe `commit` straight into the preview.
 */
@Component({
  selector: 'aed-bulk-edit-menu',
  standalone: true,
  imports: [LucideAngularModule, PopoverModule],
  templateUrl: './bulk-edit-menu.component.html',
  styleUrl: './bulk-edit-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkEditMenuComponent {
  readonly fields = input.required<readonly BulkEditFieldOption[]>();
  readonly buttonLabel = input<string>('Editar');

  readonly commit = output<BulkEditCommit>();

  protected readonly editIcon = Pencil;
  protected readonly chevronIcon = ChevronDown;
  protected readonly arrowIcon = ArrowRight;

  protected readonly selectedFieldKey = signal<string>('');
  protected readonly selectedValue = signal<string>('');

  protected readonly selectedField = computed(
    () => this.fields().find((f) => f.key === this.selectedFieldKey()) ?? this.fields()[0],
  );

  constructor() {
    // Default the selection to the first available field/value pair.
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

  protected onCommit(close: () => void): void {
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
    close();
  }
}
