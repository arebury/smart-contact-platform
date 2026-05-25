import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { NAV_ICONS } from '@core/icons/nav-icons';
import { CommandPaletteService, PaletteCommand } from '@core/services/command-palette.service';
import { SC_ICON_SIZE_DEFAULT, SC_ICON_SIZE_LG } from '@shared/utils/icon-size';
import { isTypingTarget } from '@shared/utils/is-typing-target';

interface GroupedCommands {
  readonly category: PaletteCommand['category'];
  readonly items: readonly PaletteCommand[];
}

/**
 * Command palette overlay (`⌘K` / `Ctrl+K`). Mounted once in the app
 * shell, listens for the global shortcut, and renders the searchable
 * command list driven by `CommandPaletteService`.
 *
 * Keyboard model:
 *   ⌘K / Ctrl+K  toggle open/close
 *   Esc           close
 *   ↑ / ↓         move highlighted command
 *   Enter         run highlighted command
 *
 * Click on backdrop closes; click on a command runs it.
 */
@Component({
  selector: 'sc-command-palette',
  imports: [IconComponent],
  templateUrl: './command-palette.component.html',
  styleUrl: './command-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteComponent {
  protected readonly host = inject(CommandPaletteService);

  protected readonly searchIcon = 'search';
  protected readonly iconSizeDefault = SC_ICON_SIZE_DEFAULT;
  protected readonly iconSizeLg = SC_ICON_SIZE_LG;
  protected readonly query = signal('');
  protected readonly highlighted = signal(0);

  @ViewChild('searchInput') private readonly searchInput?: ElementRef<HTMLInputElement>;

  protected readonly filtered = computed<readonly PaletteCommand[]>(() => {
    const q = this.query().toLowerCase().trim();
    const all = this.host.commands();
    if (!q) return all;
    return all.filter((c) => {
      if (c.label.toLowerCase().includes(q)) return true;
      return c.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false;
    });
  });

  protected readonly grouped = computed<readonly GroupedCommands[]>(() => {
    const list = this.filtered();
    const map = new Map<PaletteCommand['category'], PaletteCommand[]>();
    for (const cmd of list) {
      if (!map.has(cmd.category)) map.set(cmd.category, []);
      map.get(cmd.category)!.push(cmd);
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  });

  constructor() {
    /* Reset palette state every time it opens, and focus the search input. */
    effect(() => {
      if (this.host.visible()) {
        this.query.set('');
        this.highlighted.set(0);
        queueMicrotask(() => this.searchInput?.nativeElement.focus());
      }
    });

    /* Reset highlight when query changes (keep cursor at the top). */
    effect(() => {
      this.query();
      this.highlighted.set(0);
    });
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    /* Toggle on Cmd+K (Mac) / Ctrl+K (Win/Linux). */
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.host.toggle();
      return;
    }
    /* `/` enfoca el primer <sc-search> visible de la página (patrón GitHub /
     * Linear / Slack). Se suprime cuando el usuario está tipeando para no
     * robar la barra. Cuando la paleta ya está abierta tampoco aplica:
     * Esc/Enter/Arrows manejan la paleta. */
    if (event.key === '/' && !isTypingTarget(event.target) && !this.host.visible()) {
      const searchInput = document.querySelector<HTMLInputElement>('sc-search input');
      if (searchInput && searchInput.offsetParent !== null) {
        event.preventDefault();
        searchInput.focus();
        return;
      }
    }
    if (!this.host.visible()) return;
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.host.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.runHighlighted();
        break;
    }
  }

  protected resolveIcon(name: string | undefined) {
    if (!name) return null;
    return NAV_ICONS[name as keyof typeof NAV_ICONS] ?? null;
  }

  protected indexOf(cmd: PaletteCommand): number {
    return this.filtered().findIndex((c) => c.id === cmd.id);
  }

  protected onItemHover(cmd: PaletteCommand): void {
    const idx = this.indexOf(cmd);
    if (idx >= 0) this.highlighted.set(idx);
  }

  protected onBackdropClick(): void {
    this.host.close();
  }

  protected run(cmd: PaletteCommand): void {
    cmd.action();
    this.host.close();
  }

  private move(delta: number): void {
    const len = this.filtered().length;
    if (len === 0) return;
    this.highlighted.update((i) => (i + delta + len) % len);
  }

  private runHighlighted(): void {
    const cmd = this.filtered()[this.highlighted()];
    if (cmd) this.run(cmd);
  }
}
