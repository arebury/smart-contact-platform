import { MessageSquare } from "lucide-react";
import { useIntencionesStore } from "./useIntencionesStore";
import { RepositoryListPage } from "../shared/RepositoryListPage";
import type { Intencion } from "./intencionesData";
import type { RepoColumnDef, RepoFieldDef } from "../shared/RepositoryListPage";

const columns: RepoColumnDef<Intencion>[] = [
  {
    key: "name",
    label: "Nombre",
    width: "w-44",
    render: (item) => (
      <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>{item.name}</span>
    ),
  },
  {
    key: "category",
    label: "Categoría",
    width: "w-28",
    render: (item) => (
      <span className="text-[11px] text-gray-500 px-1.5 py-0.5 border border-gray-200 bg-gray-50" style={{ fontWeight: 500 }}>
        {item.category}
      </span>
    ),
  },
  {
    key: "examples",
    label: "Ejemplos",
    render: (item) => (
      <span className="text-[12px] text-gray-500 line-clamp-1">{item.examples}</span>
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
  { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Consultar factura" },
  { key: "category", label: "Categoría", type: "select", options: [
    { value: "General", label: "General" },
    { value: "Facturación", label: "Facturación" },
    { value: "Soporte", label: "Soporte" },
    { value: "Ventas", label: "Ventas" },
    { value: "Gestión", label: "Gestión" },
    { value: "Reclamación", label: "Reclamación" },
  ]},
  { key: "examples", label: "Frases de ejemplo", type: "textarea", required: true, placeholder: "Frases separadas por coma..." },
  { key: "description", label: "Descripción", type: "text", placeholder: "Breve descripción..." },
];

export function IntencionesPage() {
  const { intenciones, addIntencion, updateIntencion, deleteIntencion, deleteIntenciones } = useIntencionesStore();

  return (
    <RepositoryListPage<Intencion>
      title="Intenciones"
      entityName="intención"
      entityNamePlural="intenciones"
      breadcrumbs={[
        { label: "Administración", path: "/admin/usuarios" },
        { label: "Repositorios", path: "/admin/repositorios" },
        { label: "Intenciones" },
      ]}
      icon={<MessageSquare size={20} />}
      items={intenciones}
      columns={columns}
      searchKeys={["name", "category", "examples", "description"]}
      formFields={formFields}
      onAdd={(data) => addIntencion(data as unknown as Omit<Intencion, "id">)}
      onUpdate={(id, data) => updateIntencion(id, data)}
      onDelete={deleteIntencion}
      onDeleteMany={deleteIntenciones}
    />
  );
}
