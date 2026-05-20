import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriState, CheckboxComponent } from './checkbox.component';
import { Component, signal } from '@angular/core';

@Component({
  standalone: true,
  imports: [CheckboxComponent],
  template: `
    <sc-checkbox [state]="state()" [ariaLabel]="'Test header'" (cycle)="lastEmit.set($event)" />
  `,
})
class HostComponent {
  readonly state = signal<TriState>('none');
  readonly lastEmit = signal<boolean | null>(null);
}

describe('CheckboxComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    // The viewChild effect runs during change detection — wait one cycle.
    await fixture.whenStable();
  });

  function getInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input.tri-checkbox__input') as HTMLInputElement;
  }

  it('renders unchecked when state is "none"', () => {
    expect(getInput().checked).toBeFalse();
    expect(getInput().indeterminate).toBeFalse();
  });

  it('renders indeterminate when state is "some"', async () => {
    host.state.set('some');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getInput().checked).toBeFalse();
    expect(getInput().indeterminate).toBeTrue();
  });

  it('renders checked when state is "all"', async () => {
    host.state.set('all');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getInput().checked).toBeTrue();
    expect(getInput().indeterminate).toBeFalse();
  });

  it('clicking emits true when state is "none"', () => {
    host.state.set('none');
    fixture.detectChanges();
    getInput().click();
    expect(host.lastEmit()).toBeTrue();
  });

  it('clicking emits false when state is "all"', async () => {
    host.state.set('all');
    fixture.detectChanges();
    await fixture.whenStable();
    getInput().click();
    expect(host.lastEmit()).toBeFalse();
  });

  it('clicking emits false when state is "some" (mixed clears first)', async () => {
    host.state.set('some');
    fixture.detectChanges();
    await fixture.whenStable();
    getInput().click();
    expect(host.lastEmit()).toBeFalse();
  });

  it('exposes aria-checked="mixed" for indeterminate', async () => {
    host.state.set('some');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getInput().getAttribute('aria-checked')).toBe('mixed');
  });
});
