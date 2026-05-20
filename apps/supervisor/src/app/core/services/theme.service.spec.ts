import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('sc-dark');
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    document.documentElement.classList.remove('sc-dark');
    localStorage.clear();
  });

  it('falls back to "system" when no persisted value exists', () => {
    const svc = TestBed.inject(ThemeService);
    expect(svc.mode()).toBe('system');
  });

  it('reads a persisted "dark" value on init', () => {
    localStorage.setItem('sc-theme', 'dark');
    const svc = TestBed.inject(ThemeService);
    expect(svc.mode()).toBe('dark');
  });

  it('falls back to "system" when the persisted value is invalid', () => {
    localStorage.setItem('sc-theme', 'banana');
    const svc = TestBed.inject(ThemeService);
    expect(svc.mode()).toBe('system');
  });

  describe('set(mode)', () => {
    it('updates the mode signal', () => {
      const svc = TestBed.inject(ThemeService);
      svc.set('dark');
      expect(svc.mode()).toBe('dark');
    });

    it('persists the choice to localStorage', async () => {
      const svc = TestBed.inject(ThemeService);
      svc.set('dark');
      // The effect that writes localStorage runs on the next microtask;
      // flush by awaiting `Promise.resolve()` so the assertion sees the write.
      TestBed.flushEffects();
      expect(localStorage.getItem('sc-theme')).toBe('dark');
    });

    it('persists "system" as a deliberate choice (does NOT clear)', () => {
      const svc = TestBed.inject(ThemeService);
      svc.set('system');
      TestBed.flushEffects();
      expect(localStorage.getItem('sc-theme')).toBe('system');
    });
  });

  describe('effectiveMode', () => {
    it('passes "light" / "dark" through unchanged', () => {
      const svc = TestBed.inject(ThemeService);
      svc.set('light');
      expect(svc.effectiveMode()).toBe('light');
      svc.set('dark');
      expect(svc.effectiveMode()).toBe('dark');
    });

    it('resolves "system" to the OS preference (light or dark)', () => {
      const svc = TestBed.inject(ThemeService);
      svc.set('system');
      // The exact resolved value depends on the test runner's host;
      // assert it lands on one of the two valid values.
      expect(['light', 'dark']).toContain(svc.effectiveMode());
    });
  });

  describe('DOM application', () => {
    it('adds the .sc-dark class on <html> when dark', () => {
      const svc = TestBed.inject(ThemeService);
      svc.set('dark');
      TestBed.flushEffects();
      expect(document.documentElement.classList.contains('sc-dark')).toBe(true);
    });

    it('removes the .sc-dark class on <html> when switching to light', () => {
      const svc = TestBed.inject(ThemeService);
      svc.set('dark');
      TestBed.flushEffects();
      svc.set('light');
      TestBed.flushEffects();
      expect(document.documentElement.classList.contains('sc-dark')).toBe(false);
    });
  });
});
