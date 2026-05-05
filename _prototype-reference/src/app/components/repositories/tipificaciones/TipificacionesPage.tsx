import { Tags } from "lucide-react";
import { useTipificacionesStore } from "./useTipificacionesStore";
import { RepositoryListPage } from "../shared/RepositoryListPage";
import type { Tipificacion } from "./tipificacionesData";
import type { RepoColumnDef, RepoFieldDef } from "../shared/RepositoryListPage";

const columns: RepoColumnDef<Tipificacion>[] = [
  {
    key: "name",
    label: "Nombre",
    width: "w-48",
    render: (item) => (
      <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>{item.name}</span>
    ),
  },
  {
    key: "code",
    label: "Código",
    width: "w-28",
    render: (item) => (
      <span className="text-[12px] text-gray-500 font-mono">{item.code}</span>
    ),
  },
  {
    key: "category",
    label: "Categoría",
    width: "w-32",
    render: (item) => (
      <span className="text-[11px] text-gray-500 px-1.5 py-0.5 border border-gray-200 bg-gray-50" style={{ fontWeight: 500 }}>
        {item.category}
      </span>
    ),
  },
  {
    key: "description",
    label: "Descripción",
    render: (item) => (
      <span className="text-[12px] text-gray-400 line-clamp-1">{item.description}</span>
    ),
  },
];

const formFields: RepoFieldDef[] = [
  { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Consulta resuelta" },
  { key: "code", label: "Código", type: "text", required: true, placeholder: "CON-001" },
  { key: "category", label: "Categoría", type: "select", options: [
    { value: "Consulta", label: "Consulta" },
    { value: "Ventas", label: "Ventas" },
    { value: "Reclamación", label: "Reclamación" },
    { value: "Soporte", label: "Soporte" },
    { value: "Otros", label: "Otros" },
  ]},
  { key: "description", label: "Descripción", type: "text", placeholder: "Breve descripción..." },
];

export function TipificacionesPage() {
  const { tipificaciones, addTipificacion, updateTipificacion, deleteTipificacion, deleteTipificaciones } = useTipificacionesStore();

  return (
    <RepositoryListPage<Tipificacion>
      title="Tipificaciones"
      entityName="tipificación"
      entityNamePlural="tipificaciones"
      breadcrumbs={[
        { label: "Administración", path: "/admin/usuarios" },
        { label: "Repositorios", path: "/admin/repositorios" },
        { label: "Tipificaciones" },
      ]}
      icon={<Tags size={20} />}
      items={tipificaciones}
      columns={columns}
      searchKeys={["name", "code", "category", "description"]}
      formFields={formFields}
      onAdd={(data) => addTipificacion(data as unknown as Omit<Tipificacion, "id">)}
      onUpdate={(id, data) => updateTipificacion(id, data)}
      onDelete={deleteTipificacion}
      onDeleteMany={deleteTipificaciones}
    />
  );
}
