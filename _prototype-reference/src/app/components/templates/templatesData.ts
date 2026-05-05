export interface Template {
  id: number;
  title: string;
  type: "chat" | "email";
  body: string;
  createdAt: string;
  updatedAt: string;
}

export const defaultTemplates: Template[] = [
  { id: 1, title: "Saludo inicial", type: "chat", body: "Hola, soy {agente}. \u00bfEn qu\u00e9 puedo ayudarle?", createdAt: "2025-11-02", updatedAt: "2025-11-02" },
  { id: 2, title: "Solicitud de datos", type: "chat", body: "Para poder ayudarle necesito que me facilite su n\u00famero de referencia.", createdAt: "2025-11-03", updatedAt: "2025-12-10" },
  { id: 3, title: "Despedida chat", type: "chat", body: "Gracias por contactar con nosotros. \u00bfPuedo ayudarle en algo m\u00e1s?", createdAt: "2025-11-03", updatedAt: "2025-11-03" },
  { id: 4, title: "Transferencia informada", type: "chat", body: "Le voy a transferir con un especialista que podr\u00e1 atenderle mejor.", createdAt: "2025-11-05", updatedAt: "2025-11-05" },
  { id: 5, title: "Espera en cola", type: "chat", body: "Le pido disculpas por la espera. En breve le atenderemos.", createdAt: "2025-11-10", updatedAt: "2026-01-15" },
  { id: 6, title: "Confirmaci\u00f3n de pedido", type: "email", body: "Estimado/a {cliente}, le confirmamos que su pedido #{ref} ha sido procesado correctamente.", createdAt: "2025-11-12", updatedAt: "2025-11-12" },
  { id: 7, title: "Respuesta a reclamaci\u00f3n", type: "email", body: "Estimado/a {cliente}, hemos recibido su reclamaci\u00f3n y la estamos revisando.", createdAt: "2025-11-14", updatedAt: "2026-02-01" },
  { id: 8, title: "Seguimiento de incidencia", type: "email", body: "Le informamos de que su incidencia #{ref} ha sido actualizada.", createdAt: "2025-11-18", updatedAt: "2025-11-18" },
  { id: 9, title: "Encuesta de satisfacci\u00f3n", type: "email", body: "Nos gustar\u00eda conocer su opini\u00f3n sobre la atenci\u00f3n recibida.", createdAt: "2025-12-01", updatedAt: "2025-12-01" },
  { id: 10, title: "Cierre de caso", type: "email", body: "Le comunicamos que su caso #{ref} ha sido resuelto satisfactoriamente.", createdAt: "2025-12-05", updatedAt: "2025-12-05" },
  { id: 11, title: "Fuera de horario", type: "chat", body: "Nuestro horario de atenci\u00f3n es de L-V 9:00 a 18:00. Le atenderemos lo antes posible.", createdAt: "2025-12-10", updatedAt: "2025-12-10" },
  { id: 12, title: "Promoci\u00f3n activa", type: "email", body: "Estimado/a {cliente}, le informamos de nuestra nueva promoci\u00f3n vigente hasta {fecha}.", createdAt: "2026-01-08", updatedAt: "2026-01-08" },
];
