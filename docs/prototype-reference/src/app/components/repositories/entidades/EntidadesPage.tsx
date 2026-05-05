import { Box } from "lucide-react";
import { useEntidadesStore } from "./useEntidadesStore";
import { RepositoryListPage } from "../shared/RepositoryListPage";
import type { Entidad } from "./entidadesData";
import type { RepoColumnDef, RepoFieldDef } from "../shared/RepositoryListPage";

const columns: RepoColumnDef<Entidad>[] = [
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
    width: "w-24",
    render: (item) => (
      <span className="text-[11px] text-gray-500 px-1.5 py-0.5 border border-gray-200 bg-gray-50" style={{ fontWeight: 500 }}>
        {item.type}
      </span>
    ),
  },
  {
    key: "values",
    label: "Valores / Patrón",
    render: (item) => (
      <span className="text-[12px] text-gray-500 line-clamp-1 font-mono">{item.values || "—"}</span>
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
  { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Producto" },
  { key: "type", label: "Tipo", type: "select", options: [
    { value: "text", label: "Texto libre" },
    { value: "list", label: "Lista de valores" },
    { value: "regex", label: "Expresión regular" },
    { value: "number", label: "Número" },
    { value: "date", label: "Fecha" },
  ]},
  { key: "values", label: "Valores / Patrón", type: "textarea", placeholder: "Valores separados por coma o patrón regex..." },
  { key: "description", label: "Descripción", type: "text", placeholder: "Breve descripción..." },
];

export function EntidadesPage() {
  const { entidades, addEntidad, updateEntidad, deleteEntidad, deleteEntidades } = useEntidadesStore();

  return (
    <RepositoryListPage<Entidad>
      title="Entidades"
      entityName="entidad"
      entityNamePlural="entidades"
      breadcrumbs={[
        { label: "Administración", path: "/admin/usuarios" },
        { label: "Repositorios", path: "/admin/repositorios" },
        { label: "Entidades" },
      ]}
      icon={<Box size={20} />}
      items={entidades}
      columns={columns}
      searchKeys={["name", "type", "description"]}
      formFields={formFields}
      onAdd={(data) => addEntidad(data as unknown as Omit<Entidad, "id">)}
      onUpdate={(id, data) => updateEntidad(id, data)}
      onDelete={deleteEntidad}
      onDeleteMany={deleteEntidades}
    />
  );
}
