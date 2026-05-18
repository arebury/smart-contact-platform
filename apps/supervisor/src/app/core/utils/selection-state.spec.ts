import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SelectionState } from './selection-state';

interface Item {
  readonly id: number;
  readonly name: string;
}

const ITEMS: readonly Item[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
];

describe('SelectionState', () => {
  let visibleList: ReturnType<typeof signal<readonly Item[]>>;
  let selection: SelectionState<Item>;

  beforeEach(() => {
    visibleList = signal<readonly Item[]>(ITEMS);
    /*
     * The helper reads its visible list through a thunk so consuming
     * components can pass any signal-based source (sorted(), filtered()).
     * Wrap the test in `TestBed.runInInjectionContext` so the `computed()`s
     * inside `SelectionState` resolve their signal context.
     */
    selection = TestBed.runInInjectionContext(() => new SelectionState(() => visibleList()));
  });

  it('starts empty', () => {
    expect(selection.ids().size).toBe(0);
    expect(selection.count()).toBe(0);
    expect(selection.allSelected()).toBe(false);
    expect(selection.someSelected()).toBe(false);
  });

  describe('toggle', () => {
    it('adds an id when absent', () => {
      selection.toggle(1);
      expect(selection.has(1)).toBe(true);
      expect(selection.count()).toBe(1);
    });

    it('removes an id when present', () => {
      selection.toggle(1);
      selection.toggle(1);
      expect(selection.has(1)).toBe(false);
      expect(selection.count()).toBe(0);
    });

    it('keeps the rest of the selection intact when toggling one id', () => {
      selection.toggle(1);
      selection.toggle(2);
      selection.toggle(1); // remove 1
      expect(selection.has(1)).toBe(false);
      expect(selection.has(2)).toBe(true);
      expect(selection.count()).toBe(1);
    });
  });

  describe('toggleAll', () => {
    it('selects every visible item when nothing is selected', () => {
      selection.toggleAll();
      expect(selection.count()).toBe(ITEMS.length);
      expect(selection.allSelected()).toBe(true);
    });

    it('clears the selection when every visible item is already selected', () => {
      selection.toggleAll(); // select all
      selection.toggleAll(); // clear
      expect(selection.count()).toBe(0);
      expect(selection.allSelected()).toBe(false);
    });

    it('selects every visible item when only some are selected (acts as "select all" not "toggle each")', () => {
      selection.toggle(1);
      selection.toggleAll();
      expect(selection.count()).toBe(ITEMS.length);
      expect(selection.allSelected()).toBe(true);
    });

    it('respects the visible list at the time of the call (filtered → narrower)', () => {
      visibleList.set(ITEMS.slice(0, 2)); // only Alice + Bob visible
      selection.toggleAll();
      expect(selection.count()).toBe(2);
      expect(selection.has(3)).toBe(false);
    });
  });

  describe('clear', () => {
    it('drops every id', () => {
      selection.toggle(1);
      selection.toggle(2);
      selection.clear();
      expect(selection.count()).toBe(0);
    });
  });

  describe('allSelected', () => {
    it('is false for an empty visible list (avoids announcing "all" of nothing)', () => {
      visibleList.set([]);
      expect(selection.allSelected()).toBe(false);
    });

    it('reacts when the visible list shrinks below the selection', () => {
      selection.toggle(1);
      selection.toggle(2);
      visibleList.set([ITEMS[0]!, ITEMS[1]!]); // exactly the two we picked
      expect(selection.allSelected()).toBe(true);
    });
  });

  describe('someSelected', () => {
    it('is true when at least one but not all are selected', () => {
      selection.toggle(1);
      expect(selection.someSelected()).toBe(true);
    });

    it('is false when every visible item is selected', () => {
      selection.toggleAll();
      expect(selection.someSelected()).toBe(false);
    });

    it('is false when the selection is empty', () => {
      expect(selection.someSelected()).toBe(false);
    });
  });
});
