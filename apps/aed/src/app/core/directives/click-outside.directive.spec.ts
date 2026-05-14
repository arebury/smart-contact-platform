import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  imports: [ClickOutsideDirective],
  template: `
    <div data-testid="host" [aedClickOutsideEnabled]="enabled" (aedClickOutside)="hits = hits + 1">
      inside
    </div>
    <button data-testid="outside" type="button">outside</button>
  `,
})
class HostComponent {
  enabled = true;
  hits = 0;
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function dispatchPointerDown(target: Element): void {
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  }

  it('emits when clicking outside the host', () => {
    const outside = fixture.nativeElement.querySelector('[data-testid="outside"]') as HTMLElement;
    dispatchPointerDown(outside);
    expect(host.hits).toBe(1);
  });

  it('does not emit when clicking inside the host', () => {
    const inside = fixture.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
    dispatchPointerDown(inside);
    expect(host.hits).toBe(0);
  });

  it('emits on Escape', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(host.hits).toBe(1);
  });

  it('respects the enabled flag', () => {
    host.enabled = false;
    fixture.detectChanges();
    const outside = fixture.nativeElement.querySelector('[data-testid="outside"]') as HTMLElement;
    dispatchPointerDown(outside);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(host.hits).toBe(0);
  });
});
