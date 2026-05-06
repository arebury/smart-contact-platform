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
import { Keyboard, LucideAngularModule } from 'lucide-angular';

import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { NAV_ICONS } from '../../icons/nav-icons';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { IllustratedAvatarComponent } from '../../../shared/components/illustrated-avatar/illustrated-avatar.component';

/**
 * TopBar — breadcrumb trail on the left, avatar with user menu on the right.
 *
 * The avatar is the {@link IllustratedAvatarComponent}: hashed from the
 * supervisor's name so the chrome shares a visual language with the
 * agents list (where the same component renders each agent's portrait).
 * The menu popover is anchored to the avatar and dismissed by
 * {@link ClickOutsideDirective}; Esc returns focus to the trigger.
 */
@Component({
  selector: 'aed-top-bar',
  standalone: true,
  imports: [
    ClickOutsideDirective,
    IllustratedAvatarComponent,
    LucideAngularModule,
    TranslateModule,
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private readonly router = inject(Router);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly shortcuts = inject(KeyboardShortcutsService);

  protected readonly trail = this.breadcrumbs.trail;

  /* Hard-coded today; eventually flows from a Supervisor / session service. */
  protected readonly userName = 'Mario Supervisor';
  protected readonly userPhone = '+34 917 945 449';

  protected readonly userMenuOpen = signal(false);
  protected readonly lastIndex = computed(() => this.trail().length - 1);
  private readonly avatarBtn = viewChild<ElementRef<HTMLButtonElement>>('avatarBtn');

  protected readonly phoneIcon = NAV_ICONS['phone'];
  protected readonly helpIcon = NAV_ICONS['help-circle'];
  protected readonly logoutIcon = NAV_ICONS['log-out'];
  protected readonly dashboardIcon = NAV_ICONS['layout-dashboard'];
  protected readonly shortcutsIcon = Keyboard;

  protected goToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }

  protected openShortcuts(): void {
    this.shortcuts.toggle();
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
