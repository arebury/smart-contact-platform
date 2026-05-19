import { MOCK_CONVERSATIONS } from './conversations-mock';
import type { Conversation } from './conversation.types';

/**
 * Mock-data samples · prototype-only feature (S39).
 *
 * Cada sample es una re-shaping del mock base `MOCK_CONVERSATIONS` que
 * demuestra un estado distinto del prototipo. La `ConversationsPage`
 * expone un switcher arriba a la derecha (clase demo) para que Rafa,
 * Marta o un stakeholder cycle entre escenarios sin recargar mock
 * manualmente.
 *
 * Réplica del prototipo React `data/mockSamples.ts` adaptado al mock
 * Angular (15 entries vs 156 React). Las muestras se reducen al
 * subset que tiene sentido con la base actual.
 *
 * ⚠️ PURGA PRE-DEPLOY · stakeholder no técnico:
 *   Antes de cualquier deploy real / cliente final, eliminar:
 *     · Este archivo (`mock-samples.ts`).
 *     · `MockSampleSwitcherComponent` y su uso en `ConversationsPage`.
 *     · La signal `currentSampleId` y el método `setSample()` del
 *       `ConversationsStore`.
 *   Sustituir por una carga directa de `MOCK_CONVERSATIONS` (o del
 *   backend cuando exista). Sec 17 P3 (canon React).
 */

export interface MockSample {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly build: () => readonly Conversation[];
}

/** Clone shallow + arrays profundos para evitar mutación accidental. */
const clone = (c: Conversation): Conversation => ({
  ...c,
  recordings: c.recordings ? c.recordings.map((r) => ({ ...r })) : undefined,
  transcription: c.transcription ? c.transcription.map((l) => ({ ...l })) : undefined,
});

const cloneAll = (): Conversation[] => MOCK_CONVERSATIONS.map(clone);

export const MOCK_SAMPLES: readonly MockSample[] = [
  {
    id: 'default',
    label: 'Estado mixto',
    description:
      'Mezcla realista — el conjunto base con grabación, transcripción y análisis en distintos estados.',
    build: () => cloneAll(),
  },
  {
    id: 'all-pending',
    label: 'Todo por procesar',
    description:
      'Llamadas sin transcripción ni análisis. Los chats mantienen transcripción (siempre la tienen por definición).',
    build: () =>
      cloneAll().map((c) => {
        if (c.channel === 'chat') return c;
        return {
          ...c,
          hasTranscription: false,
          hasAnalysis: false,
          hasFailedTranscription: false,
          transcription: undefined,
          recordings: c.recordings
            ? c.recordings.map((r) => ({ ...r, hasTranscription: false }))
            : undefined,
        };
      }),
  },
  {
    id: 'all-done',
    label: 'Todo procesado',
    description: 'Todo grabado, transcrito y analizado. Demuestra el estado C1 (todo procesado).',
    build: () =>
      cloneAll().map((c) => {
        if (c.deleted) return c; // respetar custodia GDPR vencida
        return {
          ...c,
          hasRecording: c.channel === 'llamada' ? true : c.hasRecording,
          hasTranscription: true,
          hasAnalysis: true,
          hasFailedTranscription: false,
          recordings: c.recordings
            ? c.recordings.map((r) => ({ ...r, hasTranscription: true }))
            : undefined,
        };
      }),
  },
  {
    id: 'calls-only-untranscribed',
    label: 'Solo llamadas pendientes',
    description:
      'Solo llamadas con grabación pero sin transcripción. Perfecto para mostrar el flujo principal de transcribir.',
    build: () =>
      cloneAll()
        .filter((c) => c.channel === 'llamada' && c.hasRecording && !c.deleted)
        .map((c) => ({
          ...c,
          hasTranscription: false,
          hasAnalysis: false,
          hasFailedTranscription: false,
          transcription: undefined,
          recordings: c.recordings
            ? c.recordings.map((r) => ({ ...r, hasTranscription: false }))
            : undefined,
        })),
  },
  {
    id: 'chats-only',
    label: 'Solo chats',
    description:
      'Conjunto reducido a chats — todos transcritos por definición. Demuestra que el toggle de análisis arranca activado.',
    build: () => cloneAll().filter((c) => c.channel === 'chat'),
  },
  {
    id: 'small',
    label: 'Conjunto reducido',
    description: 'Las primeras 8 conversaciones para vistas más cómodas o capturas.',
    build: () => cloneAll().slice(0, 8),
  },
  {
    id: 'multi-recording',
    label: 'Solo multi-grabación',
    description:
      'Conversaciones que pasaron por IVR con transferencia entre grupos — cada tramo es una grabación distinta.',
    build: () => cloneAll().filter((c) => c.recordings && c.recordings.length > 1),
  },
  {
    id: 'only-failed',
    label: 'Solo fallidas',
    description:
      'Conversaciones con transcripción fallida. Demuestra el estado terminal rojo + filtro "Solo fallidas" + acción "Marcar como leídas".',
    build: () =>
      cloneAll()
        .filter((c) => c.channel === 'llamada' && c.hasRecording && !c.deleted)
        .map((c) => ({
          ...c,
          hasTranscription: false,
          hasAnalysis: false,
          hasFailedTranscription: true,
          transcription: undefined,
        })),
  },
  {
    id: 'gdpr-expired',
    label: 'Custodia GDPR vencida',
    description:
      'Conversaciones con custodia GDPR vencida — fila atenuada, tooltip explicativo, excluidas del bulk en silencio (COA §"Custodia GDPR").',
    build: () =>
      cloneAll()
        .slice(0, 6)
        .map((c) => ({
          ...c,
          deleted: true,
          hasRecording: c.channel === 'llamada' ? false : c.hasRecording,
          hasTranscription: false,
          hasAnalysis: false,
        })),
  },
  {
    id: 'multi-tramo-parcial',
    label: 'Multi-tramo parcial',
    description:
      'Llamadas multi-grabación donde unos tramos están transcritos y otros no — caveat documentado en COA §"Multi-tramo parcial".',
    build: () =>
      cloneAll()
        .filter((c) => c.recordings && c.recordings.length > 1)
        .map((c) => {
          if (!c.recordings) return c;
          // Primer tramo transcrito, resto no — estado "parcialmente transcrito".
          const recordings = c.recordings.map((r, idx) => ({
            ...r,
            hasTranscription: idx === 0,
          }));
          return {
            ...c,
            hasTranscription: false, // agregado: solo si TODOS los tramos lo están
            hasAnalysis: false,
            recordings,
          };
        }),
  },
  {
    id: 'no-recording',
    label: 'Llamadas sin grabación',
    description:
      'Llamadas que entraron pero no quedaron grabadas — estado "Sin grabación" en el reproductor (COA §"Estados de la pestaña Transcripción" #2).',
    build: () =>
      cloneAll()
        .filter((c) => c.channel === 'llamada')
        .slice(0, 8)
        .map((c) => ({
          ...c,
          hasRecording: false,
          hasTranscription: false,
          hasAnalysis: false,
          hasFailedTranscription: false,
          transcription: undefined,
          recordings: undefined,
        })),
  },
];

export const DEFAULT_SAMPLE_ID = 'default';

export function getSample(id: string): MockSample {
  return MOCK_SAMPLES.find((s) => s.id === id) ?? MOCK_SAMPLES[0];
}
