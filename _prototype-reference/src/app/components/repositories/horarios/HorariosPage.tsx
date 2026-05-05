import { Clock } from "lucide-react";
import { useHorariosStore } from "./useHorariosStore";
import { RepositoryListPage } from "../shared/RepositoryListPage";
import type { Horario } from "./horariosData";
import type { RepoColumnDef, RepoFieldDef } from "../shared/RepositoryListPage";

const columns: RepoColumnDef<Horario>[] = [
  {
    key: "name",
    label: "Nombre",
    width: "w-44",
    render: (item) => (
      <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>{item.name}</span>
    ),
  },
  {
    key: "schedule",
    label: "Franja",
    width: "w-44",
    render: (item) => (
      <span className="text-[12px] text-gray-500 font-mono">{item.schedule}</span>
    ),
  },
  {
    key: "timezone",
    label: "Zona horaria",
    width: "w-40",
    render: (item) => (
      <span className="text-[12px] text-gray-400">{item.timezone}</span>
    ),
  },
  {
    key: "status",
    label: "Estado",
    width: "w-24",
    render: (item) => (
      <span className={`text-[11px] px-1.5 py-0.5 border ${
        item.status === "active"
          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
          : "text-gray-400 bg-gray-50 border-gray-200"
      }`} style={{ fontWeight: 500 }}>
        {item.status === "active" ? "Activo" : "Inactivo"}
      </span>
    ),
  },
];

const formFields: RepoFieldDef[] = [
  { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Turno Mañana" },
  { key: "schedule", label: "Franja horaria", type: "text", required: true, placeholder: "L-V 09:00–18:00" },
  { key: "timezone", label: "Zona horaria", type: "select", options: [
    { value: "Europe/Madrid", label: "Europe/Madrid" },
    { value: "Europe/London", label: "Europe/London" },
    { value: "America/Mexico_City", label: "America/Mexico_City" },
    { value: "America/Bogota", label: "America/Bogota" },
    { value: "America/Buenos_Aires", label: "America/Buenos_Aires" },
    { value: "America/New_York", label: "America/New_York" },
  ]},
  { key: "description", label: "Descripción", type: "text", placeholder: "Breve descripción..." },
  { key: "status", label: "Estado", type: "select", options: [
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
  ]},
];

export function HorariosPage() {
  const { horarios, addHorario, updateHorario, deleteHorario, deleteHorarios } = useHorariosStore();

  return (
    <RepositoryListPage<Horario>
      title="Horarios"
      entityName="horario"
      entityNamePlural="horarios"
      breadcrumbs={[
        { label: "Administración", path: "/admin/usuarios" },
        { label: "Repositorios", path: "/admin/repositorios" },
        { label: "Horarios" },
      ]}
      icon={<Clock size={20} />}
      items={horarios}
      columns={columns}
      searchKeys={["name", "schedule", "description"]}
      formFields={formFields}
      onAdd={(data) => addHorario(data as unknown as Omit<Horario, "id">)}
      onUpdate={(id, data) => updateHorario(id, data)}
      onDelete={deleteHorario}
      onDeleteMany={deleteHorarios}
    />
  );
}
