import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Pencil, Check, X, Loader2, Trash2 } from "lucide-react";

/* ───── StickyFormHeader (DD#299) ─────
   Shared header for all Create/Edit pages with:
   - Inline name editing (click to edit, Enter to confirm, Escape to cancel)
   - Cancel / Save buttons
   - Optional Delete button (icon only, before Cancel)
   - Exposes startEditing() via ref for programmatic trigger (e.g. validation)
   Used by: CreateAgentPage, CreateGroupPage, CreateUserPage.
   ────────────────────────────────────────────────────────────────── */

export interface StickyFormHeaderHandle {
  /** Programmatically open inline name editing (e.g. from save validation) */
  startEditing: () => void;
}

interface StickyFormHeaderProps {
  /** Current name value */
  name: string;
  /** Called when user confirms a new name */
  onNameChange: (newName: string) => void;
  /** Whether we're editing an existing entity (enables inline name editing) */
  isEdit: boolean;
  /** Fallback display name when name is empty in edit mode, e.g. "Editar agente" */
  editFallbackTitle: string;
  /** Title shown in create mode, e.g. "Crear agente" */
  createTitle: string;
  /** Navigate away on Cancel */
  onCancel: () => void;
  /** Save handler */
  onSave: () => void;
  /** Whether save is in progress */
  saving: boolean;
  /** Whether save button should be disabled */
  saveDisabled: boolean;
  /** Optional: show delete (Trash) icon button before Cancel */
  onDelete?: () => void;
  /** Optional: delete button title for accessibility */
  deleteTitle?: string;
}

export const StickyFormHeader = forwardRef<StickyFormHeaderHandle, StickyFormHeaderProps>(
  function StickyFormHeader(
    {
      name,
      onNameChange,
      isEdit,
      editFallbackTitle,
      createTitle,
      onCancel,
      onSave,
      saving,
      saveDisabled,
      onDelete,
      deleteTitle = "Eliminar",
    },
    ref,
  ) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const startEditing = () => {
      setDraft(name);
      setEditing(true);
      setTimeout(() => inputRef.current?.select(), 0);
    };

    useImperativeHandle(ref, () => ({ startEditing }), [name]);

    const confirmName = () => {
      if (draft.trim()) {
        onNameChange(draft.trim());
      }
      setEditing(false);
    };

    const cancelEditing = () => {
      setEditing(false);
    };

    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        {/* Left: Name display / edit */}
        {isEdit && !editing ? (
          <button
            type="button"
            className="group flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
            onClick={startEditing}
            title="Editar nombre"
          >
            <h1
              className="text-gray-800 text-[20px]"
              style={{ fontWeight: 600 }}
            >
              {name || editFallbackTitle}
            </h1>
            <Pencil size={14} className="text-gray-300 opacity-30 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : isEdit && editing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); confirmName(); }
                else if (e.key === "Escape") { cancelEditing(); }
              }}
              onBlur={() => {
                if (draft.trim() && draft.trim() !== name) {
                  onNameChange(draft.trim());
                }
                setEditing(false);
              }}
              className="text-gray-800 text-[20px] bg-transparent border-b-2 border-gray-400 outline-none px-0 py-0 w-[300px]"
              style={{ fontWeight: 600 }}
            />
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              onMouseDown={(e) => { e.preventDefault(); confirmName(); }}
              title="Confirmar"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              onMouseDown={(e) => { e.preventDefault(); cancelEditing(); }}
              title="Cancelar"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <h1
            className="text-gray-800 text-[20px]"
            style={{ fontWeight: 600 }}
          >
            {createTitle}
          </h1>
        )}

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2.5">
          {onDelete && isEdit && (
            <button
              onClick={onDelete}
              className="px-3 py-2 text-[13px] text-red-400 hover:text-red-500 cursor-pointer border border-gray-300 hover:bg-red-50"
              title={deleteTitle}
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-700 cursor-pointer border border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saveDisabled || saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-white text-[13px] cursor-pointer bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontWeight: 500 }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    );
  },
);
