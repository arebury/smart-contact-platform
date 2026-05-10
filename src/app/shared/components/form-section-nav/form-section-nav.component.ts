import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent } from 'rxjs';

export interface FormNavSection {
  /** DOM id of the target section card. */
  readonly id: string;
  /** i18n key for the link label. */
  readonly labelKey: string;
}

/**
 * Sticky in-form section nav with scroll-spy. Mirrors the visual rhythm
 * of `aed-settings-sidebar` (Figma node 224:9167) so create/edit pages
 * inherit the same "left = orient, right = work" expectation as
 * `/config/*`.
 *
 * The scroll container is `.app-shell__content` (set by AppShell).
 * Active section detection uses scroll position rather than
 * IntersectionObserver because the rail must reflect "the section the
 * user is reading" — which is the topmost one whose title has crossed
 * the StickyFormHeader, not whichever happens to be largest in view.
 */
@Component({
  selector: 'aed-form-section-nav',
  imports: [TranslateModule],
  templateUrl: './form-section-nav.component.html',
  styleUrl: './form-section-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionNavComponent implements AfterViewInit {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly sections = input.required<readonly FormNavSection[]>();
  /** Aria-label for the nav landmark. */
  readonly labelKey = input<string>('common.form_nav.label');
  /** Drops the outer card chrome so the nav can be embedded inside another
   * container (the hybrid identity rail uses this). */
  readonly compact = input<boolean>(false);

  protected readonly activeId = signal<string | null>(null);

  /** Pixel offset (sticky header) before a section is considered "current". */
  private readonly activationOffset = 96;

  ngAfterViewInit(): void {
    const scroller = this.host.nativeElement.closest<HTMLElement>('.app-shell__content');
    if (!scroller) return;

    // Initial detection so the first section is highlighted on load.
    this.recompute(scroller);

    fromEvent(scroller, 'scroll', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recompute(scroller));
  }

  protected onJump(event: MouseEvent, id: string): void {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeId.set(id);
  }

  private recompute(scroller: HTMLElement): void {
    const ids = this.sections().map((s) => s.id);
    const scrollerTop = scroller.getBoundingClientRect().top;
    let current: string | null = ids[0] ?? null;

    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top - scrollerTop;
      if (top - this.activationOffset <= 0) {
        current = id;
      } else {
        break;
      }
    }

    if (current !== this.activeId()) this.activeId.set(current);
  }
}
