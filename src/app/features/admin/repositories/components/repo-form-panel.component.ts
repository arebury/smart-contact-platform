import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertTriangle, LucideAngularModule } from 'lucide-angular';

import { RepoEntity, RepoFieldDef } from './repo-types';

export type RepoFormSubmission = Readonly<Record<string, string>>;

/**
 * Generic create / edit panel rendered by `<aed-repo-list-page>` for every
 * repository instance. Field set is data-driven; supports text, textarea and
 * select inputs. Validates required fields and the duplicate-name constraint
 * (case-insensitive, ignoring the current record).
 */
@Component({
    selector: 'aed-repo-form-panel',
    imports: [FormsModule, LucideAngularModule, TranslateModule],
    templateUrl: './repo-form-panel.component.html',
    styleUrl: './repo-form-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoFormPanelComponent<T extends RepoEntity> implements OnInit, AfterViewInit {
  private readonly translate = inject(TranslateService);

  readonly fields = input.required<readonly RepoFieldDef[]>();
  readonly initial = input<T | null>(null);
  readonly existingNames = input.required<readonly string[]>();
  readonly entityNameSpanish = input.required<string>();

  readonly save = output<RepoFormSubmission>();
  readonly cancelled = output<void>();

  protected readonly alertIcon = AlertTriangle;
  protected readonly values = signal<Record<string, string>>({});
  protected readonly error = signal('');

  @ViewChild('firstInput') private readonly firstInput?: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    const seed = this.initial();
    const next: Record<string, string> = {};
    for (const field of this.fields()) {
      if (seed) {
        const raw = (seed as unknown as Record<string, unknown>)[field.key];
        next[field.key] = raw == null ? '' : String(raw);
      } else if (field.type === 'select' && field.options?.length) {
        next[field.key] = field.options[0]!.value;
      } else {
        next[field.key] = '';
      }
    }
    this.values.set(next);
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.firstInput?.nativeElement.focus());
  }

  protected onChange(key: string, value: string): void {
    this.values.update((current) => ({ ...current, [key]: value }));
    if (this.error()) this.error.set('');
  }

  protected onKey(event: KeyboardEvent, allowEnterSave = true): void {
    if (event.key === 'Enter' && !event.shiftKey && allowEnterSave) {
      event.preventDefault();
      this.onSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelled.emit();
    }
  }

  protected onSave(): void {
    if (!this.validate()) return;
    const trimmed: Record<string, string> = {};
    for (const field of this.fields()) {
      trimmed[field.key] = this.values()[field.key]?.trim() ?? '';
    }
    this.save.emit(trimmed);
  }

  private validate(): boolean {
    const values = this.values();
    const name = (values['name'] ?? '').trim();
    if (!name) {
      this.error.set(this.translate.instant('repositories.errors.name_required'));
      return false;
    }
    const initialName = this.initial()?.name ?? '';
    const duplicate = this.existingNames().some(
      (n) =>
        n.toLowerCase() === name.toLowerCase() && n.toLowerCase() !== initialName.toLowerCase(),
    );
    if (duplicate) {
      this.error.set(
        this.translate.instant('repositories.errors.duplicate_name', {
          entity: this.entityNameSpanish(),
        }),
      );
      return false;
    }
    for (const field of this.fields()) {
      if (field.required && !(values[field.key] ?? '').trim()) {
        this.error.set(
          this.translate.instant('repositories.errors.field_required', {
            field: this.translate.instant(field.labelKey),
          }),
        );
        return false;
      }
    }
    this.error.set('');
    return true;
  }
}
