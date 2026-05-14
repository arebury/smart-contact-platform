import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PlaceholderPageComponent } from './placeholder-page.component';

describe('PlaceholderPageComponent', () => {
  let component: PlaceholderPageComponent;
  let fixture: ComponentFixture<PlaceholderPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceholderPageComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaceholderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders', () => {
    expect(component).toBeTruthy();
  });

  it('renders the placeholder block', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('.placeholder')).not.toBeNull();
    expect(html.querySelector('.placeholder__title')).not.toBeNull();
  });
});
