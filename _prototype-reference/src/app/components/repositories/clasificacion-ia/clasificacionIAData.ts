/* ═══════════════════════════════════════════════════════
   Clasificación IA — Modelos de clasificación automática
   ═══════════════════════════════════════════════════════ */

export interface ClasificacionIA {
  id: number;
  name: string;
  model: string;
  categories: string;
  accuracy: string;
  description: string;
  status: string;
}

export const clasificacionIAData: ClasificacionIA[] = [
  { id: 1, name: "Clasificador de intenciones", model: "GPT-4o", categories: "Consulta, Venta, Reclamación, Soporte, Baja", accuracy: "94.2%", description: "Clasificación automática de la intención principal del cliente", status: "active" },
  { id: 2, name: "Detector de urgencia", model: "GPT-4o-mini", categories: "Baja, Media, Alta, Crítica", accuracy: "91.7%", description: "Clasifica la urgencia del mensaje para priorizar en cola", status: "active" },
  { id: 3, name: "Clasificador de productos", model: "Claude 3.5", categories: "Internet, Móvil, TV, Pack, Otros", accuracy: "96.1%", description: "Identifica el producto sobre el que trata la conversación", status: "active" },
  { id: 4, name: "Análisis de satisfacción", model: "GPT-4o", categories: "Muy insatisfecho, Insatisfecho, Neutro, Satisfecho, Muy satisfecho", accuracy: "88.5%", description: "Predice el nivel de satisfacción del cliente durante la conversación", status: "active" },
  { id: 5, name: "Detección de fraude", model: "Claude 3.5", categories: "Legítimo, Sospechoso, Fraude potencial", accuracy: "97.3%", description: "Identifica patrones de conversación asociados a fraude", status: "inactive" },
  { id: 6, name: "Segmentación de cliente", model: "GPT-4o-mini", categories: "Nuevo, Recurrente, VIP, En riesgo, Inactivo", accuracy: "89.8%", description: "Clasifica al cliente según su perfil y comportamiento", status: "active" },
];
