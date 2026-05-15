import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'sc-ds-docs-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly scrolled = signal(false);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @HostListener('window:scroll')
  protected onScroll(): void {
    if (!this.isBrowser) return;
    const should = window.scrollY > 240;
    if (should !== this.scrolled()) {
      this.scrolled.set(should);
    }
  }
}
