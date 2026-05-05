import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorDotPickerComponent, ColorDotOption } from './color-dot-picker.component';

describe('ColorDotPickerComponent', () => {
  let fixture: ComponentFixture<ColorDotPickerComponent>;
  let component: ColorDotPickerComponent;

  const options: ColorDotOption[] = [
    { value: 'red', label: 'Red', color: '#ef4444' },
    { value: 'blue', label: 'Blue', color: '#3b82f6' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ColorDotPickerComponent] }).compileComponents();
    fixture = TestBed.createComponent(ColorDotPickerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', 'red');
    fixture.detectChanges();
  });

  it('renders one swatch per option', () => {
    const swatches = fixture.nativeElement.querySelectorAll('.picker__swatch');
    expect(swatches.length).toBe(2);
  });

  it('marks the active swatch with --selected', () => {
    const swatches = fixture.nativeElement.querySelectorAll('.picker__swatch');
    expect(swatches[0].classList.contains('picker__swatch--selected')).toBe(true);
    expect(swatches[1].classList.contains('picker__swatch--selected')).toBe(false);
  });

  it('updates the model when a swatch is clicked', () => {
    const swatches = fixture.nativeElement.querySelectorAll('.picker__swatch');
    (swatches[1] as HTMLButtonElement).click();
    expect(component.value()).toBe('blue');
  });
});
