import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router";
import { TopBar } from "../layout/TopBar";
import { DeleteEntityDialog } from "../shared/DeleteEntityDialog";
import { BulkActionBar } from "../shared/BulkActionBar";
import { type Agent, availableSchedules } from "./agentsData";
import { type PresenceStatus, presenceLabels } from "./agentsData";
import { useAgentsStore } from "./useAgentsStore";
import { ContextMenu, BulkContextMenu, SortableHeader, ChannelIconWithTooltip } from "../shared/TableComponents";
import { ColumnSelectorDropdown, useColumnVisibility, type ColumnDef } from "../shared/ColumnSelector";
import { useClickOutside } from "../shared/useClickOutside";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  X,
  Headphones,
  Check,
  Minus,
  Monitor,
  PhoneCall,
  Shield,
  ChevronDown,
  CircleDot,
  Tag,
  Building2,
  Trash2,
  FilePen,
} from "lucide-react";
import { useLabelsStore } from "../labels/useLabelsStore";
import { useGroupsStore } from "../groups/useGroupsStore";
import { LabelChip } from "../labels/LabelsPage";
import type { Label } from "../labels/labelsData";
import { labelColorStyles } from "../labels/labelsData";
import { ImpactPreviewDialog, type ImpactPreviewItem } from "../shared/ImpactPreviewDialog";
import { Tooltip } from "../shared/Tooltip";
import { exportToXlsx } from "../shared/exportXlsx";
import { LabelFilterButton } from "../shared/LabelFilterButton";
import { useKeyboardNav } from "../shared/useKeyboardNav";
import { pushUndo, removeUndo } from "../shared/undoStack";

/* ───── Sort types ───── */
type SortField = "name" | "extension" | "type" | "groups" | "channels" | "phone" | "presence" | "id" | "recording" | "schedules" | "pin";
type SortDir = "asc" | "desc";

/* ───── Type icon with tooltip ───── */
const agentTypeConfig: Record<
  string,
  { label: string; Icon: typeof Monitor }
> = {
  normal: { label: "Agente normal", Icon: PhoneCall },
  cuscare: { label: "Agente Cuscare", Icon: Monitor },
  cuscare_carrier: { label: "Agente Cuscare Carrier", Icon: Building2 },
  admin_cuscare: { label: "Admin Cuscare", Icon: Shield },
};

function TypeIcon({ agentType }: { agentType: string }) {
  const config = agentTypeConfig[agentType] ?? agentTypeConfig.normal;
  const { label, Icon } = config;

  return (
    <Tooltip content={label} placement="top" maxWidth={180}>
      <span className="inline-flex cursor-help" aria-label={label}>
        <Icon size={14} className="text-gray-400" />
      </span>
    </Tooltip>
  );
}

/* ───── Group Popover ───── */
function GroupPopover({
  groups,
  count,
}: {
  groups: { name: string }[];
  count: number;
}) {
  const maxShow = 5;
  const displayGroups = groups.slice(0, maxShow);
  const remaining = count - displayGroups.length;

  const tooltipContent = groups.length > 0 ? (
    <>
      <div className="space-y-0.5">
        {displayGroups.map((g, i) => (
          <div key={i} className="text-white/90">{g.name}</div>
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

/* ───── Status dot color ───── */
const presenceDotColor: Record<PresenceStatus, string> = {
  disponible: "bg-green-500",
  no_disponible: "bg-gray-400",
  bano: "bg-amber-400",
  comida: "bg-amber-400",
  formacion: "bg-amber-400",
};

/* ───── Status badge with inline dropdown (DD#163: min-w, DD#148: dropup) ───── */
function PresenceBadge({
  agentId,
  presence,
  onUpdate,
}: {
  agentId: number;
  presence: PresenceStatus;
  onUpdate: (id: number, status: PresenceStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closePresence = useCallback(() => setOpen(false), []);
  useClickOutside(ref, closePresence, open);

  const allStatuses: PresenceStatus[] = [
    "disponible",
    "no_disponible",
    "bano",
    "comida",
    "formacion",
  ];

  const listRef = useRef<HTMLDivElement>(null);
  const { activeIndex, onKeyDown } = useKeyboardNav({
    itemCount: allStatuses.length,
    isOpen: open,
    onSelect: (i) => {
      onUpdate(agentId, allStatuses[i]);
      setOpen(false);
    },
    onClose: closePresence,
    containerRef: listRef,
  });

  const handleToggle = (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 200);
    }
    setOpen(!open);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        onKeyDown={onKeyDown}
        className="inline-flex items-center gap-1.5 px-2 py-1 border border-gray-200 hover:border-gray-400 text-[11px] text-gray-600 cursor-pointer bg-white min-w-[120px]"
        style={{ fontWeight: 500 }}
      >
        <span className={`w-2 h-2 shrink-0 rounded-full ${presenceDotColor[presence]}`} />
        <span className="flex-1 text-left whitespace-nowrap">{presenceLabels[presence]}</span>
        <ChevronDown size={10} className="text-gray-400 shrink-0" />
      </button>
      {open && (
        <div
          ref={listRef}
          className={`absolute z-50 left-0 bg-white border border-gray-300 py-1 min-w-[150px] transition-opacity duration-100 ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          onKeyDown={onKeyDown}
        >
          {allStatuses.map((s, idx) => (
            <button
              key={s}
              data-kb-item
              onClick={(e) => {
                e.stopPropagation();
                if (s !== presence) {
                  const oldPresence = presence;
                  onUpdate(agentId, s);
                  const undoFn = () => onUpdate(agentId, oldPresence);
                  const tId = toast.success(
                    `Estado cambiado a "${presenceLabels[s]}"`,
                    {
                      duration: 8000,
                      action: {
                        label: "Deshacer",
                        onClick: () => {
                          undoFn();
                          removeUndo(tId);
                          toast("Cambio revertido");
                        },
                      },
                    }
                  );
                  pushUndo(tId, undoFn, `Estado "${presenceLabels[s]}" revertido`);
                }
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] cursor-pointer ${
                idx === activeIndex
                  ? "bg-gray-100 text-gray-800"
                  : s === presence
                    ? "bg-gray-50 text-gray-800"
                    : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${presenceDotColor[s]}`} />
              {presenceLabels[s]}
              {s === presence && <Check size={12} className="ml-auto text-gray-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Empty state ───── */
function EmptyAgentsState({ onCreateAgent }: { onCreateAgent: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 border border-dashed border-gray-300">
      <div className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center mb-6">
        <Headphones size={32} className="text-gray-300" />
      </div>
      <h3
        className="text-[16px] text-gray-600 mb-2"
        style={{ fontWeight: 500 }}
      >
        Aún no hay agentes
      </h3>
      <p className="text-[13px] text-gray-400 text-center max-w-sm mb-6">
        Crea tu primer agente para que pueda atender interacciones en los grupos
        configurados
      </p>
      <button
        onClick={onCreateAgent}
        className="inline-flex items-center gap-2 px-5 py-2 text-[13px] text-white cursor-pointer bg-gray-800"
        style={{ fontWeight: 500 }}
      >
        <Plus size={16} />
        Crear agente
      </button>
    </div>
  );
}

/* ───── Context Menu Label Submenu ───── */
function ContextMenuLabelSubmenu({
  agentId,
  agents,
  allLabels,
  updateAgent,
  onClose,
}: {
  agentId: number;
  agents: Agent[];
  allLabels: Label[];
  updateAgent: (id: number, data: Partial<Agent>) => void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const agent = agents.find((a) => a.id === agentId);
  if (!agent || allLabels.length === 0) return null;

  const agentLabels = new Set(agent.labels || []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-gray-600 hover:bg-gray-100 cursor-pointer">
        <Tag size={14} className="text-gray-400" />
        <span className="flex-1 text-left">Labels</span>
        {agentLabels.size > 0 && (
          <span className="inline-flex items-center gap-0.5 mr-1">
            {(agent.labels || []).slice(0, 3).map((lid) => {
              const lbl = allLabels.find((l) => l.id === lid);
              if (!lbl) return null;
              const s = labelColorStyles[lbl.color];
              return <span key={lid} className={`w-1.5 h-1.5 ${s.dot}`} style={{ borderRadius: "50%" }} />;
            })}
          </span>
        )}
        <ChevronDown size={12} className="text-gray-400 -rotate-90" />
      </button>
      {open && (
        <div
          className="absolute left-full top-0 bg-white border border-gray-300 py-1.5 min-w-[180px] z-50"
          style={{ marginLeft: -1 }}
        >
          {allLabels.map((label) => {
            const hasLabel = agentLabels.has(label.id);
            const s = labelColorStyles[label.color];
            return (
              <button
                key={label.id}
                onClick={() => {
                  const oldLabels = [...(agent.labels || [])];
                  const newLabels = hasLabel
                    ? oldLabels.filter((l) => l !== label.id)
                    : [...oldLabels, label.id];
                  updateAgent(agentId, { labels: newLabels });
                  const undoFn = () => updateAgent(agentId, { labels: oldLabels });
                  const tId = toast.success(
                    `Label "${label.name}" ${hasLabel ? "eliminada de" : "asignada a"} ${agent.name}`,
                    {
                      duration: 8000,
                      action: {
                        label: "Deshacer",
                        onClick: () => {
                          undoFn();
                          removeUndo(tId);
                          toast("Cambio revertido");
                        },
                      },
                    }
                  );
                  pushUndo(tId, undoFn, `Label "${label.name}" revertida`);
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-[12px] text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <span
                  className={`w-3.5 h-3.5 flex items-center justify-center border ${
                    hasLabel
                      ? "bg-gray-800 border-gray-800"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {hasLabel && <Check size={10} className="text-white" />}
                </span>
                <span className={`w-2 h-2 ${s.dot} shrink-0`} style={{ borderRadius: "50%" }} />
                {label.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───── Bulk Label Assign Dropdown ───── */
function BulkLabelDropdown({
  allLabels,
  selectedAgentIds,
  agents,
  updateAgent,
  onDone,
}: {
  allLabels: Label[];
  selectedAgentIds: Set<number>;
  agents: Agent[];
  updateAgent: (id: number, data: Partial<Agent>) => void;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  // For each label, count how many selected agents have it
  const labelCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const agId of selectedAgentIds) {
      const ag = agents.find((a) => a.id === agId);
      if (ag) {
        for (const lid of ag.labels || []) {
          counts.set(lid, (counts.get(lid) || 0) + 1);
        }
      }
    }
    return counts;
  }, [selectedAgentIds, agents]);

  const totalSelected = selectedAgentIds.size;

  const handleToggleLabel = (labelId: number) => {
    const affectedIds = Array.from(selectedAgentIds);
    const count = labelCounts.get(labelId) || 0;
    const shouldAdd = count < totalSelected; // not all have it → add to all

    const snapshots: { id: number; oldLabels: number[] }[] = [];
    for (const agId of affectedIds) {
      const ag = agents.find((a) => a.id === agId);
      if (!ag) continue;
      const oldLabels = [...(ag.labels || [])];
      snapshots.push({ id: agId, oldLabels });

      if (shouldAdd) {
        if (!oldLabels.includes(labelId)) {
          updateAgent(agId, { labels: [...oldLabels, labelId] });
        }
      } else {
        updateAgent(agId, { labels: oldLabels.filter((l) => l !== labelId) });
      }
    }

    const label = allLabels.find((l) => l.id === labelId);
    const actionText = shouldAdd ? "asignada a" : "eliminada de";
    const undoFn = () => { for (const s of snapshots) updateAgent(s.id, { labels: s.oldLabels }); };
    const tId = toast.success(`Label "${label?.name}" ${actionText} ${totalSelected} agentes`, {
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
    pushUndo(tId, undoFn, `Label bulk "${label?.name}" revertida`);
    onDone();
    setOpen(false);
  };

  const { activeIndex, onKeyDown } = useKeyboardNav({
    itemCount: allLabels.length,
    isOpen: open,
    onSelect: (i) => handleToggleLabel(allLabels[i].id),
    onClose: close,
    containerRef: listRef,
  });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 text-[12px] text-white cursor-pointer"
      >
        <Tag size={12} />
        Labels
      </button>
      {open && (
        <div
          ref={listRef}
          className="absolute bottom-full mb-1 left-0 bg-white border border-gray-300 py-1 min-w-[220px] z-50 max-h-[260px] overflow-y-auto"
          onKeyDown={onKeyDown}
        >
          {allLabels.length === 0 ? (
            <div className="px-3 py-4 text-[12px] text-gray-400 text-center">
              No hay labels
            </div>
          ) : (
            allLabels.map((label, idx) => {
              const count = labelCounts.get(label.id) || 0;
              const allHave = count === totalSelected;
              const someHave = count > 0 && !allHave;

              return (
                <button
                  key={label.id}
                  data-kb-item
                  onClick={() => handleToggleLabel(label.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-600 cursor-pointer ${
                    idx === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 flex items-center justify-center border ${
                      allHave
                        ? "bg-gray-800 border-gray-800"
                        : someHave
                          ? "border-gray-400 bg-white"
                          : "border-gray-300 bg-white"
                    }`}
                  >
                    {allHave ? (
                      <Check size={10} className="text-white" />
                    ) : someHave ? (
                      <Minus size={10} className="text-gray-500" />
                    ) : null}
                  </span>
                  <LabelChip label={label} size="xs" />
                  {someHave && (
                    <span className="ml-auto text-[10px] text-gray-400">{count}/{totalSelected}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ───── Label Inline Popover (DD#211: click-to-open, no navigation) ─────
   Replaces LabelCountTooltip. Clicking the dots opens an inline popover
   with checkboxes to toggle labels, keeping the user in context. */
function LabelInlinePopover({
  agentId,
  agentLabels,
  allLabels,
  updateAgent,
}: {
  agentId: number;
  agentLabels: Label[];
  allLabels: Label[];
  updateAgent: (id: number, data: Partial<Agent>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const agentLabelIds = useMemo(() => new Set(agentLabels.map((l) => l.id)), [agentLabels]);

  if (agentLabels.length === 0) return null;

  const handleToggle = (labelId: number, e: ReactMouseEvent) => {
    e.stopPropagation();
    const currentIds = agentLabels.map((l) => l.id);
    const has = agentLabelIds.has(labelId);
    const newLabels = has
      ? currentIds.filter((id) => id !== labelId)
      : [...currentIds, labelId];
    const label = allLabels.find((l) => l.id === labelId);
    updateAgent(agentId, { labels: newLabels });
    const undoFn = () => updateAgent(agentId, { labels: currentIds });
    const tId = toast.success(
      `Label "${label?.name}" ${has ? "eliminada de" : "asignada a"} agente`,
      {
        duration: 8000,
        action: {
          label: "Deshacer",
          onClick: () => {
            undoFn();
            removeUndo(tId);
            toast("Cambio revertido");
          },
        },
      }
    );
    pushUndo(tId, undoFn, `Label "${label?.name}" revertida`);
  };

  const handleClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 220);
    }
    setOpen(!open);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-0.5 cursor-pointer hover:opacity-70"
        aria-label={`${agentLabels.length} labels`}
      >
        {agentLabels.slice(0, 5).map((l) => {
          const s = labelColorStyles[l.color];
          return (
            <span
              key={l.id}
              className={`w-2 h-2 shrink-0 ${s.dot}`}
              style={{ borderRadius: "50%" }}
            />
          );
        })}
        {agentLabels.length > 5 && (
          <span className="text-[10px] text-gray-400 ml-0.5">+{agentLabels.length - 5}</span>
        )}
      </button>

      {open && (
        <div
          className={`absolute left-0 bg-white border border-gray-300 py-1.5 min-w-[200px] z-50 max-h-[280px] overflow-y-auto ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[11px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
            Labels del agente
          </div>
          <div className="border-t border-gray-100 my-1" />

          {allLabels.map((label) => {
            const has = agentLabelIds.has(label.id);
            return (
              <button
                key={label.id}
                onClick={(e) => handleToggle(label.id, e)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <span
                  className={`w-3.5 h-3.5 flex items-center justify-center border ${
                    has
                      ? "bg-gray-800 border-gray-800"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {has && <Check size={10} className="text-white" />}
                </span>
                <LabelChip label={label} size="xs" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───── Schedule Filter Button (DD#291) ───── */
function ScheduleFilterButton({
  filterIds,
  onToggle,
  onClear,
}: {
  filterIds: Set<number>;
  onToggle: (id: number) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const { activeIndex, onKeyDown } = useKeyboardNav({
    itemCount: availableSchedules.length,
    isOpen: open,
    onSelect: (i) => onToggle(availableSchedules[i].id),
    onClose: close,
    containerRef: listRef,
  });

  if (availableSchedules.length === 0) return null;

  const activeCount = filterIds.size;
  const hasFilters = activeCount > 0;

  return (
    <div className="relative" ref={ref}>
      <Tooltip
        content={
          hasFilters
            ? `${activeCount} filtro${activeCount !== 1 ? "s" : ""} de agenda activo${activeCount !== 1 ? "s" : ""}`
            : "Filtrar por agenda"
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
          aria-label="Filtrar por agenda"
        >
          <PhoneCall size={14} />
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

      {open && (
        <div
          ref={listRef}
          className="absolute right-0 top-full mt-1 bg-white border border-gray-300 py-1.5 min-w-[260px] max-h-[340px] overflow-y-auto z-50"
          onKeyDown={onKeyDown}
        >
          <div
            className="px-3 py-1.5 text-[11px] text-gray-400 uppercase tracking-wider"
            style={{ fontWeight: 600 }}
          >
            Filtrar por agenda
          </div>
          <div className="border-t border-gray-100 my-1" />

          {availableSchedules.map((sched, idx) => {
            const active = filterIds.has(sched.id);
            return (
              <button
                key={sched.id}
                data-kb-item
                type="button"
                onClick={() => onToggle(sched.id)}
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
                <PhoneCall size={12} className="text-gray-400 shrink-0" />
                <span className="flex-1 text-left">{sched.name}</span>
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
      )}
    </div>
  );
}

/* ═══════ MAIN PAGE ═══════ */
export function AgentsListPage() {
  const navigate = useNavigate();
  const { agents, deleteAgent, deleteAgents, duplicateAgent, bulkUpdate, updatePresence, updateAgent } =
    useAgentsStore();
  const { labels: allLabels } = useLabelsStore();
  const { groups: allGroups } = useGroupsStore();

  /* ── Label lookup map ── */
  const labelMap = useMemo(() => {
    const map = new Map<number, Label>();
    for (const l of allLabels) map.set(l.id, l);
    return map;
  }, [allLabels]);

  /* ── Label filter ── */
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterLabelIds, setFilterLabelIds] = useState<Set<number>>(() => {
    const labelParam = searchParams.get("label");
    if (labelParam) {
      const ids = labelParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0);
      return new Set(ids);
    }
    return new Set();
  });

  /* ── Schedule filter ── */
  const [filterScheduleIds, setFilterScheduleIds] = useState<Set<number>>(new Set());

  // Sync URL param when filter changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterLabelIds.size > 0) params.label = Array.from(filterLabelIds).join(",");
    if (filterScheduleIds.size > 0) params.schedule = Array.from(filterScheduleIds).join(",");
    if (Object.keys(params).length > 0 || searchParams.has("label") || searchParams.has("schedule")) {
      setSearchParams(params, { replace: true });
    }
  }, [filterLabelIds, filterScheduleIds]);

  /* ── Column visibility ── */
  const agentColumns: ColumnDef[] = [
    { key: "id", label: "ID", defaultVisible: true },
    { key: "name", label: "Nombre", defaultVisible: true, locked: true },
    { key: "extension", label: "Extensión", defaultVisible: true },
    { key: "type", label: "Tipo", defaultVisible: true },
    { key: "groups", label: "Grupos", defaultVisible: true },
    /* labels merged into Name column (DD#191) — removed as standalone column */
    { key: "channels", label: "Canales", defaultVisible: true },
    { key: "phone", label: "Teléfono", defaultVisible: false },
    { key: "pin", label: "PIN", defaultVisible: false },
    { key: "recording", label: "Grabación", defaultVisible: true },
    { key: "schedules", label: "Agendas", defaultVisible: false },
    { key: "presence", label: "Estado", defaultVisible: true },
  ];
  const { visibleColumns, isVisible, toggle: toggleColumn, reset: resetColumns } =
    useColumnVisibility("sc_agents_columns_v6", agentColumns);

  const visibleCount = agentColumns.filter((c) => !c.locked && visibleColumns.has(c.key)).length;
  const colSpanDuplicate = 1 + visibleCount; // name (locked) + visible optional columns

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    agentId: number;
  } | null>(null);
  const [bulkContextMenu, setBulkContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "bulk";
    agents: Agent[];
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
    sourceAgent: Agent;
    editName: string;
  } | null>(null);
  const duplicateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (duplicateRow && duplicateInputRef.current) {
      duplicateInputRef.current.focus();
      duplicateInputRef.current.select();
    }
  }, [duplicateRow]);

  const handleDuplicate = (agentId: number) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    setDuplicateRow({
      sourceAgent: agent,
      editName: `Copia de ${agent.name}`,
    });
  };

  const confirmDuplicate = () => {
    if (!duplicateRow) return;
    const name =
      duplicateRow.editName.trim() ||
      `Copia de ${duplicateRow.sourceAgent.name}`;
    const newAgent = duplicateAgent(duplicateRow.sourceAgent.id, name);
    if (newAgent) {
      const undoFn = () => deleteAgent(newAgent.id);
      const tId = toast.success(
        `Borrador «${name}» creado`,
        {
          description: "Revisa la configuración y guarda para activar el agente.",
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

  /* ── Filtered + sorted agents ── */
  const filteredAndSortedAgents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = agents.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.extension.toLowerCase().includes(q) ||
      (a.code || "").toLowerCase().includes(q) ||
      (a.phone || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q) ||
      (a.schedules || []).some((sid) => {
        const sn = availableSchedules.find((s) => s.id === sid)?.name;
        return sn && sn.toLowerCase().includes(q);
      })
    );

    // Label filter (OR logic)
    if (filterLabelIds.size > 0) {
      result = result.filter((a) =>
        (a.labels || []).some((lid) => filterLabelIds.has(lid))
      );
    }

    // Schedule filter (OR logic)
    if (filterScheduleIds.size > 0) {
      result = result.filter((a) =>
        (a.schedules || []).some((sid) => filterScheduleIds.has(sid))
      );
    }

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
        case "extension":
          cmp = parseInt(a.extension) - parseInt(b.extension);
          break;
        case "type":
          cmp = a.agentType.localeCompare(b.agentType);
          break;
        case "groups":
          cmp = a.groups.length - b.groups.length;
          break;
        case "channels":
          cmp = a.channels.length - b.channels.length;
          if (cmp === 0) {
            cmp = a.channels.join(",").localeCompare(b.channels.join(","));
          }
          break;
        case "phone":
          cmp = (a.phone || "").localeCompare(b.phone || "");
          break;
        case "presence": {
          const order: Record<string, number> = { disponible: 0, bano: 1, comida: 2, formacion: 3, no_disponible: 4 };
          cmp = (order[a.presenceStatus || "no_disponible"] ?? 5) - (order[b.presenceStatus || "no_disponible"] ?? 5);
          break;
        }
        case "id":
          cmp = parseInt(a.code || "0") - parseInt(b.code || "0");
          break;
        case "recording":
          cmp = (a.permissions.recording ? 1 : 0) - (b.permissions.recording ? 1 : 0);
          break;
        case "schedules":
          cmp = (a.schedules?.length || 0) - (b.schedules?.length || 0);
          break;
        case "pin":
          cmp = (a.pin || "").localeCompare(b.pin || "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [agents, searchQuery, sortField, sortDir, filterLabelIds, filterScheduleIds]);

  const allSelected =
    filteredAndSortedAgents.length > 0 &&
    filteredAndSortedAgents.every((a) => selectedIds.has(a.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedAgents.map((a) => a.id)));
    }
  };

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedAgents = useMemo(
    () => agents.filter((a) => selectedIds.has(a.id)),
    [agents, selectedIds]
  );

  const handleMenuClick = (e: ReactMouseEvent, agentId: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({
      x: rect.right - 170,
      y: rect.bottom + 4,
      agentId,
    });
  };

  /* ── Stats ── */
  // (removed — counter subheader eliminated)

  /* ── Bulk field options ── */
  const bulkFieldOptions = [
    { key: "presenceStatus", label: "Estado" },
    { key: "channels", label: "Canales" },
    { key: "recording", label: "Grabación" },
    { key: "defaultOutboundGroup", label: "Grupo saliente por defecto" },
  ];

  /* Compute common groups across selected agents for outbound group constraint (Patch G.4, DD#296: reuse memoized selectedAgents) */
  const commonGroupNames = useMemo(() => {
    if (selectedAgents.length === 0) return [] as string[];
    const first = new Set(selectedAgents[0].groups.map((g) => g.name));
    for (let i = 1; i < selectedAgents.length; i++) {
      const names = new Set(selectedAgents[i].groups.map((g) => g.name));
      for (const n of first) {
        if (!names.has(n)) first.delete(n);
      }
    }
    return Array.from(first).sort((a, b) => a.localeCompare(b, "es"));
  }, [selectedAgents]);

  const bulkValueOptions: Record<string, string[]> = {
    presenceStatus: ["Disponible", "No disponible", "Baño", "Comida", "Formación"],
    channels: ["Teléfono", "Chat", "Email", "Teléfono, Chat", "Teléfono, Chat, Email"],
    recording: ["Activada", "Desactivada"],
    defaultOutboundGroup: commonGroupNames,
  };

  /* ── Show impact preview before bulk apply (DD#199) ── */
  const handleBulkApplyPreview = () => {
    const fieldLabel =
      bulkFieldOptions.find((f) => f.key === bulkField)?.label || bulkField;
    const items: ImpactPreviewItem[] = Array.from(selectedIds)
      .map((agId) => {
        const ag = agents.find((a) => a.id === agId);
        if (!ag) return null;
        return {
          id: ag.id,
          name: ag.name,
          detail: `(${ag.groups.length} grupos)`,
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
    const fieldLabel =
      bulkFieldOptions.find((f) => f.key === bulkField)?.label || bulkField;
    const snapshot = confirmedIds.map((agId) => {
      const ag = agents.find((a) => a.id === agId);
      return ag ? { id: agId, field: bulkField, oldValue: ag } : null;
    }).filter(Boolean) as { id: number; field: string; oldValue: typeof agents[0] }[];

    if (bulkField === "presenceStatus") {
      bulkUpdate(confirmedIds, "presenceStatus", bulkValue);
    } else if (bulkField === "recording") {
      bulkUpdate(confirmedIds, "recording", bulkValue);
    } else if (bulkField === "defaultOutboundGroup") {
      bulkUpdate(confirmedIds, "defaultOutboundGroup", bulkValue);
    } else {
      bulkUpdate(confirmedIds, bulkField, bulkValue);
    }

    const undoRestore = () => {
      for (const s of snapshot) {
        updateAgent(s.id, s.oldValue);
      }
    };

    const tId = toast.success(`${fieldLabel} actualizado en ${confirmedIds.length} agentes`, {
      description: `Se ha cambiado a "${bulkValue}"`,
      duration: 8000,
      action: {
        label: "Deshacer",
        onClick: () => {
          undoRestore();
          removeUndo(tId);
          toast("Cambio revertido");
        },
      },
    });
    pushUndo(tId, undoRestore, `Bulk edit ${fieldLabel} revertido`);
    setBulkField("");
    setBulkValue("");
    setBulkFieldDropdownOpen(false);
    setSelectedIds(new Set());
    setImpactPreview(null);
  };

  const showEmptyState = agents.length === 0;
  const showSearchEmpty =
    !showEmptyState && filteredAndSortedAgents.length === 0;

  /* ── XLSX Export (DD#274, DD#296: uses shared exportToXlsx) ── */
  const handleExport = () => {
    const channelLabels: Record<string, string> = { phone: "Teléfono", chat: "Chat", email: "Email" };
    const typeLabels: Record<string, string> = {
      normal: "Agente normal", cuscare: "Agente Cuscare",
      cuscare_carrier: "Agente Cuscare Carrier", admin_cuscare: "Admin Cuscare",
    };
    const headers = [
      "ID", "Nombre", "Extensión", "Tipo extensión", "Tipo agente",
      "Canales", "Activación", "Teléfono", "Email", "Grabación",
      "Servicios (activos)", "Servicios (inactivos)", "Grupo saliente",
      "Labels", "Agendas", "Idiomas",
    ];
    const rows = filteredAndSortedAgents.map((a) => {
      const activeGroups = a.groups.filter((g) => g.active).map((g) => g.name);
      const inactiveGroups = a.groups.filter((g) => !g.active).map((g) => g.name);
      const agentLabels = (a.labels || [])
        .map((lid) => labelMap.get(lid)?.name)
        .filter(Boolean);
      const agentSchedules = (a.schedules || [])
        .map((sid) => availableSchedules.find((s) => s.id === sid)?.name)
        .filter(Boolean);
      return [
        a.code || "",
        a.name,
        a.extension,
        a.extensionType === "phone" ? "Teléfono" : "WebRTC",
        typeLabels[a.agentType] || a.agentType,
        a.channels.map((ch) => channelLabels[ch] || ch).join(", "),
        a.status === "active" ? "Activo" : "Inactivo",
        a.phone || "",
        a.email || "",
        a.permissions.recording ? "Sí" : "No",
        activeGroups.join(", "),
        inactiveGroups.join(", "),
        a.defaultOutboundGroup || "",
        agentLabels.join(", "),
        agentSchedules.join(", "),
        (a.languages || []).join(", "),
      ];
    });

    exportToXlsx({ headers, rows, sheetName: "Agentes", filePrefix: "agentes" });
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: "Administración", path: "/admin/usuarios" },
          { label: "Agentes" },
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
              Agentes
            </h1>

            <button
              onClick={() => navigate("/admin/agentes/crear")}
              className="inline-flex items-center gap-2 px-4 py-2 text-white text-[13px] cursor-pointer bg-gray-800"
              style={{ fontWeight: 500 }}
            >
              <Plus size={15} />
              Crear agente
            </button>
          </div>

          {/* ── Action bar ── */}
          <div className="flex items-center gap-3 mb-5">
            <ColumnSelectorDropdown
              columns={agentColumns}
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

            {/* Filters pushed right (DD#233, DD#290) */}
            <div className="ml-auto flex items-center gap-2">
              <ScheduleFilterButton
                filterIds={filterScheduleIds}
                onToggle={(id) => {
                  setFilterScheduleIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }}
                onClear={() => setFilterScheduleIds(new Set())}
              />
              <LabelFilterButton
                allLabels={allLabels}
                filterIds={filterLabelIds}
                onToggle={(id) => {
                  setFilterLabelIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }}
                onClear={() => setFilterLabelIds(new Set())}
                variant="action-bar"
                placement="right"
              />
            </div>
          </div>

          {/* ── Empty state: no agents ── */}
          {showEmptyState && (
            <EmptyAgentsState
              onCreateAgent={() => navigate("/admin/agentes/crear")}
            />
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
                  {searchQuery && (filterLabelIds.size > 0 || filterScheduleIds.size > 0)
                    ? <>No hay agentes que coincidan con &ldquo;{searchQuery}&rdquo; y los filtros activos</>
                    : filterLabelIds.size > 0 || filterScheduleIds.size > 0
                      ? <>No hay agentes con los filtros seleccionados</>
                      : <>No hay agentes que coincidan con &ldquo;{searchQuery}&rdquo;</>
                  }
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 text-[13px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    Limpiar búsqueda
                  </button>
                )}
                {(filterLabelIds.size > 0 || filterScheduleIds.size > 0) && (
                  <button
                    onClick={() => { setFilterLabelIds(new Set()); setFilterScheduleIds(new Set()); }}
                    className="px-4 py-2 text-[13px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    Quitar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── TABLE VIEW ── */}
          {!showEmptyState && filteredAndSortedAgents.length > 0 && (
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
                          aria-label="Seleccionar todos los agentes"
                          tabIndex={-1}
                        />
                      </th>
                      {isVisible("id") && <SortableHeader
                        label="ID"
                        field="id"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                        align="center"
                      />}
                      <SortableHeader
                        label="Nombre"
                        field="name"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />
                      {isVisible("extension") && <SortableHeader
                        label="Extensión"
                        field="extension"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />}
                      {isVisible("type") && <SortableHeader
                        label="Tipo"
                        field="type"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                        align="center"
                      />}
                      {isVisible("groups") && <SortableHeader
                        label="Grupos"
                        field="groups"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                        align="center"
                      />}
                      {/* labels column merged into Name (DD#191) */}
                      {isVisible("channels") && <SortableHeader
                        label="Canales"
                        field="channels"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                        align="center"
                      />}
                      {isVisible("phone") && <SortableHeader
                        label="Teléfono"
                        field="phone"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />}
                      {isVisible("pin") && <SortableHeader
                        label="PIN"
                        field="pin"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />}
                      {isVisible("recording") && <SortableHeader
                        label="Grabación"
                        field="recording"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />}
                      {isVisible("schedules") && <SortableHeader
                        label="Agendas"
                        field="schedules"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />}
                      {isVisible("presence") && <SortableHeader
                        label="Estado"
                        field="presence"
                        activeField={sortField}
                        direction={sortDir}
                        onSort={handleSort}
                      />}
                      <th className="w-12 px-3 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Inline duplicate row */}
                    {duplicateRow && (
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            disabled
                            className="w-4 h-4 opacity-30"
                          />
                        </td>
                        <td className="px-3 py-3" colSpan={colSpanDuplicate}>
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
                    {filteredAndSortedAgents.map((agent) => {
                      const isSelected = selectedIds.has(agent.id);
                      const isDraft = agent.isDraft;
                      return (
                        <tr
                          key={agent.id}
                          className={`border-b border-gray-200 border-l-2 ${
                            isDraft
                              ? "border-l-amber-400 bg-amber-50/40"
                              : "border-l-transparent"
                          } ${
                            isSelected ? "bg-gray-100" : isDraft ? "" : "hover:bg-gray-50"
                          }`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (selectedIds.size >= 2 && selectedIds.has(agent.id)) {
                              setBulkContextMenu({ x: e.clientX, y: e.clientY });
                            } else {
                              setContextMenu({ x: e.clientX, y: e.clientY, agentId: agent.id });
                            }
                          }}
                        >
                          <td
                            className="px-3 py-3 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); toggleOne(agent.id); }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOne(agent.id)}
                              className="w-4 h-4 cursor-pointer pointer-events-none"
                              aria-label={`Seleccionar ${agent.name}`}
                              tabIndex={-1}
                            />
                          </td>
                          {isVisible("id") && (
                          <td className="px-3 py-3 text-[13px] text-gray-400 font-mono text-center">
                            {agent.code}
                          </td>
                          )}
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/admin/agentes/editar/${agent.id}`
                                  )
                                }
                                className="text-[13px] text-gray-700 cursor-pointer hover:text-gray-900 hover:underline"
                                style={{ fontWeight: 500 }}
                              >
                                {agent.name}
                              </button>
                              {isDraft && (
                                <Tooltip content="Borrador — pendiente de revisión" placement="top" maxWidth={200}>
                                  <span className="inline-flex text-amber-500 cursor-help">
                                    <FilePen size={13} />
                                  </span>
                                </Tooltip>
                              )}
                              {(() => {
                                const agentLbls = (agent.labels || [])
                                  .map((lid) => labelMap.get(lid))
                                  .filter(Boolean) as Label[];
                                return (
                                  <LabelInlinePopover
                                    agentId={agent.id}
                                    agentLabels={agentLbls}
                                    allLabels={allLabels}
                                    updateAgent={updateAgent}
                                  />
                                );
                              })()}
                            </div>
                          </td>
                          {isVisible("extension") && (
                          <td className="px-3 py-3 text-[13px] text-gray-500 font-mono">
                            {agent.extension}
                          </td>
                          )}
                          {isVisible("type") && (
                          <td className="px-3 py-3 text-center">
                            <TypeIcon agentType={agent.agentType} />
                          </td>
                          )}
                          {isVisible("groups") && (
                          <td className="px-3 py-3 text-center">
                            <GroupPopover
                              groups={agent.groups}
                              count={agent.groups.length}
                            />
                          </td>
                          )}
                          {/* labels shown inline with name (DD#191) */}
                          {isVisible("channels") && (
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {agent.channels.map((ch) => (
                                <ChannelIconWithTooltip key={ch} channel={ch} />
                              ))}
                            </div>
                          </td>
                          )}
                          {isVisible("phone") && (
                          <td className="px-3 py-3 text-[13px] text-gray-500">
                            {agent.phone || <span className="text-gray-300">—</span>}
                          </td>
                          )}
                          {isVisible("pin") && (
                          <td className="px-3 py-3">
                            {agent.pin ? (
                              <span className="group/pin inline-flex items-center cursor-default">
                                <span className="text-[13px] text-gray-400 font-mono tracking-wider group-hover/pin:hidden">
                                  {"•••"}
                                </span>
                                <span className="text-[13px] text-gray-600 font-mono tracking-wider hidden group-hover/pin:inline">
                                  {agent.pin}
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          )}
                          {isVisible("recording") && (
                          <td className="px-3 py-3 text-center">
                            {agent.permissions.recording ? (
                              <CircleDot size={14} className="text-gray-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          )}
                          {isVisible("schedules") && (
                          <td className="px-3 py-3">
                            {(agent.schedules?.length || 0) > 0 ? (
                              <Tooltip content={
                                <div>
                                  {agent.schedules!.map((sid) => {
                                    const s = availableSchedules.find((sc) => sc.id === sid);
                                    return s ? (
                                      <div key={sid} className="flex items-center gap-1.5 py-0.5">
                                        <PhoneCall size={11} className="text-gray-400 shrink-0" />
                                        <span>{s.name}</span>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              }>
                                <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 cursor-default">
                                  <PhoneCall size={13} className="text-gray-400" />
                                  {agent.schedules!.length}
                                </span>
                              </Tooltip>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          )}
                          {isVisible("presence") && (
                          <td className="px-3 py-3">
                            <PresenceBadge
                              agentId={agent.id}
                              presence={agent.presenceStatus || "no_disponible"}
                              onUpdate={updatePresence}
                            />
                          </td>
                          )}
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={(e) => handleMenuClick(e, agent.id)}
                              className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer inline-flex items-center justify-center"
                            >
                              <MoreHorizontal
                                size={16}
                                className="text-gray-400"
                              />
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
                  {filteredAndSortedAgents.length} agentes
                </span>
              </div>
              
            </>
          )}
        </div>
      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onEdit={() => {
            navigate(`/admin/agentes/editar/${contextMenu.agentId}`);
            setContextMenu(null);
          }}
          onDuplicate={() => {
            handleDuplicate(contextMenu.agentId);
            setContextMenu(null);
          }}
          onDelete={() => {
            const agent = agents.find((a) => a.id === contextMenu.agentId);
            if (agent) {
              setDeleteTarget({ type: "single", agents: [agent] });
            }
            setContextMenu(null);
          }}
          extraItems={
            <ContextMenuLabelSubmenu
              agentId={contextMenu.agentId}
              agents={agents}
              allLabels={allLabels}
              updateAgent={updateAgent}
              onClose={() => setContextMenu(null)}
            />
          }
        />
      )}

      {/* ── Bulk Context Menu ── */}
      {bulkContextMenu && (
        <BulkContextMenu
          x={bulkContextMenu.x}
          y={bulkContextMenu.y}
          count={selectedIds.size}
          onClose={() => setBulkContextMenu(null)}
          onDelete={() => {
            setDeleteTarget({ type: "bulk", agents: selectedAgents });
            setBulkContextMenu(null);
          }}
        />
      )}

      {/* ── Delete Dialog ── */}
      {deleteTarget && (
        <DeleteEntityDialog
          type={deleteTarget.type}
          items={deleteTarget.agents.map((a) => ({ id: a.id, name: a.name }))}
          entitySingular="agente"
          entityPlural="agentes"
          singleDetailMessage={
            deleteTarget.type === "single"
              ? `El agente será desasignado de ${deleteTarget.agents[0].groups.length === 1 ? "1 grupo" : `${deleteTarget.agents[0].groups.length} grupos`} automáticamente.`
              : undefined
          }
          bulkFooterMessage="Los agentes serán desasignados de sus grupos automáticamente."
          onClose={() => setDeleteTarget(null)}
          onConfirm={(remainingIds) => {
            if (deleteTarget.type === "single") {
              const agent = deleteTarget.agents[0];
              deleteAgent(agent.id);
              toast.success(`Agente «${agent.name}» eliminado`);
            } else {
              const ids = remainingIds || deleteTarget.agents.map((a) => a.id);
              deleteAgents(ids);
              toast.success(`${ids.length} agentes eliminados`);
            }
            setDeleteTarget(null);
          }}
        />
      )}

      {/* ── Bulk action bar (2+ selected) ── */}
      <BulkActionBar
        count={selectedIds.size >= 2 ? selectedIds.size : 0}
        entitySingular="agente"
        entityPlural="agentes"
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
            <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-gray-300 py-1 z-50">
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
        {bulkField === "defaultOutboundGroup" && commonGroupNames.length === 0 ? (
          <span className="text-white/50 text-[12px] italic max-w-[260px]">
            Los agentes seleccionados no comparten grupos en común
          </span>
        ) : (
          <>
            <select
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              disabled={!bulkField}
              className="px-3 py-1.5 border border-white/20 text-white text-[12px] cursor-pointer min-w-[140px] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <option value="" className="text-gray-800">—</option>
              {bulkField && (bulkValueOptions[bulkField] || []).map((v) => (
                <option key={v} value={v} className="text-gray-800">
                  {v}
                </option>
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
          </>
        )}

        <div className="w-px h-5 bg-white/20" />

        <BulkLabelDropdown
          allLabels={allLabels}
          selectedAgentIds={selectedIds}
          agents={agents}
          updateAgent={updateAgent}
          onDone={() => setSelectedIds(new Set())}
        />
      </BulkActionBar>

      {/* ── Impact Preview Dialog (DD#199) ── */}
      {impactPreview && (
        <ImpactPreviewDialog
          operation={impactPreview.operation}
          entityLabel="agentes"
          fieldLabel={impactPreview.fieldLabel}
          newValue={impactPreview.newValue}
          items={impactPreview.items}
          onConfirm={(confirmedIds) => {
            if (impactPreview.operation === "duplicate") {
              confirmedIds.forEach((id) => {
                const ag = agents.find((a) => a.id === id);
                if (ag) duplicateAgent(ag.id, `Copia de ${ag.name}`);
              });
              toast.success(`${confirmedIds.length} agentes duplicados`);
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