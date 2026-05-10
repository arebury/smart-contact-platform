import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  MaybeAsync,
  RouterStateSnapshot,
} from '@angular/router';

import { DiscardDialogService } from '@core/services/discard-dialog.service';
import { DirtyAware, formDirtyGuard } from './form-dirty.guard';

/**
 * Minimal harness that runs a `CanDeactivateFn` inside Angular's
 * injection context — the guard reads `inject(DiscardDialogService)`
 * synchronously when the form is dirty, so we need DI to resolve.
 */
function runGuard(component: DirtyAware): MaybeAsync<GuardResult> {
  return TestBed.runInInjectionContext(() =>
    formDirtyGuard(
      component,
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
      {} as RouterStateSnapshot,
    ),
  );
}

describe('formDirtyGuard', () => {
  let confirmSpy: jasmine.Spy<() => Promise<boolean>>;

  beforeEach(() => {
    confirmSpy = jasmine.createSpy('confirm');
    TestBed.configureTestingModule({
      providers: [{ provide: DiscardDialogService, useValue: { confirm: confirmSpy } }],
    });
  });

  it('lets navigation proceed without prompting when the form is clean', () => {
    const result = runGuard({ formDirty: signal(false) });
    expect(result).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('opens the discard dialog when the form is dirty', () => {
    confirmSpy.and.returnValue(Promise.resolve(true));
    runGuard({ formDirty: signal(true) });
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it('resolves true when the user confirms discard', async () => {
    confirmSpy.and.returnValue(Promise.resolve(true));
    const result = await runGuard({ formDirty: signal(true) });
    expect(result).toBe(true);
  });

  it('resolves false when the user keeps editing', async () => {
    confirmSpy.and.returnValue(Promise.resolve(false));
    const result = await runGuard({ formDirty: signal(true) });
    expect(result).toBe(false);
  });
});
