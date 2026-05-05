import { TestBed } from '@angular/core/testing';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BreadcrumbService);
  });

  it('starts empty', () => {
    expect(service.trail()).toEqual([]);
  });

  it('replaces the trail on set()', () => {
    service.set([{ label: 'Admin', path: '/admin' }, { label: 'Users' }]);
    expect(service.trail().length).toBe(2);
    expect(service.trail()[0]?.label).toBe('Admin');
    expect(service.trail()[1]?.path).toBeUndefined();
  });

  it('empties the trail on clear()', () => {
    service.set([{ label: 'X' }]);
    service.clear();
    expect(service.trail()).toEqual([]);
  });
});
