import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { TopBar } from "../../layout/TopBar";
import { useClickOutside } from "../../shared/useClickOutside";
import { BulkActionBar } from "../../shared/BulkActionBar";
import { toast } from "sonner";
import type { ReactNode } from "react";
import {
  Plus,
  Search,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  AlertTriangle,
  Download,
} from "lucide-react";
import { exportToXlsx } from "../../shared/exportXlsx";

/* ── Types ── */
interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface RepoColumnDef<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  width?: string;
  headerClass?: string;
}

export interface RepoFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "status";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface RepositoryListPageProps<T extends { id: number; name: string }> {
  title: string;
  entityName: string;
  entityNamePlural: string;
  breadcrumbs: BreadcrumbItem[];
  icon: ReactNode;
  items: T[];
  columns: RepoColumnDef<T>[];
  searchKeys: (keyof T)[];
  formFields: RepoFieldDef[];
  onAdd: (data: Record<string, string>) => void;
  onUpdate: (id: number, data: Record<string, string>) => void;
  onDelete: (id: number) => void;
  onDeleteMany: (ids: number[]) => void;
  /** Extra columns for XLSX export */
  xlsxColumns?: { header: string; accessor: (item: T) => string }[];
}

/* ═══════ Inline Form Panel ═══════ */
function FormPanel<T extends { id: number; name: string }>({
  fields,
  initial,
  existingNames,
  entityName,
  onSave,
  onCancel,
}: {
  fields: RepoFieldDef[];
  initial?: T;
  existingNames: string[];
  entityName: string;
  onSave: (data: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of fields) {
      v[f.key] = initial ? String((initial as Record<string, unknown>)[f.key] ?? "") : (f.type === "select" && f.options?.length ? f.options[0].value : "");
    }
    return v;
  });
  const [error, setError] = useState("");
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const handleChange = (key: string, val: string) => {
    setValues((p) => ({ ...p, [key]: val }));
    setError("");
  };

  const validate = () => {
    const name = values.name?.trim();
    if (!name) { setError("El nombre es obligatorio"); return false; }
    const dup = existingNames.some(
      (n) => n.toLowerCase() === name.toLowerCase() && n.toLowerCase() !== (initial?.name ?? "").toLowerCase()
    );
    if (dup) { setError(`Ya existe un/a ${entityName} con este nombre`); return false; }
    for (const f of fields) {
      if (f.required && !values[f.key]?.trim()) {
        setError(`"${f.label}" es obligatorio`);
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (validate()) {
      const trimmed: Record<string, string> = {};
      for (const f of fields) trimmed[f.key] = values[f.key]?.trim() ?? "";
      onSave(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="w-80 bg-white border border-gray-300 p-4">
      <div className="text-[13px] text-gray-800 mb-3" style={{ fontWeight: 600 }}>
        {initial ? `Editar ${entityName}` : `Nuevo/a ${entityName}`}
      </div>
      {fields.map((f, i) => (
        <div key={f.key} className="mb-3">
          <label className="text-[12px] text-gray-500 mb-1 block">
            {f.label}
            {!f.required && <span className="text-gray-300 ml-1">(opcional)</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea
              value={values[f.key] ?? ""}
              onChange={(e) => handleChange(f.key, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
              placeholder={f.placeholder}
              className="w-full px-2 py-1.5 border border-gray-300 text-[13px] text-gray-700 focus:outline-none focus:border-gray-500 resize-none h-16"
            />
          ) : f.type === "select" || f.type === "status" ? (
            <select
              value={values[f.key] ?? ""}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 text-[13px] text-gray-700 focus:outline-none focus:border-gray-500 bg-white"
            >
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              ref={i === 0 ? firstRef : undefined}
              type="text"
              value={values[f.key] ?? ""}
              onChange={(e) => handleChange(f.key, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={f.placeholder}
              className={`w-full px-2 py-1.5 border text-[13px] text-gray-700 focus:outline-none focus:border-gray-500 ${
                error && f.key === "name" ? "border-red-300 bg-red-50/50" : "border-gray-300"
              }`}
            />
          )}
        </div>
      ))}
      <div className="min-h-[18px] mb-2">
        {error && (
          <div className="flex items-center gap-1 text-[11px] text-red-600">
            <AlertTriangle size={10} />
            {error}
          </div>
        )}
      </div>
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

/* ═══════ Row Context Menu ═══════ */
function RowMenu({
  pos,
  onEdit,
  onDelete,
  onClose,
}: {
  pos: { x: number; y: number };
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose, true);

  const top = Math.min(pos.y, window.innerHeight - 120);
  const left = Math.min(pos.x, window.innerWidth - 180);

  return (
    <div
      ref={ref}
      className="fixed z-50 w-40 bg-white border border-gray-300 py-1"
      style={{ top, left }}
    >
      <button
        className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-100 cursor-pointer"
        onClick={onEdit}
      >
        <Pencil size={13} className="text-gray-400" /> Editar
      </button>
      <button
        className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 cursor-pointer"
        onClick={onDelete}
      >
        <Trash2 size={13} /> Eliminar
      </button>
    </div>
  );
}

/* ═══════ Delete Dialog ═══════ */
function DeleteDialog({
  entityName,
  names,
  onConfirm,
  onCancel,
}: {
  entityName: string;
  names: string[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onCancel} />
      <div ref={ref} className="relative bg-white border border-gray-300 w-[420px] p-6">
        <div className="text-[14px] text-gray-800 mb-2" style={{ fontWeight: 600 }}>
          {names.length > 1
            ? `Eliminar ${names.length} ${entityName}s`
            : `Eliminar ${entityName}`}
        </div>
        <p className="text-[13px] text-gray-500 mb-4">
          {names.length === 1 ? (
            <>Se eliminará <strong className="text-gray-700">"{names[0]}"</strong>. Esta acción no se puede deshacer.</>
          ) : (
            <>Se eliminarán {names.length} registros. Esta acción no se puede deshacer.</>
          )}
        </p>
        {names.length > 1 && (
          <div className="mb-4 max-h-24 overflow-y-auto border border-gray-200 p-2">
            {names.map((n) => (
              <div key={n} className="text-[12px] text-gray-600 py-0.5">{n}</div>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-1.5">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-[12px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-[12px] text-white bg-red-600 hover:bg-red-700 cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════ MAIN COMPONENT ═══════ */
export function RepositoryListPage<T extends { id: number; name: string }>({
  title,
  entityName,
  entityNamePlural,
  breadcrumbs,
  icon,
  items,
  columns,
  searchKeys,
  formFields,
  onAdd,
  onUpdate,
  onDelete,
  onDeleteMany,
  xlsxColumns,
}: RepositoryListPageProps<T>) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showForm, setShowForm] = useState<false | "add" | number>(false);
  const [ctxMenu, setCtxMenu] = useState<{ id: number; x: number; y: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number[] | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  useClickOutside(formRef, () => { if (showForm) setShowForm(false); }, !!showForm);

  /* ── Filtered items ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      searchKeys.some((k) => {
        const v = (item as Record<string, unknown>)[k as string];
        return typeof v === "string" && v.toLowerCase().includes(q);
      })
    );
  }, [items, search, searchKeys]);

  /* ── Handlers ── */
  const handleAdd = useCallback(
    (data: Record<string, string>) => {
      onAdd(data);
      setShowForm(false);
      toast.success(`${entityName} creado/a`);
    },
    [onAdd, entityName]
  );

  const handleUpdate = useCallback(
    (id: number, data: Record<string, string>) => {
      onUpdate(id, data);
      setShowForm(false);
      toast.success(`${entityName} actualizado/a`);
    },
    [onUpdate, entityName]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    if (deleteTarget.length === 1) {
      onDelete(deleteTarget[0]);
      toast.success(`${entityName} eliminado/a`);
    } else {
      onDeleteMany(deleteTarget);
      toast.success(`${deleteTarget.length} ${entityNamePlural} eliminados/as`);
    }
    setDeleteTarget(null);
    setSelected(new Set());
  }, [deleteTarget, onDelete, onDeleteMany, entityName, entityNamePlural]);

  const handleContextMenu = useCallback((e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setCtxMenu({ id, x: e.clientX, y: e.clientY });
  }, []);

  const toggleSelect = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }, [filtered, selected.size]);

  const handleExport = useCallback(() => {
    const cols = xlsxColumns ?? columns.map((c) => ({
      header: c.label,
      accessor: (item: T) => String((item as Record<string, unknown>)[c.key] ?? ""),
    }));
    exportToXlsx({
      filename: title.toLowerCase().replace(/\s+/g, "-"),
      headers: cols.map((c) => c.header),
      rows: items.map((item) => cols.map((c) => c.accessor(item))),
    });
    toast.success("Exportación completada");
  }, [items, columns, xlsxColumns, title]);

  const existingNames = useMemo(() => items.map((i) => i.name), [items]);
  const deleteNames = useMemo(
    () => (deleteTarget ? items.filter((i) => deleteTarget.includes(i.id)).map((i) => i.name) : []),
    [deleteTarget, items]
  );

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6 max-w-[960px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-400">{icon}</span>
              <h1 className="text-[20px] text-gray-800" style={{ fontWeight: 600 }}>
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
                style={{ fontWeight: 500 }}
                title="Exportar a Excel"
              >
                <Download size={13} />
                Exportar
              </button>
              <div className="relative" ref={formRef}>
                <button
                  onClick={() => setShowForm(showForm === "add" ? false : "add")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
                  style={{ fontWeight: 500 }}
                >
                  <Plus size={13} />
                  Crear
                </button>
                {showForm === "add" && (
                  <div className="absolute right-0 top-9 z-30">
                    <FormPanel
                      fields={formFields}
                      existingNames={existingNames}
                      entityName={entityName}
                      onSave={handleAdd}
                      onCancel={() => setShowForm(false)}
                    />
                  </div>
                )}
                {typeof showForm === "number" && (
                  <div className="absolute right-0 top-9 z-30">
                    <FormPanel
                      fields={formFields}
                      initial={items.find((i) => i.id === showForm)}
                      existingNames={existingNames}
                      entityName={entityName}
                      onSave={(data) => handleUpdate(showForm, data)}
                      onCancel={() => setShowForm(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4 w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ${entityNamePlural}...`}
              className="w-full pl-8 pr-7 py-1.5 border border-gray-300 text-[13px] text-gray-700 focus:outline-none focus:border-gray-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Table */}
          <div className="border border-gray-300">
            {/* Header */}
            <div className="flex items-center bg-gray-50 border-b border-gray-300 px-3 py-2">
              <div className="w-8 shrink-0 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
              {columns.map((col) => (
                <div
                  key={col.key}
                  className={`text-[11px] text-gray-500 uppercase tracking-wider px-2 ${col.width ?? "flex-1"} ${col.headerClass ?? ""}`}
                  style={{ fontWeight: 600 }}
                >
                  {col.label}
                </div>
              ))}
              <div className="w-8 shrink-0" />
            </div>

            {/* Body */}
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-[13px] text-gray-400">
                {search ? "Sin resultados para la búsqueda" : `No hay ${entityNamePlural}`}
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center px-3 py-2.5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50/60 group transition-colors cursor-default ${
                    selected.has(item.id) ? "bg-gray-50" : "bg-white"
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, item.id)}
                >
                  <div className="w-8 shrink-0 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                  {columns.map((col) => (
                    <div key={col.key} className={`px-2 ${col.width ?? "flex-1"} min-w-0`}>
                      {col.render(item)}
                    </div>
                  ))}
                  <div className="w-8 shrink-0 flex items-center justify-center">
                    <button
                      onClick={(e) => setCtxMenu({ id: item.id, x: e.clientX, y: e.clientY })}
                      className="text-gray-300 hover:text-gray-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <RowMenu
          pos={{ x: ctxMenu.x, y: ctxMenu.y }}
          onEdit={() => { setShowForm(ctxMenu.id); setCtxMenu(null); }}
          onDelete={() => { setDeleteTarget([ctxMenu.id]); setCtxMenu(null); }}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          entityName={entityName}
          names={deleteNames}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          entitySingular={entityName}
          entityPlural={entityNamePlural}
          onClear={() => setSelected(new Set())}
        >
          <button
            onClick={() => setDeleteTarget(Array.from(selected))}
            className="px-3 py-1.5 border border-red-400 text-red-400 text-[12px] hover:bg-red-400/10 cursor-pointer"
          >
            Eliminar
          </button>
        </BulkActionBar>
      )}
    </>
  );
}