import { useState, useRef, useMemo, useCallback, useEffect, type MouseEvent as ReactMouseEvent } from "react";
import { useNavigate } from "react-router";
import { TopBar } from "../layout/TopBar";
import { useUsersStore } from "./useUsersStore";
import { userTypeLabels, type User } from "./usersData";
import { ContextMenu, SortableHeader } from "../shared/TableComponents";
import { DeleteEntityDialog } from "../shared/DeleteEntityDialog";
import { BulkActionBar } from "../shared/BulkActionBar";
import { exportToXlsx } from "../shared/exportXlsx";
import { pushUndo, removeUndo } from "../shared/undoStack";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  UserCog,
  Download,
  FilePen,
  Check,
} from "lucide-react";

/* ═══════ Sort field type ═══════ */
type SortField = "name" | "email" | "type" | "identifier" | "status" | null;

/* ═══════ MAIN PAGE ═══════ */
export function UsersListPage() {
  const navigate = useNavigate();
  const { users, deleteUser, deleteUsers, duplicateUser, setUsers } = useUsersStore();

  /* ── Search ── */
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Selection ── */
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  /* ── Sort ── */
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  /* ── Context menu ── */
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; userId: number } | null>(null);

  /* ── Delete dialog ── */
  const [deleteTarget, setDeleteTarget] = useState<{ type: "single" | "bulk"; items: { id: number; name: string }[] } | null>(null);

  // Duplicate inline edit state (DD#301: consistent with Agents/Groups)
  const [duplicateRow, setDuplicateRow] = useState<{
    sourceUser: User;
    editName: string;
  } | null>(null);
  const duplicateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (duplicateRow && duplicateInputRef.current) {
      duplicateInputRef.current.focus();
      duplicateInputRef.current.select();
    }
  }, [duplicateRow]);

  /* ── Filtering + Sorting ── */
  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.identifier.toLowerCase().includes(q) ||
        userTypeLabels[u.type].toLowerCase().includes(q)
    );

    result = [...result].sort((a, b) => {
      // Drafts first
      if (a.isDraft && !b.isDraft) return -1;
      if (!a.isDraft && b.isDraft) return 1;

      if (!sortField) return 0;

      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name, "es");
          break;
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "type":
          cmp = userTypeLabels[a.type].localeCompare(userTypeLabels[b.type]);
          break;
        case "identifier":
          cmp = a.identifier.localeCompare(b.identifier);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [users, searchQuery, sortField, sortDir]);

  const selectedUsers = useMemo(
    () => users.filter((u) => selectedIds.has(u.id)),
    [users, selectedIds]
  );

  /* ── Handlers ── */
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected =
    filteredAndSorted.length > 0 &&
    filteredAndSorted.every((u) => selectedIds.has(u.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSorted.map((u) => u.id)));
    }
  };

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent, userId: number) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, userId });
    },
    []
  );

  /* ── Delete ── */
  const handleDeleteConfirm = (remainingIds?: number[]) => {
    if (!deleteTarget) return;

    const idsToDelete = deleteTarget.type === "bulk" && remainingIds
      ? remainingIds
      : deleteTarget.items.map((i) => i.id);

    // Snapshot for undo
    const snapshot = users.filter((u) => idsToDelete.includes(u.id));
    const names = snapshot.map((u) => u.name);

    if (idsToDelete.length === 1) {
      deleteUser(idsToDelete[0]);
    } else {
      deleteUsers(idsToDelete);
    }

    const toastMsg =
      idsToDelete.length === 1
        ? `Usuario "${names[0]}" eliminado`
        : `${idsToDelete.length} usuarios eliminados`;

    const toastId = toast.success(toastMsg, {
      action: {
        label: "Deshacer",
        onClick: () => {
          setUsers((prev) => [...prev, ...snapshot]);
          removeUndo(toastId);
          toast.success("Eliminacion deshecha");
        },
      },
      duration: 8000,
    });

    pushUndo(toastId, () => {
      setUsers((prev) => [...prev, ...snapshot]);
      toast.success("Eliminacion deshecha");
    }, toastMsg);

    setDeleteTarget(null);
    setSelectedIds(new Set());
    setContextMenu(null);
  };

  /* ── Duplicate (DD#301: inline pattern, consistent with Agents/Groups) ── */
  const handleDuplicate = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setDuplicateRow({
      sourceUser: user,
      editName: `Copia de ${user.name}`,
    });
  };

  const confirmDuplicate = () => {
    if (!duplicateRow) return;
    const name =
      duplicateRow.editName.trim() ||
      `Copia de ${duplicateRow.sourceUser.name}`;
    const newUser = duplicateUser(duplicateRow.sourceUser.id, name);
    if (newUser) {
      const undoFn = () => deleteUser(newUser.id);
      const tId = toast.success(
        `Borrador «${name}» creado`,
        {
          description: "Revisa la configuración y guarda para activar el usuario.",
          duration: 8000,
          action: {
            label: "Deshacer",
            onClick: () => {
              undoFn();
              removeUndo(tId);
              toast("Duplicado revertido");
            },
          },
        }
      );
      pushUndo(tId, undoFn, `Duplicado "${name}" eliminado`);
    }
    setDuplicateRow(null);
  };

  const cancelDuplicate = () => {
    setDuplicateRow(null);
  };

  /* ── Export ── */
  const handleExport = () => {
    const headers = ["Nombre", "Email", "Tipo", "Identificador", "Estado", "Grupos", "Servicios"];
    const rows = filteredAndSorted.map((u) => [
      u.name,
      u.email,
      userTypeLabels[u.type],
      u.identifier,
      u.status === "active" ? "Activo" : "Inactivo",
      u.assignedGroups.length,
      u.assignedServices.length,
    ]);
    exportToXlsx({ headers, rows, sheetName: "Usuarios", filePrefix: "usuarios" });
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: "Administración", path: "/admin/usuarios" },
          { label: "Usuarios" },
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
              Usuarios
            </h1>

            <button
              onClick={() => navigate("/admin/usuarios/crear")}
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
              style={{ fontWeight: 500 }}
            >
              <Plus size={15} />
              Nuevo usuario
            </button>
          </div>

          {/* Action bar (DD#300: Exportar moved here for consistency with Agents/Groups/Labels) */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar por nombre, email, tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (searchQuery) setSearchQuery("");
                    else (e.target as HTMLInputElement).blur();
                  }
                }}
                className="pl-9 pr-3 py-2 border border-gray-300 text-[13px] w-80 focus:outline-none focus:border-gray-500 bg-white"
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
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-8 border border-dashed border-gray-300">
              <div className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center mb-6">
                <UserCog size={32} className="text-gray-300" />
              </div>
              <h3
                className="text-[16px] text-gray-600 mb-2"
                style={{ fontWeight: 500 }}
              >
                Aun no hay usuarios
              </h3>
              <p className="text-[13px] text-gray-400 text-center max-w-sm mb-6">
                Crea tu primer usuario para gestionar el acceso al sistema
              </p>
              <button
                onClick={() => navigate("/admin/usuarios/crear")}
                className="inline-flex items-center gap-2 px-5 py-2 text-[13px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                <Plus size={16} />
                Crear usuario
              </button>
            </div>
          ) : (
            <div className="border border-gray-300 overflow-hidden bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="w-10 px-3 py-3 cursor-pointer" onClick={toggleAll}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="w-4 h-4 cursor-pointer pointer-events-none"
                        tabIndex={-1}
                      />
                    </th>
                    <SortableHeader
                      label="Nombre"
                      field="name"
                      activeField={sortField}
                      direction={sortDir}
                      onSort={() => toggleSort("name")}
                    />
                    <SortableHeader
                      label="Email"
                      field="email"
                      activeField={sortField}
                      direction={sortDir}
                      onSort={() => toggleSort("email")}
                    />
                    <SortableHeader
                      label="Tipo"
                      field="type"
                      activeField={sortField}
                      direction={sortDir}
                      onSort={() => toggleSort("type")}
                    />
                    <SortableHeader
                      label="Identificador"
                      field="identifier"
                      activeField={sortField}
                      direction={sortDir}
                      onSort={() => toggleSort("identifier")}
                    />
                    <SortableHeader
                      label="Estado"
                      field="status"
                      activeField={sortField}
                      direction={sortDir}
                      onSort={() => toggleSort("status")}
                    />
                    <th
                      className="px-3 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider"
                      style={{ fontWeight: 600 }}
                    >
                      Grupos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Inline duplicate row — appears at the top (DD#301) */}
                  {duplicateRow && (
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          disabled
                          className="w-4 h-4 opacity-30"
                        />
                      </td>
                      <td className="px-3 py-3" colSpan={5}>
                        <div className="flex items-center gap-2">
                          <input
                            ref={duplicateInputRef}
                            type="text"
                            value={duplicateRow.editName}
                            onChange={(e) =>
                              setDuplicateRow({
                                ...duplicateRow,
                                editName: e.target.value,
                              })
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
                  {filteredAndSorted.map((user) => {
                    const isSelected = selectedIds.has(user.id);
                    return (
                      <tr
                        key={user.id}
                        className={`group/row border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                          isSelected ? "bg-gray-100" : ""
                        }`}
                        onClick={() => navigate(`/admin/usuarios/editar/${user.id}`)}
                        onContextMenu={(e) => handleContextMenu(e, user.id)}
                      >
                        {/* Checkbox */}
                        <td
                          className="px-3 py-3 w-10 relative"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(user.id);
                          }}
                        >
                          {/* Draft indicator */}
                          {user.isDraft && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-400" />
                          )}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(user.id)}
                            className={`w-4 h-4 cursor-pointer pointer-events-none transition-opacity ${
                              isSelected
                                ? "opacity-100"
                                : "opacity-0 group-hover/row:opacity-100"
                            }`}
                            tabIndex={-1}
                          />
                        </td>

                        {/* Name */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {user.isDraft && (
                              <FilePen size={13} className="text-amber-500 shrink-0" />
                            )}
                            <span
                              className="text-[13px] text-gray-700"
                              style={{ fontWeight: 500 }}
                            >
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-3 py-3 text-[13px] text-gray-500">
                          {user.email || <span className="text-gray-300 italic">Sin email</span>}
                        </td>

                        {/* Type */}
                        <td className="px-3 py-3">
                          <span className="text-[12px] text-gray-500 border border-gray-200 px-2 py-0.5">
                            {userTypeLabels[user.type]}
                          </span>
                        </td>

                        {/* Identifier */}
                        <td className="px-3 py-3 text-[13px] text-gray-400 font-mono">
                          {user.identifier}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3">
                          <span
                            className={`text-[12px] px-2 py-0.5 border ${
                              user.status === "active"
                                ? "text-gray-700 border-gray-300 bg-gray-50"
                                : "text-gray-400 border-gray-200"
                            }`}
                          >
                            {user.status === "active" ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        {/* Groups count */}
                        <td className="px-3 py-3 text-[13px] text-gray-400">
                          {user.assignedGroups.length}
                        </td>
                      </tr>
                    );
                  })}

                  {/* No results */}
                  {filteredAndSorted.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Search size={20} className="text-gray-200 mx-auto mb-2" />
                        <div
                          className="text-[13px] text-gray-500"
                          style={{ fontWeight: 500 }}
                        >
                          Sin resultados
                        </div>
                        <div className="text-[12px] text-gray-400 mt-0.5">
                          No hay usuarios que coincidan
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
          {users.length > 0 && (
            null
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onEdit={() => {
            navigate(`/admin/usuarios/editar/${contextMenu.userId}`);
            setContextMenu(null);
          }}
          onDuplicate={() => {
            handleDuplicate(contextMenu.userId);
            setContextMenu(null);
          }}
          onDelete={() => {
            const user = users.find((u) => u.id === contextMenu.userId);
            if (user) setDeleteTarget({ type: "single", items: [{ id: user.id, name: user.name }] });
            setContextMenu(null);
          }}
        />
      )}

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteEntityDialog
          type={deleteTarget.type}
          items={deleteTarget.items}
          entitySingular="usuario"
          entityPlural="usuarios"
          singleDetailMessage="El usuario perdera acceso al sistema inmediatamente."
          bulkFooterMessage="Los usuarios perderan acceso al sistema inmediatamente."
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Bulk action bar */}
      <BulkActionBar
        count={selectedIds.size}
        entitySingular="usuario"
        entityPlural="usuarios"
        onClear={() => setSelectedIds(new Set())}
      >
        <button
          onClick={() => {
            setDeleteTarget({
              type: "bulk",
              items: selectedUsers.map((u) => ({ id: u.id, name: u.name })),
            });
          }}
          className="px-3 py-1.5 border border-red-400 text-red-400 text-[12px] hover:bg-red-400/10 cursor-pointer"
        >
          Eliminar
        </button>
      </BulkActionBar>
    </>
  );
}