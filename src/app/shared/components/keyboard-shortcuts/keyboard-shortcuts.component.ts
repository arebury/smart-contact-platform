import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

import { CommandPaletteService } from '@core/services/command-palette.service';

interface ShortcutGroup {
  readonly title: string;
  readonly items: ReadonlyArray<{ readonly label: string; readonly keys: readonly string[] }>;
}

/**
 * Keyboard-shortcuts cheat sheet, triggered by the `?` key from anywhere
 * in the app. Renders as a modal-like overlay that lists every supported
 * shortcut grouped by purpose. Suppressed while the user is typing in
 * an input/textarea/select so pressing `?` inside a form field types the
 * character instead of opening the help.
 *
 * Mounted once in the app shell. Owns its own visibility signal — no
 * service is needed because the overlay never has to be opened from
 * code, only by the keyboard.
 */
@Component({
  selector: 'aed-keyboard-shortcuts',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './keyboard-shortcuts.component.html',
  styleUrl: './keyboard-shortcuts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardShortcutsComponent {
  private readonly palette = inject(CommandPaletteService);

  protected readonly closeIcon = X;
  protected readonly visible = signal(false);

  protected readonly groups: readonly ShortcutGroup[] = [
    {
      title: 'Navegación',
      items: [
        { label: 'Abrir paleta de comandos', keys: ['⌘', 'K'] },
        { label: 'Abrir paleta de comandos (Win/Linux)', keys: ['Ctrl', 'K'] },
        { label: 'Mostrar atajos', keys: ['?'] },
      ],
    },
    {
      title: 'En la paleta',
      items: [
        { label: 'Mover selección', keys: ['↑', '↓'] },
        { label: 'Ejecutar', keys: ['↵'] },
        { label: 'Cerrar', keys: ['Esc'] },
      ],
    },
    {
      title: 'En cualquier parte',
      items: [
        { label: 'Cerrar diálogo / panel', keys: ['Esc'] },
        { label: 'Deshacer última acción', keys: ['⌘', 'Z'] },
      ],
    },
  ];

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    /* Esc closes if open. Always handled even when typing — the user
     * presses Esc to dismiss panels, that takes priority. */
    if (this.visible() && event.key === 'Escape') {
      event.preventDefault();
      this.visible.set(false);
      return;
    }

    /* `?` opens the cheatsheet — but only when the user isn't typing
     * inside an editable element. Otherwise pressing `?` inside a
     * search field would steal the character. */
    if (event.key === '?' && !isTypingTarget(event.target)) {
      /* Don't double up with the command palette already open. */
      if (this.palette.visible()) return;
      event.preventDefault();
      this.visible.update((v) => !v);
    }
  }

  protected onBackdropClick(): void {
    this.visible.set(false);
  }

  protected onClose(): void {
    this.visible.set(false);
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}
