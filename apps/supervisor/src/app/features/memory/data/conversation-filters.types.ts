/**
 * Modelo de los filtros aplicados al listado de conversaciones.
 *
 * Migrado simplificado desde `ConversationFilters.tsx` del prototipo:
 * el prototipo usa `dateRange: string` (etiquetas tipo "hoy / última
 * semana"); aquí pivoteamos a `date: Date | null` (filter por fecha
 * exacta) porque `sc-datepicker` v1 solo soporta single date. Si Marta
 * pide rangos, escalamos en iter futura.
 */
export interface MemoryConversationFilters {
  readonly services: readonly string[];
  readonly date: Date | null;
  readonly origin: string;
  readonly destination: string;
  readonly groups: readonly string[];
  readonly agents: readonly string[];
}

export const EMPTY_FILTERS: MemoryConversationFilters = {
  services: [],
  date: null,
  origin: '',
  destination: '',
  groups: [],
  agents: [],
};
