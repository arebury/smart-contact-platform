import { Variable as VariableIcon } from "lucide-react";
import { useVariablesStore } from "./useVariablesStore";
import { RepositoryListPage } from "../shared/RepositoryListPage";
import type { Variable } from "./variablesData";
import type { RepoColumnDef, RepoFieldDef } from "../shared/RepositoryListPage";

const columns: RepoColumnDef<Variable>[] = [
  {
    key: "name",
    label: "Nombre",
    width: "w-44",
    render: (item) => (
      <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>{item.name}</span>
    ),
  },
  {
    key: "key",
    label: "Clave",
    width: "w-32",
    render: (item) => (
      <code className="text-[12px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5">{item.key}</code>
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
    key: "defaultValue",
    label: "Valor por defecto",
    width: "w-36",
    render: (item) => (
      <span className="text-[12px] text-gray-400">{item.defaultValue || "—"}</span>
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
  { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Nombre del agente" },
  { key: "key", label: "Clave", type: "text", required: true, placeholder: "{mi_variable}" },
  { key: "type", label: "Tipo", type: "select", options: [
    { value: "text", label: "Texto" },
    { value: "number", label: "Número" },
    { value: "date", label: "Fecha" },
    { value: "boolean", label: "Booleano" },
  ]},
  { key: "defaultValue", label: "Valor por defecto", type: "text", placeholder: "Valor si no se resuelve..." },
  { key: "description", label: "Descripción", type: "text", placeholder: "Breve descripción..." },
];

export function VariablesPage() {
  const { variables, addVariable, updateVariable, deleteVariable, deleteVariables } = useVariablesStore();

  return (
    <RepositoryListPage<Variable>
      title="Variables"
      entityName="variable"
      entityNamePlural="variables"
      breadcrumbs={[
        { label: "Administración", path: "/admin/usuarios" },
        { label: "Repositorios", path: "/admin/repositorios" },
        { label: "Variables" },
      ]}
      icon={<VariableIcon size={20} />}
      items={variables}
      columns={columns}
      searchKeys={["name", "key", "description"]}
      formFields={formFields}
      onAdd={(data) => addVariable(data as unknown as Omit<Variable, "id">)}
      onUpdate={(id, data) => updateVariable(id, data)}
      onDelete={deleteVariable}
      onDeleteMany={deleteVariables}
    />
  );
}
