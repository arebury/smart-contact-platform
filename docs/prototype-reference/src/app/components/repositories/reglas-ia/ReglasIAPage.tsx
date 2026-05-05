import { Sparkles } from "lucide-react";
import { useReglasIAStore } from "./useReglasIAStore";
import { RepositoryListPage } from "../shared/RepositoryListPage";
import type { ReglaIA } from "./reglasIAData";
import type { RepoColumnDef, RepoFieldDef } from "../shared/RepositoryListPage";

const priorityStyles: Record<string, string> = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-gray-500 bg-gray-50 border-gray-200",
};

const priorityLabels: Record<string, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const columns: RepoColumnDef<ReglaIA>[] = [
  {
    key: "name",
    label: "Nombre",
    width: "w-52",
    render: (item) => (
      <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>{item.name}</span>
    ),
  },
  {
    key: "condition",
    label: "Condición",
    render: (item) => (
      <span className="text-[12px] text-gray-500 font-mono line-clamp-1">{item.condition}</span>
    ),
  },
  {
    key: "action",
    label: "Acción",
    render: (item) => (
      <span className="text-[12px] text-gray-500 line-clamp-1">{item.action}</span>
    ),
  },
  {
    key: "priority",
    label: "Prioridad",
    width: "w-24",
    render: (item) => (
      <span className={`text-[11px] px-1.5 py-0.5 border ${priorityStyles[item.priority] ?? priorityStyles.low}`} style={{ fontWeight: 500 }}>
        {priorityLabels[item.priority] ?? item.priority}
      </span>
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
  { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Escalación por sentimiento" },
  { key: "condition", label: "Condición", type: "text", required: true, placeholder: "sentiment_score < -0.7" },
  { key: "action", label: "Acción", type: "text", required: true, placeholder: "Transferir a agente humano" },
  { key: "priority", label: "Prioridad", type: "select", options: [
    { value: "high", label: "Alta" },
    { value: "medium", label: "Media" },
    { value: "low", label: "Baja" },
  ]},
  { key: "status", label: "Estado", type: "select", options: [
    { value: "active", label: "Activa" },
    { value: "inactive", label: "Inactiva" },
  ]},
];

export function ReglasIAPage() {
  const { reglas, addRegla, updateRegla, deleteRegla, deleteReglas } = useReglasIAStore();

  return (
    <RepositoryListPage<ReglaIA>
      title="Reglas IA"
      entityName="regla IA"
      entityNamePlural="reglas IA"
      breadcrumbs={[
        { label: "Administración", path: "/admin/usuarios" },
        { label: "Repositorios", path: "/admin/repositorios" },
        { label: "Reglas IA" },
      ]}
      icon={<Sparkles size={20} />}
      items={reglas}
      columns={columns}
      searchKeys={["name", "condition", "action"]}
      formFields={formFields}
      onAdd={(data) => addRegla(data as unknown as Omit<ReglaIA, "id">)}
      onUpdate={(id, data) => updateRegla(id, data)}
      onDelete={deleteRegla}
      onDeleteMany={deleteReglas}
    />
  );
}
