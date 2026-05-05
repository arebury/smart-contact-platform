import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useNavigate } from "react-router";
import { TopBar } from "../layout/TopBar";
import { DeleteEntityDialog } from "../shared/DeleteEntityDialog";
import { BulkActionBar } from "../shared/BulkActionBar";
import { type Group } from "./groupsData";
import { availableSchedules } from "../agents/agentsData";
import { useGroupsStore } from "./useGroupsStore";
import { ContextMenu, BulkContextMenu, SortableHeader, ChannelIconWithTooltip } from "../shared/TableComponents";
import { ColumnSelectorDropdown, useColumnVisibility, type ColumnDef } from "../shared/ColumnSelector";
import { useClickOutside } from "../shared/useClickOutside";
import { toast } from "sonner";
import { ImpactPreviewDialog, type ImpactPreviewItem } from "../shared/ImpactPreviewDialog";
import { Tooltip } from "../shared/Tooltip";
import { pushUndo, removeUndo } from "../shared/undoStack";
import { exportToXlsx } from "../shared/exportXlsx";
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Trash2,
  X,
  Users,
  Tags,
  Check,
  FilePen,
} from "lucide-react";

/* ───── Sort types ───── */
type SortField = "name" | "agents" | "priority" | "strategy" | "channels" | "id" | "services";
type SortDir = "asc" | "desc";

const priorityOrder: Record<string, number> = {
  Baja: 0,
  Media: 1,
  Alta: 2,
  "Máxima": 3,
};

/* ───── Priority badge (low-fi: simple bordered text) ───── */
function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Baja: "border-gray-300 text-gray-500",
    Media: "border-gray-400 text-gray-600",
    Alta: "border-gray-500 text-gray-700",
    "Máxima": "border-gray-600 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 border text-[11px] ${styles[priority] || styles.Baja}`}
      style={{ fontWeight: 500 }}
    >
      {priority}
    </span>
  );
}

/* ───── Agent Popover (DD#203: uses shared Tooltip) ───── */
function AgentPopover({ agents, count }: { agents: string[]; count: number }) {
  const maxShow = 8;
  const displayAgents = agents.slice(0, maxShow);
  const remaining = count - displayAgents.length;

  const tooltipContent = agents.length > 0 ? (
    <>
      <div className="space-y-0.5">
        {displayAgents.map((agent, i) => (
          <div key={i} className="text-white/90">{agent}</div>
        ))}
      </div>
      {remaining > 0 && (
        <div className="text-white/50 mt-1.5 pt-1.5 border-t border-white/10">
          +{remaining} más
        </div>
      )}
    </>
  ) : null;

  return (
    <Tooltip content={tooltipContent} placement="top" maxWidth={280}>
      <span className="text-[13px] text-gray-600 underline decoration-dotted cursor-help">
        {count}
      </span>
    </Tooltip>
  );
}

/* ───── Typification icon (DD#203: uses shared Tooltip) ───── */
function TypificationIcon() {
  return (
    <Tooltip content="Tipificación activa" placement="top" maxWidth={160}>
      <span className="inline-flex ml-1.5 cursor-help" aria-label="Tipificación activa">
        <Tags size={13} className="text-gray-400" />
      </span>
    </Tooltip>
  );
}

/* ───── Empty state ───── */
function EmptyGroupsState({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 border border-dashed border-gray-300">
      <div className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center mb-6">
        <Users size={32} className="text-gray-300" />
      </div>
      <h3 className="text-[16px] text-gray-600 mb-2" style={{ fontWeight: 500 }}>
        Aún no hay grupos
      </h3>
      <p className="text-[13px] text-gray-400 text-center max-w-sm mb-6">
        Crea tu primer grupo para empezar a distribuir interacciones entre agentes
      </p>
      <button
        onClick={onCreateGroup}
        className="inline-flex items-center gap-2 px-5 py-2 text-[13px] text-white cursor-pointer bg-gray-800"
        style={{ fontWeight: 500 }}
      >
        <Plus size={16} />
        Crear grupo
      </button>
    </div>
  );
}

/* ═══════ MAIN PAGE ═══════ */
export function GroupsListPage() {
  const navigate = useNavigate();
  const { groups, deleteGroup, deleteGroups, duplicateGroup, bulkUpdate, updateGroup } = useGroupsStore();

  /* ── Column visibility ── */
  const groupColumns: ColumnDef[] = [
    { key: "id", label: "ID", defaultVisible: true },
    { key: "name", label: "Nombre", defaultVisible: true, locked: true },
    { key: "phone", label: "Teléfono", defaultVisible: true },
    { key: "services", label: "Servicios", defaultVisible: true },
    { key: "agents", label: "Agentes", defaultVisible: true },
    { key: "priority", label: "Prioridad", defaultVisible: true },
    { key: "strategy", label: "Estrategia", defaultVisible: true },
    { key: "channels", label: "Canales", defaultVisible: true },
  ];
  const { visibleColumns, isVisible, toggle: toggleColumn, reset: resetColumns } =
    useColumnVisibility("sc_groups_columns_v4", groupColumns);

  const visibleCount = groupColumns.filter((c) => !c.locked && visibleColumns.has(c.key)).length;
  const colSpanDuplicate = 1 + visibleCount;

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    groupId: number;
  } | null>(null);
  const [bulkContextMenu, setBulkContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "bulk";
    groups: Group[];
  } | null>(null);

  /* ── Sorting ── */
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Inline bulk edit state
  const [bulkField, setBulkField] = useState("");
  const [bulkValue, setBulkValue] = useState("");
  const [bulkFieldDropdownOpen, setBulkFieldDropdownOpen] = useState(false);
  const bulkFieldDropdownRef = useRef<HTMLDivElement>(null);

  // Close bulk field dropdown on outside click or Escape
  const closeBulkDropdown = useCallback(() => setBulkFieldDropdownOpen(false), []);
  useClickOutside(bulkFieldDropdownRef, closeBulkDropdown, bulkFieldDropdownOpen);

  // Impact preview state (DD#199)
  const [impactPreview, setImpactPreview] = useState<{
    operation: "bulkEdit" | "duplicate";
    fieldLabel?: string;
    newValue?: string;
    items: ImpactPreviewItem[];
  } | null>(null);

  // Duplicate inline edit state
  const [duplicateRow, setDuplicateRow] = useState<{
    sourceGroup: Group;
    editName: string;
  } | null>(null);
  const duplicateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (duplicateRow && duplicateInputRef.current) {
      duplicateInputRef.current.focus();
      duplicateInputRef.current.select();
    }
  }, [duplicateRow]);

  const handleDuplicate = (groupId: number) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    setDuplicateRow({ sourceGroup: group, editName: `Copia de ${group.name}` });
  };

  const confirmDuplicate = () => {
    if (!duplicateRow) return;
    const name = duplicateRow.editName.trim() || `Copia de ${duplicateRow.sourceGroup.name}`;
    const newGroup = duplicateGroup(duplicateRow.sourceGroup.id, name);
    if (newGroup) {
      const undoFn = () => deleteGroup(newGroup.id);
      const tId = toast.success(`Borrador «${name}» creado`, {
        description: "Revisa la configuración y guarda para activar el grupo.",
        duration: 8000,
        action: {
          label: "Deshacer",
          onClick: () => {
            undoFn();
            removeUndo(tId);
            toast("Duplicado revertido");
          },
        },
      });
      pushUndo(tId, undoFn, `Duplicado "${name}" eliminado`);
    }
    setDuplicateRow(null);
  };

  const cancelDuplicate = () => {
    setDuplicateRow(null);
  };

  /* ── Filtered + sorted groups ── */
  const filteredAndSortedGroups = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = groups.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q) ||
      g.strategy.toLowerCase().includes(q) ||
      g.priority.toLowerCase().includes(q) ||
      (g.services || []).some((s) => s.toLowerCase().includes(q))
    );

    /* Sort with drafts always floating to top (DD#295, DD#296: merged into single pass) */
    result = [...result].sort((a, b) => {
      // Drafts first, regardless of sort field
      if (a.isDraft && !b.isDraft) return -1;
      if (!a.isDraft && b.isDraft) return 1;

      if (!sortField) return 0;

      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name, "es");
          break;
        case "agents":
          cmp = a.agents - b.agents;
          break;
        case "priority":
          cmp = (priorityOrder[a.priority] ?? 0) - (priorityOrder[b.priority] ?? 0);
          break;
        case "strategy":
          cmp = a.strategy.localeCompare(b.strategy, "es");
          break;
        case "channels":
          cmp = a.channels.length - b.channels.length;
          if (cmp === 0) {
            cmp = a.channels.join(",").localeCompare(b.channels.join(","));
          }
          break;
        case "services":
          cmp = (a.services?.length ?? 0) - (b.services?.length ?? 0);
          if (cmp === 0) {
            cmp = (a.services || []).join(",").localeCompare((b.services || []).join(","), "es");
          }
          break;
        case "id":
          cmp = parseInt(a.code || "0") - parseInt(b.code || "0");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [groups, searchQuery, sortField, sortDir]);

  const allSelected =
    filteredAndSortedGroups.length > 0 &&
    filteredAndSortedGroups.every((g) => selectedIds.has(g.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedGroups.map((g) => g.id)));
    }
  };

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedGroups = useMemo(
    () => groups.filter((g) => selectedIds.has(g.id)),
    [groups, selectedIds]
  );

  const handleMenuClick = (e: ReactMouseEvent, groupId: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({
      x: rect.right - 170,
      y: rect.bottom + 4,
      groupId,
    });
  };

  /* ── Stats ── */
  // (removed — counter subheader eliminated)

  /* ── Bulk field options ── */
  const bulkFieldOptions = [
    { key: "priority", label: "Prioridad" },
    { key: "strategy", label: "Estrategia" },
    { key: "phone", label: "Teléfono asociado" },
    { key: "overflow", label: "Desbordar llamadas" },
  ];

  const bulkValueOptions: Record<string, string[]> = {
    priority: ["Baja", "Media", "Alta", "Máxima"],
    strategy: ["Balanceada", "Lineal", "Aleatoria", "Menos llamadas atendidas", "Menos reciente (más inactivo)", "Agente exclusivo", "Niveles", "Ring All"],
    phone: ["917945449", "918371548"],
    overflow: ["Activado", "Desactivado"],
  };

  /* ── Show impact preview before bulk apply (DD#199) ── */
  const handleBulkApplyPreview = () => {
    const fieldLabel = bulkFieldOptions.find((f) => f.key === bulkField)?.label || bulkField;
    const items: ImpactPreviewItem[] = Array.from(selectedIds)
      .map((gId) => {
        const g = groups.find((gr) => gr.id === gId);
        if (!g) return null;
        return {
          id: g.id,
          name: g.name,
          detail: `(${g.agents} agentes)`,
        };
      })
      .filter(Boolean) as ImpactPreviewItem[];

    setImpactPreview({
      operation: "bulkEdit",
      fieldLabel,
      newValue: bulkValue,
      items,
    });
  };

  const handleBulkApplyConfirmed = (confirmedIds: number[]) => {
    const fieldLabel = bulkFieldOptions.find((f) => f.key === bulkField)?.label || bulkField;
    const snapshot = confirmedIds.map((gId) => {
      const g = groups.find((gr) => gr.id === gId);
      return g ? { ...g } : null;
    }).filter(Boolean) as Group[];

    if (bulkField !== "overflow") {
      bulkUpdate(confirmedIds, bulkField, bulkValue);
    }

    const undoFn = () => { for (const s of snapshot) updateGroup(s.id, s); };
    const tId = toast.success(`${fieldLabel} actualizada en ${confirmedIds.length} grupos`, {
      description: `Se ha cambiado a "${bulkValue}"`,
      duration: 8000,
      action: {
        label: "Deshacer",
        onClick: () => {
          undoFn();
          removeUndo(tId);
          toast("Cambio revertido");
        },
      },
    });
    pushUndo(tId, undoFn, `Bulk edit ${fieldLabel} revertido en grupos`);
    setBulkField("");
    setBulkValue("");
    setBulkFieldDropdownOpen(false);
    setSelectedIds(new Set());
    setImpactPreview(null);
  };

  const showEmptyState = groups.length === 0;
  const showSearchEmpty = !showEmptyState && filteredAndSortedGroups.length === 0;

  /* ── XLSX Export (DD#278, DD#296: uses shared exportToXlsx) ── */
  const handleExport = () => {
    const channelLabels: Record<string, string> = { phone: "Teléfono", chat: "Chat", email: "Email" };
    const headers = ["ID", "Nombre", "Teléfono", "Nº Agentes", "Prioridad", "Estrategia", "Canales", "Servicios", "Agendas", "Tipificación", "Agentes asignados"];
    const rows = filteredAndSortedGroups.map((g) => [
      g.code || "",
      g.name,
      g.phone,
      g.agents,
      g.priority,
      g.strategy,
      g.channels.map((ch) => channelLabels[ch] || ch).join(", "),
      (g.services || []).join(", ") || "—",
      (g.schedules || []).map((sid) => {
        const s = availableSchedules.find((sc) => sc.id === sid);
        return s ? s.name : "";
      }).filter(Boolean).join(", ") || "—",
      g.typification ? "Sí" : "No",
      g.assignedAgents.join(", "),
    ]);

    exportToXlsx({ headers, rows, sheetName: "Grupos", filePrefix: "grupos" });
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: "Administración", path: "/admin/usuarios" },
          { label: "Grupos" },
        ]}
      />

      <div className="flex-1 overflow-auto bg-white">
        <div className={`px-6 py-6 max-w-[1400px] mx-auto transition-[padding] duration-200 ${selectedIds.size >= 2 ? "pb-20" : ""}`}>
          {/* Page title + Create button */}
          <div className="flex items-center justify-between mb-5">
            <h1
              className="text-gray-800 text-[20px]"
              style={{ fontWeight: 600 }}
            >
              Grupos
            </h1>

            <button
              onClick={() => navigate("/admin/grupos/crear")}
              className="inline-flex items-center gap-2 px-4 py-2 text-white text-[13px] cursor-pointer bg-gray-800"
              style={{ fontWeight: 500 }}
            >
              <Plus size={15} />
              Crear grupo
            </button>
          </div>

          {/* ── Action bar ── */}
          <div className="flex items-center gap-3 mb-5">
            <ColumnSelectorDropdown
              columns={groupColumns}
              visibleColumns={visibleColumns}
              onToggle={toggleColumn}
              onReset={resetColumns}
            />

            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (searchQuery) {
                      setSearchQuery("");
                    } else {
                      (e.target as HTMLInputElement).blur();
                    }
                  }
                }}
                className="pl-9 pr-3 py-2 border border-gray-300 text-[13px] w-72 focus:outline-none focus:border-gray-500 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-500 hover:text-gray-600 border border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              <Download size={14} />
              Exportar
            </button>
          </div>

          {/* ── Empty state: no groups ── */}
          {showEmptyState && (
            <EmptyGroupsState onCreateGroup={() => navigate("/admin/grupos/crear")} />
          )}

          {/* ── Empty state: search no results ── */}
          {showSearchEmpty && (
            <div className="border border-dashed border-gray-300 py-16 flex flex-col items-center gap-3">
              <div className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center">
                <Search size={28} className="text-gray-300" />
              </div>
              <div className="text-center">
                <div
                  className="text-[14px] text-gray-500"
                  style={{ fontWeight: 600 }}
                >
                  Sin resultados
                </div>
                <div className="text-[13px] text-gray-400 mt-1">
                  No hay grupos que coincidan con &ldquo;{searchQuery}&rdquo;
                </div>
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 text-[13px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer mt-2"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}

          {/* ── TABLE VIEW ── */}
          {!showEmptyState && filteredAndSortedGroups.length > 0 && (
            <>
              <div className="border border-gray-300 overflow-hidden bg-white">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th
                        className="w-10 px-3 py-3 cursor-pointer"
                        onClick={toggleAll}
                      >
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          className="w-4 h-4 cursor-pointer pointer-events-none"
                          aria-label="Seleccionar todos los grupos"
                          tabIndex={-1}
                        />
                      </th>
                      {isVisible("id") && (
                      <SortableHeader
                        label="ID"
                        field="id"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                        align="center"
                      />
                      )}
                      <SortableHeader
                        label="Nombre"
                        field="name"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />
                      {isVisible("phone") && (
                      <th
                        className="text-left px-3 py-3 text-[11px] text-gray-400 tracking-wider uppercase"
                        style={{ fontWeight: 600 }}
                      >
                        Teléfono
                      </th>
                      )}
                      {isVisible("services") && <SortableHeader
                        label="Servicios"
                        field="services"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                        align="center"
                      />}
                      {isVisible("agents") && <SortableHeader
                        label="Agentes"
                        field="agents"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                        align="center"
                      />}
                      {isVisible("priority") && <SortableHeader
                        label="Prioridad"
                        field="priority"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />}
                      {isVisible("strategy") && <SortableHeader
                        label="Estrategia"
                        field="strategy"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />}
                      {isVisible("channels") && <SortableHeader
                        label="Canales"
                        field="channels"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                        align="center"
                      />}
                      <th className="w-12 px-3 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Inline duplicate row — appears at the top */}
                    {duplicateRow && (
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="px-3 py-3">
                          <input type="checkbox" disabled className="w-4 h-4 opacity-30" />
                        </td>
                        <td className="px-3 py-3" colSpan={colSpanDuplicate}>
                          <div className="flex items-center gap-2">
                            <input
                              ref={duplicateInputRef}
                              type="text"
                              value={duplicateRow.editName}
                              onChange={(e) =>
                                setDuplicateRow({ ...duplicateRow, editName: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") confirmDuplicate();
                                if (e.key === "Escape") cancelDuplicate();
                              }}
                              className="px-2.5 py-1.5 border border-gray-400 text-[13px] bg-white focus:outline-none focus:border-gray-600 w-80"
                              style={{ fontWeight: 500 }}
                            />
                            <button
                              onClick={cancelDuplicate}
                              className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                              title="Cancelar"
                            >
                              <X size={15} />
                            </button>
                            <button
                              onClick={confirmDuplicate}
                              className="p-1 text-green-500 hover:text-green-700 cursor-pointer"
                              title="Confirmar"
                            >
                              <Check size={15} />
                            </button>
                            <span className="text-[11px] text-gray-400 ml-2">
                              Renombra la copia y confirma
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3"></td>
                      </tr>
                    )}
                    {filteredAndSortedGroups.map((group) => {
                      const isSelected = selectedIds.has(group.id);
                      const isDraft = group.isDraft;
                      return (
                        <tr
                          key={group.id}
                          className={`border-b border-gray-200 border-l-2 ${
                            isDraft
                              ? "border-l-amber-400 bg-amber-50/40"
                              : "border-l-transparent"
                          } ${
                            isSelected ? "bg-gray-100" : isDraft ? "" : "hover:bg-gray-50"
                          }`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            // If this row is part of multi-select, show bulk menu
                            if (selectedIds.size >= 2 && selectedIds.has(group.id)) {
                              setBulkContextMenu({ x: e.clientX, y: e.clientY });
                            } else {
                              setContextMenu({ x: e.clientX, y: e.clientY, groupId: group.id });
                            }
                          }}
                        >
                          <td
                            className="px-3 py-3 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); toggleOne(group.id); }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOne(group.id)}
                              className="w-4 h-4 cursor-pointer pointer-events-none"
                              aria-label={`Seleccionar ${group.name}`}
                              tabIndex={-1}
                            />
                          </td>
                          {isVisible("id") && <td className="px-3 py-3 text-[13px] text-gray-400 font-mono">
                            {group.code}
                          </td>}
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/admin/grupos/editar/${group.id}`)}
                                className="text-[13px] text-gray-700 cursor-pointer hover:text-gray-900 hover:underline"
                                style={{ fontWeight: 500 }}
                              >
                                {group.name}
                              </button>
                              {isDraft && (
                                <Tooltip content="Borrador — pendiente de revisión" placement="top" maxWidth={200}>
                                  <span className="inline-flex text-amber-500 cursor-help">
                                    <FilePen size={13} />
                                  </span>
                                </Tooltip>
                              )}
                              {group.typification && <TypificationIcon />}
                            </div>
                          </td>
                          {isVisible("phone") && <td className="px-3 py-3 text-[13px] text-gray-500 font-mono">
                            {group.phone}
                          </td>}
                          {isVisible("services") && <td className="px-3 py-3 text-center">
                            {(group.services && group.services.length > 0) ? (
                              <Tooltip
                                content={
                                  <div className="space-y-0.5">
                                    {group.services.map((s, i) => (
                                      <div key={i} className="text-white/90">{s}</div>
                                    ))}
                                  </div>
                                }
                                placement="top"
                                maxWidth={260}
                              >
                                <span className="text-[13px] text-gray-600 underline decoration-dotted cursor-help">
                                  {group.services.length}
                                </span>
                              </Tooltip>
                            ) : (
                              <span className="text-[12px] text-gray-300">—</span>
                            )}
                          </td>}
                          {isVisible("agents") && <td className="px-3 py-3 text-center">
                            <AgentPopover
                              agents={group.assignedAgents}
                              count={group.agents}
                            />
                          </td>}
                          {isVisible("priority") && <td className="px-3 py-3">
                            <PriorityBadge priority={group.priority} />
                          </td>}
                          {isVisible("strategy") && <td className="px-3 py-3 text-[12px] text-gray-500">
                            {group.strategy}
                          </td>}
                          {isVisible("channels") && <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {group.channels.map((ch) => (
                                <ChannelIconWithTooltip key={ch} channel={ch} />
                              ))}
                            </div>
                          </td>}
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={(e) => handleMenuClick(e, group.id)}
                              className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer inline-flex items-center justify-center"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sort hint + count */}
              <div className="flex items-center justify-between mt-3 text-[12px] text-gray-400">
                <div>
                  {sortField && (
                    <button
                      onClick={() => { setSortField(null); setSortDir("asc"); }}
                      className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={11} />
                      Quitar ordenación
                    </button>
                  )}
                </div>
                <span>
                  {filteredAndSortedGroups.length} grupos
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onEdit={() => {
            navigate(`/admin/grupos/editar/${contextMenu.groupId}`);
            setContextMenu(null);
          }}
          onDuplicate={() => {
            handleDuplicate(contextMenu.groupId);
            setContextMenu(null);
          }}
          onDelete={() => {
            const group = groups.find(
              (g) => g.id === contextMenu.groupId
            );
            if (group)
              setDeleteTarget({ type: "single", groups: [group] });
            setContextMenu(null);
          }}
        />
      )}

      {/* Bulk Context Menu */}
      {bulkContextMenu && (
        <BulkContextMenu
          x={bulkContextMenu.x}
          y={bulkContextMenu.y}
          count={selectedIds.size}
          onClose={() => setBulkContextMenu(null)}
          onDelete={() => {
            setDeleteTarget({ type: "bulk", groups: selectedGroups });
            setBulkContextMenu(null);
          }}
        />
      )}

      {/* Bulk Action Bar — only for 2+ selected */}
      {selectedIds.size > 1 && (
        <BulkActionBar
          count={selectedIds.size}
          entitySingular="grupo"
          entityPlural="grupos"
          onClear={() => {
            setSelectedIds(new Set());
            setBulkField("");
            setBulkValue("");
          }}
        >
          <span className="text-white/60">Cambiar</span>
          <div className="relative" ref={bulkFieldDropdownRef}>
            <button
              onClick={() => setBulkFieldDropdownOpen(!bulkFieldDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/20 text-white text-[12px] cursor-pointer min-w-[150px] justify-between hover:border-white/40"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <span>{bulkField ? bulkFieldOptions.find((f) => f.key === bulkField)?.label : "Seleccionar campo"}</span>
              <span className="text-white/40 text-[10px]">&#9662;</span>
            </button>
            {bulkFieldDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-300 py-1 z-50">
                {bulkFieldOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setBulkField(opt.key);
                      setBulkValue("");
                      setBulkFieldDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] cursor-pointer hover:bg-gray-100 ${
                      bulkField === opt.key ? "text-gray-800 bg-gray-100" : "text-gray-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-white/60">a</span>
          <select
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            disabled={!bulkField}
            className="px-3 py-1.5 border border-white/20 text-white text-[12px] cursor-pointer min-w-[140px] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <option value="" className="text-gray-800">—</option>
            {bulkField && bulkValueOptions[bulkField]?.map((opt) => (
              <option key={opt} value={opt} className="text-gray-800">{opt}</option>
            ))}
          </select>
          <button
            onClick={handleBulkApplyPreview}
            disabled={!bulkField || !bulkValue}
            className="px-3.5 py-1.5 bg-white text-gray-800 text-[12px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
            style={{ fontWeight: 500 }}
          >
            Aplicar
          </button>
        </BulkActionBar>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteEntityDialog
          type={deleteTarget.type}
          items={deleteTarget.groups.map((g) => ({ id: g.id, name: g.name }))}
          entitySingular="grupo"
          entityPlural="grupos"
          singleDetailMessage={
            deleteTarget.type === "single"
              ? `Los ${deleteTarget.groups[0].agents} agentes asignados a este grupo no serán eliminados.`
              : undefined
          }
          bulkFooterMessage="Los agentes asignados a estos grupos no serán eliminados."
          onClose={() => setDeleteTarget(null)}
          onConfirm={(remainingIds) => {
            if (deleteTarget.type === "single") {
              deleteGroup(deleteTarget.groups[0].id);
              toast(`Grupo «${deleteTarget.groups[0].name}» eliminado`, {
                description: "Los agentes asignados no han sido eliminados.",
              });
            } else {
              const ids = remainingIds || deleteTarget.groups.map((g) => g.id);
              deleteGroups(ids);
              toast(`${ids.length} grupos eliminados`, {
                description: "Los agentes asignados no han sido eliminados.",
              });
            }
            setDeleteTarget(null);
            setSelectedIds(new Set());
          }}
        />
      )}

      {/* Impact Preview Dialog (DD#199) */}
      {impactPreview && (
        <ImpactPreviewDialog
          operation={impactPreview.operation}
          entityLabel="grupos"
          fieldLabel={impactPreview.fieldLabel}
          newValue={impactPreview.newValue}
          items={impactPreview.items}
          onConfirm={(confirmedIds) => {
            if (impactPreview.operation === "duplicate") {
              confirmedIds.forEach((id) => {
                const g = groups.find((gr) => gr.id === id);
                if (g) duplicateGroup(id, `Copia de ${g.name}`);
              });
              toast.success(`${confirmedIds.length} grupos duplicados`);
              setSelectedIds(new Set());
              setImpactPreview(null);
            } else {
              handleBulkApplyConfirmed(confirmedIds);
            }
          }}
          onClose={() => setImpactPreview(null)}
        />
      )}
    </>
  );
}