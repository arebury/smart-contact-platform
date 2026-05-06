import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import { filter, map, startWith } from 'rxjs/operators';

import { NAV_ICONS } from '../../icons/nav-icons';
import { NAV_SECTIONS } from './nav-data';
import { normalizeRoutePath } from './path-utils';
import { SidebarNavItemComponent } from './sidebar-nav-item.component';

/**
 * Application sidebar — logo header, two-section nav tree, design-decisions
 * shortcut at the foot. Reads the active URL from the Router and feeds it to
 * the recursive `<aed-sidebar-nav-item>` children so they highlight properly.
 */
@Component({
  selector: 'aed-sidebar',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, SidebarNavItemComponent, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly sections = NAV_SECTIONS;
  protected readonly bookOpenIcon = NAV_ICONS['book-open'];

  /** Active URL (after stripping /crear, /editar/:id and folding repo subpaths). */
  protected readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => normalizeRoutePath(event.urlAfterRedirects)),
      startWith(normalizeRoutePath(this.router.url)),
    ),
    { initialValue: normalizeRoutePath(this.router.url) },
  );

  constructor() {
    /**
     * After every navigation, blur whatever element inside the sidebar
     * still has focus — otherwise the `:focus-within` rule keeps the
     * sidebar in its expanded state forever after a click. The keyboard
     * `Tab` flow still works (focus is only blurred AFTER navigation
     * completes, never during user-driven traversal).
     */
    effect(() => {
      this.currentPath();
      const active = document.activeElement;
      if (active instanceof HTMLElement && this.host.nativeElement.contains(active)) {
        active.blur();
      }
    });
  }

  protected readonly trackBySectionTitle = (_: number, section: { titleKey: string }): string =>
    section.titleKey;

  protected readonly trackByItemKey = (_: number, item: { labelKey: string }): string =>
    item.labelKey;

  protected onNavigate(path: string): void {
    void this.router.navigateByUrl(path);
  }

  protected onOpenDesignDecisions(event: MouseEvent): void {
    /*
     * Hook reserved for the design decisions panel migration. We still
     * blur the trigger here even though there's nothing to navigate to
     * — otherwise the focus stays on the button after the click and
     * the sidebar's `:focus-within` rule pins it in the expanded
     * state forever (the post-`NavigationEnd` blur effect doesn't
     * cover this case because no navigation actually happens).
     */
    (event.currentTarget as HTMLElement).blur();
  }

  protected readonly hasItems = computed(() => this.sections.length > 0);
}
