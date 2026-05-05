/* ═══════════════════════════════════════════════════════
   Labels — Data model & seed data
   ═══════════════════════════════════════════════════════ */

export interface Label {
  id: number;
  name: string;
  color: LabelColor;
  description?: string;
}

/** Fixed palette — 8 distinguishable, low-fi-friendly colors */
export type LabelColor =
  | "gray"
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "teal"
  | "blue"
  | "purple";

export const LABEL_COLORS: LabelColor[] = [
  "gray",
  "red",
  "orange",
  "amber",
  "green",
  "teal",
  "blue",
  "purple",
];

/** Tailwind class sets for each color — subtle chips that don't overwhelm the low-fi aesthetic */
export const labelColorStyles: Record<
  LabelColor,
  { bg: string; text: string; border: string; dot: string }
> = {
  gray:   { bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-300",   dot: "bg-gray-500" },
  red:    { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200",    dot: "bg-red-500" },
  orange: { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  amber:  { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-500" },
  green:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  teal:   { bg: "bg-teal-50",    text: "text-teal-700",   border: "border-teal-200",   dot: "bg-teal-500" },
  blue:   { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500" },
  purple: { bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
};

/* ── Seed data ── */
export const labelsData: Label[] = [
  { id: 1, name: "Orange España",    color: "orange", description: "Agentes asignados al cliente Orange en España" },
  { id: 2, name: "Orange Colombia",  color: "orange", description: "Agentes asignados al cliente Orange en Colombia" },
  { id: 3, name: "Soporte Nivel 1",  color: "blue",   description: "Primer nivel de soporte técnico" },
  { id: 4, name: "Soporte Nivel 2",  color: "purple", description: "Segundo nivel — escalaciones" },
  { id: 5, name: "VIP",              color: "amber",  description: "Agentes con capacitación para clientes VIP" },
  { id: 6, name: "Bilingüe",         color: "teal",   description: "Agentes con capacidad en dos o más idiomas" },
  { id: 7, name: "Turno Mañana",     color: "green" },
  { id: 8, name: "Turno Tarde",      color: "green" },
  { id: 9, name: "Formación",        color: "gray",   description: "En proceso de formación, no asignar a colas críticas" },
  { id: 10, name: "Ventas",          color: "red",    description: "Especializados en campañas de venta outbound" },
];
