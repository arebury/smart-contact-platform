import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  let component: AppShellComponent;
  let fixture: ComponentFixture<AppShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent, TranslateModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders', () => {
    expect(component).toBeTruthy();
  });

  it('mounts the sidebar, top-bar and router-outlet', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('sc-sidebar')).not.toBeNull();
    expect(html.querySelector('sc-top-bar')).not.toBeNull();
    expect(html.querySelector('router-outlet')).not.toBeNull();
  });
});
