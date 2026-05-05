/* ═══════════════════════════════════════════════════════
   Horarios — Franjas horarias y turnos operativos
   ═══════════════════════════════════════════════════════ */

export interface Horario {
  id: number;
  name: string;
  schedule: string;
  timezone: string;
  description: string;
  status: string;
}

export const horariosData: Horario[] = [
  { id: 1, name: "Horario General", schedule: "L-V 09:00–18:00", timezone: "Europe/Madrid", description: "Horario estándar de oficina", status: "active" },
  { id: 2, name: "Turno Mañana", schedule: "L-V 07:00–15:00", timezone: "Europe/Madrid", description: "Turno de mañana para soporte", status: "active" },
  { id: 3, name: "Turno Tarde", schedule: "L-V 15:00–23:00", timezone: "Europe/Madrid", description: "Turno de tarde para soporte", status: "active" },
  { id: 4, name: "Turno Noche", schedule: "L-D 23:00–07:00", timezone: "Europe/Madrid", description: "Cobertura nocturna para emergencias", status: "active" },
  { id: 5, name: "Fines de Semana", schedule: "S-D 10:00–14:00", timezone: "Europe/Madrid", description: "Cobertura reducida fines de semana", status: "active" },
  { id: 6, name: "Horario LATAM", schedule: "L-V 14:00–22:00", timezone: "America/Mexico_City", description: "Adaptado al horario de Latinoamérica", status: "active" },
  { id: 7, name: "24/7 Emergencias", schedule: "L-D 00:00–23:59", timezone: "Europe/Madrid", description: "Cobertura continua sin interrupciones", status: "active" },
  { id: 8, name: "Horario Verano", schedule: "L-V 08:00–15:00", timezone: "Europe/Madrid", description: "Jornada intensiva de verano (julio–agosto)", status: "inactive" },
];
