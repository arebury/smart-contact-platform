import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { TopBar } from "../layout/TopBar";
import { useTemplatesStore } from "./useTemplatesStore";
import type { Template } from "./templatesData";
import { useClickOutside } from "../shared/useClickOutside";
import { toast } from "sonner";
import { DeleteEntityDialog } from "../shared/DeleteEntityDialog";
import { BulkActionBar } from "../shared/BulkActionBar";
import {
  Plus,
  Search,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileStack,
  MessageSquare,
  Mail,
  AlertTriangle,
} from "lucide-react";

/* ═══════ Create / Edit Panel ═══════ */
function TemplateFormPanel({
  initial,
  activeTab,
  existingTitles,
  onSave,
  onCancel,
}: {
  initial?: Template;
  activeTab: "chat" | "email";
  existingTitles: string[];
  onSave: (data: { title: string; type: "chat" | "email"; body: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [type, setType] = useState<"chat" | "email">(initial?.type || activeTab);
  const [body, setBody] = useState(initial?.body || "");
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const validate = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("El titulo es obligatorio");
      return false;
    }
    const isDuplicate = existingTitles.some(
      (t) =>
        t.toLowerCase() === trimmed.toLowerCase() &&
        t.toLowerCase() !== (initial?.title || "").toLowerCase()
    );
    if (isDuplicate) {
      setError("Ya existe una plantilla con este titulo");
      return false;
    }
    if (!body.trim()) {
      setError("El contenido es obligatorio");
      return false;
    }
    setError("");
    return true;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ title: title.trim(), type, body: body.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="w-96 bg-white border border-gray-300 p-4">
      <div
        className="text-[13px] text-gray-800 mb-3"
        style={{ fontWeight: 600 }}
      >
        {initial ? "Editar plantilla" : "Nueva plantilla"}
      </div>

      {/* Title */}
      <div className="mb-3">
        <label className="text-[12px] text-gray-500 mb-1 block">Titulo</label>
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Titulo de la plantilla"
          className={`w-full px-2 py-1.5 border text-[13px] text-gray-700 focus:outline-none focus:border-gray-500 ${
            error ? "border-red-300 bg-red-50/50" : "border-gray-300"
          }`}
        />
      </div>

      {/* Type */}
      <div className="mb-3">
        <label className="text-[12px] text-gray-500 mb-1 block">Canal</label>
        <div className="flex items-center gap-2">
          {(["chat", "email"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] border cursor-pointer ${
                type === t
                  ? "border-gray-800 text-gray-800 bg-gray-50"
                  : "border-gray-300 text-gray-400 hover:text-gray-600"
              }`}
              style={{ fontWeight: type === t ? 600 : 400 }}
            >
              {t === "chat" ? (
                <MessageSquare size={12} />
              ) : (
                <Mail size={12} />
              )}
              {t === "chat" ? "Chat" : "Email"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="mb-3">
        <label className="text-[12px] text-gray-500 mb-1 block">
          Contenido
        </label>
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Escribe el contenido de la plantilla..."
          rows={3}
          className="w-full px-2 py-1.5 border border-gray-300 text-[13px] text-gray-700 focus:outline-none focus:border-gray-500 resize-none"
        />
        <p className="text-[11px] text-gray-400 mt-1">
          Variables: {"{agente}"}, {"{cliente}"}, {"{ref}"}, {"{fecha}"}
        </p>
      </div>

      {/* Error */}
      <div className="min-h-[18px] mb-2">
        {error && (
          <div className="flex items-center gap-1 text-[11px] text-red-600">
            <AlertTriangle size={10} />
            {error}
          </div>
        )}
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

/* ═══════ MAIN PAGE ═══════ */
export function TemplatesPage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, deleteTemplates } =
    useTemplatesStore();

  /* ── Tab ── */
  const [activeTab, setActiveTab] = useState<"chat" | "email">("chat");

  /* ── Search ── */
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Creating / Editing ── */
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const createPanelRef = useRef<HTMLDivElement>(null);
  useClickOutside(createPanelRef, () => setCreating(false), creating);

  const editPanelRef = useRef<HTMLDivElement>(null);
  useClickOutside(editPanelRef, () => setEditingId(null), editingId !== null);

  /* ── Selection ── */
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  /* ── Context menu ── */
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    templateId: number;
  } | null>(null);
  const ctxRef = useRef<HTMLDivElement>(null);
  useClickOutside(ctxRef, () => setContextMenu(null), !!contextMenu);

  /* ── Delete dialog ── */
  const [deleteTarget, setDeleteTarget] = useState<{
    templates: Template[];
  } | null>(null);

  /* ── Filtering (by tab + search) ── */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return templates.filter(
      (t) =>
        t.type === activeTab &&
        (q === "" ||
          t.title.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q))
    );
  }, [templates, activeTab, searchQuery]);

  /* ── Sort alphabetically ── */
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.title.localeCompare(b.title)),
    [filtered]
  );

  const existingTitles = templates.map((t) => t.title);

  const chatCount = templates.filter((t) => t.type === "chat").length;
  const emailCount = templates.filter((t) => t.type === "email").length;

  /* ── Handlers ── */
  const handleCreate = (data: {
    title: string;
    type: "chat" | "email";
    body: string;
  }) => {
    addTemplate(data);
    setCreating(false);
    toast.success(`Plantilla "${data.title}" creada`);
  };

  const handleUpdate = (
    id: number,
    data: { title: string; type: "chat" | "email"; body: string }
  ) => {
    updateTemplate(id, data);
    setEditingId(null);
    toast.success(`Plantilla "${data.title}" actualizada`);
  };

  const handleDelete = (toDelete: Template[]) => {
    const ids = toDelete.map((t) => t.id);
    if (ids.length === 1) {
      deleteTemplate(ids[0]);
    } else {
      deleteTemplates(ids);
    }
    setDeleteTarget(null);
    setSelectedIds(new Set());
    setContextMenu(null);
    const names = toDelete.map((t) => t.title).join(", ");
    toast.success(
      toDelete.length === 1
        ? `Plantilla "${names}" eliminada`
        : `${toDelete.length} plantillas eliminadas`
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
    if (selectedIds.size === sorted.length && sorted.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((t) => t.id)));
    }
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, templateId: number) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, templateId });
    },
    []
  );

  /* ── Row menu (⋯) ── */
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setOpenMenuId(null), openMenuId !== null);

  /* Clear selection when switching tabs */
  const switchTab = (tab: "chat" | "email") => {
    setActiveTab(tab);
    setSearchQuery("");
    setSelectedIds(new Set());
    setEditingId(null);
    setCreating(false);
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: "Administración", path: "/admin/usuarios" },
          { label: "Repositorios", path: "/admin/repositorios" },
          { label: "Plantillas" },
        ]}
      />

      <div className="flex-1 overflow-y-auto bg-white">
        <div
          className={`px-6 py-6 max-w-[1400px] mx-auto transition-[padding] duration-200 ${
            selectedIds.size > 0 ? "pb-20" : ""
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1
              className="text-gray-800 text-[20px]"
              style={{ fontWeight: 600 }}
            >
              Plantillas
            </h1>

            <div className="relative">
              <button
                onClick={() => {
                  setCreating(!creating);
                  setEditingId(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                <Plus size={15} />
                Nueva plantilla
              </button>

              {creating && (
                <div
                  ref={createPanelRef}
                  className="absolute right-0 top-full mt-1 z-40"
                >
                  <TemplateFormPanel
                    activeTab={activeTab}
                    existingTitles={existingTitles}
                    onSave={handleCreate}
                    onCancel={() => setCreating(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-gray-200 mb-5">
            {(["chat", "email"] as const).map((tab) => {
              const isActive = activeTab === tab;
              const count = tab === "chat" ? chatCount : emailCount;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchTab(tab)}
                  className={`px-5 py-2.5 text-[13px] cursor-pointer border-b-2 transition-colors ${
                    isActive
                      ? "border-gray-800 text-gray-800"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                  style={{ fontWeight: isActive ? 600 : 400 }}
                >
                  <span className="flex items-center gap-2">
                    {tab === "chat" ? (
                      <MessageSquare size={14} />
                    ) : (
                      <Mail size={14} />
                    )}
                    {tab === "chat" ? "Chat" : "Email"}
                    <span className="text-[11px] text-gray-400">{count}</span>
                  </span>
                </button>
              );
            })}
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
          </div>

          {/* Table */}
          {templates.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 px-8 border border-dashed border-gray-300">
              <div className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center mb-6">
                <FileStack size={32} className="text-gray-300" />
              </div>
              <h3
                className="text-[16px] text-gray-600 mb-2"
                style={{ fontWeight: 500 }}
              >
                Aun no hay plantillas
              </h3>
              <p className="text-[13px] text-gray-400 text-center max-w-sm mb-6">
                Crea tu primera plantilla de mensaje para agilizar la atencion
              </p>
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 px-5 py-2 text-[13px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                <Plus size={16} />
                Crear plantilla
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
                        checked={
                          sorted.length > 0 &&
                          selectedIds.size === sorted.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer pointer-events-none"
                        tabIndex={-1}
                      />
                    </th>
                    <th
                      className="px-3 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider"
                      style={{ fontWeight: 600 }}
                    >
                      Titulo
                    </th>
                    <th
                      className="px-3 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider"
                      style={{ fontWeight: 600 }}
                    >
                      Contenido
                    </th>
                    <th
                      className="px-3 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider w-28"
                      style={{ fontWeight: 600 }}
                    >
                      Actualizada
                    </th>
                    <th className="w-12 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((tpl) => {
                    const isSelected = selectedIds.has(tpl.id);
                    return (
                      <tr
                        key={tpl.id}
                        className={`group/row border-b border-gray-200 hover:bg-gray-50 ${
                          isSelected ? "bg-gray-100" : ""
                        }`}
                        onContextMenu={(e) =>
                          handleContextMenu(e, tpl.id)
                        }
                      >
                        {/* Checkbox — hover pattern */}
                        <td
                          className="px-3 py-3 w-10 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(tpl.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(tpl.id)}
                            className={`w-4 h-4 cursor-pointer pointer-events-none transition-opacity ${
                              isSelected
                                ? "opacity-100"
                                : "opacity-0 group-hover/row:opacity-100"
                            }`}
                            tabIndex={-1}
                          />
                        </td>

                        {/* Title */}
                        <td className="px-3 py-3 relative">
                          <span
                            className="text-[13px] text-gray-700"
                            style={{ fontWeight: 500 }}
                          >
                            {tpl.title}
                          </span>

                          {editingId === tpl.id && (
                            <div
                              ref={editPanelRef}
                              className="absolute left-3 top-full mt-1 z-40"
                            >
                              <TemplateFormPanel
                                initial={tpl}
                                activeTab={activeTab}
                                existingTitles={existingTitles}
                                onSave={(data) =>
                                  handleUpdate(tpl.id, data)
                                }
                                onCancel={() => setEditingId(null)}
                              />
                            </div>
                          )}
                        </td>

                        {/* Body preview */}
                        <td className="px-3 py-3 text-[13px] text-gray-400 max-w-[400px]">
                          <span className="block truncate">{tpl.body}</span>
                        </td>

                        {/* Updated */}
                        <td className="px-3 py-3 text-[12px] text-gray-400 w-28">
                          {tpl.updatedAt}
                        </td>

                        {/* Row actions */}
                        <td className="px-3 py-3 text-right">
                          <div className="relative inline-flex">
                            <button
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === tpl.id ? null : tpl.id
                                )
                              }
                              className="p-2 hover:bg-gray-200 cursor-pointer inline-flex items-center justify-center"
                            >
                              <MoreHorizontal
                                size={16}
                                className="text-gray-400"
                              />
                            </button>

                            {openMenuId === tpl.id && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-gray-300 py-1"
                              >
                                <button
                                  onClick={() => {
                                    setEditingId(tpl.id);
                                    setOpenMenuId(null);
                                    setCreating(false);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                  <Pencil
                                    size={13}
                                    className="text-gray-400"
                                  />
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTarget({
                                      templates: [tpl],
                                    });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                  <Trash2
                                    size={13}
                                    className="text-gray-400"
                                  />
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
                      <td colSpan={5} className="py-12 text-center">
                        <Search
                          size={20}
                          className="text-gray-200 mx-auto mb-2"
                        />
                        <div
                          className="text-[13px] text-gray-500"
                          style={{ fontWeight: 500 }}
                        >
                          Sin resultados
                        </div>
                        <div className="text-[12px] text-gray-400 mt-0.5">
                          No hay plantillas de{" "}
                          {activeTab === "chat" ? "chat" : "email"} que
                          coincidan
                          {searchQuery ? ` con "${searchQuery}"` : ""}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {templates.length > 0 && (
            <div className="flex items-center justify-between mt-3 text-[12px] text-gray-400">
              <div />
              <span>
                {sorted.length} plantilla{sorted.length !== 1 ? "s" : ""}
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
              setEditingId(contextMenu.templateId);
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
              const tpl = templates.find(
                (t) => t.id === contextMenu.templateId
              );
              if (tpl) setDeleteTarget({ templates: [tpl] });
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
        <DeleteEntityDialog
          type={deleteTarget.templates.length === 1 ? "single" : "bulk"}
          items={deleteTarget.templates.map((t) => ({ id: t.id, name: t.title }))}
          entitySingular="plantilla"
          entityPlural="plantillas"
          singleDetailMessage="Los agentes y grupos que la tengan asignada perderan la referencia."
          bulkFooterMessage="Los agentes y grupos que las tengan asignadas perderan la referencia."
          onClose={() => setDeleteTarget(null)}
          onConfirm={(remainingIds) => {
            if (remainingIds) {
              const toDelete = deleteTarget.templates.filter((t) => remainingIds.includes(t.id));
              handleDelete(toDelete);
            } else {
              handleDelete(deleteTarget.templates);
            }
          }}
        />
      )}

      {/* ── Bulk action bar (fixed bottom, consistent with Agents/Groups/Labels) ── */}
      <BulkActionBar
        count={selectedIds.size}
        entitySingular="plantilla"
        entityPlural="plantillas"
        selectedSuffix={{ singular: "seleccionada", plural: "seleccionadas" }}
        onClear={() => setSelectedIds(new Set())}
      >
        <button
          onClick={() => {
            const toDelete = templates.filter((t) =>
              selectedIds.has(t.id)
            );
            setDeleteTarget({ templates: toDelete });
          }}
          className="px-3 py-1.5 border border-red-400 text-red-400 text-[12px] hover:bg-red-400/10 cursor-pointer"
        >
          Eliminar
        </button>
      </BulkActionBar>
    </>
  );
}