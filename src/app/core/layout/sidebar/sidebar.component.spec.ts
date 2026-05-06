import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, TranslateModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
  });

  it('renders the brand and both nav sections', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('.sidebar__brand')).not.toBeNull();
    expect(html.querySelectorAll('.sidebar__section').length).toBe(2);
  });

  it('renders the design-decisions shortcut at the foot', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('.sidebar__decisions')).not.toBeNull();
  });
});
