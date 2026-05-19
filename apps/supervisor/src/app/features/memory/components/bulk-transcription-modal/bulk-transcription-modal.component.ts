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
import { AlertCircle, AlignLeft, Loader2, LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

import { ModalComponent } from '@shared/components/modal/modal.component';

import type { Conversation } from '../../data/conversation.types';

/**
 * Bulk transcription modal · Memory iter 6b v26.
 *
 * Reemplaza la taxonomía v11 (3 destinos MECE) por un layout compact
 * de 2 celdas tipo "Hero + Decision". Réplica del prototipo React
 * `BulkTranscriptionModal.tsx · v26 (Figma 297:2559)`.
 *
 * Body 720×200, dos celdas equal separadas por hairline vertical:
 *
 *   ┌─────────────────────────┬─────────────────────────┐
 *   │ TOTAL A PROCESAR        │ ANÁLISIS                │
 *   │ 12  genera coste        │ Incluir análisis   ◯─●  │
 *   │ Incluye 3 multi-rec.    │ 8 admiten análisis      │
 *   └─────────────────────────┴─────────────────────────┘
 *
 * Counters derivados:
 *   nTrans   = audios de llamadas pendientes (multi-rec leg-aware)
 *   nAnBase  = call_ea + chat_ea (elegibles para análisis)
 *   heroCount = toggleOn ? (nTrans + nAnBase) : nTrans
 *
 * 6 casos según contadores no-cero (C1-C6 documentados en spec React).
 * naturalDefault: toggle ON solo cuando nTrans=0 && nAnBase>0 (C2/C5).
 *
 * Multi-rec rule (sec 13.13): una llamada multi-grabación con 3 legs
 * sin transcribir cuenta como 3 audios en el hero, no 1 conversación.
 * El delta hint explica "Incluye N llamadas con varios tramos".
 *
 * Inputs nuevos vs v11: `processingIds` + `analyzingIds` (opcional,
 * default []) — excluyen filas mid-dispatch para evitar doble coste.
 * Hoy el mock no usa esos arrays; se documenta en §10 inventory.
 */
@Component({
  selector: 'sc-memory-bulk-transcription-modal',
  imports: [
    ButtonModule,
    FormsModule,
    LucideAngularModule,
    ModalComponent,
    ToggleSwitchModule,
    TranslateModule,
  ],
  templateUrl: './bulk-transcription-modal.component.html',
  styleUrl: './bulk-transcription-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkTranscriptionModalComponent {
  private readonly translate = inject(TranslateService);

  readonly visible = input.required<boolean>();
  readonly selected = input.required<readonly Conversation[]>();
  readonly processingIds = input<readonly string[]>([]);
  readonly analyzingIds = input<readonly string[]>([]);

  readonly closed = output<void>();
  readonly confirmed = output<{
    readonly includeAnalysis: boolean;
    readonly eligibleIds: readonly string[];
  }>();

  /** Estado del toggle controlado por el usuario. El estado efectivo `toggleOn`
   *  aplica el natural-default + el lock cuando no se puede transcribir. */
  protected readonly userToggleOn = signal(false);
  protected readonly shakeKey = signal(0);
  protected readonly pulseKey = signal(0);
  protected readonly bumpKey = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Análisis derivado de la selección. Excluye `deleted: true` y filas
   *  en proceso de transcripción/análisis (evita doble dispatch). */
  protected readonly analysis = computed(() =>
    analyze(this.selected(), this.processingIds(), this.analyzingIds()),
  );

  protected readonly nTrans = computed(() => this.analysis().nTrans);
  protected readonly nAnBase = computed(() => this.analysis().nAnBase);
  protected readonly nInProgress = computed(() => this.analysis().nInProgress);
  protected readonly nMultiRec = computed(() => this.analysis().nMultiRec);
  protected readonly nPartialMultiRec = computed(() => this.analysis().nPartialMultiRec);
  protected readonly nSel = computed(() => this.selected().length);

  /** Solo es false en C1 (nada que hacer) — el toggle queda disabled. */
  protected readonly canAnalyze = computed(() => this.nTrans() + this.nAnBase() > 0);
  protected readonly toggleDisabled = computed(() => !this.canAnalyze());
  protected readonly isAllProcessed = computed(() => !this.canAnalyze());

  /** Natural default: ON solo cuando nada que transcribir pero sí analizar
   *  (C2/C5). Se aplica al abrir el modal y al cambiar la selección. */
  protected readonly toggleOn = computed(() =>
    this.toggleDisabled() ? false : this.userToggleOn(),
  );

  protected readonly heroCount = computed(() =>
    this.toggleOn() ? this.nTrans() + this.nAnBase() : this.nTrans(),
  );

  protected readonly canSubmit = computed(() => this.heroCount() > 0 && !this.isLoading());

  /**
   * Subtitle dinámico para el header del modal: contexto de selección.
   * Muestra desglose "X llamadas, Y chats" solo cuando hay mix (evita
   * redundancia "5 conversaciones · 5 llamadas").
   */
  protected readonly subtitle = computed(() => {
    const sel = this.selected();
    if (sel.length === 0) return 'Sin selección';
    const nCalls = sel.filter((c) => c.channel === 'llamada').length;
    const nChats = sel.length - nCalls;
    const head =
      sel.length === 1
        ? '1 conversación seleccionada'
        : `${sel.length} conversaciones seleccionadas`;
    if (nCalls > 0 && nChats > 0) {
      const bits: string[] = [];
      bits.push(`${nCalls} ${nCalls === 1 ? 'llamada' : 'llamadas'}`);
      bits.push(`${nChats} ${nChats === 1 ? 'chat' : 'chats'}`);
      return `${head} · ${bits.join(', ')}`;
    }
    return head;
  });

  /**
   * Hint debajo del hero. Solo aparece cuando aporta info NUEVA respecto
   * al subtitle (regla 15.41 anti señales-duplicadas). Casos típicos:
   *  - "Incluye N llamadas con varios tramos" (multi-rec, footgun 15.44).
   *  - "Excluye N en proceso" (cuando processingIds tiene filas selecc).
   */
  protected readonly heroDeltaHint = computed<string | null>(() => {
    if (this.isAllProcessed()) return null;
    const includes: string[] = [];
    const excludes: string[] = [];
    const nMR = this.nMultiRec();
    const nPMR = this.nPartialMultiRec();
    const nIP = this.nInProgress();
    if (nMR > 0 && !this.toggleOn()) {
      includes.push(`${nMR} ${nMR === 1 ? 'llamada' : 'llamadas'} con varios tramos`);
    }
    if (nPMR > 0) {
      if (includes.length > 0) {
        includes.push(`${nPMR} con tramos ya iniciados`);
      } else {
        includes.push(`${nPMR} ${nPMR === 1 ? 'llamada' : 'llamadas'} con tramos ya iniciados`);
      }
    }
    if (nIP > 0) excludes.push(`${nIP} en proceso`);
    const parts: string[] = [];
    if (includes.length > 0) parts.push(`Incluye ${includes.join(' · ')}`);
    if (excludes.length > 0) parts.push(`Excluye ${excludes.join(' · ')}`);
    return parts.length > 0 ? parts.join('. ') + '.' : null;
  });

  protected readonly captionLabel = computed(() => {
    const n = this.nTrans() + this.nAnBase();
    return n === 1 ? 'admite análisis' : 'admiten análisis';
  });

  protected readonly alignLeftIcon = AlignLeft;
  protected readonly loaderIcon = Loader2;
  protected readonly alertIcon = AlertCircle;

  constructor() {
    // Reset toggle to natural default al abrir o al cambiar selección.
    effect(() => {
      if (!this.visible()) return;
      // Tocar selected() para que el effect se dispare con cualquier cambio.
      this.selected();
      const naturalOn = this.nTrans() === 0 && this.nAnBase() > 0;
      this.userToggleOn.set(naturalOn);
      this.isLoading.set(false);
      this.error.set(null);
    });

    // Pulse hero al cambiar heroCount (solo mientras visible).
    let prevHero = this.heroCount();
    effect(() => {
      const h = this.heroCount();
      if (this.visible() && h !== prevHero) {
        this.bumpKey.update((k) => k + 1);
      }
      prevHero = h;
    });
  }

  protected onToggleChange(next: boolean): void {
    if (this.toggleDisabled()) {
      // C1 nudge: shake la cell decisión.
      this.shakeKey.update((k) => k + 1);
      return;
    }
    this.pulseKey.update((k) => k + 1);
    this.userToggleOn.set(next);
  }

  protected onCancel(): void {
    if (this.isLoading()) return;
    this.closed.emit();
  }

  protected onConfirm(): void {
    if (!this.canSubmit()) return;
    const includeAnalysis = this.toggleOn();
    const a = this.analysis();
    const eligibleIds: string[] = [];
    for (const c of a.readyToTranscribe) eligibleIds.push(c.id);
    if (includeAnalysis) {
      for (const c of a.callEa) eligibleIds.push(c.id);
      for (const c of a.chatEa) eligibleIds.push(c.id);
    }
    this.isLoading.set(true);
    this.error.set(null);
    // Mock: emite inmediatamente. En real, el caller manejaría loading/error
    // y devolvería una promise. Aquí simulamos resolución síncrona.
    this.confirmed.emit({ includeAnalysis, eligibleIds });
    this.isLoading.set(false);
  }
}

interface AnalysisResult {
  readonly readyToTranscribe: readonly Conversation[];
  readonly callEa: readonly Conversation[];
  readonly chatEa: readonly Conversation[];
  readonly nTrans: number;
  readonly nConvTrans: number;
  readonly nMultiRec: number;
  readonly nPartialMultiRec: number;
  readonly nInProgress: number;
  readonly nAnBase: number;
}

/**
 * Calcula los contadores derivados de la selección, aplicando los
 * filtros silenciosos (deleted + in-progress) y la regla multi-rec
 * (audios, no conversaciones).
 */
function analyze(
  selected: readonly Conversation[],
  processingIds: readonly string[],
  analyzingIds: readonly string[],
): AnalysisResult {
  const inProgress = new Set<string>([...processingIds, ...analyzingIds]);
  const eligible = selected.filter((c) => !c.deleted && !inProgress.has(c.id));
  const calls = eligible.filter((c) => c.channel === 'llamada');
  const chats = eligible.filter((c) => c.channel === 'chat');
  const nInProgress = selected.filter((c) => inProgress.has(c.id)).length;

  const readyToTranscribe = calls.filter((c) => c.hasRecording && !c.hasTranscription);

  // Multi-rec: una llamada con N tramos sin transcribir cuenta N audios.
  let nTramos = 0;
  let nMultiRec = 0;
  let nPartialMultiRec = 0;
  for (const c of readyToTranscribe) {
    const recs = c.recordings;
    if (recs && recs.length > 1) {
      nMultiRec++;
      const untranscribed = recs.filter((r) => !r.hasTranscription).length;
      nTramos += untranscribed;
      if (recs.some((r) => r.hasTranscription)) nPartialMultiRec++;
    } else {
      nTramos += 1;
    }
  }

  const callsTranscribed = calls.filter((c) => c.hasTranscription);
  const callEa = callsTranscribed.filter((c) => !c.hasAnalysis);
  const chatEa = chats.filter((c) => !c.hasAnalysis);

  return {
    readyToTranscribe,
    callEa,
    chatEa,
    nTrans: nTramos,
    nConvTrans: readyToTranscribe.length,
    nMultiRec,
    nPartialMultiRec,
    nInProgress,
    nAnBase: callEa.length + chatEa.length,
  };
}
