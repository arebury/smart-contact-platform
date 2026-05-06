import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { NAV_SECTIONS } from '@core/layout/sidebar/nav-data';
import type { NavItem } from '@core/layout/sidebar/nav-data';
import type { NavIconKey } from '@core/icons/nav-icons';

export interface PaletteCommand {
  /** Stable id, used for keyboard highlight tracking. */
  readonly id: string;
  readonly label: string;
  readonly category: 'Páginas' | 'Acciones';
  readonly icon?: NavIconKey;
  readonly keywords?: readonly string[];
  readonly action: () => void;
}

/**
 * Single source of truth for the command palette overlay (`⌘K` / `Ctrl+K`).
 * Owns the visibility signal and derives the available commands from the
 * sidebar nav tree. Components and global keydown handlers call
 * `open()` / `close()` / `toggle()`; the renderer (`<aed-command-palette>`,
 * mounted once in the app shell) reacts to `visible()`.
 */
@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly visible = signal(false);

  readonly commands = computed<readonly PaletteCommand[]>(() => this.buildCommands());

  open(): void {
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
  }

  toggle(): void {
    this.visible.update((v) => !v);
  }

  private buildCommands(): PaletteCommand[] {
    const cmds: PaletteCommand[] = [];

    /* Pages: walk the nav tree recursively, grab every leaf that has a `path`. */
    const walk = (items: readonly NavItem[]): void => {
      for (const item of items) {
        if (item.path) {
          cmds.push({
            id: `page:${item.path}`,
            label: this.translate.instant(item.labelKey),
            category: 'Páginas',
            icon: item.icon,
            action: () => void this.router.navigateByUrl(item.path!),
          });
        }
        if (item.children) walk(item.children);
      }
    };
    NAV_SECTIONS.forEach((s) => walk(s.items));

    /* Quick "create" actions for the entities the user manages every day. */
    const create: ReadonlyArray<{ readonly path: string; readonly key: string }> = [
      { path: '/admin/grupos/crear', key: 'groups.create_button' },
      { path: '/admin/agentes/crear', key: 'agents.create_button' },
      { path: '/admin/usuarios/crear', key: 'users.create_button' },
    ];
    for (const c of create) {
      cmds.push({
        id: `action:${c.path}`,
        label: this.translate.instant(c.key),
        category: 'Acciones',
        keywords: ['crear', 'nuevo'],
        action: () => void this.router.navigateByUrl(c.path),
      });
    }

    return cmds;
  }
}
