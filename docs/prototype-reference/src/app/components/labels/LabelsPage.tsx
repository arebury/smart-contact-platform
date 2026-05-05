import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { TopBar } from "../layout/TopBar";
import { useLabelsStore } from "./useLabelsStore";
import { useAgentsStore } from "../agents/useAgentsStore";
import {
  LABEL_COLORS,
  labelColorStyles,
  type Label,
  type LabelColor,
} from "./labelsData";
import { useClickOutside } from "../shared/useClickOutside";
import { BulkActionBar } from "../shared/BulkActionBar";
import { toast } from "sonner";
import { exportToXlsx } from "../shared/exportXlsx";
import {
  Plus,
  Search,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  Tag,
  Check,
  AlertTriangle,
  Download,
} from "lucide-react";

/* ═══════ Color Picker (inline row of dots) ═══════ */
function ColorPicker({
  value,
  onChange,
}: {
  value: LabelColor;
  onChange: (c: LabelColor) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {LABEL_COLORS.map((c) => {
        const s = labelColorStyles[c];
        const isSelected = c === value;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`w-5 h-5 flex items-center justify-center cursor-pointer border ${
              isSelected ? "border-gray-600" : "border-transparent hover:border-gray-300"
            }`}
            title={c}
          >
            <span className={`w-3 h-3 ${s.dot}`} />
          </button>
        );
      })}
    </div>
  );
}

/* ═══════ Label Chip (reusable) ═══════ */
export function LabelChip({
  label,
  size = "sm",
  onRemove,
}: {
  label: Label;
  size?: "sm" | "xs";
  onRemove?: () => void;
}) {
  const s = labelColorStyles[label.color];
  const sizeClasses = size === "xs" ? "text-[10px] px-1.5 py-0" : "text-[11px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center gap-1 border ${s.bg} ${s.text} ${s.border} ${sizeClasses}`}
      style={{ fontWeight: 500 }}
    >
      <span className={`w-1.5 h-1.5 ${s.dot} shrink-0`} />
      {label.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70 cursor-pointer"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

/* ═══════ Create / Edit Panel (dropdown, no layout shift) ═══════ */
function LabelFormPanel({
  initial,
  existingNames,
  onSave,
  onCancel,
}: {
  initial?: Label;
  existingNames: string[];
  onSave: (data: { name: string; color: LabelColor; description: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState<LabelColor>(initial?.color || "blue");
  const [description, setDescription] = useState(initial?.description || "");
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const validate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio");
      return false;
    }
    const isDuplicate = existingNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase() && n.toLowerCase() !== (initial?.name || "").toLowerCase()
    );
    if (isDuplicate) {
      setError("Ya existe una label con este nombre");
      return false;
    }
    setError("");
    return true;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ name: name.trim(), color, description: description.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="w-80 bg-white border border-gray-300 p-4">
      <div className="text-[13px] text-gray-800 mb-3" style={{ fontWeight: 600 }}>
        {initial ? "Editar label" : "Nueva label"}
      </div>

      {/* Name */}
      <div className="mb-3">
        <label className="text-[12px] text-gray-500 mb-1 block">Nombre</label>
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={handleKeyDown}
          placeholder="Nombre de la label"
          className={`w-full px-2 py-1.5 border text-[13px] text-gray-700 focus:outline-none focus:border-gray-500 ${
            error ? "border-red-300 bg-red-50/50" : "border-gray-300"
          }`}
        />
        <div className="min-h-[18px] mt-1">
          {error && (
            <div className="flex items-center gap-1 text-[11px] text-red-600">
              <AlertTriangle size={10} />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Color */}
      <div className="mb-3">
        <label className="text-[12px] text-gray-500 mb-1 block">Color</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="text-[12px] text-gray-500 mb-1 block">Descripción <span className="text-gray-300">(opcional)</span></label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Breve descripción..."
          className="w-full px-2 py-1.5 border border-gray-300 text-[13px] text-gray-500 focus:outline-none focus:border-gray-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-[12px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
          style={{ fontWeight: 500 }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
          style={{ fontWeight: 500 }}
        >
          {initial ? "Guardar" : "Crear"}
        </button>
      </div>
    </div>
  );
}

/* ═══════ Delete Confirmation Dialog ═══════ */
function DeleteLabelDialog({
  labels,
  agentCountMap,
  onConfirm,
  onCancel,
}: {
  labels: Label[];
  agentCountMap: Map<number, number>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const totalAffected = labels.reduce((sum, l) => sum + (agentCountMap.get(l.id) || 0), 0);
  const isSingle = labels.length === 1;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] bg-white border border-gray-300">
        <div className="px-5 pt-5 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 border border-gray-300 flex items-center justify-center">
              <Trash2 size={16} className="text-gray-500" />
            </div>
            <h3 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>
              {isSingle ? "Eliminar label" : `Eliminar ${labels.length} labels`}
            </h3>
          </div>

          {isSingle ? (
            <p className="text-[13px] text-gray-500" style={{ lineHeight: "1.6" }}>
              ¿Eliminar la label <span style={{ fontWeight: 600 }}>"{labels[0].name}"</span>?
              {totalAffected > 0 && (
                <> Se eliminará de {totalAffected} agente{totalAffected !== 1 ? "s" : ""} que la tienen asignada.</>
              )}
            </p>
          ) : (
            <div>
              <p className="text-[13px] text-gray-500 mb-2" style={{ lineHeight: "1.6" }}>
                ¿Eliminar estas labels?
                {totalAffected > 0 && (
                  <> Afectará a {totalAffected} agente{totalAffected !== 1 ? "s" : ""} en total.</>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l) => (
                  <LabelChip key={l.id} label={l} size="xs" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 flex items-center justify-end gap-2 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-[13px] text-gray-600 border border-gray-300 hover:bg-gray-100 cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-[13px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════ MAIN PAGE ═══════ */
export function LabelsPage() {
  const { labels, addLabel, updateLabel, deleteLabel, deleteLabels } = useLabelsStore();
  const { agents, updateAgent } = useAgentsStore();

  /* ── Search ── */
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Creating / Editing ── */
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const createBtnRef = useRef<HTMLDivElement>(null);
  const createPanelRef = useRef<HTMLDivElement>(null);
  useClickOutside(createPanelRef, () => setCreating(false), creating);

  /* ── Edit panel ── */
  const editPanelRef = useRef<HTMLDivElement>(null);
  useClickOutside(editPanelRef, () => setEditingId(null), editingId !== null);

  /* ── Selection ── */
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  /* ── Context menu ── */
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; labelId: number } | null>(null);
  const ctxRef = useRef<HTMLDivElement>(null);
  useClickOutside(ctxRef, () => setContextMenu(null), !!contextMenu);

  /* ── Delete dialog ── */
  const [deleteTarget, setDeleteTarget] = useState<{ labels: Label[] } | null>(null);

  /* ── Counts per label ── */
  const agentCountMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const agent of agents) {
      for (const lid of agent.labels || []) {
        map.set(lid, (map.get(lid) || 0) + 1);
      }
    }
    return map;
  }, [agents]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return labels;
    return labels.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description || "").toLowerCase().includes(q)
    );
  }, [labels, searchQuery]);

  /* ── Sorted alphabetically ── */
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.name.localeCompare(b.name)),
    [filtered]
  );

  const existingNames = labels.map((l) => l.name);

  /* ── Handlers ── */
  const handleCreate = (data: { name: string; color: LabelColor; description: string }) => {
    addLabel({
      name: data.name,
      color: data.color,
      description: data.description || undefined,
    });
    setCreating(false);
    toast.success(`Label "${data.name}" creada`);
  };

  const handleUpdate = (id: number, data: { name: string; color: LabelColor; description: string }) => {
    updateLabel(id, {
      name: data.name,
      color: data.color,
      description: data.description || undefined,
    });
    setEditingId(null);
    toast.success(`Label "${data.name}" actualizada`);
  };

  const handleDelete = (labelsToDelete: Label[]) => {
    const ids = labelsToDelete.map((l) => l.id);
    const idSet = new Set(ids);

    // Remove labels from agents
    for (const agent of agents) {
      if (agent.labels?.some((lid) => idSet.has(lid))) {
        updateAgent(agent.id, {
          labels: (agent.labels || []).filter((lid) => !idSet.has(lid)),
        });
      }
    }

    // Delete labels
    if (ids.length === 1) {
      deleteLabel(ids[0]);
    } else {
      deleteLabels(ids);
    }

    setDeleteTarget(null);
    setSelectedIds(new Set());
    setContextMenu(null);

    const names = labelsToDelete.map((l) => l.name).join(", ");
    toast.success(
      labelsToDelete.length === 1
        ? `Label "${names}" eliminada`
        : `${labelsToDelete.length} labels eliminadas`
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((l) => l.id)));
    }
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, labelId: number) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, labelId });
    },
    []
  );

  /* ── Row menu (⋯) ── */
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setOpenMenuId(null), openMenuId !== null);

  /* ── XLSX Export (DD#278, DD#296: uses shared exportToXlsx) ── */
  const handleExport = () => {
    const headers = ["Nombre", "Color", "Descripción", "Agentes asignados"];
    const rows = sorted.map((l) => [
      l.name,
      l.color,
      l.description || "",
      agentCountMap.get(l.id) || 0,
    ]);

    exportToXlsx({ headers, rows, sheetName: "Labels", filePrefix: "labels" });
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: "Administración", path: "/admin/usuarios" },
          { label: "Repositorios", path: "/admin/repositorios" },
          { label: "Labels" },
        ]}
      />

      <div className="flex-1 overflow-y-auto bg-white">
        <div className={`px-6 py-6 max-w-[1400px] mx-auto transition-[padding] duration-200 ${selectedIds.size > 0 ? "pb-20" : ""}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1
              className="text-gray-800 text-[20px]"
              style={{ fontWeight: 600 }}
            >
              Labels
            </h1>

            <div className="relative" ref={createBtnRef}>
              <button
                onClick={() => { setCreating(!creating); setEditingId(null); }}
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                <Plus size={15} />
                Nueva label
              </button>

              {/* Create dropdown panel */}
              {creating && (
                <div
                  ref={createPanelRef}
                  className="absolute right-0 top-full mt-1 z-40"
                >
                  <LabelFormPanel
                    existingNames={existingNames}
                    onSave={handleCreate}
                    onCancel={() => setCreating(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-3 mb-5">
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

          {/* Table */}
          {labels.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 px-8 border border-dashed border-gray-300">
              <div className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center mb-6">
                <Tag size={32} className="text-gray-300" />
              </div>
              <h3 className="text-[16px] text-gray-600 mb-2" style={{ fontWeight: 500 }}>
                Aún no hay labels
              </h3>
              <p className="text-[13px] text-gray-400 text-center max-w-sm mb-6">
                Crea tu primera label para organizar y filtrar tus agentes
              </p>
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 px-5 py-2 text-[13px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                <Plus size={16} />
                Crear label
              </button>
            </div>
          ) : (
            <div className="border border-gray-300 overflow-hidden bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th
                      className="w-10 px-3 py-3 cursor-pointer"
                      onClick={toggleSelectAll}
                    >
                      <input
                        type="checkbox"
                        checked={sorted.length > 0 && selectedIds.size === sorted.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer pointer-events-none"
                        tabIndex={-1}
                      />
                    </th>
                    <th
                      className="px-3 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider"
                      style={{ fontWeight: 600 }}
                    >
                      Nombre
                    </th>
                    <th
                      className="px-3 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider"
                      style={{ fontWeight: 600 }}
                    >
                      Descripción
                    </th>
                    <th className="w-12 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {/* Label rows */}
                  {sorted.map((label) => {
                    return (
                      <tr
                        key={label.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 group ${
                          selectedIds.has(label.id) ? "bg-gray-100" : ""
                        }`}
                        onContextMenu={(e) => handleContextMenu(e, label.id)}
                      >
                        {/* Checkbox — DD#154 Fitts */}
                        <td
                          className="px-3 py-3 w-10 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); toggleSelect(label.id); }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(label.id)}
                            onChange={() => toggleSelect(label.id)}
                            className="w-4 h-4 cursor-pointer pointer-events-none"
                            tabIndex={-1}
                          />
                        </td>

                        {/* Name with color chip */}
                        <td className="px-3 py-3 relative">
                          <LabelChip label={label} />

                          {/* Edit panel (appears over the row, no layout shift) */}
                          {editingId === label.id && (
                            <div
                              ref={editPanelRef}
                              className="absolute left-3 top-full mt-1 z-40"
                            >
                              <LabelFormPanel
                                initial={label}
                                existingNames={existingNames}
                                onSave={(data) => handleUpdate(label.id, data)}
                                onCancel={() => setEditingId(null)}
                              />
                            </div>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-3 py-3 text-[13px] text-gray-400">
                          {label.description || (
                            <span className="text-gray-300 italic">Sin descripción</span>
                          )}
                        </td>

                        {/* Row actions */}
                        <td className="px-3 py-3 text-right">
                          <div className="relative inline-flex">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === label.id ? null : label.id)}
                              className="p-2 hover:bg-gray-200 cursor-pointer inline-flex items-center justify-center"
                            >
                              <MoreHorizontal size={16} className="text-gray-400" />
                            </button>

                            {openMenuId === label.id && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-gray-300 py-1"
                              >
                                <button
                                  onClick={() => {
                                    setEditingId(label.id);
                                    setOpenMenuId(null);
                                    setCreating(false);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                  <Pencil size={13} className="text-gray-400" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTarget({ labels: [label] });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                  <Trash2 size={13} className="text-gray-400" />
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* No results */}
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Search size={20} className="text-gray-200 mx-auto mb-2" />
                        <div className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>
                          Sin resultados
                        </div>
                        <div className="text-[12px] text-gray-400 mt-0.5">
                          No hay labels que coincidan con "{searchQuery}"
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {labels.length > 0 && (
            <div className="flex items-center justify-between mt-3 text-[12px] text-gray-400">
              <div />
              <span>
                {sorted.length} label{sorted.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={ctxRef}
          className="fixed z-50 w-44 bg-white border border-gray-300 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              setEditingId(contextMenu.labelId);
              setContextMenu(null);
              setCreating(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <Pencil size={13} className="text-gray-400" />
            Editar
          </button>
          <button
            onClick={() => {
              const label = labels.find((l) => l.id === contextMenu.labelId);
              if (label) setDeleteTarget({ labels: [label] });
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <Trash2 size={13} className="text-gray-400" />
            Eliminar
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <DeleteLabelDialog
          labels={deleteTarget.labels}
          agentCountMap={agentCountMap}
          onConfirm={() => handleDelete(deleteTarget.labels)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Bulk action bar (fixed bottom, consistent with Agents/Groups) ── */}
      <BulkActionBar
        count={selectedIds.size}
        entitySingular="label"
        entityPlural="labels"
        selectedSuffix={{ singular: "seleccionada", plural: "seleccionadas" }}
        onClear={() => setSelectedIds(new Set())}
      >
        <button
          onClick={() => {
            const toDelete = labels.filter((l) => selectedIds.has(l.id));
            setDeleteTarget({ labels: toDelete });
          }}
          className="px-3 py-1.5 border border-red-400 text-red-400 text-[12px] hover:bg-red-400/10 cursor-pointer"
        >
          Eliminar
        </button>
      </BulkActionBar>
    </>
  );
}