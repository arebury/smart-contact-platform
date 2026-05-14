import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { InlineRenameCellComponent } from './inline-rename-cell.component';

/**
 * Hosts the rename cell with two-way captured outputs so each test can
 * assert what the cell emitted (or didn't) for a given user action.
 */
@Component({
  standalone: true,
  imports: [InlineRenameCellComponent],
  template: `
    <sc-inline-rename-cell
      [initialValue]="initial"
      [placeholder]="placeholder"
      (commit)="committed = $event"
      (cancelled)="cancelCount = cancelCount + 1"
    />
  `,
})
class HostComponent {
  initial = 'Original Name';
  placeholder = 'Type a name…';
  committed: string | null = null;
  cancelCount = 0;
}

describe('InlineRenameCellComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function inputEl(): HTMLInputElement {
    return fixture.debugElement.query(By.css('.rename__input')).nativeElement as HTMLInputElement;
  }

  function commitBtn(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.rename__btn--commit'))
      .nativeElement as HTMLButtonElement;
  }

  function cancelBtn(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.rename__btn--cancel'))
      .nativeElement as HTMLButtonElement;
  }

  /** Type a new value into the input and let Angular flush ngModel. */
  function typeIntoInput(value: string): void {
    const el = inputEl();
    el.value = value;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('seeds the input with the initialValue input', () => {
    expect(inputEl().value).toBe('Original Name');
  });

  it('forwards the placeholder input to the underlying <input>', () => {
    expect(inputEl().placeholder).toBe('Type a name…');
  });

  describe('commit flow', () => {
    it('emits the trimmed value on Enter', () => {
      typeIntoInput('  New Name  ');
      inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(host.committed).toBe('New Name');
    });

    it('emits the trimmed value when the check button is clicked', () => {
      typeIntoInput('Another Name');
      commitBtn().click();
      expect(host.committed).toBe('Another Name');
    });

    it('does not emit when the value is empty', () => {
      typeIntoInput('');
      inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(host.committed).toBeNull();
    });

    it('does not emit when the value is whitespace-only', () => {
      typeIntoInput('   ');
      inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(host.committed).toBeNull();
    });

    it('disables the commit button when the value is empty / whitespace-only', () => {
      typeIntoInput('');
      expect(commitBtn().disabled).toBe(true);
      typeIntoInput('   ');
      expect(commitBtn().disabled).toBe(true);
      typeIntoInput('hello');
      expect(commitBtn().disabled).toBe(false);
    });
  });

  describe('cancel flow', () => {
    it('emits cancelled on Escape', () => {
      inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(host.cancelCount).toBe(1);
    });

    it('emits cancelled when the X button is clicked', () => {
      cancelBtn().click();
      expect(host.cancelCount).toBe(1);
    });

    it('Escape does not also commit a pending edit', () => {
      typeIntoInput('Pending');
      inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(host.cancelCount).toBe(1);
      expect(host.committed).toBeNull();
    });
  });

  it('autofocuses the input on mount (Fitts — user is already in rename mode)', () => {
    /*
     * `ngAfterViewInit` schedules `focus()` + `select()` inside a
     * `queueMicrotask`. Flush the microtask queue and then assert.
     */
    return Promise.resolve().then(() => {
      expect(document.activeElement).toBe(inputEl());
    });
  });
});
