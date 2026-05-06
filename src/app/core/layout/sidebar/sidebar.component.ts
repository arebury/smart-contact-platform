import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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

  protected readonly trackBySectionTitle = (_: number, section: { titleKey: string }): string =>
    section.titleKey;

  protected readonly trackByItemKey = (_: number, item: { labelKey: string }): string =>
    item.labelKey;

  protected onNavigate(path: string): void {
    void this.router.navigateByUrl(path);
  }

  protected onOpenDesignDecisions(): void {
    // Hook reserved for the design decisions panel migration. Intentional no-op.
  }

  protected readonly hasItems = computed(() => this.sections.length > 0);
}
