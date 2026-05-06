import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [TranslateModule.forRoot()],
    });
    service = TestBed.inject(BreadcrumbService);
  });

  it('starts empty when no route declares a breadcrumb', () => {
    expect(service.trail()).toEqual([]);
  });

  it('manual set() overrides the auto-derived trail', () => {
    service.set([{ label: 'Admin', path: '/admin' }, { label: 'Users' }]);
    expect(service.trail().length).toBe(2);
    expect(service.trail()[0]?.label).toBe('Admin');
    expect(service.trail()[1]?.path).toBeUndefined();
  });

  it('clear() drops the manual override', () => {
    service.set([{ label: 'X' }]);
    service.clear();
    expect(service.trail()).toEqual([]);
  });
});
