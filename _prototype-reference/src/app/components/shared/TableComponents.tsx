import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import {
  Pencil,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Phone,
  MessageSquare,
  Mail,
  CopyPlus,
} from "lucide-react";
import { useClickOutside } from "./useClickOutside";
import { Tooltip } from "./Tooltip";

/* ───── Viewport clamping helper (DD#134) ───── */
function useViewportClamp(
  ref: React.RefObject<HTMLDivElement | null>,
  x: number,
  y: number
) {
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setPos({ x, y });
      return;
    }
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clampedX = x + rect.width > vw ? vw - rect.width - 8 : x;
    const clampedY = y + rect.height > vh ? vh - rect.height - 8 : y;
    setPos({
      x: Math.max(8, clampedX),
      y: Math.max(8, clampedY),
    });
  }, [ref, x, y]);

  return pos;
}

/* ───── Fade-in hook (DD#151) ───── */
function useFadeIn() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return visible;
}

/* ───── Context Menu ───── */
export function ContextMenu({
  x,
  y,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  extraItems,
}: {
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  extraItems?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  const pos = useViewportClamp(ref, x, y);
  const visible = useFadeIn();

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed bg-white border border-gray-300 py-1.5 z-50 min-w-[170px] transition-opacity duration-100"
      style={{ top: pos.y, left: pos.x, opacity: visible ? 1 : 0 }}
    >
      <button
        onClick={onEdit}
        role="menuitem"
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer"
      >
        <Pencil size={14} className="text-gray-400" />
        Editar
      </button>
      <button
        onClick={onDuplicate}
        role="menuitem"
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer"
      >
        <Copy size={14} className="text-gray-400" />
        Duplicar
      </button>
      {extraItems}
      <div className="border-t border-gray-200 my-1" />
      <button
        onClick={onDelete}
        role="menuitem"
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-500 hover:bg-gray-100 cursor-pointer"
      >
        <Trash2 size={14} />
        Eliminar
      </button>
    </div>
  );
}

/* ───── Bulk Context Menu (for multi-select right-click) ───── */
/* DD#206: Simplified — submenus removed, bulk editing only via the bulk bar.
   Right-click on multi-select now offers duplicate and quick delete. */
export function BulkContextMenu({
  x,
  y,
  count,
  onClose,
  onDelete,
  onDuplicate,
}: {
  x: number;
  y: number;
  count: number;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  const pos = useViewportClamp(ref, x, y);
  const visible = useFadeIn();

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed bg-white border border-gray-300 py-1.5 z-50 min-w-[210px] transition-opacity duration-100"
      style={{ top: pos.y, left: pos.x, opacity: visible ? 1 : 0 }}
    >
      {onDuplicate && (
        <button
          onClick={onDuplicate}
          role="menuitem"
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          <CopyPlus size={14} />
          Duplicar {count} seleccionados
        </button>
      )}
      <button
        onClick={onDelete}
        role="menuitem"
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-500 hover:bg-gray-100 cursor-pointer"
      >
        <Trash2 size={14} />
        Eliminar {count} seleccionados
      </button>
    </div>
  );
}

/* ───── Sortable Header (DD#167: aria-sort) ───── */
export function SortableHeader<T extends string>({
  label,
  field,
  activeField,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  field: T;
  activeField: T | null;
  direction: "asc" | "desc";
  onSort: (field: T) => void;
  align?: "left" | "center";
}) {
  const isActive = activeField === field;
  const ariaSortValue = isActive ? (direction === "asc" ? "ascending" : "descending") : undefined;
  return (
    <th
      className={`${
        align === "center" ? "text-center" : "text-left"
      } px-3 py-3 text-[11px] tracking-wider uppercase cursor-pointer select-none hover:bg-gray-100 ${
        isActive ? "text-gray-700" : "text-gray-400"
      }`}
      style={{ fontWeight: 600 }}
      onClick={() => onSort(field)}
      role="columnheader"
      aria-sort={ariaSortValue}
    >
      <span
        className={`inline-flex items-center gap-1 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {label}
        {isActive ? (
          direction === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="text-gray-400" />
        )}
      </span>
    </th>
  );
}

/* ───── Channel icons (DD#132: contrast fix gray-400 → gray-500, DD#201: aria-label + tooltip) ───── */
const channelLabelsMap: Record<string, string> = {
  phone: "Teléfono",
  chat: "Chat",
  email: "Email",
};

export const channelIconMap = {
  phone: Phone,
  chat: MessageSquare,
  email: Mail,
};

export function ChannelIconWithTooltip({ channel }: { channel: string }) {
  const label = channelLabelsMap[channel] || channel;
  const IconComponent = channelIconMap[channel as keyof typeof channelIconMap];
  if (!IconComponent) return null;

  return (
    <Tooltip content={label} placement="top" maxWidth={120}>
      <span aria-label={label} role="img" className="inline-flex">
        <IconComponent size={14} className="text-gray-500" />
      </span>
    </Tooltip>
  );
}