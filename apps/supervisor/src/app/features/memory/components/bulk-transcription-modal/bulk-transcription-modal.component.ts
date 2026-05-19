import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CheckCircle2,
  FileText,
  Info,
  Lock,
  LucideAngularModule,
  SkipForward,
  Sparkles,
} from 'lucide-angular';
import { ButtonModule } from 'primeng/button';

import { ModalComponent } from '@shared/components/modal/modal.component';

import type { Conversation } from '../../data/conversation.types';

/**
 * Bulk transcription modal · Memory iter 6b.
 *
 * Réplica del spec v11 (`Memory/docs/specs/bulk-transcription-modal.md`):
 * 3 columnas hero **mutuamente excluyentes** sobre la selección. Cada
 * conversación entra en exactamente un destino. Invariante:
 * `destination1 + destination2 + destination3 === procesables`.
 *
 * Columnas:
 *   1. **Primera acción pendiente** (etiqueta dinámica): "Transcribir +
 *      analizar" si toggle ON, "Solo transcribir" si OFF. Valor: `c.t`.
 *   2. **Solo analizar**: `c.ea + ch.ea` si toggle ON, 0 si OFF.
 *   3. **Omitidas**: `c.aa + ch.aa` (+ `c.ea + ch.ea` si toggle OFF).
 *
 * Toggle "Incluir análisis IA" se bloquea (ON forzado, candado, shake al
 * click) cuando `analysisOnlyMode === true` (no hay nada que transcribir
 * pero sí elegibles para análisis).
 *
 * Filtrado defensivo aplicado a la selección:
 *   - `deleted: true` (retención vencida) → excluido silenciosamente.
 *   - llamada sin recording → excluido silenciosamente.
 *
 * Diferidos a iter futura (anotado en `docs/memory-migration-inventory.md §10`):
 *   - Sticky toast post-confirmación ("Generando transcripción…" infinity).
 *   - Caption "Excluye K en proceso" (mock no tiene estado `processingIds`).
 *   - Hint "Incluye N llamadas con varios tramos" / "M con tramos ya iniciados".
 *   - Eyebrow `ACCIÓN MASIVA` (sc-modal canonical no soporta eyebrow slot;
 *     anotado en SCDS inconsistencies-backlog para refactor futuro).
 */
@Component({
  selector: 'sc-memory-bulk-transcription-modal',
  imports: [ButtonModule, LucideAngularModule, ModalComponent, TranslateModule],
  templateUrl: './bulk-transcription-modal.component.html',
  styleUrl: './bulk-transcription-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkTranscriptionModalComponent {
  private readonly translate = inject(TranslateService);

  readonly visible = input.required<boolean>();
  readonly selected = input.required<readonly Conversation[]>();

  readonly closed = output<void>();
  readonly confirmed = output<{
    readonly includeAnalysis: boolean;
    readonly eligibleIds: readonly string[];
  }>();

  protected readonly userToggleOn = signal(false);
  protected readonly shakeLocked = signal(false);

  protected readonly buckets = computed(() => computeBuckets(this.selected()));

  protected readonly nSelected = computed(() => this.selected().length);

  protected readonly nProcessable = computed(() => {
    const b = this.buckets();
    return b.c_t + b.c_ea + b.c_aa + b.ch_ea + b.ch_aa;
  });

  protected readonly nFilteredOut = computed(() => this.nSelected() - this.nProcessable());

  protected readonly analysisOnlyMode = computed(() => {
    const b = this.buckets();
    return b.c_t === 0 && b.c_ea + b.ch_ea > 0;
  });

  protected readonly toggleLocked = computed(() => this.analysisOnlyMode());

  protected readonly toggleOn = computed(() => (this.toggleLocked() ? true : this.userToggleOn()));

  protected readonly destination1 = computed(() => this.buckets().c_t);

  protected readonly destination2 = computed(() => {
    const b = this.buckets();
    return this.toggleOn() ? b.c_ea + b.ch_ea : 0;
  });

  protected readonly destination3 = computed(() => {
    const b = this.buckets();
    return b.c_aa + b.ch_aa + (this.toggleOn() ? 0 : b.c_ea + b.ch_ea);
  });

  protected readonly toProcess = computed(() => this.destination1() + this.destination2());

  protected readonly buttonDisabled = computed(() => this.toProcess() === 0);

  protected readonly isAllProcessed = computed(() => {
    const d3 = this.destination3();
    const proc = this.nProcessable();
    return proc > 0 && this.toProcess() === 0 && d3 === proc;
  });

  protected readonly destination1LabelKey = computed(() =>
    this.toggleOn() ? 'memory.bulk_modal.col1.label_on' : 'memory.bulk_modal.col1.label_off',
  );

  protected readonly col1DescKey = computed(() =>
    this.destination1() > 0
      ? 'memory.bulk_modal.col1.desc_has'
      : 'memory.bulk_modal.col1.desc_none',
  );

  protected readonly col2DescKey = computed(() => {
    if (this.destination2() > 0) return 'memory.bulk_modal.col2.desc_has';
    if (this.buckets().c_ea + this.buckets().ch_ea === 0) {
      return 'memory.bulk_modal.col2.desc_none_eligible';
    }
    return 'memory.bulk_modal.col2.desc_toggle_off_hint';
  });

  protected readonly col3DescKey = computed(() => {
    const d3 = this.destination3();
    if (d3 === 0) return 'memory.bulk_modal.col3.desc_zero';
    const includesEa = !this.toggleOn() && this.buckets().c_ea + this.buckets().ch_ea > 0;
    return includesEa
      ? 'memory.bulk_modal.col3.desc_with_skipped_analysis'
      : 'memory.bulk_modal.col3.desc_already';
  });

  protected readonly toggleDescKey = computed(() => {
    if (!this.toggleLocked()) return 'memory.bulk_modal.toggle.desc_normal';
    const b = this.buckets();
    const onlyChats = b.c_ea === 0 && b.ch_ea > 0;
    return onlyChats
      ? 'memory.bulk_modal.toggle.desc_locked_chats'
      : 'memory.bulk_modal.toggle.desc_locked_calls';
  });

  // Chips de canal por columna
  protected readonly col1Chips = computed(() => {
    return this.destination1() > 0 ? (['calls'] as const) : ([] as const);
  });

  protected readonly col2Chips = computed(() => {
    if (!this.toggleOn()) return [] as const;
    const out: ('calls' | 'chats')[] = [];
    if (this.buckets().c_ea > 0) out.push('calls');
    if (this.buckets().ch_ea > 0) out.push('chats');
    return out;
  });

  protected readonly col3Chips = computed(() => {
    const b = this.buckets();
    const includesEa = !this.toggleOn();
    const out: ('calls' | 'chats')[] = [];
    if (b.c_aa > 0 || (includesEa && b.c_ea > 0)) out.push('calls');
    if (b.ch_aa > 0 || (includesEa && b.ch_ea > 0)) out.push('chats');
    return out;
  });

  protected readonly fileIcon = FileText;
  protected readonly sparkleIcon = Sparkles;
  protected readonly skipIcon = SkipForward;
  protected readonly infoIcon = Info;
  protected readonly checkIcon = CheckCircle2;
  protected readonly lockIcon = Lock;

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.userToggleOn.set(false);
        this.shakeLocked.set(false);
      }
    });
  }

  protected onToggleClick(): void {
    if (this.toggleLocked()) {
      this.shakeLocked.set(true);
      setTimeout(() => this.shakeLocked.set(false), 320);
      return;
    }
    this.userToggleOn.update((v) => !v);
  }

  protected onCancel(): void {
    this.closed.emit();
  }

  protected onConfirm(): void {
    if (this.buttonDisabled()) return;
    const includeAnalysis = this.toggleOn();
    const eligible: string[] = [];
    for (const conv of this.selected()) {
      if (!isEligibleForBulk(conv)) continue;
      if (conv.channel === 'llamada') {
        if (!conv.hasTranscription) eligible.push(conv.id);
        else if (includeAnalysis && !conv.hasAnalysis) eligible.push(conv.id);
      } else {
        if (includeAnalysis && !conv.hasAnalysis) eligible.push(conv.id);
      }
    }
    this.confirmed.emit({ includeAnalysis, eligibleIds: eligible });
  }
}

interface Buckets {
  readonly c_t: number;
  readonly c_ea: number;
  readonly c_aa: number;
  readonly ch_ea: number;
  readonly ch_aa: number;
}

function isEligibleForBulk(c: Conversation): boolean {
  if (c.deleted) return false;
  if (c.channel === 'llamada' && !c.hasRecording) return false;
  return true;
}

function computeBuckets(selected: readonly Conversation[]): Buckets {
  let c_t = 0;
  let c_ea = 0;
  let c_aa = 0;
  let ch_ea = 0;
  let ch_aa = 0;
  for (const conv of selected) {
    if (!isEligibleForBulk(conv)) continue;
    if (conv.channel === 'llamada') {
      if (!conv.hasTranscription) c_t++;
      else if (!conv.hasAnalysis) c_ea++;
      else c_aa++;
    } else {
      if (!conv.hasAnalysis) ch_ea++;
      else ch_aa++;
    }
  }
  return { c_t, c_ea, c_aa, ch_ea, ch_aa };
}
