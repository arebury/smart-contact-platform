import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ClipboardService } from '@core/services/clipboard.service';
import { DeletableEntity, DeleteEntityDialogComponent } from './delete-entity-dialog.component';

/**
 * Translate-loader stub: every key resolves to itself plus interpolated
 * params, so we can assert against the keys instead of fighting the i18n
 * file in tests.
 */
class StubLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

@Component({
  standalone: true,
  imports: [DeleteEntityDialogComponent],
  template: `
    <aed-delete-entity-dialog
      [visible]="visible()"
      [mode]="mode"
      [items]="items"
      [entitySingular]="'agente'"
      [entityPlural]="'agentes'"
      (cancelled)="cancelCount = cancelCount + 1"
      (confirm)="confirmed = $event"
    />
  `,
})
class HostComponent {
  readonly visible = signal(true);
  mode: 'single' | 'bulk' = 'single';
  items: readonly DeletableEntity[] = [{ id: 1, name: 'Miguel Palacios' }];
  cancelCount = 0;
  confirmed: readonly number[] | null | undefined = undefined;
}

describe('DeleteEntityDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let clipboardSpy: { copy: jasmine.Spy<(text: string) => Promise<boolean>> };

  function findInside<T = HTMLElement>(selector: string): T {
    /*
     * The dialog renders its body via PrimeNG's `<p-dialog>`, which
     * portals the content to the document body. Query the document
     * scope rather than the fixture's host element.
     */
    const el = document.querySelector(selector);
    expect(el).withContext(`element "${selector}" should exist`).toBeTruthy();
    return el as unknown as T;
  }

  beforeEach(async () => {
    clipboardSpy = { copy: jasmine.createSpy('copy').and.resolveTo(true) };
    await TestBed.configureTestingModule({
      imports: [
        HostComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: StubLoader } }),
      ],
      providers: [MessageService, { provide: ClipboardService, useValue: clipboardSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    /*
     * PrimeNG portals the dialog into `document.body`; close + tear
     * down so the next test starts clean.
     */
    host.visible.set(false);
    fixture.detectChanges();
    document.querySelectorAll('.p-dialog, .p-dialog-mask').forEach((el) => el.remove());
  });

  describe('single mode', () => {
    beforeEach(() => {
      host.mode = 'single';
      host.items = [{ id: 42, name: 'Miguel Palacios' }];
      fixture.detectChanges();
    });

    it('disables confirm until the typed text matches the entity name', () => {
      const confirmBtn = findInside<HTMLButtonElement>('.btn--danger');
      expect(confirmBtn.disabled).toBe(true);

      const input = findInside<HTMLInputElement>('#delete-confirm-input');
      input.value = 'Migue'; // partial
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(confirmBtn.disabled).toBe(true);

      input.value = 'Miguel Palacios';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(confirmBtn.disabled).toBe(false);
    });

    it('emits confirm with `null` when the user types the name and clicks delete', () => {
      const input = findInside<HTMLInputElement>('#delete-confirm-input');
      input.value = 'Miguel Palacios';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      findInside<HTMLButtonElement>('.btn--danger').click();
      fixture.detectChanges();
      expect(host.confirmed).toBeNull();
    });

    it('emits cancelled when Cancel is clicked', () => {
      findInside<HTMLButtonElement>('.btn--secondary').click();
      fixture.detectChanges();
      expect(host.cancelCount).toBe(1);
    });

    it('copies the entity name to the clipboard when the copy-name button is clicked', async () => {
      const copyBtn = findInside<HTMLButtonElement>('.delete-entity__copy-name');
      copyBtn.click();
      // `clipboard.copy()` returns a promise; flush microtasks before asserting.
      await Promise.resolve();
      expect(clipboardSpy.copy).toHaveBeenCalledWith('Miguel Palacios');
    });

    it('resets the typed text when the items list changes (next delete request)', () => {
      const input = findInside<HTMLInputElement>('#delete-confirm-input');
      input.value = 'Miguel Palacios';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Caller swaps to a different target — typed text must clear so
      // the previous "match" doesn't accidentally enable confirm.
      host.items = [{ id: 99, name: 'Marta Recio' }];
      fixture.detectChanges();

      const confirmBtn = findInside<HTMLButtonElement>('.btn--danger');
      expect(confirmBtn.disabled).toBe(true);
    });
  });

  describe('bulk mode', () => {
    beforeEach(() => {
      host.mode = 'bulk';
      host.items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Carol' },
      ];
      fixture.detectChanges();
    });

    it('renders one chip per item and confirm enabled by default', () => {
      const chips = document.querySelectorAll('.delete-entity__chip');
      expect(chips.length).toBe(3);
      expect(findInside<HTMLButtonElement>('.btn--danger').disabled).toBe(false);
    });

    it('emits confirm with every surviving id when nothing is pruned', () => {
      findInside<HTMLButtonElement>('.btn--danger').click();
      fixture.detectChanges();
      expect(host.confirmed).toBeTruthy();
      const ids = [...(host.confirmed ?? [])].sort();
      expect(ids).toEqual([1, 2, 3]);
    });

    it('removes a chip when its X is clicked and excludes the id from confirm', () => {
      const removeBtns = document.querySelectorAll<HTMLButtonElement>(
        '.delete-entity__chip-remove',
      );
      // First chip is Alice (id=1); prune her.
      removeBtns[0]!.click();
      fixture.detectChanges();
      expect(document.querySelectorAll('.delete-entity__chip').length).toBe(2);

      findInside<HTMLButtonElement>('.btn--danger').click();
      fixture.detectChanges();
      const ids = [...(host.confirmed ?? [])].sort();
      expect(ids).toEqual([2, 3]);
    });

    it('keeps the dialog open and disables confirm when every chip is pruned (recovery)', () => {
      const removeBtns = document.querySelectorAll<HTMLButtonElement>(
        '.delete-entity__chip-remove',
      );
      removeBtns.forEach((btn) => btn.click());
      fixture.detectChanges();
      expect(document.querySelectorAll('.delete-entity__chip').length).toBe(0);
      expect(findInside<HTMLButtonElement>('.btn--danger').disabled).toBe(true);
    });

    it('resets every chip when the items list changes (caller re-staging a delete)', () => {
      const removeBtns = document.querySelectorAll<HTMLButtonElement>(
        '.delete-entity__chip-remove',
      );
      removeBtns[0]!.click();
      fixture.detectChanges();
      expect(document.querySelectorAll('.delete-entity__chip').length).toBe(2);

      host.items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Carol' },
      ];
      fixture.detectChanges();
      expect(document.querySelectorAll('.delete-entity__chip').length).toBe(3);
    });
  });
});
