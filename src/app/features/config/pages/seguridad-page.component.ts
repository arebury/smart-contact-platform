import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Info,
  Key,
  Loader2,
  LucideAngularModule,
  Search,
  Shield,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { BreadcrumbService } from '@core/services';
import { AgentsStore } from '@features/admin/agents/state/agents.store';

const CONFIRM_PHRASE = 'REGENERAR';

interface RegenerationResult {
  readonly count: number;
  readonly timestamp: string;
}

/**
 * Seguridad page (`/config/seguridad`).
 *
 * Two cards: a "Políticas de contraseñas" panel (cosmetic, mirrors the
 * prototype's UI without backing storage) and a collapsed-by-default
 * accordion that hosts the deliberately-buried bulk password regeneration
 * flow. The destructive action is gated behind typing the literal
 * "REGENERAR" string.
 */
@Component({
  selector: 'aed-seguridad-page',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './seguridad-page.component.html',
  styleUrl: './seguridad-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeguridadPageComponent implements OnInit, OnDestroy {
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly agentsStore = inject(AgentsStore);

  protected readonly shieldIcon = Shield;
  protected readonly keyIcon = Key;
  protected readonly searchIcon = Search;
  protected readonly closeIcon = X;
  protected readonly alertIcon = AlertTriangle;
  protected readonly infoIcon = Info;
  protected readonly chevronDown = ChevronDown;
  protected readonly chevronRight = ChevronRight;
  protected readonly downloadIcon = Download;
  protected readonly checkIcon = Check;
  protected readonly loaderIcon = Loader2;

  protected readonly confirmPhraseToken = CONFIRM_PHRASE;

  protected readonly regenOpen = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly confirmText = signal('');
  protected readonly processing = signal(false);
  protected readonly result = signal<RegenerationResult | null>(null);

  protected readonly activeAgents = computed(() =>
    this.agentsStore.agents().filter((a) => a.status === 'active'),
  );

  protected readonly filteredAgents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.activeAgents();
    if (!query) return all;
    return all.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.code.toLowerCase().includes(query) ||
        a.extension.includes(query) ||
        (a.email?.toLowerCase().includes(query) ?? false),
    );
  });

  protected readonly allFilteredSelected = computed(() => {
    const filtered = this.filteredAgents();
    if (filtered.length === 0) return false;
    const selected = this.selectedIds();
    return filtered.every((a) => selected.has(a.id));
  });

  protected readonly canExecute = computed(
    () =>
      this.selectedIds().size > 0 &&
      this.confirmText() === CONFIRM_PHRASE &&
      !this.processing(),
  );

  ngOnInit(): void {
    this.breadcrumbs.set([
      { label: this.translate.instant('sidebar.configuration') },
      { label: this.translate.instant('config.seguridad.title') },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.clear();
  }

  protected toggleAccordion(): void {
    this.regenOpen.update((v) => !v);
  }

  protected toggleAll(): void {
    const filtered = this.filteredAgents();
    const allSelected = this.allFilteredSelected();
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const agent of filtered) {
        if (allSelected) next.delete(agent.id);
        else next.add(agent.id);
      }
      return next;
    });
  }

  protected toggleOne(id: number): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected onConfirmInput(value: string): void {
    this.confirmText.set(value.toUpperCase());
  }

  protected onSearchKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.searchQuery()) {
      this.searchQuery.set('');
    } else {
      (event.target as HTMLInputElement).blur();
    }
  }

  protected regenerate(): void {
    if (!this.canExecute()) return;
    this.processing.set(true);
    const count = this.selectedIds().size;

    setTimeout(() => {
      this.result.set({
        count,
        timestamp: this.formatTimestamp(new Date()),
      });
      this.processing.set(false);
      this.selectedIds.set(new Set());
      this.confirmText.set('');
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant(
          count === 1
            ? 'config.seguridad.toast.regenerated_one'
            : 'config.seguridad.toast.regenerated_many',
          { count },
        ),
        life: 4000,
      });
    }, 1500);
  }

  protected downloadCsv(): void {
    const result = this.result();
    if (!result) return;

    const header = ['Código', 'Nombre', 'Email', 'Contraseña temporal'].join(',');
    const sample = this.agentsStore.agents().slice(0, result.count);
    const rows = sample.map((a) => {
      const tempPwd = `tmp_${Math.random().toString(36).slice(2, 10)}`;
      return [a.code, JSON.stringify(a.name), a.email ?? '', tempPwd].join(',');
    });
    const csv = [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `credenciales_temporales_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('config.seguridad.toast.csv_downloaded'),
      life: 3000,
    });
  }

  private formatTimestamp(date: Date): string {
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
