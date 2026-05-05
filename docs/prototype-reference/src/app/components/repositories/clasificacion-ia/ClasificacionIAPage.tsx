import { Tags } from "lucide-react";
import { useClasificacionIAStore } from "./useClasificacionIAStore";
import { RepositoryListPage } from "../shared/RepositoryListPage";
import type { ClasificacionIA } from "./clasificacionIAData";
import type { RepoColumnDef, RepoFieldDef } from "../shared/RepositoryListPage";

const columns: RepoColumnDef<ClasificacionIA>[] = [
  {
    key: "name",
    label: "Nombre",
    width: "w-48",
    render: (item) => (
      <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>{item.name}</span>
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
    key: "categories",
    label: "Categorías",
    render: (item) => (
      <span className="text-[12px] text-gray-500 line-clamp-1">{item.categories}</span>
    ),
  },
  {
    key: "accuracy",
    label: "Precisión",
    width: "w-24",
    render: (item) => (
      <span className="text-[12px] text-emerald-600 font-mono" style={{ fontWeight: 500 }}>{item.accuracy}</span>
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
  { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Clasificador de intenciones" },
  { key: "model", label: "Modelo", type: "select", options: [
    { value: "GPT-4o", label: "GPT-4o" },
    { value: "GPT-4o-mini", label: "GPT-4o-mini" },
    { value: "Claude 3.5", label: "Claude 3.5" },
    { value: "Claude 3 Haiku", label: "Claude 3 Haiku" },
  ]},
  { key: "categories", label: "Categorías", type: "textarea", required: true, placeholder: "Categorías separadas por coma..." },
  { key: "accuracy", label: "Precisión", type: "text", placeholder: "Ej: 94.2%" },
  { key: "description", label: "Descripción", type: "text", placeholder: "Breve descripción..." },
  { key: "status", label: "Estado", type: "select", options: [
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
  ]},
];

export function ClasificacionIAPage() {
  const { clasificaciones, addClasificacion, updateClasificacion, deleteClasificacion, deleteClasificaciones } = useClasificacionIAStore();

  return (
    <RepositoryListPage<ClasificacionIA>
      title="Clasificación IA"
      entityName="clasificación IA"
      entityNamePlural="clasificaciones IA"
      breadcrumbs={[
        { label: "Administración", path: "/admin/usuarios" },
        { label: "Repositorios", path: "/admin/repositorios" },
        { label: "Clasificación IA" },
      ]}
      icon={<Tags size={20} />}
      items={clasificaciones}
      columns={columns}
      searchKeys={["name", "model", "categories", "description"]}
      formFields={formFields}
      onAdd={(data) => addClasificacion(data as unknown as Omit<ClasificacionIA, "id">)}
      onUpdate={(id, data) => updateClasificacion(id, data)}
      onDelete={deleteClasificacion}
      onDeleteMany={deleteClasificaciones}
    />
  );
}
