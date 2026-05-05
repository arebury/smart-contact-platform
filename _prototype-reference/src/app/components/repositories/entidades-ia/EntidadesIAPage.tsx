import { Box } from "lucide-react";
import { useEntidadesIAStore } from "./useEntidadesIAStore";
import { RepositoryListPage } from "../shared/RepositoryListPage";
import type { EntidadIA } from "./entidadesIAData";
import type { RepoColumnDef, RepoFieldDef } from "../shared/RepositoryListPage";

const columns: RepoColumnDef<EntidadIA>[] = [
  {
    key: "name",
    label: "Nombre",
    width: "w-44",
    render: (item) => (
      <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>{item.name}</span>
    ),
  },
  {
    key: "type",
    label: "Tipo",
    width: "w-28",
    render: (item) => (
      <span className="text-[11px] text-gray-500 px-1.5 py-0.5 border border-gray-200 bg-gray-50" style={{ fontWeight: 500 }}>
        {item.type}
      </span>
    ),
  },
  {
    key: "model",
    label: "Modelo",
    width: "w-28",
    render: (item) => (
      <span className="text-[12px] text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5" style={{ fontWeight: 500 }}>
        {item.model}
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
        {item.status === "active" ? "Activa" : "Inactiva"}
      </span>
    ),
  },
];

const formFields: RepoFieldDef[] = [
  { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Sentimiento" },
  { key: "type", label: "Tipo", type: "select", options: [
    { value: "clasificación", label: "Clasificación" },
    { value: "extracción", label: "Extracción" },
    { value: "puntuación", label: "Puntuación" },
    { value: "generación", label: "Generación" },
    { value: "recomendación", label: "Recomendación" },
  ]},
  { key: "model", label: "Modelo", type: "select", options: [
    { value: "GPT-4o", label: "GPT-4o" },
    { value: "GPT-4o-mini", label: "GPT-4o-mini" },
    { value: "Claude 3.5", label: "Claude 3.5" },
    { value: "Claude 3 Haiku", label: "Claude 3 Haiku" },
  ]},
  { key: "description", label: "Descripción", type: "text", placeholder: "Breve descripción..." },
  { key: "status", label: "Estado", type: "select", options: [
    { value: "active", label: "Activa" },
    { value: "inactive", label: "Inactiva" },
  ]},
];

export function EntidadesIAPage() {
  const { entidades, addEntidad, updateEntidad, deleteEntidad, deleteEntidades } = useEntidadesIAStore();

  return (
    <RepositoryListPage<EntidadIA>
      title="Entidades IA"
      entityName="entidad IA"
      entityNamePlural="entidades IA"
      breadcrumbs={[
        { label: "Administración", path: "/admin/usuarios" },
        { label: "Repositorios", path: "/admin/repositorios" },
        { label: "Entidades IA" },
      ]}
      icon={<Box size={20} />}
      items={entidades}
      columns={columns}
      searchKeys={["name", "type", "model", "description"]}
      formFields={formFields}
      onAdd={(data) => addEntidad(data as unknown as Omit<EntidadIA, "id">)}
      onUpdate={(id, data) => updateEntidad(id, data)}
      onDelete={deleteEntidad}
      onDeleteMany={deleteEntidades}
    />
  );
}
