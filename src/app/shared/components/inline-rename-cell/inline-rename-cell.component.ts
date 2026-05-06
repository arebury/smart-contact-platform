import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X } from 'lucide-angular';

/**
 * In-place editable name cell. Used by the list pages immediately after a
 * duplicate so the freshly-created draft can be renamed without a router
 * round-trip (mirrors the React prototype's `InlineDuplicateRow`, but adapted
 * to keep the row in its original position so the table layout never shifts).
 *
 * Behaviour:
 *   - autofocus + select-all on mount (Fitts: user is already in "rename" mode)
 *   - Enter or check button → emit `commit` with the trimmed value
 *   - Esc or X button → emit `cancel` (caller decides whether to delete the
 *     draft or just revert the name)
 *   - empty / whitespace-only values disable commit
 *
 * Sized to match the resting name cell exactly: same font, same line-height,
 * borderless, transparent background. The action buttons are inline and
 * collapse to icon-only width so the cell width never changes.
 */
@Component({
  selector: 'aed-inline-rename-cell',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './inline-rename-cell.component.html',
  styleUrl: './inline-rename-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineRenameCellComponent implements AfterViewInit {
  readonly initialValue = input.required<string>();
  readonly placeholder = input<string>('');
  readonly ariaLabel = input<string>('Renombrar');

  readonly commit = output<string>();
  readonly cancel = output<void>();

  protected readonly checkIcon = Check;
  protected readonly closeIcon = X;

  protected readonly value = signal('');

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  ngAfterViewInit(): void {
    this.value.set(this.initialValue());
    queueMicrotask(() => {
      const el = this.inputRef().nativeElement;
      el.focus();
      el.select();
    });
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onCommit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel.emit();
    }
  }

  protected onCommit(): void {
    const next = this.value().trim();
    if (!next) return;
    this.commit.emit(next);
  }

  protected onCancel(): void {
    this.cancel.emit();
  }
}
