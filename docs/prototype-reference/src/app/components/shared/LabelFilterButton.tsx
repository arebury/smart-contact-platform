import { useState, useRef, useCallback, useEffect } from "react";
import { Tag, Check, X } from "lucide-react";
import { useClickOutside } from "./useClickOutside";
import { useKeyboardNav } from "./useKeyboardNav";
import { Tooltip } from "./Tooltip";
import type { Label } from "../labels/labelsData";
import { labelColorStyles } from "../labels/labelsData";
import { LabelChip } from "../labels/LabelsPage";

/* ───── Unified Label Filter (DD#221) ─────
   Two visual variants sharing logic (useClickOutside + useKeyboardNav):
     • "action-bar" — Tag icon, tooltip, checkbox rows with LabelChip (DD#208, DD#233)
     • "compact"    — Tag icon, dot+text rows, circle badge (DD#219)
     • "header"     — borderless Tag icon for table headers (DD#233)
   Replaces the old separate LabelFilterDropdown and LabelFilterButton. */

type Variant = "action-bar" | "compact" | "header";
type Placement = "left" | "right";

interface LabelFilterProps {
  allLabels: Label[];
  filterIds: Set<number>;
  onToggle: (id: number) => void;
  onClear: () => void;
  variant?: Variant;
  /** Horizontal alignment of the dropdown panel (default: "left" for action-bar, "right" for compact) */
  placement?: Placement;
  /** Icon size in px (only for compact variant; default 13) */
  iconSize?: number;
  /** z-index for the dropdown panel (default 50) */
  zIndex?: number;
  /** External signal to force-close the panel */
  forceClose?: boolean;
}

export function LabelFilterButton({
  allLabels,
  filterIds,
  onToggle,
  onClear,
  variant = "compact",
  placement,
  iconSize = 13,
  zIndex = 50,
  forceClose,
}: LabelFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useClickOutside(ref, close, open);

  // Track previous forceClose to detect rising edge (false→true)
  const prevForceCloseRef = useRef(forceClose);
  useEffect(() => {
    // Only close on rising edge: forceClose went from false → true
    if (forceClose && !prevForceCloseRef.current && open) {
      setOpen(false);
    }
    prevForceCloseRef.current = forceClose;
  }, [forceClose, open]);

  const { activeIndex, onKeyDown } = useKeyboardNav({
    itemCount: allLabels.length,
    isOpen: open,
    onSelect: (i) => onToggle(allLabels[i].id),
    onClose: close,
    containerRef: listRef,
  });

  if (allLabels.length === 0) return null;

  const activeCount = filterIds.size;
  const hasFilters = activeCount > 0;
  const resolvedPlacement = placement ?? (variant === "action-bar" ? "left" : "right");
  const panelAlign = resolvedPlacement === "left" ? "left-0" : "right-0";

  /* ── Render trigger button ── */
  const renderButton = () => {
    if (variant === "action-bar") {
      return (
        <Tooltip
          content={
            hasFilters
              ? `${activeCount} filtro${activeCount !== 1 ? "s" : ""} activo${activeCount !== 1 ? "s" : ""}`
              : "Filtrar por label"
          }
          placement="top"
          maxWidth={180}
          disabled={open}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            onKeyDown={onKeyDown}
            className={`relative inline-flex items-center justify-center w-[34px] h-[34px] border cursor-pointer ${
              hasFilters
                ? "text-gray-600 border-gray-400 bg-white"
                : "text-gray-400 border-gray-300 hover:text-gray-600 hover:border-gray-400 bg-white"
            }`}
            aria-label="Filtrar por label"
          >
            <Tag size={14} />
            {hasFilters && (
              <span
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-gray-700 text-white text-[8px] flex items-center justify-center"
                style={{ borderRadius: "50%" }}
              >
                {activeCount}
              </span>
            )}
          </button>
        </Tooltip>
      );
    }

    // header variant — borderless icon for table headers (DD#233)
    if (variant === "header") {
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          onKeyDown={onKeyDown}
          className={`relative shrink-0 p-0.5 cursor-pointer ${
            open || hasFilters
              ? "text-gray-600"
              : "text-gray-300 hover:text-gray-500"
          }`}
          title="Filtrar por label"
          aria-label="Filtrar por label"
        >
          <Tag size={iconSize} />
          {hasFilters && (
            <span
              className="absolute -top-1 -right-1 w-3 h-3 bg-gray-700 text-white text-[7px] flex items-center justify-center"
              style={{ borderRadius: "50%" }}
            >
              {activeCount}
            </span>
          )}
        </button>
      );
    }

    // compact variant
    return (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={`relative shrink-0 p-1.5 border cursor-pointer ${
          open || hasFilters
            ? "border-gray-400 text-gray-600 bg-white"
            : "border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400"
        }`}
        title="Filtrar por label"
        aria-label="Filtrar por label"
      >
        <Tag size={14} />
        {hasFilters && (
          <span
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-gray-700 text-white text-[8px] flex items-center justify-center"
            style={{ borderRadius: "50%" }}
          >
            {activeCount}
          </span>
        )}
      </button>
    );
  };

  /* ── Render dropdown panel ── */
  const renderPanel = () => {
    if (!open) return null;

    if (variant === "action-bar") {
      return (
        <div
          ref={listRef}
          className={`absolute ${panelAlign} top-full mt-1 bg-white border border-gray-300 py-1.5 min-w-[220px] max-h-[340px] overflow-y-auto`}
          style={{ zIndex }}
          onKeyDown={onKeyDown}
        >
          <div
            className="px-3 py-1.5 text-[11px] text-gray-400 uppercase tracking-wider"
            style={{ fontWeight: 600 }}
          >
            Filtrar por label
          </div>
          <div className="border-t border-gray-100 my-1" />

          {allLabels.map((label, idx) => {
            const active = filterIds.has(label.id);
            return (
              <button
                key={label.id}
                data-kb-item
                type="button"
                onClick={() => onToggle(label.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-gray-600 cursor-pointer ${
                  idx === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 flex items-center justify-center border ${
                    active
                      ? "bg-gray-800 border-gray-800"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {active && <Check size={10} className="text-white" />}
                </span>
                <LabelChip label={label} size="xs" />
              </button>
            );
          })}

          {hasFilters && (
            <>
              <div className="border-t border-gray-100 mt-1 pt-1" />
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Quitar filtros
              </button>
            </>
          )}
        </div>
      );
    }

    // compact variant
    return (
      <div
        ref={listRef}
        className={`absolute top-full ${panelAlign} mt-1 bg-white border border-gray-300 min-w-[180px] max-h-[280px] overflow-y-auto`}
        style={{ boxShadow: "none", zIndex }}
        onKeyDown={onKeyDown}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-2 py-1.5 z-10">
          <span className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>
            Filtrar por label
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="p-0.5 text-gray-300 hover:text-gray-500 cursor-pointer"
              title="Quitar filtros"
              aria-label="Quitar filtros"
            >
              <X size={10} />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-0.5 px-2 pb-1.5">
          {allLabels.map((label, idx) => {
            const active = filterIds.has(label.id);
            const s = labelColorStyles[label.color];
            return (
              <button
                key={label.id}
                type="button"
                data-kb-item
                onClick={() => onToggle(label.id)}
                className={`flex items-center gap-2 px-2 py-1 text-[11px] text-left cursor-pointer ${
                  idx === activeIndex
                    ? "bg-gray-100 text-gray-700"
                    : active
                      ? "bg-gray-50 text-gray-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <span
                  className={`w-2 h-2 shrink-0 ${s.dot}`}
                  style={{ borderRadius: "50%" }}
                />
                <span className="flex-1">{label.name}</span>
                {active && <Check size={12} className="text-gray-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={ref}>
      {renderButton()}
      {renderPanel()}
    </div>
  );
}

/* ── Backward-compatible alias (DD#221) ── */
export function LabelFilterDropdown({
  allLabels,
  filterLabelIds,
  onToggle,
  onClear,
}: {
  allLabels: Label[];
  filterLabelIds: Set<number>;
  onToggle: (id: number) => void;
  onClear: () => void;
}) {
  return (
    <LabelFilterButton
      allLabels={allLabels}
      filterIds={filterLabelIds}
      onToggle={onToggle}
      onClear={onClear}
      variant="action-bar"
    />
  );
}