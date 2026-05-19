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
  AlertTriangle,
  AlignLeft,
  Download,
  FileText,
  FileX,
  Loader2,
  LucideAngularModule,
  MessageSquare,
  Pause,
  Phone,
  Play,
  RotateCcw,
  RotateCw,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { ModalComponent } from '@shared/components/modal/modal.component';
import type { Conversation, TranscriptionLine } from '../../data/conversation.types';

/**
 * Modal por conversación · Memory iter 5.
 *
 * Réplica 1:1 (Angular + SCDS) de `ConversationPlayerModal.tsx` del prototipo
 * React, alineada con la spec `docs/referencia-ui.md §2` del repo Memory.
 *
 * Anatomía:
 *   Header  ─ icon (Phone/MessageSquare) + "Llamada/Chat · #ID" + meta
 *   Body
 *     ├ Audio bar (solo llamadas; disabled si no hay recording)
 *     └ Tab row "Transcripción" / "Análisis" + acciones derecha
 *         (Analizar · Descargar). Re-transcribir es post-v1 (diferido §10).
 *     └ Tab body con state machine: Decision / Processing / Terminal / Active.
 *   Footer  ─ "Cerrar".
 *
 * Diferidos a iter siguiente / post-rollout (ver `docs/memory-migration-inventory.md §10`):
 *  - Re-transcribir + RetranscriptionConfirmModal.
 *  - MultiRecordingPlayer (multi-leg IVR). Iter 5 renderiza single con la
 *    primera grabación cuando hay >1.
 *  - Wrapper `<sc-audio-player>` SCDS (esperando 2º consumer).
 *  - Modal "Download" heredado SC (v1 toast).
 */
@Component({
  selector: 'sc-memory-conversation-player-modal',
  imports: [ButtonModule, LucideAngularModule, ModalComponent, TranslateModule],
  templateUrl: './conversation-player-modal.component.html',
  styleUrl: './conversation-player-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationPlayerModalComponent {
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly visible = input.required<boolean>();
  readonly conversation = input<Conversation | null>(null);
  readonly isTranscribing = input(false);
  readonly isAnalyzing = input(false);

  readonly closed = output<void>();
  readonly requestTranscription = output<string>();
  readonly requestAnalysis = output<string>();
  readonly requestTranscriptionAndAnalysis = output<string>();

  protected readonly activeTab = signal<'transcription' | 'analysis'>('transcription');
  protected readonly isPlaying = signal(false);
  protected readonly currentTime = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly requestingTranscription = signal(false);
  protected readonly requestingAnalysis = signal(false);

  private playbackTimer: ReturnType<typeof setInterval> | null = null;

  protected readonly isChat = computed(() => this.conversation()?.channel === 'chat');

  protected readonly conversationLabel = computed(() =>
    this.isChat() ? 'memory.player.label_chat' : 'memory.player.label_call',
  );

  protected readonly modalTitle = computed(() => {
    const c = this.conversation();
    if (!c) return '';
    const label = this.isChat() ? 'Chat' : 'Llamada';
    return `${label} · #${c.id}`;
  });

  protected readonly modalSubtitle = computed(() => {
    const c = this.conversation();
    if (!c) return null;
    return `${c.service} · ${c.date} ${c.hour} · Duración ${c.duration}`;
  });

  protected readonly playerEnabled = computed(() => {
    const c = this.conversation();
    return !!c && !this.isChat() && !!c.hasRecording;
  });

  protected readonly canRequestAnalysis = computed(() => {
    const c = this.conversation();
    return !!c && (c.hasTranscription === true || this.isChat());
  });

  protected readonly totalDuration = computed(() => {
    const c = this.conversation();
    return parseDurationSeconds(c?.duration) || 103;
  });

  protected readonly progressPct = computed(() => {
    const total = this.totalDuration();
    return total > 0 ? (this.currentTime() / total) * 100 : 0;
  });

  protected readonly filteredLines = computed<readonly TranscriptionLine[]>(() => {
    const c = this.conversation();
    if (!c?.transcription) return [];
    const q = this.searchTerm().toLowerCase().trim();
    if (!q) return c.transcription;
    return c.transcription.filter(
      (line) => line.text.toLowerCase().includes(q) || line.speaker.toLowerCase().includes(q),
    );
  });

  protected readonly currentTimeLabel = computed(() => formatTime(this.currentTime()));
  protected readonly totalDurationLabel = computed(() => formatTime(this.totalDuration()));

  protected readonly analyzeDisabled = computed(() => {
    const c = this.conversation();
    if (!c) return true;
    return !c.hasTranscription || c.hasAnalysis === true || this.requestingAnalysis();
  });

  protected readonly analyzeTitleKey = computed(() => {
    const c = this.conversation();
    if (!c) return 'memory.player.actions.analyze';
    if (!c.hasTranscription) return 'memory.player.actions.analyze_no_transcript';
    if (c.hasAnalysis) return 'memory.player.actions.analyze_done';
    return 'memory.player.actions.analyze';
  });

  protected readonly summary = computed<string | null>(() => {
    const c = this.conversation();
    if (!c?.transcription || c.transcription.length === 0) return null;
    return SUMMARY_TEMPLATES[hashString(c.id) % SUMMARY_TEMPLATES.length];
  });

  protected readonly sentiment = computed(() => {
    const c = this.conversation();
    if (!c) return SENTIMENT_PALETTE[1];
    const text = (c.transcription ?? [])
      .map((l) => l.text)
      .join(' ')
      .toLowerCase();
    if (NEGATIVE_LEXICON.test(text)) return SENTIMENT_PALETTE[2];
    return SENTIMENT_PALETTE[hashString(c.id) % SENTIMENT_PALETTE.length];
  });

  protected readonly phoneIcon = Phone;
  protected readonly chatIcon = MessageSquare;
  protected readonly playIcon = Play;
  protected readonly pauseIcon = Pause;
  protected readonly back10Icon = RotateCcw;
  protected readonly fwd10Icon = RotateCw;
  protected readonly searchIcon = Search;
  protected readonly fileTextIcon = FileText;
  protected readonly fileXIcon = FileX;
  protected readonly sparklesIcon = Sparkles;
  protected readonly downloadIcon = Download;
  protected readonly loaderIcon = Loader2;
  protected readonly alignLeftIcon = AlignLeft;
  protected readonly trendingUpIcon = TrendingUp;
  protected readonly alertTriangleIcon = AlertTriangle;

  constructor() {
    effect(() => {
      const isOpen = this.visible();
      const c = this.conversation();
      if (!isOpen) {
        this.stopPlayback();
        return;
      }
      this.isPlaying.set(false);
      this.currentTime.set(0);
      this.searchTerm.set('');
      this.requestingTranscription.set(false);
      this.requestingAnalysis.set(false);
      if (c && !c.hasTranscription && c.hasAnalysis) {
        this.activeTab.set('analysis');
      } else {
        this.activeTab.set('transcription');
      }
    });

    effect((onCleanup) => {
      if (!this.isPlaying()) {
        this.stopPlayback();
        return;
      }
      const total = this.totalDuration();
      this.playbackTimer = setInterval(() => {
        const next = this.currentTime() + 1;
        if (next >= total) {
          this.isPlaying.set(false);
          this.currentTime.set(0);
        } else {
          this.currentTime.set(next);
        }
      }, 1000);
      onCleanup(() => this.stopPlayback());
    });
  }

  protected setActiveTab(tab: 'transcription' | 'analysis'): void {
    this.activeTab.set(tab);
  }

  protected onTogglePlay(): void {
    if (!this.playerEnabled()) return;
    this.isPlaying.update((p) => !p);
  }

  protected onBack10(): void {
    if (!this.playerEnabled()) return;
    this.currentTime.set(Math.max(0, this.currentTime() - 10));
  }

  protected onFwd10(): void {
    if (!this.playerEnabled()) return;
    this.currentTime.set(Math.min(this.totalDuration(), this.currentTime() + 10));
  }

  protected onScrubClick(event: MouseEvent): void {
    if (!this.playerEnabled()) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.currentTime.set(Math.max(0, Math.min(this.totalDuration(), ratio * this.totalDuration())));
  }

  protected onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onClose(): void {
    this.stopPlayback();
    this.closed.emit();
  }

  protected onRequestTranscription(): void {
    const c = this.conversation();
    if (!c) return;
    this.requestingTranscription.set(true);
    this.requestTranscription.emit(c.id);
    setTimeout(() => this.requestingTranscription.set(false), 600);
  }

  protected onRequestAnalysis(): void {
    const c = this.conversation();
    if (!c) return;
    this.requestingAnalysis.set(true);
    this.requestAnalysis.emit(c.id);
    setTimeout(() => this.requestingAnalysis.set(false), 600);
  }

  protected onRequestBoth(): void {
    const c = this.conversation();
    if (!c) return;
    this.requestingAnalysis.set(true);
    this.requestTranscriptionAndAnalysis.emit(c.id);
    setTimeout(() => this.requestingAnalysis.set(false), 600);
  }

  protected onDownload(): void {
    const titleKey = this.isChat()
      ? 'memory.player.download_chat_toast'
      : 'memory.player.download_audio_toast';
    this.messages.add({
      severity: 'info',
      summary: this.translate.instant(titleKey),
      life: 2500,
    });
  }

  protected isAgentSpeaker(speaker: string): boolean {
    const c = this.conversation();
    if (!c) return false;
    const s = speaker.toLowerCase().trim();
    if (s === 'agente' || s === 'speaker 1') return true;
    if (s === 'cliente' || s === 'speaker 2') return false;
    if (c.channel === 'llamada' && c.origin.toLowerCase().trim() === s) {
      return true;
    }
    return false;
  }

  private stopPlayback(): void {
    if (this.playbackTimer !== null) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
  }
}

function parseDurationSeconds(dur?: string): number {
  if (!dur) return 0;
  const parts = dur.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatTime(s: number): string {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const NEGATIVE_LEXICON =
  /molest|frustr|inadmis|reclam|queja|incidenc|problem|injust|enfad|inacept/i;

/**
 * Colores del dot de sentimiento — adaptados al SCDS, no a la paleta hex
 * del prototipo React. Regla migración: `--sc-*` SIEMPRE gana sobre la
 * paleta original del prototipo, aunque visualmente difiera ligeramente.
 * Ver `feedback_migration_safety.md` y `Camino B` en planning.
 */
const SENTIMENT_PALETTE = [
  {
    labelKey: 'memory.player.sentiment.positive',
    summaryKey: 'memory.player.sentiment.positive_summary',
    color: 'var(--sc-color-green-500)',
  },
  {
    labelKey: 'memory.player.sentiment.neutral',
    summaryKey: 'memory.player.sentiment.neutral_summary',
    color: 'var(--sc-color-gray-400)',
  },
  {
    labelKey: 'memory.player.sentiment.negative',
    summaryKey: 'memory.player.sentiment.negative_summary',
    color: 'var(--sc-color-amber-500)',
  },
] as const;

const SUMMARY_TEMPLATES: readonly string[] = [
  'El cliente reporta una incidencia de servicio activa desde hace 48 horas. El agente identifica una avería de zona ya reportada, escala a prioridad alta y compromete una compensación en la próxima factura.',
  'Conversación comercial sobre el plan empresarial. El interesado pregunta por capacidad para 50 usuarios y precio; el agente recomienda Pro, propone descuento anual y agenda demo para el viernes.',
  'Soporte técnico urgente: el cliente describe un sistema sin arranque. Tras un protocolo de modo seguro, se restablece el acceso y la incidencia se escala a nivel 2 para limpieza de logs.',
  'Disputa de facturación. El cliente cuestiona un cargo de 45,50 € por finalización de promoción. El agente reconoce el malentendido, aplica una bonificación del 20 % durante tres meses y cierra acordada.',
  'Seguimiento de pedido. El agente confirma fecha y franja de entrega, indica que se enviará tracking en tiempo real y aclara que la instalación está incluida.',
  'Solicitud de baja del servicio premium por uso esporádico. El agente ofrece un plan reducido al 50 % con cupo mensual de 20 horas; el cliente acepta y se programa el cambio para el próximo periodo.',
];
