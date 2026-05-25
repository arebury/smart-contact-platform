import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';

import { CommandPaletteService } from '@core/services/command-palette.service';
import { KeyboardShortcutsService } from '@core/services/keyboard-shortcuts.service';
import { IconComponent } from '@shared/components';
import { SC_ICON_SIZE_DEFAULT } from '@shared/utils/icon-size';
import { isTypingTarget } from '@shared/utils/is-typing-target';

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
  selector: 'sc-keyboard-shortcuts',
  imports: [IconComponent],
  templateUrl: './keyboard-shortcuts.component.html',
  styleUrl: './keyboard-shortcuts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardShortcutsComponent {
  private readonly palette = inject(CommandPaletteService);
  private readonly shortcuts = inject(KeyboardShortcutsService);

  protected readonly closeIcon = 'close';
  protected readonly iconSizeDefault = SC_ICON_SIZE_DEFAULT;
  protected readonly visible = this.shortcuts.visible;

  protected readonly groups: readonly ShortcutGroup[] = [
    {
      title: 'Navegación',
      items: [
        { label: 'Abrir paleta de comandos', keys: ['⌘', 'K'] },
        { label: 'Abrir paleta de comandos (Win/Linux)', keys: ['Ctrl', 'K'] },
        { label: 'Enfocar buscador de la página', keys: ['/'] },
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
        { label: 'Guardar formulario', keys: ['⌘', 'S'] },
        { label: 'Deshacer última acción', keys: ['⌘', 'Z'] },
        { label: 'Cerrar diálogo / panel', keys: ['Esc'] },
      ],
    },
  ];

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    /* Esc closes if open. Always handled even when typing — the user
     * presses Esc to dismiss panels, that takes priority. */
    if (this.visible() && event.key === 'Escape') {
      event.preventDefault();
      this.shortcuts.close();
      return;
    }

    /* `?` opens the cheatsheet — but only when the user isn't typing
     * inside an editable element. Otherwise pressing `?` inside a
     * search field would steal the character. */
    if (event.key === '?' && !isTypingTarget(event.target)) {
      /* Don't double up with the command palette already open. */
      if (this.palette.visible()) return;
      event.preventDefault();
      this.shortcuts.toggle();
    }
  }

  protected onBackdropClick(): void {
    this.shortcuts.close();
  }

  protected onClose(): void {
    this.shortcuts.close();
  }
}
