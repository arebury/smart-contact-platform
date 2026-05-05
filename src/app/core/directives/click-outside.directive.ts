import {
  DestroyRef,
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Emits `aedClickOutside` when the user clicks outside the host element or
 * presses Escape. Mirrors the `useClickOutside` hook from the React prototype.
 *
 * Usage:
 *   <div (aedClickOutside)="close()" [aedClickOutsideEnabled]="open">…</div>
 */
@Directive({
  selector: '[aedClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements OnInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() aedClickOutsideEnabled = true;

  @Output() readonly aedClickOutside = new EventEmitter<void>();

  ngOnInit(): void {
    fromEvent<PointerEvent>(document, 'pointerdown')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => this.aedClickOutsideEnabled),
        filter((event) => {
          const target = event.target as Node | null;
          return !!target && !this.host.nativeElement.contains(target);
        }),
      )
      .subscribe(() => this.aedClickOutside.emit());

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => this.aedClickOutsideEnabled),
        filter((event) => event.key === 'Escape'),
      )
      .subscribe(() => this.aedClickOutside.emit());
  }
}
