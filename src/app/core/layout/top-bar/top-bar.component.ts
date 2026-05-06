import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { NAV_ICONS } from '../../icons/nav-icons';
import { BreadcrumbService } from '../../services/breadcrumb.service';

/**
 * TopBar — breadcrumb trail on the left, avatar with user menu on the right.
 *
 * Reads the breadcrumb trail from `BreadcrumbService` (pages push their own
 * trail in `ngOnInit`). The user menu is a self-contained popover dismissed
 * by `ClickOutsideDirective`.
 */
@Component({
  selector: 'aed-top-bar',
  standalone: true,
  imports: [ClickOutsideDirective, LucideAngularModule, TranslateModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private readonly router = inject(Router);
  private readonly breadcrumbs = inject(BreadcrumbService);

  protected readonly trail = this.breadcrumbs.trail;

  protected readonly userMenuOpen = signal(false);
  protected readonly lastIndex = computed(() => this.trail().length - 1);
  private readonly avatarBtn = viewChild<ElementRef<HTMLButtonElement>>('avatarBtn');

  protected readonly userIcon = NAV_ICONS['user'];
  protected readonly phoneIcon = NAV_ICONS['phone'];
  protected readonly helpIcon = NAV_ICONS['help-circle'];
  protected readonly logoutIcon = NAV_ICONS['log-out'];
  protected readonly dashboardIcon = NAV_ICONS['layout-dashboard'];

  protected goToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  protected closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  /** Esc closes the menu and returns focus to the avatar trigger. */
  protected onMenuKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.userMenuOpen()) return;
    event.preventDefault();
    this.userMenuOpen.set(false);
    this.avatarBtn()?.nativeElement.focus();
  }

  protected onCrumbClick(path: string | undefined): void {
    if (!path) return;
    void this.router.navigateByUrl(path);
  }
}
