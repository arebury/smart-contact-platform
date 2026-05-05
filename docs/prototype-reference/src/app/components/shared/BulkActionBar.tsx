import { type ReactNode } from "react";
import { X } from "lucide-react";

/* ───── BulkActionBar (DD#298) ─────
   Fixed bottom bar that appears when items are selected in list pages.
   Provides: selection count + clear button on the left, custom actions on the right.
   Used by: AgentsListPage, GroupsListPage, LabelsPage, UsersListPage.
   ────────────────────────────────────────────────────────────────── */

interface BulkActionBarProps {
  /** Number of selected items */
  count: number;
  /** Singular entity label: "agente", "grupo", "etiqueta", etc. */
  entitySingular: string;
  /** Plural entity label: "agentes", "grupos", "etiquetas", etc. */
  entityPlural: string;
  /** Optional gender-aware suffix for "seleccionado/a/os/as" — defaults to masculine */
  selectedSuffix?: { singular: string; plural: string };
  /** Called when user clicks the X to clear selection */
  onClear: () => void;
  /** Right-side actions (delete button, bulk edit controls, etc.) */
  children?: ReactNode;
}

export function BulkActionBar({
  count,
  entitySingular,
  entityPlural,
  selectedSuffix,
  onClear,
  children,
}: BulkActionBarProps) {
  if (count === 0) return null;

  const label = count === 1 ? entitySingular : entityPlural;
  const suffix = selectedSuffix
    ? count === 1 ? selectedSuffix.singular : selectedSuffix.plural
    : count === 1 ? "seleccionado" : "seleccionados";

  return (
    <div className="fixed bottom-0 left-[var(--sidebar-w,220px)] right-0 bg-gray-800 text-white px-6 py-3 flex items-center justify-between flex-wrap gap-y-2 z-40">
      {/* Left: Selection count + clear */}
      <div className="flex items-center gap-2.5 text-[13px]">
        <span className="text-white/90">
          {count} {label} {suffix}
        </span>
        <button
          onClick={onClear}
          className="text-white/40 hover:text-white cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Right: Custom actions */}
      {children && (
        <div className="flex items-center gap-2.5 text-[13px]">
          {children}
        </div>
      )}
    </div>
  );
}
