import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  /** Resolved (translated) heading shown at the top of the dialog. */
  readonly title: string;
  /** Resolved (translated) body / subtitle. Single sentence works best. */
  readonly body: string;
  /** Resolved label for the destructive / primary action button. */
  readonly acceptLabel: string;
  /** Resolved label for the safe / cancel button. */
  readonly rejectLabel: string;
  /** Visual tone for the accept button. Defaults to `'primary'`. */
  readonly acceptTone?: 'primary' | 'danger';
}

/**
 * Programmatic confirmation. Backs every `confirm(): Promise<boolean>` call
 * across the app (route guards, "discard changes", future logout, etc.) by
 * flipping signals on a single host component mounted in the app shell.
 *
 * Public surface stays tiny on purpose — callers never touch the host
 * directly, they just call `request()` and `await` the boolean.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmHostService {
  readonly visible = signal(false);
  readonly state = signal<ConfirmRequest | null>(null);

  private resolver: ((value: boolean) => void) | null = null;

  /**
   * Show a confirmation. Resolves `true` when the user accepts, `false`
   * when they reject (button, ESC via cancel, or another `request()` that
   * supersedes the open one).
   */
  request(req: ConfirmRequest): Promise<boolean> {
    if (this.resolver) {
      const previous = this.resolver;
      this.resolver = null;
      previous(false);
    }
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      this.state.set(req);
      this.visible.set(true);
    });
  }

  accept(): void {
    this.settle(true);
  }

  reject(): void {
    this.settle(false);
  }

  private settle(value: boolean): void {
    const r = this.resolver;
    this.resolver = null;
    this.visible.set(false);
    if (r) r(value);
  }
}
