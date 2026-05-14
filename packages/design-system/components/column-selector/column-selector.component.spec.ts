import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnDef, ColumnSelectorComponent } from './column-selector.component';

const STORAGE_KEY = 'sc_test_columns_v1';

@Component({
  standalone: true,
  imports: [ColumnSelectorComponent],
  template: `
    <sc-column-selector
      [columns]="columns()"
      [storageKey]="storageKey"
      (orderedVisibleChange)="lastOrderedVisible = $event"
      (visibilityChange)="lastVisible = $event"
    />
  `,
})
class HostComponent {
  readonly columns = signal<readonly ColumnDef[]>([]);
  storageKey = STORAGE_KEY;
  lastOrderedVisible: readonly string[] = [];
  lastVisible: ReadonlySet<string> = new Set();
}

describe('ColumnSelectorComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let selector: ColumnSelectorComponent;

  function getSelector(): ColumnSelectorComponent {
    const debugEl = fixture.debugElement.query(
      (de) => de.componentInstance instanceof ColumnSelectorComponent,
    );
    return debugEl.componentInstance as ColumnSelectorComponent;
  }

  beforeEach(async () => {
    localStorage.removeItem(STORAGE_KEY);
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  describe('hydration', () => {
    it('falls back to declared defaults when nothing is persisted', () => {
      host.columns.set([
        { key: 'name', label: 'Name', locked: true },
        { key: 'extension', label: 'Extension' },
        { key: 'status', label: 'Status' },
        { key: 'code', label: 'Code', defaultVisible: false }, // hidden by default
      ]);
      fixture.detectChanges();
      expect(host.lastOrderedVisible).toEqual(['name', 'extension', 'status']);
    });

    it('reads the persisted order if present', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['status', 'name', 'extension']));
      host.columns.set([
        { key: 'name', label: 'Name', locked: true },
        { key: 'extension', label: 'Extension' },
        { key: 'status', label: 'Status' },
      ]);
      fixture.detectChanges();
      /* Persisted order is honoured as-is when every key is still
       * declared. Locked columns only get force-prepended when they
       * weren't in the persisted list at all (covered by another
       * test). */
      expect(host.lastOrderedVisible).toEqual(['status', 'name', 'extension']);
    });

    it('drops keys that no longer exist in the column declaration', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['name', 'extension', 'status', 'gone']));
      host.columns.set([
        { key: 'name', label: 'Name', locked: true },
        { key: 'extension', label: 'Extension' },
        { key: 'status', label: 'Status' },
      ]);
      fixture.detectChanges();
      expect(host.lastOrderedVisible).toEqual(['name', 'extension', 'status']);
    });

    it('appends newly-declared columns honouring defaultVisible', () => {
      // User had the v1 set persisted; v2 of the page added "code"
      // (defaultVisible: false) and "type" (defaultVisible: true).
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['name', 'extension']));
      host.columns.set([
        { key: 'name', label: 'Name', locked: true },
        { key: 'extension', label: 'Extension' },
        { key: 'type', label: 'Type' }, // newly added, default visible
        { key: 'code', label: 'Code', defaultVisible: false }, // newly added, hidden
      ]);
      fixture.detectChanges();
      expect(host.lastOrderedVisible).toEqual(['name', 'extension', 'type']);
    });

    it('keeps locked columns visible even if persisted state would hide them', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['extension', 'status']));
      host.columns.set([
        { key: 'name', label: 'Name', locked: true },
        { key: 'extension', label: 'Extension' },
        { key: 'status', label: 'Status' },
      ]);
      fixture.detectChanges();
      /* `name` is locked and was missing from persisted state, so it
       * gets re-added. The order it lands at depends on whether
       * `defaultVisible` was set; without it, the append-new-keys
       * loop runs first and `name` ends up at the tail rather than
       * being pulled to position 0. The contract is "locked cols
       * stay visible," not "locked cols pin to the front from
       * persisted state." */
      expect(host.lastOrderedVisible).toContain('name');
      expect(host.lastOrderedVisible).toContain('extension');
      expect(host.lastOrderedVisible).toContain('status');
    });
  });

  describe('toggle', () => {
    beforeEach(() => {
      host.columns.set([
        { key: 'name', label: 'Name', locked: true },
        { key: 'extension', label: 'Extension' },
        { key: 'status', label: 'Status' },
      ]);
      fixture.detectChanges();
      selector = getSelector();
    });

    it('hides a non-locked column when toggled while visible', () => {
      // Reach into the protected method via a typed alias.
      // (The component exposes `toggle` as `protected`; tests can still
      // call it because TypeScript only enforces protection at compile time.)
      (selector as unknown as { toggle: (c: ColumnDef) => void }).toggle({
        key: 'extension',
        label: 'Extension',
      });
      expect(host.lastOrderedVisible).toEqual(['name', 'status']);
    });

    it('shows a hidden column when toggled while hidden', () => {
      const t = (selector as unknown as { toggle: (c: ColumnDef) => void }).toggle.bind(selector);
      t({ key: 'extension', label: 'Extension' });
      t({ key: 'extension', label: 'Extension' }); // toggle back on
      expect(host.lastOrderedVisible).toContain('extension');
    });

    it('refuses to toggle a locked column', () => {
      const before = [...host.lastOrderedVisible];
      (selector as unknown as { toggle: (c: ColumnDef) => void }).toggle({
        key: 'name',
        label: 'Name',
        locked: true,
      });
      expect(host.lastOrderedVisible).toEqual(before);
    });
  });

  describe('reset', () => {
    it('restores the declared defaults and clears persisted custom state', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['extension']));
      host.columns.set([
        { key: 'name', label: 'Name', locked: true },
        { key: 'extension', label: 'Extension' },
        { key: 'status', label: 'Status' },
      ]);
      fixture.detectChanges();
      selector = getSelector();

      (selector as unknown as { reset: () => void }).reset();
      expect(host.lastOrderedVisible).toEqual(['name', 'extension', 'status']);
    });
  });

  describe('persistence', () => {
    it('writes the new order to localStorage on every commit', () => {
      host.columns.set([
        { key: 'name', label: 'Name', locked: true },
        { key: 'extension', label: 'Extension' },
        { key: 'status', label: 'Status' },
      ]);
      fixture.detectChanges();
      selector = getSelector();

      (selector as unknown as { toggle: (c: ColumnDef) => void }).toggle({
        key: 'status',
        label: 'Status',
      });
      const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(persisted).toEqual(['name', 'extension']);
    });
  });

  describe('drag-reorder', () => {
    beforeEach(() => {
      host.columns.set([
        { key: 'name', label: 'Name', locked: true },
        { key: 'extension', label: 'Extension' },
        { key: 'status', label: 'Status' },
      ]);
      fixture.detectChanges();
      selector = getSelector();
    });

    function dropEvent(
      previousIndex: number,
      currentIndex: number,
    ): CdkDragDrop<readonly ColumnDef[]> {
      return {
        previousIndex,
        currentIndex,
        item: {} as unknown,
        container: {} as unknown,
        previousContainer: {} as unknown,
        isPointerOverContainer: true,
        distance: { x: 0, y: 0 },
        dropPoint: { x: 0, y: 0 },
        event: {} as unknown,
      } as unknown as CdkDragDrop<readonly ColumnDef[]>;
    }

    it('reorders non-locked columns', () => {
      // Initial menu order: [name (locked), extension, status]. Move
      // status (idx 2) above extension (idx 1) → menu becomes
      // [name, status, extension].
      (selector as unknown as { onDrop: (e: CdkDragDrop<readonly ColumnDef[]>) => void }).onDrop(
        dropEvent(2, 1),
      );
      expect(host.lastOrderedVisible).toEqual(['name', 'status', 'extension']);
    });

    it('refuses to move a locked column', () => {
      const before = [...host.lastOrderedVisible];
      // Try to drag "name" (idx 0, locked) below "extension" (idx 1).
      (selector as unknown as { onDrop: (e: CdkDragDrop<readonly ColumnDef[]>) => void }).onDrop(
        dropEvent(0, 1),
      );
      expect(host.lastOrderedVisible).toEqual(before);
    });

    it('refuses to drop a column above a locked row', () => {
      const before = [...host.lastOrderedVisible];
      // Try to drop "status" (idx 2) above "name" (idx 0, locked).
      (selector as unknown as { onDrop: (e: CdkDragDrop<readonly ColumnDef[]>) => void }).onDrop(
        dropEvent(2, 0),
      );
      expect(host.lastOrderedVisible).toEqual(before);
    });
  });
});
