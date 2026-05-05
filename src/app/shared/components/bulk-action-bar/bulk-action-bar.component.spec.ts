import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BulkActionBarComponent } from './bulk-action-bar.component';

describe('BulkActionBarComponent', () => {
  let fixture: ComponentFixture<BulkActionBarComponent>;
  let component: BulkActionBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BulkActionBarComponent] }).compileComponents();
    fixture = TestBed.createComponent(BulkActionBarComponent);
    component = fixture.componentInstance;
  });

  function setInputs(count: number) {
    fixture.componentRef.setInput('count', count);
    fixture.componentRef.setInput('entity', {
      singular: 'label',
      plural: 'labels',
      suffixSingular: 'seleccionada',
      suffixPlural: 'seleccionadas',
    });
    fixture.detectChanges();
  }

  it('hides itself when count is zero', () => {
    setInputs(0);
    expect(fixture.nativeElement.querySelector('.bulk-bar')).toBeNull();
  });

  it('uses singular form for count of 1', () => {
    setInputs(1);
    expect(fixture.nativeElement.textContent).toContain('1 label seleccionada');
  });

  it('uses plural form for count > 1', () => {
    setInputs(3);
    expect(fixture.nativeElement.textContent).toContain('3 labels seleccionadas');
  });

  it('emits clear when the X button is clicked', () => {
    setInputs(2);
    let cleared = 0;
    component.clear.subscribe(() => cleared++);
    (fixture.nativeElement.querySelector('.bulk-bar__clear') as HTMLButtonElement).click();
    expect(cleared).toBe(1);
  });
});
