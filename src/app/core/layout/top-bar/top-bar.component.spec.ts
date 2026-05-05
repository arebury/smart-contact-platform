import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { TopBarComponent } from './top-bar.component';

describe('TopBarComponent', () => {
  let fixture: ComponentFixture<TopBarComponent>;
  let breadcrumbs: BreadcrumbService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBarComponent, TranslateModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBarComponent);
    breadcrumbs = TestBed.inject(BreadcrumbService);
  });

  it('renders the avatar', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.top-bar__avatar')).not.toBeNull();
  });

  it('renders the breadcrumb trail set in the service', () => {
    breadcrumbs.set([{ label: 'Admin', path: '/admin' }, { label: 'Usuarios' }]);
    fixture.detectChanges();
    const crumbs = fixture.nativeElement.querySelectorAll('.top-bar__crumb');
    expect(crumbs.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.top-bar__crumb-link')?.textContent.trim()).toBe(
      'Admin',
    );
    expect(fixture.nativeElement.querySelector('.top-bar__crumb-current')?.textContent.trim()).toBe(
      'Usuarios',
    );
  });

  it('toggles the user menu on avatar click', () => {
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('.top-bar__avatar') as HTMLButtonElement;
    expect(fixture.nativeElement.querySelector('.top-bar__menu')).toBeNull();
    avatar.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.top-bar__menu')).not.toBeNull();
    avatar.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.top-bar__menu')).toBeNull();
  });
});
