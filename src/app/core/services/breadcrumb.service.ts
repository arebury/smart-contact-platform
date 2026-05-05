import { Injectable, signal } from '@angular/core';

export interface BreadcrumbItem {
  /** Label rendered as-is. Pass an i18n-translated string. */
  readonly label: string;
  /** Optional router link. The last crumb is typically link-less. */
  readonly path?: string;
}

/**
 * Pages set their breadcrumbs via `BreadcrumbService.set([...])` in their
 * constructor or `ngOnInit`. The TopBar component reads the signal and renders
 * the trail. Mirrors the per-page `<TopBar breadcrumbs={...} />` pattern from
 * the React prototype, but inverted: the bar lives in the shell and pages push
 * their state into a service.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly _trail = signal<readonly BreadcrumbItem[]>([]);
  readonly trail = this._trail.asReadonly();

  set(trail: readonly BreadcrumbItem[]): void {
    this._trail.set(trail);
  }

  clear(): void {
    this._trail.set([]);
  }
}
