import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Plus, X } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';

type LucideIcon = typeof Plus;

let modalIdCounter = 0;

/**
 * Canonical modal shell — Smart Contact design (Figma node 1037:34069).
 *
 * Three slots:
 *   - **header**: leading icon (optional) + title + subtitle (optional) +
 *     close X. Rendered from inputs; not projected.
 *   - **body**: free content slot (default `<ng-content>`).
 *   - **footer**: action row, projected via `<ng-content select="[modal-actions]">`.
 *
 * Wraps PrimeNG `<p-dialog>` for focus trap, ESC, mask and animation,
 * but the dialog's default chrome is hidden — we render the entire card
 * ourselves so the visual matches the design system 1:1.
 *
 * Usage:
 *
 * ```html
 * <aed-modal
 *   [visible]="open()"
 *   title="¿Eliminar agente?"
 *   subtitle="Esta acción no se puede deshacer."
 *   [icon]="trashIcon"
 *   (cancelled)="open.set(false)"
 * >
 *   <p>Body content goes here.</p>
 *   <div modal-actions>
 *     <button class="btn btn--secondary" (click)="open.set(false)">Cancelar</button>
 *     <button class="btn btn--danger" (click)="confirm()">Eliminar</button>
 *   </div>
 * </aed-modal>
 * ```
 */
@Component({
  selector: 'aed-modal',
  standalone: true,
  imports: [DialogModule, LucideAngularModule, TranslateModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly visible = input.required<boolean>();
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly icon = input<LucideIcon | null>(null);
  readonly width = input<string>('440px');
  readonly closable = input(true);
  /** When false, the footer slot stays empty; consumers can omit `<div modal-actions>`. */
  readonly hasFooter = input(true);
  /** When true, skip the body section entirely. For confirm dialogs whose
   * description lives in the header subtitle — without this the empty body
   * still claimed its padding and rendered as a blank band. */
  readonly bodyless = input(false);

  readonly cancelled = output<void>();

  protected readonly closeIcon = X;
  /** Stable ids so `aria-labelledby` / `aria-describedby` resolve correctly. */
  protected readonly id = ++modalIdCounter;
  protected readonly titleId = computed(() => `aed-modal-${this.id}-title`);
  protected readonly subtitleId = computed(() => `aed-modal-${this.id}-subtitle`);

  protected onClose(): void {
    this.cancelled.emit();
  }
}
