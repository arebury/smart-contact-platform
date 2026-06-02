import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';

import { IconComponent } from '../icon/icon.component';
import { SC_ICON_SIZE_LG } from '@shared/utils/icon-size';

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
 * <sc-dialog
 *   [visible]="open()"
 *   title="¿Eliminar agente?"
 *   subtitle="Esta acción no se puede deshacer."
 *   [icon]="'delete'"
 *   (cancelled)="open.set(false)"
 * >
 *   <p>Body content goes here.</p>
 *   <div modal-actions>
 *     <button class="btn btn--secondary" (click)="open.set(false)">Cancelar</button>
 *     <button class="btn btn--danger" (click)="confirm()">Eliminar</button>
 *   </div>
 * </sc-dialog>
 * ```
 */
@Component({
  selector: 'sc-dialog',
  imports: [DialogModule, IconComponent, TranslateModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  readonly visible = input.required<boolean>();
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly width = input<string>('440px');
  readonly closable = input(true);
  /** When false, the footer slot stays empty; consumers can omit `<div modal-actions>`. */
  readonly hasFooter = input(true);
  /** When true, skip the body section entirely. For confirm dialogs whose
   * description lives in the header subtitle — without this the empty body
   * still claimed its padding and rendered as a blank band. */
  readonly bodyless = input(false);

  readonly cancelled = output<void>();

  protected readonly closeIcon = 'close';
  protected readonly iconSizeLg = SC_ICON_SIZE_LG;
  /** Stable ids so `aria-labelledby` / `aria-describedby` resolve correctly. */
  protected readonly id = ++modalIdCounter;
  protected readonly titleId = computed(() => `sc-dialog-${this.id}-title`);
  protected readonly subtitleId = computed(() => `sc-dialog-${this.id}-subtitle`);

  /** Element focused right before the dialog opened — focus returns here on close. */
  private triggerEl: HTMLElement | null = null;

  constructor() {
    let wasOpen = false;
    effect(() => {
      const open = this.visible();
      // On the false→true edge, remember what had focus (the opener) before
      // PrimeNG moves focus into the dialog. Restored in onClose().
      if (open && !wasOpen) {
        this.triggerEl = (document.activeElement as HTMLElement | null) ?? null;
      }
      wasOpen = open;
    });
  }

  /** PrimeNG's own dismiss (Escape, with `closable`) goes through `close()`,
   * which only emits `visibleChange(false)`. Our `[visible]` is one-way, so we
   * bridge it to `onClose()` — otherwise the input re-applies `true` and the
   * dialog reopens. PrimeNG's z-index gate already lets a nested overlay
   * (open `<sc-select>` panel) swallow Escape first, so this only fires for the
   * dialog itself. */
  protected onVisibleChange(open: boolean): void {
    if (!open) this.onClose();
  }

  protected onClose(): void {
    this.cancelled.emit();
    const el = this.triggerEl;
    this.triggerEl = null;
    // Return focus to the opener so keyboard / screen-reader users don't get
    // dropped at <body>. queueMicrotask lets PrimeNG finish tearing down first.
    if (el && typeof el.focus === 'function') {
      queueMicrotask(() => el.focus());
    }
  }
}
