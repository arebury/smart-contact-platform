/* ═══════════════════════════════════════════════════════
   Reglas IA — Reglas de negocio para el motor de IA
   ═══════════════════════════════════════════════════════ */

export interface ReglaIA {
  id: number;
  name: string;
  condition: string;
  action: string;
  priority: string;
  status: string;
}

export const reglasIAData: ReglaIA[] = [
  { id: 1, name: "Escalación por sentimiento negativo", condition: "sentiment_score < -0.7", action: "Transferir a agente humano", priority: "high", status: "active" },
  { id: 2, name: "Detección de intención de baja", condition: "intent = 'cancelar' AND tenure < 6m", action: "Transferir a retención", priority: "high", status: "active" },
  { id: 3, name: "Respuesta automática FAQ", condition: "confidence > 0.95 AND topic IN faq_topics", action: "Responder con artículo KB", priority: "medium", status: "active" },
  { id: 4, name: "Sugerencia de upsell", condition: "intent = 'contratar' AND plan = 'basic'", action: "Ofrecer plan premium", priority: "low", status: "active" },
  { id: 5, name: "Idioma no soportado", condition: "detected_lang NOT IN supported_langs", action: "Transferir a cola multiidioma", priority: "medium", status: "active" },
  { id: 6, name: "Cliente VIP detectado", condition: "customer_tier = 'vip'", action: "Priorizar en cola + notificar supervisor", priority: "high", status: "active" },
  { id: 7, name: "Timeout de conversación", condition: "silence_duration > 5min", action: "Enviar mensaje de seguimiento", priority: "low", status: "inactive" },
  { id: 8, name: "Doble verificación de identidad", condition: "action = 'cambio_datos' AND verified = false", action: "Solicitar verificación adicional", priority: "high", status: "active" },
];
