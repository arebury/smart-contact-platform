import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule, Columns3, RotateCcw } from 'lucide-angular';
import { PopoverModule } from 'primeng/popover';

export interface ColumnDef {
  /** Stable key persisted in localStorage. */
  readonly key: string;
  /** Translated label shown in the dropdown. */
  readonly label: string;
  /** When true, the column cannot be hidden (e.g. "Name"). */
  readonly locked?: boolean;
}

/**
 * Column visibility menu. Popover with a labelled checkbox per column,
 * a "reset to defaults" affordance, and a versioned localStorage cache.
 *
 * The component owns the visible-set as an internal signal and emits
 * `visibilityChange` after every toggle so the parent stays a pure
 * consumer (no two-way binding ceremony).
 *
 * Storage key includes a version suffix so a developer can invalidate
 * stale user prefs (e.g. when adding/removing a column) without writing
 * a one-shot migration.
 */
@Component({
  selector: 'aed-column-selector',
  standalone: true,
  imports: [LucideAngularModule, PopoverModule],
  templateUrl: './column-selector.component.html',
  styleUrl: './column-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnSelectorComponent {
  readonly columns = input.required<readonly ColumnDef[]>();
  /**
   * localStorage key — should already include a `_v<N>` suffix so a future
   * column rename / removal can invalidate the cache by bumping the suffix.
   */
  readonly storageKey = input.required<string>();
  /** Optional aria-label override for the trigger button. */
  readonly buttonLabel = input<string>('Columnas');

  readonly visibilityChange = output<ReadonlySet<string>>();

  protected readonly columnsIcon = Columns3;
  protected readonly resetIcon = RotateCcw;

  /** Default = all keys; never includes locked columns separately because they
   * stay visible regardless of the persisted set. */
  private readonly defaultVisible = computed(() => new Set(this.columns().map((c) => c.key)));

  protected readonly visible = signal<ReadonlySet<string>>(new Set());

  constructor() {
    // Hydrate from localStorage once we have the columns + key.
    effect(() => {
      const cols = this.columns();
      const key = this.storageKey();
      if (cols.length === 0 || !key) return;

      const fallback = this.defaultVisible();
      const next = readVisibleSet(key) ?? fallback;
      // Pin locked columns to visible regardless of cache state.
      const merged = new Set(next);
      for (const col of cols) if (col.locked) merged.add(col.key);
      this.visible.set(merged);
      this.visibilityChange.emit(merged);
    });
  }

  protected isVisible(key: string): boolean {
    return this.visible().has(key);
  }

  protected toggle(col: ColumnDef): void {
    if (col.locked) return;
    const next = new Set(this.visible());
    if (next.has(col.key)) next.delete(col.key);
    else next.add(col.key);
    this.visible.set(next);
    persistVisibleSet(this.storageKey(), next);
    this.visibilityChange.emit(next);
  }

  protected reset(): void {
    const next = this.defaultVisible();
    this.visible.set(next);
    persistVisibleSet(this.storageKey(), next);
    this.visibilityChange.emit(next);
  }
}

function readVisibleSet(key: string): Set<string> | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return new Set(parsed.filter((s): s is string => typeof s === 'string'));
  } catch {
    return null;
  }
}

function persistVisibleSet(key: string, set: ReadonlySet<string>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    /* Quota or disabled — drop silently. */
  }
}
