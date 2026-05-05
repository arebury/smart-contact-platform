import { Phone } from "lucide-react";
import { useAgendasStore } from "./useAgendasStore";
import { RepositoryListPage } from "../shared/RepositoryListPage";
import type { Agenda } from "./agendasData";
import type { RepoColumnDef, RepoFieldDef } from "../shared/RepositoryListPage";

const columns: RepoColumnDef<Agenda>[] = [
  {
    key: "name",
    label: "Nombre",
    width: "w-48",
    render: (item) => (
      <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>{item.name}</span>
    ),
  },
  {
    key: "numbers",
    label: "Números",
    render: (item) => (
      <span className="text-[12px] text-gray-500 line-clamp-1">{item.numbers}</span>
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
  { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Ventas Nacional" },
  { key: "numbers", label: "Números", type: "textarea", required: true, placeholder: "900 100 200, 900 100 201..." },
  { key: "description", label: "Descripción", type: "text", placeholder: "Breve descripción..." },
  { key: "status", label: "Estado", type: "select", options: [
    { value: "active", label: "Activa" },
    { value: "inactive", label: "Inactiva" },
  ]},
];

export function AgendasPage() {
  const { agendas, addAgenda, updateAgenda, deleteAgenda, deleteAgendas } = useAgendasStore();

  return (
    <RepositoryListPage<Agenda>
      title="Agendas"
      entityName="agenda"
      entityNamePlural="agendas"
      breadcrumbs={[
        { label: "Administración", path: "/admin/usuarios" },
        { label: "Repositorios", path: "/admin/repositorios" },
        { label: "Agendas" },
      ]}
      icon={<Phone size={20} />}
      items={agendas}
      columns={columns}
      searchKeys={["name", "numbers", "description"]}
      formFields={formFields}
      onAdd={(data) => addAgenda({ ...data, id: 0 } as unknown as Omit<Agenda, "id">)}
      onUpdate={(id, data) => updateAgenda(id, data)}
      onDelete={deleteAgenda}
      onDeleteMany={deleteAgendas}
    />
  );
}
