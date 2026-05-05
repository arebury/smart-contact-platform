import { useState, useRef, useSyncExternalStore, useCallback } from "react";
import { Columns3, Check } from "lucide-react";
import { useClickOutside } from "./useClickOutside";
import { useKeyboardNav } from "./useKeyboardNav";
import { Tooltip } from "./Tooltip";

/* ───── Column definition ───── */
export interface ColumnDef {
  key: string;
  label: string;
  defaultVisible: boolean;
  /** If true, this column cannot be hidden */
  locked?: boolean;
}

/* ───── localStorage persistence ───── */
function createColumnsStore(storageKey: string, columns: ColumnDef[]) {
  const defaultVisible = new Set(
    columns.filter((c) => c.defaultVisible).map((c) => c.key)
  );

  let listeners: (() => void)[] = [];
  let snapshot: Set<string> = loadFromStorage();

  function loadFromStorage(): Set<string> {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        return new Set(parsed);
      }
    } catch {
      // ignore
    }
    return new Set(defaultVisible);
  }

  function saveToStorage(visible: Set<string>) {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(visible)));
  }

  function notify() {
    listeners.forEach((l) => l());
  }

  return {
    subscribe(listener: () => void) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
    getSnapshot() {
      return snapshot;
    },
    toggle(key: string) {
      const col = columns.find((c) => c.key === key);
      if (col?.locked) return;

      const next = new Set(snapshot);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      snapshot = next;
      saveToStorage(next);
      notify();
    },
    reset() {
      snapshot = new Set(defaultVisible);
      saveToStorage(snapshot);
      notify();
    },
  };
}

/* ───── Hook ───── */
export function useColumnVisibility(
  storageKey: string,
  columns: ColumnDef[]
) {
  const [store] = useState(() => createColumnsStore(storageKey, columns));
  const visible = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return {
    visibleColumns: visible,
    isVisible: (key: string) => visible.has(key),
    toggle: store.toggle,
    reset: store.reset,
  };
}

/* ───── Dropdown component ───── */
export function ColumnSelectorDropdown({
  columns,
  visibleColumns,
  onToggle,
  onReset,
}: {
  columns: ColumnDef[];
  visibleColumns: Set<string>;
  onToggle: (key: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setOpen(false), []);
  useClickOutside(ref, closeDropdown, open);

  const toggleableColumns = columns.filter((c) => !c.locked);
  const { activeIndex, onKeyDown } = useKeyboardNav({
    itemCount: toggleableColumns.length,
    isOpen: open,
    onSelect: (i) => onToggle(toggleableColumns[i].key),
    onClose: closeDropdown,
    containerRef: listRef,
  });

  const hiddenCount = columns.filter(
    (c) => !c.locked && !visibleColumns.has(c.key)
  ).length;

  const hasIndicator = hiddenCount > 0;

  // Map toggleable index back to full column list for highlighting
  let toggleIdx = 0;

  return (
    <div className="relative" ref={ref}>
      <Tooltip content="Columnas" placement="top" maxWidth={140} disabled={open}>
        <button
          onClick={() => setOpen(!open)}
          onKeyDown={onKeyDown}
          className={`relative inline-flex items-center justify-center w-[34px] h-[34px] border cursor-pointer ${
            hasIndicator
              ? "text-gray-600 border-gray-400 bg-white"
              : "text-gray-400 border-gray-300 hover:text-gray-600 hover:border-gray-400 bg-white"
          }`}
          aria-label="Configurar columnas visibles"
        >
          <Columns3 size={15} />
        </button>
      </Tooltip>

      {open && (
        <div
          ref={listRef}
          className="absolute left-0 top-full mt-1 bg-white border border-gray-300 py-1.5 min-w-[200px] z-50"
          onKeyDown={onKeyDown}
        >
          <div className="px-3 py-1.5 text-[11px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
            Columnas visibles
          </div>
          <div className="border-t border-gray-100 my-1" />

          {columns.map((col) => {
            const checked = visibleColumns.has(col.key);
            const isLocked = col.locked;
            const currentToggleIdx = isLocked ? -1 : toggleIdx++;
            return (
              <button
                key={col.key}
                data-kb-item={!isLocked ? "" : undefined}
                onClick={() => {
                  if (!isLocked) onToggle(col.key);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] ${
                  isLocked
                    ? "text-gray-400 cursor-not-allowed"
                    : currentToggleIdx === activeIndex
                      ? "text-gray-600 bg-gray-100 cursor-pointer"
                      : "text-gray-600 hover:bg-gray-50 cursor-pointer"
                }`}
              >
                <span
                  className={`w-4 h-4 flex items-center justify-center border ${
                    checked
                      ? "bg-gray-800 border-gray-800"
                      : "border-gray-300 bg-white"
                  } ${isLocked ? "opacity-50" : ""}`}
                >
                  {checked && <Check size={11} className="text-white" />}
                </span>
                <span className={isLocked ? "opacity-50" : ""}>{col.label}</span>
              </button>
            );
          })}

          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              onReset();
            }}
            className="w-full text-left px-3 py-1.5 text-[12px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Restablecer por defecto
          </button>

          {/* Extra section (e.g. label filters) */}
          {/* extraSection removed — DD#208: filters moved to standalone component */}
        </div>
      )}
    </div>
  );
}