/* ═══════════════════════════════════════════════════════
   Agendas — Colecciones de números telefónicos
   ═══════════════════════════════════════════════════════ */

export interface Agenda {
  id: number;
  name: string;
  numbers: string;
  description: string;
  status: string;
}

export const agendasData: Agenda[] = [
  { id: 1, name: "Ventas Nacional", numbers: "900 100 200, 900 100 201, 900 100 202", description: "Números de ventas para el mercado nacional", status: "active" },
  { id: 2, name: "Soporte Premium", numbers: "900 200 300, 900 200 301", description: "Líneas dedicadas a clientes premium", status: "active" },
  { id: 3, name: "Cobros", numbers: "900 300 400, 900 300 401, 900 300 402, 900 300 403", description: "Números para gestión de cobros e impagos", status: "active" },
  { id: 4, name: "Emergencias 24h", numbers: "900 400 500", description: "Línea de emergencias disponible 24 horas", status: "active" },
  { id: 5, name: "Internacional LATAM", numbers: "+1 800 555 1234, +52 800 123 4567", description: "Números internacionales para Latinoamérica", status: "active" },
  { id: 6, name: "Soporte Técnico", numbers: "900 500 600, 900 500 601", description: "Líneas de soporte técnico general", status: "inactive" },
  { id: 7, name: "Campañas Outbound", numbers: "911 222 333, 911 222 334, 911 222 335", description: "Números para campañas salientes", status: "active" },
  { id: 8, name: "Retención", numbers: "900 600 700", description: "Línea especializada en retención de clientes", status: "active" },
];
