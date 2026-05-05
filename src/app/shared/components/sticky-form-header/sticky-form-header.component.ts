import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  Check,
  Loader2,
  LucideAngularModule,
  Pencil,
  Trash2,
  X,
} from 'lucide-angular';

/**
 * Sticky bar at the top of every Create/Edit page (Users, Groups, Agents…).
 * Shows the entity title, optional editable name, plus Save / Cancel /
 * Delete actions. The "Save" button shows a spinner while `[saving]` is
 * true; "Save" is disabled while `[canSave]` is false.
 */
@Component({
  selector: 'aed-sticky-form-header',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './sticky-form-header.component.html',
  styleUrl: './sticky-form-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StickyFormHeaderComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly mode = input.required<'create' | 'edit'>();
  /** Entity-singular label key (`'users.entity_singular'`). */
  readonly entityKey = input.required<string>();
  /** Current entity name (display + edit target). */
  readonly name = input.required<string>();
  /** Disables the Save button while true. */
  readonly canSave = input(true);
  /** Replaces Save with a spinner while true. */
  readonly saving = input(false);
  /** When true, shows the inline edit pencil + Delete button (edit mode). */
  readonly canDelete = input(false);

  readonly nameChange = output<string>();
  readonly save = output<void>();
  readonly cancel = output<void>();
  readonly delete = output<void>();

  protected readonly pencilIcon = Pencil;
  protected readonly checkIcon = Check;
  protected readonly closeIcon = X;
  protected readonly trashIcon = Trash2;
  protected readonly loaderIcon = Loader2;

  protected readonly editing = signal(false);
  protected readonly draftName = signal('');

  @ViewChild('nameInput') private readonly nameInput?: ElementRef<HTMLInputElement>;

  protected readonly title = computed(() => {
    if (this.mode() === 'create') return this.entityKey();
    return this.name();
  });

  /** Imperative trigger so the parent can request inline editing (e.g. from a "Rename" menu). */
  startEditing(): void {
    if (this.mode() !== 'edit') return;
    this.draftName.set(this.name());
    this.editing.set(true);
    queueMicrotask(() => this.nameInput?.nativeElement.select());
  }

  protected onPencilClick(): void {
    this.startEditing();
  }

  protected onDraftInput(value: string): void {
    this.draftName.set(value);
  }

  protected confirmRename(): void {
    const next = this.draftName().trim();
    if (next && next !== this.name()) {
      this.nameChange.emit(next);
    }
    this.editing.set(false);
  }

  protected cancelRename(): void {
    this.draftName.set(this.name());
    this.editing.set(false);
  }

  protected onRenameKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.confirmRename();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelRename();
    }
  }

  /** True when the host element contains the focused/clicked element. */
  contains(target: Node | null): boolean {
    return !!target && this.host.nativeElement.contains(target);
  }
}
