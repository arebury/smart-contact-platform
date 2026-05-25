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
import { Loader2, LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';

import { IconComponent } from '@shared/components';
import { SC_ICON_SIZE_DEFAULT, SC_ICON_SIZE_MD } from '@shared/utils/icon-size';

/**
 * Sticky bar at the top of every Create/Edit page (Users, Groups, Agents…).
 * Shows the entity title, optional editable name, plus Save / Cancel /
 * Delete actions. The "Save" button shows a spinner while `[saving]` is
 * true; "Save" is disabled while `[canSave]` is false.
 *
 * ⚠️ RETENIDO PARA ROLLBACK (S59, Supervisor DD#65). Ya NO lo usa ningún form
 * de la app: los 3 form shells migraron al modelo "todo arriba" (acciones al
 * TopBar vía TopBarSlotService + la ficha del panel para la identidad). Se
 * conserva intacto —exportado del barrel + showcased en ds-docs— como red de
 * seguridad por si se revierte el "todo arriba". NO borrar sin decisión
 * explícita (ver DD#65 § "Cómo revertir").
 */
@Component({
  selector: 'sc-sticky-form-header',
  imports: [ButtonModule, FormsModule, IconComponent, LucideAngularModule, TranslateModule],
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
  /** i18n key for the create-mode name input placeholder. */
  readonly namePlaceholderKey = input<string>('common.name_placeholder');
  /**
   * Whether to render the "Atrás" button in the actions cluster. Default
   * is `false` — the page-level breadcrumb already gives the user a way
   * back, so the form actions cluster only carries Save. Pass `true` to
   * opt-in (e.g. on a deeper modal where the breadcrumb isn't visible).
   */
  readonly showBack = input(false);

  readonly nameChange = output<string>();
  readonly save = output<void>();
  readonly cancelled = output<void>();

  protected readonly pencilIcon = 'edit';
  protected readonly checkIcon = 'check';
  protected readonly closeIcon = 'close';
  protected readonly loaderIcon = Loader2;
  protected readonly backIcon = 'arrow_back';
  protected readonly iconSizeDefault = SC_ICON_SIZE_DEFAULT;
  protected readonly iconSizeMd = SC_ICON_SIZE_MD;

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
