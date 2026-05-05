/* ═══════════════════════════════════════════════════════
   Entidades IA — Entidades semánticas gestionadas por LLMs
   ═══════════════════════════════════════════════════════ */

export interface EntidadIA {
  id: number;
  name: string;
  type: string;
  model: string;
  description: string;
  status: string;
}

export const entidadesIAData: EntidadIA[] = [
  { id: 1, name: "Sentimiento", type: "clasificación", model: "GPT-4o", description: "Detecta el sentimiento general del cliente (positivo, negativo, neutro)", status: "active" },
  { id: 2, name: "Urgencia", type: "puntuación", model: "GPT-4o", description: "Puntúa de 1 a 5 la urgencia percibida del mensaje", status: "active" },
  { id: 3, name: "Tema principal", type: "extracción", model: "GPT-4o", description: "Extrae el tema principal de la conversación", status: "active" },
  { id: 4, name: "Datos personales", type: "extracción", model: "Claude 3.5", description: "Identifica y extrae datos personales mencionados", status: "active" },
  { id: 5, name: "Idioma", type: "clasificación", model: "GPT-4o-mini", description: "Detecta el idioma de la conversación", status: "active" },
  { id: 6, name: "Resumen", type: "generación", model: "GPT-4o", description: "Genera un resumen conciso de la conversación", status: "inactive" },
  { id: 7, name: "Siguiente mejor acción", type: "recomendación", model: "Claude 3.5", description: "Sugiere la siguiente acción óptima para el agente", status: "active" },
];
