import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigationGuard } from "../shared/useNavigationGuard";
import { TopBar } from "../layout/TopBar";
import { groupsData } from "./groupsData";
import { useGroupsStore } from "./useGroupsStore";
import { DeleteEntityDialog } from "../shared/DeleteEntityDialog";
import { StickyFormHeader } from "../shared/StickyFormHeader";
import type { StickyFormHeaderHandle } from "../shared/StickyFormHeader";
import {
  SectionCard,
  FieldLabel as FieldLabelBase,
  TooltipIcon as TooltipIconBase,
  DiscardDialog,
  ToggleSwitch,
  inputClass,
  inputSmClass,
} from "../shared/FormComponents";
import { channelIconMap } from "../shared/TableComponents";
import { Tooltip } from "../shared/Tooltip";
import { LabelFilterButton } from "../shared/LabelFilterButton";
import { useClickOutside } from "../shared/useClickOutside";
import { useCrossTabWarning } from "../shared/useCrossTabWarning";
import { useAgentsStore } from "../agents/useAgentsStore";
import { availableSchedules } from "../agents/agentsData";
import { useLabelsStore } from "../labels/useLabelsStore";
import { LABEL_COLORS, labelColorStyles } from "../labels/labelsData";
import type { Label, LabelColor } from "../labels/labelsData";
import { LabelChip } from "../labels/LabelsPage";
import { useTemplatesStore } from "../templates/useTemplatesStore";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Search,
  AlertTriangle,
  ExternalLink,
  Check,
  Upload,
  Copy,
  X,
  Users,
  Plus,
  Minus,
  Loader2,
  Fingerprint,
  Headphones,
  Target,
  Volume2,
  Music,
  FolderOpen,
  Settings,
  Trash2,
  Pencil,
  Tag,
  FileStack,
  Mail,
  MessageSquare,
  Info,
  Phone,
  FilePen,
} from "lucide-react";

const tooltips: Record<string, string> = {
  channels:
    "Activa los canales por los que este grupo recibirá interacciones",
  phone:
    "Número que se mostrará como identificador de llamada al cliente",
  priority:
    "La mayoría de configuraciones usan prioridad Baja. Usa Alta o Máxima solo para grupos que requieren atención preferente.",
  strategy:
    "Define cómo se distribuyen las interacciones entre los agentes del grupo. Las estrategias avanzadas (Exclusivo, Niveles) requieren configuración adicional.",
  subStrategy:
    "Define cómo se distribuyen las interacciones entre agentes dentro de cada nivel. Se aplica a todos los niveles por igual.",
  ringAllSimultaneous:
    "Número de agentes que sonarán a la vez cuando entre una interacción. El primero en descolgar atiende la llamada.",
  chatStrategy:
    "Rotativa reparte chats por turnos entre agentes. Menos chats activos prioriza al agente con menos conversaciones abiertas",
  capacity:
    "Fija: límite exacto de conversaciones en cola. Variable: se ajusta según agentes conectados",
  holdMusic: "Audio que escucha el cliente mientras espera. Puedes subir tu archivo o usar el predeterminado",
  periodicAnnouncement:
    "Mensaje que se reproduce cada X segundos durante la espera del cliente en cola",
  outboundAudio:
    "Audio pregrabado que el agente puede reproducir al cliente durante la conversación. Uso habitual: aviso de grabación (GDPR), condiciones legales, información contractual.",
  transferTime:
    "Segundos que el agente tiene para aceptar una transferencia antes de que vuelva a cola",
  maxWaitTime:
    "Tiempo máximo que un cliente espera en cola antes de activar el desborde",
  serviceTime:
    "Tiempo objetivo en segundos para calcular el nivel de servicio del grupo",
  adminTime: "Pausa automática entre llamadas para tareas administrativas del agente",
  overflowCalls:
    "Redirige llamadas automáticamente cuando todos los agentes están inactivos o desconectados",
  overflowSession:
    "Desconecta sesiones de chat/email tras X minutos sin actividad del cliente",
  exclusiveAgent:
    "Requiere configuración específica del árbol IVR",
  levels:
    "Verifica disponibilidad por niveles configurados",
};

/* Local wrappers: pre-bind the tooltips dict */
function FieldLabel({ text, required, tooltipKey }: { text: string; required?: boolean; tooltipKey?: string }) {
  return <FieldLabelBase text={text} required={required} tooltipKey={tooltipKey} tooltipMap={tooltips} />;
}
function TooltipIcon({ tooltipKey }: { tooltipKey: string }) {
  return <TooltipIconBase tooltipKey={tooltipKey} tooltipMap={tooltips} />;
}

/* getInitials removed — project rules: no avatar initials */

/** Returns the names of groups an agent belongs to (excluding the current one being edited) */
function getAgentGroups(agentName: string, currentGroupId: number | null, allGroups: typeof groupsData): string[] {
  return allGroups
    .filter((g) => g.id !== currentGroupId && g.assignedAgents.includes(agentName))
    .map((g) => g.name);
}

function AgentGroupTags({ groups, max = 2 }: { groups: string[]; max?: number }) {
  if (groups.length === 0) return <span className="text-[10px] text-gray-300">—</span>;
  const visible = groups.slice(0, max);
  const remaining = groups.length - max;
  return (
    <span className="flex items-center gap-1 flex-wrap">
      {visible.map((g) => (
        <span key={g} className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5">
          {g}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-gray-400">+{remaining} más</span>
      )}
    </span>
  );
}

const channelLabels: Record<string, string> = {
  phone: "Teléfono",
  chat: "Chat",
  email: "Email",
};

function AgentChannelIcons({
  agentName,
  agentChannelsMap,
  groupChannels,
  iconSize = 13,
}: {
  agentName: string;
  agentChannelsMap: Map<string, ("phone" | "chat" | "email")[]>;
  groupChannels: { phone: boolean; chat: boolean; email: boolean };
  iconSize?: number;
}) {
  const agentChs = agentChannelsMap.get(agentName) || [];
  const groupActiveChannels = (["phone", "chat", "email"] as const).filter((c) => groupChannels[c]);
  const missingChannels = groupActiveChannels.filter((gc) => !agentChs.includes(gc));
  const hasMismatch = missingChannels.length > 0;

  const mismatchLabel = hasMismatch
    ? `Falta: ${missingChannels.map((c) => channelLabels[c]).join(", ")}`
    : null;

  return (
    <Tooltip content={mismatchLabel} placement="top" maxWidth={220} disabled={!hasMismatch}>
      <span className="flex items-center gap-1.5 shrink-0">
        {hasMismatch && (
          <AlertTriangle size={iconSize} className="text-amber-400 cursor-help" />
        )}
        <span className="flex items-center gap-1">
          {agentChs.map((ch) => {
            const ChIcon = channelIconMap[ch];
            return <ChIcon key={ch} size={iconSize} className="text-gray-300" />;
          })}
        </span>
      </span>
    </Tooltip>
  );
}

/* ════════════════════════════════════════════════════
   LevelsConfiguration — two-panel transfer list with drag & drop (DD#287)
   ════════════════════════════════════════════════════ */

const DND_AGENT = "LEVEL_AGENT";
interface DragAgentItem { agent: string; source: "unassigned" | number; }

/* Draggable agent row */
function DraggableAgentRow({
  agent,
  source,
  isSelected,
  onSelect,
  agentChannelsMap,
  groupChannels,
  indent,
}: {
  agent: string;
  source: "unassigned" | number;
  isSelected: boolean;
  onSelect: () => void;
  agentChannelsMap: Map<string, ("phone" | "chat" | "email")[]>;
  groupChannels: { phone: boolean; chat: boolean; email: boolean };
  indent?: boolean;
}) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: DND_AGENT,
    item: { agent, source } as DragAgentItem,
    collect: (m) => ({ isDragging: m.isDragging() }),
  }), [agent, source]);

  return (
    <div
      ref={dragRef as unknown as React.Ref<HTMLDivElement>}
      className={`flex items-center justify-between px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 cursor-grab select-none transition-opacity ${
        indent ? "pl-5" : ""
      } ${isSelected ? "bg-blue-50" : ""} ${isDragging ? "opacity-40" : ""}`}
      onClick={onSelect}
    >
      <span className="truncate">{agent}</span>
      <AgentChannelIcons
        agentName={agent}
        agentChannelsMap={agentChannelsMap}
        groupChannels={groupChannels}
        iconSize={11}
      />
    </div>
  );
}

/* Drop zone for a level (right panel) */
function LevelDropZone({
  levelIdx,
  onDrop,
  children,
}: {
  levelIdx: number;
  onDrop: (item: DragAgentItem, targetLevel: number) => void;
  children: React.ReactNode;
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: DND_AGENT,
    canDrop: (item: DragAgentItem) => item.source !== levelIdx,
    drop: (item: DragAgentItem) => onDrop(item, levelIdx),
    collect: (m) => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
  }), [levelIdx, onDrop]);

  return (
    <div
      ref={dropRef as unknown as React.Ref<HTMLDivElement>}
      className={`transition-colors ${isOver && canDrop ? "bg-blue-50/50" : ""}`}
    >
      {children}
      {/* Drop indicator when hovering */}
      {isOver && canDrop && (
        <div className="h-0.5 bg-blue-400 mx-3" />
      )}
    </div>
  );
}

/* Drop zone for unassigned panel (left panel) */
function UnassignedDropZone({
  onDrop,
  children,
}: {
  onDrop: (item: DragAgentItem) => void;
  children: React.ReactNode;
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: DND_AGENT,
    canDrop: (item: DragAgentItem) => item.source !== "unassigned",
    drop: (item: DragAgentItem) => onDrop(item),
    collect: (m) => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
  }), [onDrop]);

  return (
    <div
      ref={dropRef as unknown as React.Ref<HTMLDivElement>}
      className={`flex-1 overflow-y-auto transition-colors ${isOver && canDrop ? "bg-blue-50/30" : ""}`}
      style={{ maxHeight: 280 }}
    >
      {children}
    </div>
  );
}

function LevelsConfigurationInner({
  assignedAgents,
  levels,
  setLevels,
  subStrategy,
  setSubStrategy,
  leftSearch,
  setLeftSearch,
  rightSearch,
  setRightSearch,
  leftSelected,
  setLeftSelected,
  rightSelected,
  setRightSelected,
  collapsedLevels,
  setCollapsedLevels,
  agentChannelsMap,
  groupChannels,
}: {
  assignedAgents: string[];
  levels: string[][];
  setLevels: (updater: (prev: string[][]) => string[][]) => void;
  subStrategy: string;
  setSubStrategy: (v: string) => void;
  leftSearch: string;
  setLeftSearch: (v: string) => void;
  rightSearch: string;
  setRightSearch: (v: string) => void;
  leftSelected: Set<string>;
  setLeftSelected: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  rightSelected: Set<string>;
  setRightSelected: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  collapsedLevels: Set<number>;
  setCollapsedLevels: (v: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  agentChannelsMap: Map<string, ("phone" | "chat" | "email")[]>;
  groupChannels: { phone: boolean; chat: boolean; email: boolean };
}) {
  // Agents NOT in any level
  const allInLevels = useMemo(() => {
    const set = new Set<string>();
    levels.forEach((lvl) => lvl.forEach((a) => set.add(a)));
    return set;
  }, [levels]);

  const unassigned = useMemo(() => {
    const pool = assignedAgents.filter((a) => !allInLevels.has(a));
    if (!leftSearch.trim()) return pool;
    const q = leftSearch.toLowerCase();
    return pool.filter((a) => a.toLowerCase().includes(q));
  }, [assignedAgents, allInLevels, leftSearch]);

  const totalUnassigned = assignedAgents.filter((a) => !allInLevels.has(a)).length;

  // Move selected left → right (to first level)
  const moveRight = (all: boolean) => {
    const toMove = all ? unassigned : unassigned.filter((a) => leftSelected.has(a));
    if (toMove.length === 0) return;
    setLevels((prev) => {
      const next = prev.map((l) => [...l]);
      next[0] = [...next[0], ...toMove];
      return next;
    });
    setLeftSelected(new Set());
  };

  // Move selected right → left (remove from levels)
  const moveLeft = (all: boolean) => {
    if (all) {
      setLevels((prev) => prev.map(() => []));
      setRightSelected(new Set());
      return;
    }
    const toRemove = rightSelected;
    if (toRemove.size === 0) return;
    setLevels((prev) => prev.map((lvl) => lvl.filter((a) => !toRemove.has(a))));
    setRightSelected(new Set());
  };

  // Drag & drop handler: move agent to a target level
  const handleDropToLevel = useCallback((item: DragAgentItem, targetLevel: number) => {
    setLevels((prev) => {
      const next = prev.map((l) => [...l]);
      // Remove from source level (if it was in a level)
      if (typeof item.source === "number") {
        next[item.source] = next[item.source].filter((a) => a !== item.agent);
      }
      // Add to target level (avoid duplicates)
      if (!next[targetLevel].includes(item.agent)) {
        next[targetLevel] = [...next[targetLevel], item.agent];
      }
      return next;
    });
  }, [setLevels]);

  // Drag & drop handler: move agent back to unassigned
  const handleDropToUnassigned = useCallback((item: DragAgentItem) => {
    if (typeof item.source === "number") {
      setLevels((prev) =>
        prev.map((lvl, i) => (i === item.source ? lvl.filter((a) => a !== item.agent) : lvl))
      );
    }
  }, [setLevels]);

  const addLevel = () => {
    if (levels.length >= 5) return;
    setLevels((prev) => [...prev, []]);
  };

  const removeLevel = (idx: number) => {
    if (levels.length <= 1) return;
    setLevels((prev) => prev.filter((_, i) => i !== idx));
    setCollapsedLevels((prev) => {
      const next = new Set<number>();
      prev.forEach((v) => {
        if (v < idx) next.add(v);
        else if (v > idx) next.add(v - 1);
      });
      return next;
    });
  };

  const toggleCollapse = (idx: number) => {
    setCollapsedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Filter right panel agents by search
  const matchesRightSearch = (name: string) => {
    if (!rightSearch.trim()) return true;
    return name.toLowerCase().includes(rightSearch.toLowerCase());
  };

  const panelHeaderClass = "bg-gray-50 border-b border-gray-200 px-3 py-2 text-[12px] text-gray-600 flex items-center justify-between";
  const searchInputClass = "w-full px-2.5 py-1.5 text-[12px] border-b border-gray-200 focus:outline-none bg-white placeholder:text-gray-300";
  const arrowBtnClass = "w-7 h-7 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="mt-4 space-y-4">
      {/* Two-panel layout */}
      <div className="flex gap-0 items-stretch" style={{ minHeight: 200 }}>
        {/* LEFT PANEL — Agentes sin nivel */}
        <div className="w-[40%] border border-gray-200 flex flex-col min-h-[200px]">
          <div className={panelHeaderClass}>
            <span style={{ fontWeight: 600 }}>Agentes sin nivel ({totalUnassigned})</span>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={leftSearch}
              onChange={(e) => setLeftSearch(e.target.value)}
              placeholder="Buscar..."
              className={`${searchInputClass} pl-7`}
            />
          </div>
          <UnassignedDropZone onDrop={handleDropToUnassigned}>
            {unassigned.length === 0 ? (
              <p className="text-[11px] text-gray-300 text-center py-6">
                {totalUnassigned === 0 ? "Todos los agentes tienen nivel" : "Sin resultados"}
              </p>
            ) : (
              unassigned.map((agent) => (
                <DraggableAgentRow
                  key={agent}
                  agent={agent}
                  source="unassigned"
                  isSelected={leftSelected.has(agent)}
                  onSelect={() => {
                    setLeftSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(agent)) next.delete(agent);
                      else next.add(agent);
                      return next;
                    });
                  }}
                  agentChannelsMap={agentChannelsMap}
                  groupChannels={groupChannels}
                />
              ))
            )}
          </UnassignedDropZone>
        </div>

        {/* CENTER — Transfer arrows */}
        <div className="flex flex-col items-center justify-center gap-1 px-2 shrink-0">
          <button type="button" className={arrowBtnClass} onClick={() => moveRight(true)} title="Mover todos al nivel 1">
            <ChevronsRight size={14} />
          </button>
          <button type="button" className={arrowBtnClass} onClick={() => moveRight(false)} disabled={leftSelected.size === 0} title="Mover seleccionados al nivel 1">
            <ChevronRight size={14} />
          </button>
          <button type="button" className={arrowBtnClass} onClick={() => moveLeft(false)} disabled={rightSelected.size === 0} title="Quitar seleccionados">
            <ChevronLeft size={14} />
          </button>
          <button type="button" className={arrowBtnClass} onClick={() => moveLeft(true)} title="Quitar todos">
            <ChevronsLeft size={14} />
          </button>
        </div>

        {/* RIGHT PANEL — Niveles */}
        <div className="flex-1 border border-gray-200 flex flex-col min-h-[200px]">
          <div className={panelHeaderClass}>
            <span style={{ fontWeight: 600 }}>Niveles</span>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={rightSearch}
              onChange={(e) => setRightSearch(e.target.value)}
              placeholder="Buscar..."
              className={`${searchInputClass} pl-7`}
            />
          </div>
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 280 }}>
            {levels.map((lvlAgents, lvlIdx) => {
              const isCollapsed = collapsedLevels.has(lvlIdx);
              const filteredLvlAgents = lvlAgents.filter(matchesRightSearch);
              return (
                <LevelDropZone key={lvlIdx} levelIdx={lvlIdx} onDrop={handleDropToLevel}>
                  {/* Level header */}
                  <div
                    className="bg-gray-100/60 px-3 py-2 text-[12px] text-gray-600 border-b border-gray-100 flex items-center justify-between cursor-pointer group/lvl select-none"
                    style={{ fontWeight: 600 }}
                    onClick={() => toggleCollapse(lvlIdx)}
                  >
                    <span className="flex items-center gap-1.5">
                      {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                      Nivel {lvlIdx + 1} ({lvlAgents.length})
                    </span>
                    <Tooltip content={levels.length <= 1 ? "Mínimo 1 nivel" : "Eliminar nivel"} placement="top" maxWidth={160}>
                      <button
                        type="button"
                        className={`opacity-0 group-hover/lvl:opacity-100 transition-opacity p-0.5 ${
                          levels.length <= 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLevel(lvlIdx);
                        }}
                        disabled={levels.length <= 1}
                      >
                        <Minus size={12} />
                      </button>
                    </Tooltip>
                  </div>
                  {/* Level agents */}
                  {!isCollapsed && (
                    filteredLvlAgents.length > 0 ? (
                      filteredLvlAgents.map((agent) => (
                        <DraggableAgentRow
                          key={agent}
                          agent={agent}
                          source={lvlIdx}
                          isSelected={rightSelected.has(agent)}
                          indent
                          onSelect={() => {
                            setRightSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(agent)) next.delete(agent);
                              else next.add(agent);
                              return next;
                            });
                          }}
                          agentChannelsMap={agentChannelsMap}
                          groupChannels={groupChannels}
                        />
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-300 text-center py-3">
                        {lvlAgents.length === 0 ? "Sin agentes — arrastra aquí" : "Sin resultados"}
                      </p>
                    )
                  )}
                </LevelDropZone>
              );
            })}
          </div>
          {/* Add/remove level buttons */}
          <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-end">
            <Tooltip content={levels.length >= 5 ? "Máximo 5 niveles" : ""} placement="top" maxWidth={160} disabled={levels.length < 5}>
              <button
                type="button"
                className={`flex items-center gap-1 text-[12px] ${
                  levels.length >= 5
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700"
                }`}
                onClick={addLevel}
                disabled={levels.length >= 5}
              >
                <Plus size={12} />
                Nivel
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Validation warning */}
      {totalUnassigned > 0 && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 px-4 py-2.5">
          <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <span className="text-[12px] text-amber-700">
            Hay {totalUnassigned} {totalUnassigned === 1 ? "agente" : "agentes"} sin nivel asignado.
            Se {totalUnassigned === 1 ? "añadirá" : "añadirán"} automáticamente al último nivel.
          </span>
        </div>
      )}

      {/* Subestrategia */}
      <div>
        <FieldLabel text="Subestrategia" tooltipKey="subStrategy" />
        <select
          value={subStrategy}
          onChange={(e) => setSubStrategy(e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option>Balanceada</option>
          <option>Menos llamadas atendidas</option>
          <option>Más tiempo inactivo</option>
        </select>
      </div>
    </div>
  );
}

/* Wrapper that provides DndProvider */
function LevelsConfiguration(props: Parameters<typeof LevelsConfigurationInner>[0]) {
  return (
    <DndProvider backend={HTML5Backend}>
      <LevelsConfigurationInner {...props} />
    </DndProvider>
  );
}

export function CreateGroupPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { groups, addGroup, updateGroup, deleteGroup } = useGroupsStore();
  const { agents: agentsStoreData } = useAgentsStore();
  const { labels: allLabels } = useLabelsStore();
  const { templates: availableTemplates } = useTemplatesStore();

  /* Build agent name → label ids lookup */
  const agentLabelMap = useMemo(() => {
    const map = new Map<string, number[]>();
    agentsStoreData.forEach((a) => map.set(a.name, a.labels || []));
    return map;
  }, [agentsStoreData]);

  /* Label lookup map */
  const labelMap = useMemo(() => {
    const map = new Map<number, Label>();
    for (const l of allLabels) map.set(l.id, l);
    return map;
  }, [allLabels]);

  /* Build a map of agent name → channels for quick lookup */
  const agentChannelsMap = useMemo(() => {
    const map = new Map<string, ("phone" | "chat" | "email")[]>();
    agentsStoreData.forEach((a) => map.set(a.name, a.channels));
    return map;
  }, [agentsStoreData]);

  /* Derive allAgents from the agents store (single source of truth) */
  const allAgents = useMemo(
    () => agentsStoreData.map((a) => a.name),
    [agentsStoreData]
  );

  const editingGroup = useMemo(() => {
    if (!id) return null;
    return groups.find((g) => g.id === Number(id)) || null;
  }, [id, groups]);
  const crossTabConflict = useCrossTabWarning("group", editingGroup?.id ?? undefined);

  const isEditing = !!editingGroup;
  const pageTitle = isEditing ? "Editar grupo" : "Crear grupo";

  // Form state
  const [name, setName] = useState(editingGroup?.name || "");
  const [channels, setChannels] = useState(
    editingGroup
      ? {
          phone: editingGroup.channels.includes("phone"),
          chat: editingGroup.channels.includes("chat"),
          email: editingGroup.channels.includes("email"),
        }
      : { phone: true, chat: false, email: false }
  );
  const [phoneNumber, setPhoneNumber] = useState(
    editingGroup?.phone || "917945449"
  );
  const [priority, setPriority] = useState(editingGroup?.priority || "Baja");
  const [strategy, setStrategy] = useState(
    editingGroup?.strategy || "Balanceada"
  );
  const [chatStrategy, setChatStrategy] = useState(
    editingGroup?.chatStrategy || "Rotativa (por turnos)"
  );
  const [capacityType, setCapacityType] = useState<"fixed" | "variable">(
    editingGroup?.capacityType || "fixed"
  );
  const [capacityFixed, setCapacityFixed] = useState(
    editingGroup?.capacityType === "fixed"
      ? editingGroup?.capacityValue || "0"
      : "0"
  );
  const [capacityVariable, setCapacityVariable] = useState(
    editingGroup?.capacityType === "variable"
      ? editingGroup?.capacityValue || ""
      : ""
  );

  // Agents
  const initialAssigned = editingGroup?.assignedAgents || [];
  const [assignedAgents, setAssignedAgents] = useState<Set<string>>(
    new Set(initialAssigned)
  );
  const [agentActiveState, setAgentActiveState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    initialAssigned.forEach((a, i) => {
      // Demo: one agent starts as inactive to illustrate the OFF state
      state[a] = i !== initialAssigned.length - 1;
    });
    return state;
  });
  const [agentSearch, setAgentSearch] = useState("");
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [showAllAssigned, setShowAllAssigned] = useState(false);
  const [assignedFilter, setAssignedFilter] = useState<"all" | "active" | "inactive">("all");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());
  const [dropdownLabelFilter, setDropdownLabelFilter] = useState<Set<number>>(new Set());
  const [assignedLabelFilter, setAssignedLabelFilter] = useState<Set<number>>(new Set());
  const agentSearchRef = useRef<HTMLInputElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown results: browse mode (empty) or search mode (typing), with label filter
  const isBrowseMode = !agentSearch.trim();
  const dropdownResults = useMemo(() => {
    let pool = allAgents;

    // Apply label filter
    if (dropdownLabelFilter.size > 0) {
      pool = pool.filter((name) => {
        const agentLabels = agentLabelMap.get(name) || [];
        return agentLabels.some((lid) => dropdownLabelFilter.has(lid));
      });
    }

    if (isBrowseMode) {
      return [...pool].sort((a, b) => a.localeCompare(b)).slice(0, 20);
    }
    return pool
      .filter((a) => a.toLowerCase().includes(agentSearch.toLowerCase()))
      .slice(0, 8);
  }, [agentSearch, isBrowseMode, allAgents, dropdownLabelFilter, agentLabelMap]);

  const totalMatchCount = useMemo(() => {
    let pool = allAgents;
    if (dropdownLabelFilter.size > 0) {
      pool = pool.filter((name) => {
        const agentLabels = agentLabelMap.get(name) || [];
        return agentLabels.some((lid) => dropdownLabelFilter.has(lid));
      });
    }
    return isBrowseMode
      ? pool.length
      : pool.filter((a) => a.toLowerCase().includes(agentSearch.toLowerCase())).length;
  }, [allAgents, agentSearch, isBrowseMode, dropdownLabelFilter, agentLabelMap]);

  const currentGroupId = editingGroup?.id ?? null;

  // Close dropdown on outside click or Escape
  useClickOutside(agentDropdownRef, () => setAgentDropdownOpen(false), agentDropdownOpen);

  const toggleAgent = (agent: string) => {
    setFormTouched(true);
    setAssignedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agent)) {
        next.delete(agent);
        setAgentActiveState((s) => { const n = { ...s }; delete n[agent]; return n; });
        setSelectedAssigned((sel) => { const n = new Set(sel); n.delete(agent); return n; });
      } else {
        next.add(agent);
        setAgentActiveState((s) => ({ ...s, [agent]: true }));
      }
      return next;
    });
  };

  const toggleAgentActive = (agent: string) => {
    setFormTouched(true);
    setAgentActiveState((prev) => ({ ...prev, [agent]: !prev[agent] }));
  };

  const activeAgentCount = Array.from(assignedAgents).filter(
    (a) => agentActiveState[a] !== false
  ).length;

  const inactiveAgentCount = assignedAgents.size - activeAgentCount;

  // Filtered assigned agents (by tab + search)
  const filteredAssignedAgents = useMemo(() => {
    let agents = Array.from(assignedAgents);
    if (assignedFilter === "active") {
      agents = agents.filter((a) => agentActiveState[a] !== false);
    } else if (assignedFilter === "inactive") {
      agents = agents.filter((a) => agentActiveState[a] === false);
    }
    if (assignedSearch.trim()) {
      const q = assignedSearch.toLowerCase();
      agents = agents.filter((a) => a.toLowerCase().includes(q));
    }
    // Label filter (OR logic)
    if (assignedLabelFilter.size > 0) {
      agents = agents.filter((name) => {
        const agentLabels = agentLabelMap.get(name) || [];
        return agentLabels.some((lid) => assignedLabelFilter.has(lid));
      });
    }
    return agents;
  }, [assignedAgents, assignedFilter, agentActiveState, assignedSearch, assignedLabelFilter, agentLabelMap]);

  // Bulk actions on selected assigned agents
  const handleBulkActivate = () => {
    setFormTouched(true);
    setAgentActiveState((prev) => {
      const next = { ...prev };
      selectedAssigned.forEach((a) => { next[a] = true; });
      return next;
    });
    setSelectedAssigned(new Set());
  };

  const handleBulkDeactivate = () => {
    setFormTouched(true);
    setAgentActiveState((prev) => {
      const next = { ...prev };
      selectedAssigned.forEach((a) => { next[a] = false; });
      return next;
    });
    setSelectedAssigned(new Set());
  };

  const handleBulkRemove = () => {
    setFormTouched(true);
    setAssignedAgents((prev) => {
      const next = new Set(prev);
      selectedAssigned.forEach((a) => next.delete(a));
      return next;
    });
    setAgentActiveState((prev) => {
      const next = { ...prev };
      selectedAssigned.forEach((a) => { delete next[a]; });
      return next;
    });
    setSelectedAssigned(new Set());
  };

  const toggleSelectAssigned = (agent: string) => {
    setSelectedAssigned((prev) => {
      const next = new Set(prev);
      if (next.has(agent)) next.delete(agent);
      else next.add(agent);
      return next;
    });
  };

  const allFilteredSelected = filteredAssignedAgents.length > 0 &&
    filteredAssignedAgents.every((a) => selectedAssigned.has(a));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedAssigned(new Set());
    } else {
      setSelectedAssigned(new Set(filteredAssignedAgents));
    }
  };

  const toggleChannelFn = (ch: "phone" | "chat" | "email") => {
    setFormTouched(true);
    setChannels({ ...channels, [ch]: !channels[ch] });
  };

  // Ficha
  const [fichaType, setFichaType] = useState<"window" | "embedded">(
    "embedded"
  );
  const [fichaUrl, setFichaUrl] = useState("https://");
  const [fichaHeight, setFichaHeight] = useState("400");

  // Advanced
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [transferTime, setTransferTime] = useState("10");
  const [maxWaitTime, setMaxWaitTime] = useState("60");
  const [serviceTime, setServiceTime] = useState("0");
  const [adminTime, setAdminTime] = useState("");
  const [voice, setVoice] = useState("Jorge (masculino, Español)");
  const [overflowCalls, setOverflowCalls] = useState(false);
  const [overflowSession, setOverflowSession] = useState(false);
  const [overflowSessionTime, setOverflowSessionTime] = useState("");
  // Ring All configuration
  const [ringAllAgents, setRingAllAgents] = useState(
    editingGroup?.ringAllAgents ?? 2
  );
  // Levels configuration (when strategy = "Niveles")
  const [levels, setLevels] = useState<string[][]>(
    editingGroup?.levels || [[], []]
  );
  const [subStrategy, setSubStrategy] = useState(
    editingGroup?.subStrategy || "Balanceada"
  );
  const [levelsLeftSearch, setLevelsLeftSearch] = useState("");
  const [levelsRightSearch, setLevelsRightSearch] = useState("");
  const [levelsLeftSelected, setLevelsLeftSelected] = useState<Set<string>>(new Set());
  const [levelsRightSelected, setLevelsRightSelected] = useState<Set<string>>(new Set());
  const [collapsedLevels, setCollapsedLevels] = useState<Set<number>>(new Set());

  // Audio files
  const [holdMusicFile, setHoldMusicFile] = useState<string | null>(null);
  const [periodicAnnFile, setPeriodicAnnFile] = useState<string | null>(null);
  const [outboundAudioFile, setOutboundAudioFile] = useState<string | null>(null);
  const holdMusicRef = useRef<HTMLInputElement>(null);
  const periodicAnnRef = useRef<HTMLInputElement>(null);
  const outboundAudioRef = useRef<HTMLInputElement>(null);

  const AUDIO_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const AUDIO_ACCEPTED_TYPES = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/x-wav"];

  const handleAudioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!AUDIO_ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(wav|mp3)$/i)) {
        toast.error("Formato no soportado. Usa WAV o MP3.");
        e.target.value = "";
        return;
      }
      if (file.size > AUDIO_MAX_SIZE) {
        toast.error("El archivo supera el límite de 5 MB.");
        e.target.value = "";
        return;
      }
      setter(file.name);
      setFormTouched(true);
    }
    e.target.value = "";
  };

  const clearAudioFile = (setter: (v: string | null) => void) => {
    setter(null);
    setFormTouched(true);
  };

  // Labels (inside advanced config)
  const [assignedLabelIds, setAssignedLabelIds] = useState<number[]>(
    editingGroup?.labels || []
  );
  const [labelSearchQuery, setLabelSearchQuery] = useState("");
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false);
  const [labelActiveIdx, setLabelActiveIdx] = useState(-1);
  const [quickCreateLabel, setQuickCreateLabel] = useState(false);
  const [quickCreateColor, setQuickCreateColor] = useState<LabelColor>("gray");
  const labelDropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(labelDropdownRef, () => { setLabelDropdownOpen(false); setQuickCreateLabel(false); }, labelDropdownOpen);

  const filteredLabelsForGroup = useMemo(() => {
    if (!labelSearchQuery.trim()) return allLabels;
    const q = labelSearchQuery.toLowerCase();
    return allLabels.filter((l) => l.name.toLowerCase().includes(q));
  }, [allLabels, labelSearchQuery]);

  const addLabelToGroup = (id: number) => {
    if (!assignedLabelIds.includes(id)) {
      setAssignedLabelIds((prev) => [...prev, id]);
      setFormTouched(true);
    }
  };
  const removeLabelFromGroup = (id: number) => {
    setAssignedLabelIds((prev) => prev.filter((lid) => lid !== id));
    setFormTouched(true);
  };
  const { addLabel: storeAddLabel } = useLabelsStore();
  const handleQuickCreateGroupLabel = () => {
    const newName = labelSearchQuery.trim();
    if (!newName) return;
    const created = storeAddLabel({ name: newName, color: quickCreateColor });
    addLabelToGroup(created.id);
    setLabelSearchQuery("");
    setQuickCreateLabel(false);
    setLabelDropdownOpen(false);
    toast.success(`Label «${newName}» creada y asignada`);
  };

  // Templates (inside advanced config)
  const [assignedTemplates, setAssignedTemplates] = useState<Set<number>>(
    new Set(editingGroup?.templates || [])
  );
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateTab, setTemplateTab] = useState<"chat" | "email">("chat");
  const [assignedScheduleIds, setAssignedScheduleIds] = useState<number[]>(
    editingGroup?.schedules || []
  );
  const [scheduleSearch, setScheduleSearch] = useState("");
  const filteredSchedules = useMemo(() => {
    const q = scheduleSearch.toLowerCase();
    return availableSchedules.filter((s) =>
      q === "" || s.name.toLowerCase().includes(q)
    );
  }, [scheduleSearch]);
  const [labelsAccOpen, setLabelsAccOpen] = useState(false);
  const [templatesAccOpen, setTemplatesAccOpen] = useState(false);
  const filteredTemplates = useMemo(() => {
    const q = templateSearch.toLowerCase();
    return availableTemplates.filter(
      (t) =>
        t.type === templateTab &&
        (q === "" || t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q))
    );
  }, [templateSearch, templateTab, availableTemplates]);

  // Chat script
  const [chatScriptOpen, setChatScriptOpen] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  // Dirty tracking & validation
  const [formTouched, setFormTouched] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [nameConflictError, setNameConflictError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  /* Ref to StickyFormHeader for programmatic name editing (DD#299) */
  const stickyHeaderRef = useRef<StickyFormHeaderHandle>(null);

  const blocker = useNavigationGuard(formTouched && !saving);

  // Protect against browser tab close / refresh
  useEffect(() => {
    if (!formTouched) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formTouched]);

  /* ── Ctrl+S to save ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (formTouched && !saving) handleSave();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      if (isEditing) {
        stickyHeaderRef.current?.startEditing();
      } else {
        nameInputRef.current?.focus();
      }
      return;
    }
    if (saving) return;
    setSaving(true);
    setNameConflictError(false);

    // Simulate server round-trip (800ms)
    setTimeout(() => {
      // Check name conflict in store
      const nameExists = groups.some(
        (g) => g.name.toLowerCase() === name.trim().toLowerCase() && g.id !== editingGroup?.id
      );
      if (nameExists) {
        setSaving(false);
        setNameConflictError(true);
        nameInputRef.current?.focus();
        return;
      }

      // Random 15% chance of network error for demo purposes
      if (Math.random() < 0.15) {
        setSaving(false);
        toast.error("No se pudo guardar el grupo. Inténtalo de nuevo.", {
          action: {
            label: "Reintentar →",
            onClick: () => handleSave(),
          },
        });
        return;
      }

      // Build the group data to save
      const activeChannels: ("phone" | "chat" | "email")[] = [];
      if (channels.phone) activeChannels.push("phone");
      if (channels.chat) activeChannels.push("chat");
      if (channels.email) activeChannels.push("email");

      // DD#287: auto-assign unassigned agents to last level on save
      let finalLevels = levels;
      if (strategy === "Niveles") {
        const allInLvls = new Set<string>();
        levels.forEach((lvl) => lvl.forEach((a) => allInLvls.add(a)));
        const orphans = Array.from(assignedAgents).filter((a) => !allInLvls.has(a));
        if (orphans.length > 0) {
          finalLevels = levels.map((l, i) =>
            i === levels.length - 1 ? [...l, ...orphans] : [...l]
          );
          setLevels(finalLevels);
          toast.info(
            `${orphans.length} ${orphans.length === 1 ? "agente añadido" : "agentes añadidos"} automáticamente al último nivel.`,
            { duration: 5000 }
          );
        }
      }

      const groupPayload = {
        name: name.trim(),
        phone: phoneNumber,
        agents: assignedAgents.size,
        priority: priority as "Baja" | "Media" | "Alta" | "Máxima",
        typification: false,
        channels: activeChannels,
        strategy,
        chatStrategy: channels.chat ? chatStrategy : undefined,
        levels: strategy === "Niveles" ? finalLevels : undefined,
        subStrategy: strategy === "Niveles" ? subStrategy : undefined,
        ringAllAgents: strategy === "Ring All" ? ringAllAgents : undefined,
        capacityType,
        capacityValue: capacityType === "fixed" ? capacityFixed : capacityVariable,
        assignedAgents: Array.from(assignedAgents),
        labels: assignedLabelIds.length > 0 ? assignedLabelIds : undefined,
        templates: assignedTemplates.size > 0 ? Array.from(assignedTemplates) : undefined,
        schedules: assignedScheduleIds.length > 0 ? assignedScheduleIds : undefined,
        isDraft: undefined, // Clear draft flag on save (DD#294)
      };

      const wasDraft = isEditing && editingGroup?.isDraft;
      if (isEditing && editingGroup) {
        updateGroup(editingGroup.id, groupPayload);
      } else {
        addGroup(groupPayload);
      }

      // Success
      toast.success(
        wasDraft
          ? `Grupo «${name}» activado correctamente`
          : isEditing
            ? `Grupo «${name}» guardado correctamente`
            : `Grupo «${name}» creado correctamente`
      );
      navigate("/");
    }, 800);
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: "Administración", path: "/admin/usuarios" },
          { label: "Grupos", path: "/admin/grupos" },
          { label: isEditing ? (name || editingGroup?.name || "Editar") : "Crear grupo" },
        ]}
      />

      {/* Draft banner (DD#294) */}
      {isEditing && editingGroup?.isDraft && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-[12px] text-amber-700">
          <FilePen size={13} className="text-amber-500 shrink-0" />
          <span>Esta entidad es un borrador generado por duplicación. Al guardar se activará automáticamente y pasará a estar operativa.</span>
        </div>
      )}

      {/* ── Sticky header (DD#299: shared StickyFormHeader) ── */}
      <StickyFormHeader
        ref={stickyHeaderRef}
        name={name}
        onNameChange={(newName) => {
          setName(newName);
          setNameError(false);
          setNameConflictError(false);
          setFormTouched(true);
        }}
        isEdit={isEditing}
        editFallbackTitle={editingGroup?.name || "Editar grupo"}
        createTitle="Crear grupo"
        onCancel={() => navigate("/")}
        onSave={handleSave}
        saving={saving}
        saveDisabled={!formTouched && isEditing}
      />

      {/* DD#169: Cross-tab conflict warning */}
      {crossTabConflict && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5">
          <span className="text-[12px] text-amber-700">
            Este grupo puede estar siendo editado en otra pestaña. Los cambios guardados aquí podrían sobrescribir los de la otra sesión.
          </span>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-gray-50/80">
        <div className="flex flex-col lg:flex-row gap-6 px-6 py-6 max-w-[1100px]">
          {/* ── LEFT COLUMN — Identity + Channels (sticky on desktop) ── */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Identificación */}
              <SectionCard title="Identificación" icon={<Fingerprint size={15} className="text-gray-400" />}>
                {/* Name — only shown in create mode; in edit mode, name is edited inline in the header */}
                {!isEditing && (
                <div className="mb-5">
                  <FieldLabel text="Nombre" required />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError(false);
                      setNameConflictError(false);
                      setFormTouched(true);
                    }}
                    className={`${inputClass}${nameError || nameConflictError ? " border-red-400" : ""}`}
                    placeholder="Nombre del grupo"
                    ref={nameInputRef}
                  />
                  {nameError && (
                    <p className="text-[12px] text-red-400 mt-1.5">
                      El nombre es obligatorio
                    </p>
                  )}
                  {nameConflictError && (
                    <p className="text-[12px] text-red-400 mt-1.5">
                      Ya existe un grupo con este nombre. Elige otro.
                    </p>
                  )}
                </div>
                )}

                {channels.phone && (
                  <div className="mb-5">
                    <FieldLabel text="Teléfono asociado" tooltipKey="phone" />
                    <select
                      value={phoneNumber}
                      onChange={(e) => { setFormTouched(true); setPhoneNumber(e.target.value); }}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="917945449">917945449</option>
                      <option value="918371548">918371548</option>
                    </select>
                  </div>
                )}

                <div>
                  <FieldLabel text="Prioridad" tooltipKey="priority" />
                  <select
                    value={priority}
                    onChange={(e) => { setFormTouched(true); setPriority(e.target.value); }}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option>Baja</option>
                    <option>Media</option>
                    <option>Alta</option>
                    <option>Máxima</option>
                  </select>
                </div>
                {/* Canales (inline within Identificación) */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <FieldLabel text="Canales" />
                  <div className="flex gap-2">
                    {(["phone", "chat", "email"] as const).map((ch) => {
                      const labels = {
                        phone: "Teléfono",
                        chat: "Chat",
                        email: "Email",
                      };
                      const active = channels[ch];
                      const Icon = channelIconMap[ch];
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => toggleChannelFn(ch)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] border cursor-pointer ${
                            active
                              ? "bg-gray-800 text-white border-gray-800"
                              : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
                          }`}
                          style={{ fontWeight: active ? 500 : 400 }}
                        >
                          <Icon size={14} />
                          {labels[ch]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Settings (scrollable) ── */}
          <div className="flex-1 min-w-0">
          {/* ── Agentes ── */}
          <SectionCard title="Agentes" icon={<Users size={15} className="text-gray-400" />}>

            {/* Search-to-add input */}
            <div className="relative mb-4" ref={agentDropdownRef}>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Buscar agente por nombre..."
                    value={agentSearch}
                    onChange={(e) => {
                      setAgentSearch(e.target.value);
                      setAgentDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setAgentDropdownOpen(true);
                    }}
                    ref={agentSearchRef}
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {/* Label filter button (DD#219) */}
                <LabelFilterButton
                  allLabels={allLabels}
                  filterIds={dropdownLabelFilter}
                  onToggle={(id) => {
                    setDropdownLabelFilter((prev) => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    });
                  }}
                  onClear={() => setDropdownLabelFilter(new Set())}
                  iconSize={15}
                  zIndex={50}
                  forceClose={!agentDropdownOpen}
                />
              </div>

              {/* Dropdown results */}
              {agentDropdownOpen && (
                <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 max-h-[400px] overflow-y-auto">
                  {/* Dropdown header */}
                  <div className="px-4 py-2 text-[11px] text-gray-400 border-b border-gray-100">
                    {isBrowseMode
                      ? `${dropdownLabelFilter.size > 0 ? "Filtrados" : "Todos los agentes disponibles"} (${totalMatchCount})`
                      : `Resultados para «${agentSearch}» (${totalMatchCount})`}
                  </div>
                  {dropdownResults.length === 0 ? (
                    <div className="px-4 py-6 text-center text-[12px] text-gray-400">
                      No se encontraron agentes con ese nombre
                    </div>
                  ) : (
                    <>
                      {dropdownResults.map((agent) => {
                        const isAssigned = assignedAgents.has(agent);
                        const agentGroups = getAgentGroups(agent, currentGroupId, groups);
                        return (
                          <div
                            key={agent}
                            className={`flex items-center gap-3 px-4 py-2.5 ${
                              isAssigned
                                ? "opacity-50 cursor-default"
                                : "hover:bg-gray-50 text-gray-700 cursor-pointer"
                            }`}
                          >
                            <Headphones size={14} className="text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[13px]" style={{ fontWeight: isAssigned ? 400 : 500 }}>
                                  {agent}
                                </span>
                                {(agentLabelMap.get(agent) || []).slice(0, 4).map((lid) => {
                                  const lbl = labelMap.get(lid);
                                  if (!lbl) return null;
                                  const ls = labelColorStyles[lbl.color];
                                  return <span key={lid} className={`w-1.5 h-1.5 shrink-0 ${ls.dot}`} style={{ borderRadius: "50%" }} />;
                                })}
                              </div>
                              <AgentGroupTags groups={agentGroups} />
                            </div>
                            <AgentChannelIcons
                              agentName={agent}
                              agentChannelsMap={agentChannelsMap}
                              groupChannels={channels}
                              iconSize={12}
                            />
                            {isAssigned ? (
                              <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
                                <Check size={12} /> Asignado
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  toggleAgent(agent);
                                  setAgentSearch("");
                                  setAgentDropdownOpen(false);
                                  agentSearchRef.current?.focus();
                                }}
                                className="inline-flex items-center gap-1 text-[12px] text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 hover:bg-gray-100 cursor-pointer shrink-0"
                              >
                                <Plus size={12} /> Añadir
                              </button>
                            )}
                          </div>
                        );
                      })}
                      <div className="px-4 py-2 text-[11px] text-gray-400 border-t border-gray-100">
                        Mostrando {dropdownResults.length} de {totalMatchCount}{isBrowseMode ? " · Escribe para filtrar" : " resultados"}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Assigned agents area */}
            <div className="border border-gray-200">
              <div className="bg-gray-50/70 px-4 py-2.5 border-b border-gray-200">
                <span className="text-[12px] text-gray-600" style={{ fontWeight: 600 }}>
                  Agentes asignados
                </span>
              </div>

              {assignedAgents.size === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-8">
                  <Users size={32} className="text-gray-300 mb-3" />
                  <div className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>
                    Ningún agente asignado aún
                  </div>
                  <div className="text-[12px] text-gray-400 mt-1">
                    Busca agentes por nombre para añadirlos a este grupo
                  </div>
                </div>
              ) : (
                <div>
                  {/* Filter tabs: Todos / Activos / Inactivos */}
                  <div className="flex items-center gap-0 border-b border-gray-200 px-4">
                    {([
                      { key: "all" as const, label: "Todos", count: assignedAgents.size },
                      { key: "active" as const, label: "Activos", count: activeAgentCount },
                      { key: "inactive" as const, label: "Inactivos", count: inactiveAgentCount },
                    ]).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setAssignedFilter(tab.key);
                          setSelectedAssigned(new Set());
                          setShowAllAssigned(false);
                        }}
                        className={`px-3 py-2 text-[12px] cursor-pointer border-b-2 -mb-px ${
                          assignedFilter === tab.key
                            ? "border-gray-800 text-gray-800"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                        style={{ fontWeight: assignedFilter === tab.key ? 600 : 400 }}
                      >
                        {tab.label}
                        <span className={`ml-1 ${assignedFilter === tab.key ? "text-gray-500" : "text-gray-300"}`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search + label filter within assigned agents (DD#192, DD#215) */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <Search
                          size={13}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300"
                        />
                        <input
                          type="text"
                          placeholder="Buscar en asignados..."
                          value={assignedSearch}
                          onChange={(e) => {
                            setAssignedSearch(e.target.value);
                            setShowAllAssigned(false);
                          }}
                          className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                        />
                        {assignedSearch && (
                          <button
                            onClick={() => setAssignedSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                      {/* Label filter button (DD#219) */}
                      <LabelFilterButton
                        allLabels={allLabels}
                        filterIds={assignedLabelFilter}
                        onToggle={(id) => {
                          setAssignedLabelFilter((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                          setShowAllAssigned(false);
                        }}
                        onClear={() => setAssignedLabelFilter(new Set())}
                        iconSize={13}
                        zIndex={20}
                      />
                    </div>
                  </div>

                  {/* Bulk action bar for selected agents */}
                  {selectedAssigned.size > 0 && (
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-100 border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAllFiltered}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-[12px] text-gray-600" style={{ fontWeight: 500 }}>
                        {selectedAssigned.size} seleccionado{selectedAssigned.size > 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => setSelectedAssigned(new Set())}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                      <div className="h-3.5 w-px bg-gray-300" />
                      <button
                        onClick={handleBulkActivate}
                        className="text-[11px] text-gray-600 hover:bg-gray-200 px-2 py-1 cursor-pointer"
                        style={{ fontWeight: 500 }}
                      >
                        Activar
                      </button>
                      <button
                        onClick={handleBulkDeactivate}
                        className="text-[11px] text-gray-600 hover:bg-gray-200 px-2 py-1 cursor-pointer"
                        style={{ fontWeight: 500 }}
                      >
                        Desactivar
                      </button>
                      <button
                        onClick={handleBulkRemove}
                        className="text-[11px] text-red-500 hover:bg-red-50 px-2 py-1 cursor-pointer"
                        style={{ fontWeight: 500 }}
                      >
                        Quitar del grupo
                      </button>
                    </div>
                  )}

                  {/* Agent rows */}
                  {(() => {
                    const maxVisible = 10;
                    const visibleAgents = showAllAssigned
                      ? filteredAssignedAgents
                      : filteredAssignedAgents.slice(0, maxVisible);
                    const hasAnySelected = selectedAssigned.size > 0;

                    if (filteredAssignedAgents.length === 0) {
                      return (
                        <div className="px-4 py-8 text-center text-[12px] text-gray-400">
                          {assignedSearch.trim()
                            ? `No se encontraron agentes asignados con "${assignedSearch}"`
                            : assignedLabelFilter.size > 0
                              ? "No hay agentes asignados con esas labels"
                              : assignedFilter === "active"
                                ? "No hay agentes activos en este grupo"
                                : "No hay agentes inactivos en este grupo"
                          }
                        </div>
                      );
                    }

                    return (
                      <>
                        {visibleAgents.map((agent, i) => {
                          const agentGroups = getAgentGroups(agent, currentGroupId, groups);
                          const isSelected = selectedAssigned.has(agent);
                          return (
                          <div
                            key={agent}
                            className={`group/agent flex items-center gap-3 px-4 py-2.5 ${
                              i < visibleAgents.length - 1 ? "border-b border-gray-100" : ""
                            } ${isSelected ? "bg-gray-50" : ""}`}
                          >
                            {/* Checkbox: visible on hover or when any selected */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectAssigned(agent)}
                              className={`w-3.5 h-3.5 shrink-0 cursor-pointer ${
                                hasAnySelected
                                  ? "opacity-100"
                                  : "opacity-0 group-hover/agent:opacity-100"
                              }`}
                              style={{ transition: "opacity 0.1s" }}
                            />
                            <Headphones size={14} className="text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>
                                  {agent}
                                </span>
                                {(() => {
                                  const agentLids = agentLabelMap.get(agent) || [];
                                  if (!agentLids.length) return null;
                                  return (
                                    <span className="inline-flex items-center gap-0.5">
                                      {agentLids.slice(0, 3).map((lid) => {
                                        const lbl = labelMap.get(lid);
                                        if (!lbl) return null;
                                        const s = labelColorStyles[lbl.color];
                                        return <span key={lid} className={`w-1.5 h-1.5 ${s.dot} shrink-0`} style={{ borderRadius: "50%" }} />;
                                      })}
                                      {agentLids.length > 3 && (
                                        <span className="text-[9px] text-gray-400">+{agentLids.length - 3}</span>
                                      )}
                                    </span>
                                  );
                                })()}
                              </div>
                              <AgentGroupTags groups={agentGroups} />
                            </div>

                            {/* Agent channel icons + mismatch warning */}
                            <AgentChannelIcons
                              agentName={agent}
                              agentChannelsMap={agentChannelsMap}
                              groupChannels={channels}
                              iconSize={13}
                            />

                            {/* On/Off toggle */}
                            <button
                              className={`relative w-9 h-5 shrink-0 cursor-pointer transition-colors ${
                                agentActiveState[agent] !== false
                                  ? "bg-gray-800"
                                  : "bg-gray-300"
                              }`}
                              onClick={() => toggleAgentActive(agent)}
                              title={agentActiveState[agent] !== false ? "Activo en este grupo" : "Inactivo en este grupo"}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${
                                  agentActiveState[agent] !== false ? "translate-x-4" : ""
                                }`}
                              />
                            </button>

                            {/* Separator between toggle and × — visible only on hover */}
                            <span className="w-px h-4 bg-gray-200 shrink-0 opacity-0 group-hover/agent:opacity-100 transition-opacity" />

                            {/* Remove button — visible only on hover */}
                            <button
                              onClick={() => toggleAgent(agent)}
                              className="text-gray-300 hover:text-red-400 cursor-pointer shrink-0 opacity-0 group-hover/agent:opacity-100 transition-opacity"
                              title="Quitar del grupo"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          );
                        })}
                        {!showAllAssigned && filteredAssignedAgents.length > maxVisible && (
                          <button
                            onClick={() => setShowAllAssigned(true)}
                            className="w-full px-4 py-2.5 text-[12px] text-gray-500 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                          >
                            Ver todos ({filteredAssignedAgents.length}) ↓
                          </button>
                        )}
                        {showAllAssigned && filteredAssignedAgents.length > maxVisible && (
                          <button
                            onClick={() => setShowAllAssigned(false)}
                            className="w-full px-4 py-2.5 text-[12px] text-gray-500 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                          >
                            Mostrar menos ↑
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Estrategia ── */}
          <SectionCard title="Estrategia" icon={<Target size={15} className="text-gray-400" />}>

            {!channels.phone && !channels.chat ? (
              /* No strategy-relevant channels active */
              <div className="flex items-center gap-2.5 py-3 px-3 border border-dashed border-gray-200 min-h-[52px]">
                <Target size={15} className="text-gray-300 shrink-0" />
                <p className="text-[12px] text-gray-400">
                  Activa Teléfono o Chat para configurar estrategias de distribución.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Phone strategy */}
                {channels.phone && (
                  <div>
                    <FieldLabel
                      text="Estrategia — Teléfono"
                      tooltipKey="strategy"
                    />
                    <select
                      value={strategy}
                      onChange={(e) => {
                        setFormTouched(true);
                        const val = e.target.value;
                        setStrategy(val);
                        // Initialize levels when switching to Niveles
                        if (val === "Niveles" && levels.every((l) => l.length === 0)) {
                          setLevels([[], []]);
                        }
                      }}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <optgroup label="Estándar">
                        <option>Balanceada</option>
                        <option>Lineal</option>
                        <option>Aleatoria</option>
                        <option>Menos llamadas atendidas</option>
                        <option>Menos reciente (más inactivo)</option>
                      </optgroup>
                      <optgroup label="Avanzadas">
                        <option>Agente exclusivo</option>
                        <option>Niveles</option>
                        <option>Ring All</option>
                      </optgroup>
                    </select>

                    {/* Agente exclusivo — info callout */}
                    {strategy === "Agente exclusivo" && (
                      <div className="mt-2.5 flex items-start gap-2.5 bg-blue-50 border border-blue-200 px-4 py-2.5">
                        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-[12px] text-blue-700">
                          Agente exclusivo asigna todas las interacciones al mismo agente mientras
                          esté disponible. Requiere configuración del árbol IVR en VUI Designer.
                        </span>
                      </div>
                    )}

                    {/* Ring All — config + cost warning */}
                    {strategy === "Ring All" && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <FieldLabel text="Nº agentes simultáneos" tooltipKey="ringAllSimultaneous" />
                          <select
                            value={ringAllAgents}
                            onChange={(e) => { setFormTouched(true); setRingAllAgents(Number(e.target.value)); }}
                            className="w-[120px] px-2 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-gray-500 bg-white cursor-pointer"
                          >
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 px-4 py-2.5">
                          <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-[12px] text-amber-700">
                            Ring All puede generar costes adicionales al multiplicar el número
                            de llamadas salientes simultáneas.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Niveles — full configuration area */}
                    {strategy === "Niveles" && (
                      <LevelsConfiguration
                        assignedAgents={Array.from(assignedAgents)}
                        levels={levels}
                        setLevels={(updater) => { setFormTouched(true); setLevels(updater); }}
                        subStrategy={subStrategy}
                        setSubStrategy={(v) => { setFormTouched(true); setSubStrategy(v); }}
                        leftSearch={levelsLeftSearch}
                        setLeftSearch={setLevelsLeftSearch}
                        rightSearch={levelsRightSearch}
                        setRightSearch={setLevelsRightSearch}
                        leftSelected={levelsLeftSelected}
                        setLeftSelected={setLevelsLeftSelected}
                        rightSelected={levelsRightSelected}
                        setRightSelected={setLevelsRightSelected}
                        collapsedLevels={collapsedLevels}
                        setCollapsedLevels={setCollapsedLevels}
                        agentChannelsMap={agentChannelsMap}
                        groupChannels={channels}
                      />
                    )}
                  </div>
                )}

                {/* Chat strategy */}
                {channels.chat && (
                  <div>
                    <FieldLabel
                      text="Estrategia — Chat"
                      tooltipKey="chatStrategy"
                    />
                    <select
                      value={chatStrategy}
                      onChange={(e) => { setFormTouched(true); setChatStrategy(e.target.value); }}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option>Rotativa (por turnos)</option>
                      <option>Menos chats activos</option>
                      <option>Aleatoria</option>
                    </select>
                  </div>
                )}
              </div>
            )}

          </SectionCard>

          {/* ── Anuncios y audio ── */}
          <SectionCard title="Anuncios y audio" icon={<Volume2 size={15} className="text-gray-400" />}>
            <input ref={holdMusicRef} type="file" accept=".wav,.mp3,audio/wav,audio/mpeg" className="hidden" onChange={(e) => handleAudioChange(e, setHoldMusicFile)} />
            <input ref={periodicAnnRef} type="file" accept=".wav,.mp3,audio/wav,audio/mpeg" className="hidden" onChange={(e) => handleAudioChange(e, setPeriodicAnnFile)} />
            <input ref={outboundAudioRef} type="file" accept=".wav,.mp3,audio/wav,audio/mpeg" className="hidden" onChange={(e) => handleAudioChange(e, setOutboundAudioFile)} />

            <div className="space-y-2.5">
              {/* Música de espera */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-gray-500 w-[140px] shrink-0 flex items-center gap-1">
                  Música de espera <TooltipIcon tooltipKey="holdMusic" />
                </span>
                {holdMusicFile ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <Music size={13} className="text-gray-400 shrink-0" />
                    <span className="text-[13px] text-gray-700 truncate">{holdMusicFile}</span>
                    <button onClick={() => clearAudioFile(setHoldMusicFile)} className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"><X size={13} /></button>
                  </div>
                ) : (
                  <button onClick={() => holdMusicRef.current?.click()} className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 cursor-pointer">
                    <Upload size={13} /> Elegir archivo
                  </button>
                )}
              </div>

              {/* Anuncio periódico */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-gray-500 w-[140px] shrink-0 flex items-center gap-1">
                  Anuncio periódico <TooltipIcon tooltipKey="periodicAnnouncement" />
                </span>
                {periodicAnnFile ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <Music size={13} className="text-gray-400 shrink-0" />
                    <span className="text-[13px] text-gray-700 truncate">{periodicAnnFile}</span>
                    <button onClick={() => clearAudioFile(setPeriodicAnnFile)} className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"><X size={13} /></button>
                  </div>
                ) : (
                  <button onClick={() => periodicAnnRef.current?.click()} className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 cursor-pointer">
                    <Upload size={13} /> Elegir archivo
                  </button>
                )}
                <span className="text-[11px] text-gray-400 ml-auto shrink-0 flex items-center gap-1">
                  cada
                  <input
                    type="number"
                    defaultValue={30}
                    className={`w-12 ${inputSmClass} text-center`}
                  />
                  seg
                </span>
              </div>

              {/* Audio informativo en conversación (DD#280) */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-gray-500 w-[140px] shrink-0 flex items-center gap-1">
                  Audio informativo <TooltipIcon tooltipKey="outboundAudio" />
                </span>
                {outboundAudioFile ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <Music size={13} className="text-gray-400 shrink-0" />
                    <span className="text-[13px] text-gray-700 truncate">{outboundAudioFile}</span>
                    <button onClick={() => clearAudioFile(setOutboundAudioFile)} className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"><X size={13} /></button>
                  </div>
                ) : (
                  <button onClick={() => outboundAudioRef.current?.click()} className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 cursor-pointer">
                    <Upload size={13} /> Elegir archivo
                  </button>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Recursos asignados ── */}
          <SectionCard title="Recursos asignados" icon={<FolderOpen size={15} className="text-gray-400" />}>

            <div className="mb-5">
              <FieldLabel text="Tipificación" />
              <select className={`${inputClass} cursor-pointer`}>
                <option>Sin tipificación</option>
              </select>
            </div>

            <div className="mb-5">
              <FieldLabel text="Agendas" />
              {availableSchedules.length > 4 && (
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar agenda..."
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 text-[12px] focus:outline-none focus:border-gray-400 bg-white"
                  />
                  {scheduleSearch && (
                    <button
                      type="button"
                      onClick={() => setScheduleSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              )}
              <div className="border border-gray-200 overflow-hidden max-h-[200px] overflow-y-auto">
                {filteredSchedules.length === 0 ? (
                  <div className="px-3 py-4 text-[12px] text-gray-400 text-center">
                    Sin resultados
                  </div>
                ) : (
                  filteredSchedules.map((sched, idx) => {
                    const isChecked = assignedScheduleIds.includes(sched.id);
                    return (
                      <div
                        key={sched.id}
                        className={`group/schedrow flex items-center gap-3 px-3 py-2.5 cursor-pointer ${
                          idx < filteredSchedules.length - 1 ? "border-b border-gray-100" : ""
                        } ${isChecked ? "bg-gray-50" : "hover:bg-gray-50"}`}
                        onClick={() => {
                          setFormTouched(true);
                          setAssignedScheduleIds((prev) =>
                            prev.includes(sched.id)
                              ? prev.filter((id) => id !== sched.id)
                              : [...prev, sched.id]
                          );
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className={`w-3.5 h-3.5 cursor-pointer transition-opacity ${
                            isChecked ? "opacity-100" : "opacity-0 group-hover/schedrow:opacity-100"
                          }`}
                          tabIndex={-1}
                        />
                        <Phone size={13} className="text-gray-400 shrink-0" />
                        <span className="text-[13px] text-gray-600 flex-1" style={{ fontWeight: isChecked ? 500 : 400 }}>
                          {sched.name}
                        </span>
                        {isChecked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormTouched(true);
                              setAssignedScheduleIds((prev) => prev.filter((id) => id !== sched.id));
                            }}
                            className="text-gray-300 hover:text-gray-500 cursor-pointer shrink-0 opacity-0 group-hover/schedrow:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {assignedScheduleIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {assignedScheduleIds.map((sid) => {
                    const sched = availableSchedules.find((s) => s.id === sid);
                    if (!sched) return null;
                    return (
                      <span
                        key={sid}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 text-[12px] text-gray-600 bg-white"
                        style={{ fontWeight: 500 }}
                      >
                        {sched.name}
                        <button
                          type="button"
                          onClick={() => {
                            setFormTouched(true);
                            setAssignedScheduleIds((prev) => prev.filter((id) => id !== sid));
                          }}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mb-5">
              <FieldLabel text="Plantillas" />
              <select className={`${inputClass} cursor-pointer`}>
                <option>Seleccionar plantillas...</option>
              </select>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-1 text-[12px] text-gray-500 underline"
            >
              Gestionar en Repositorios <ExternalLink size={11} />
            </a>
          </SectionCard>

          {/* Apertura de ficha moved to Configuración avanzada */}

          {/* ── Configuración avanzada ── */}
          <div className="border border-gray-200 bg-white mb-8">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center gap-2 bg-gray-50 px-5 py-3.5 cursor-pointer hover:bg-gray-100"
            >
              {advancedOpen ? (
                <ChevronDown size={15} className="text-gray-400" />
              ) : (
                <ChevronRight size={15} className="text-gray-400" />
              )}
              <Settings size={15} className="text-gray-400" />
              <span className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>
                Configuración avanzada
              </span>
              {!advancedOpen && (
                <span className="text-[12px] text-gray-400 ml-1">
                  Valores por defecto aplicados
                </span>
              )}
            </button>

              {advancedOpen && (
                <div className="px-5 py-5 border-t border-gray-200">

                {/* ── Labels (accordion) ── */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => setLabelsAccOpen(!labelsAccOpen)}
                    className="w-full flex items-center gap-2 cursor-pointer"
                  >
                    {labelsAccOpen ? (
                      <ChevronDown size={13} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={13} className="text-gray-400" />
                    )}
                    <Tag size={13} className="text-gray-400" />
                    <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Labels
                    </span>
                    {!labelsAccOpen && assignedLabelIds.length > 0 && (
                      <span className="text-[11px] text-gray-400 ml-auto">
                        {assignedLabelIds.length} asignada{assignedLabelIds.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                  {labelsAccOpen && (
                  <div className="mt-3">
                  <div className="relative mb-4" ref={labelDropdownRef}>
                    <div className="relative">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Buscar o crear label..."
                        value={labelSearchQuery}
                        onChange={(e) => {
                          setLabelSearchQuery(e.target.value);
                          setLabelDropdownOpen(true);
                          setLabelActiveIdx(-1);
                          setQuickCreateLabel(false);
                        }}
                        onFocus={() => setLabelDropdownOpen(true)}
                        onKeyDown={(e) => {
                          if (!labelDropdownOpen) return;
                          const selectableLabels = filteredLabelsForGroup.filter(
                            (l) => !assignedLabelIds.includes(l.id)
                          );
                          const hasQuickCreate = labelSearchQuery.trim() &&
                            !allLabels.some((l) => l.name.toLowerCase() === labelSearchQuery.trim().toLowerCase());
                          const totalItems = selectableLabels.length + (hasQuickCreate ? 1 : 0);

                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setLabelActiveIdx((prev) =>
                              prev < totalItems - 1 ? prev + 1 : 0
                            );
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setLabelActiveIdx((prev) =>
                              prev > 0 ? prev - 1 : totalItems - 1
                            );
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            if (quickCreateLabel) {
                              handleQuickCreateGroupLabel();
                            } else if (labelActiveIdx >= 0 && labelActiveIdx < selectableLabels.length) {
                              addLabelToGroup(selectableLabels[labelActiveIdx].id);
                            } else if (hasQuickCreate && labelActiveIdx === selectableLabels.length) {
                              setQuickCreateLabel(true);
                            }
                          } else if (e.key === "Escape") {
                            setLabelDropdownOpen(false);
                            setLabelActiveIdx(-1);
                            setQuickCreateLabel(false);
                          }
                        }}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-gray-500 bg-white"
                      />
                      {labelSearchQuery && (
                        <button
                          onClick={() => {
                            setLabelSearchQuery("");
                            setLabelDropdownOpen(false);
                            setQuickCreateLabel(false);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {labelDropdownOpen && (
                      <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-gray-200 max-h-[320px] overflow-y-auto">
                        {(() => {
                          const selectableLabels = filteredLabelsForGroup.filter(
                            (l) => !assignedLabelIds.includes(l.id)
                          );
                          const hasQuickCreate = labelSearchQuery.trim() &&
                            !allLabels.some((l) => l.name.toLowerCase() === labelSearchQuery.trim().toLowerCase());

                          return (
                            <>
                              {selectableLabels.length === 0 && !hasQuickCreate ? (
                                <div className="px-3 py-4 text-[12px] text-gray-400 text-center">
                                  {labelSearchQuery
                                    ? "No se encontraron labels"
                                    : assignedLabelIds.length === allLabels.length
                                      ? "Todas las labels están asignadas"
                                      : "No hay labels disponibles"}
                                </div>
                              ) : (
                                <>
                                  {selectableLabels.map((label, idx) => {
                                    const isActive = idx === labelActiveIdx;
                                    return (
                                      <div
                                        key={label.id}
                                        className={`flex items-center justify-between px-3 py-2.5 ${
                                          isActive
                                            ? "bg-gray-100 cursor-pointer"
                                            : "hover:bg-gray-50 cursor-pointer"
                                        }`}
                                        onClick={() => addLabelToGroup(label.id)}
                                      >
                                        <LabelChip label={label} size="sm" />
                                        {label.description && (
                                          <span className="text-[11px] text-gray-400 ml-2 truncate max-w-[180px]">
                                            {label.description}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {hasQuickCreate && !quickCreateLabel && (
                                    <div
                                      className={`flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 ${
                                        labelActiveIdx === selectableLabels.length
                                          ? "bg-gray-100 cursor-pointer"
                                          : "hover:bg-gray-50 cursor-pointer"
                                      }`}
                                      onClick={() => setQuickCreateLabel(true)}
                                    >
                                      <Plus size={13} className="text-gray-400" />
                                      <span className="text-[13px] text-gray-600">
                                        Crear "<span style={{ fontWeight: 500 }}>{labelSearchQuery.trim()}</span>"
                                      </span>
                                    </div>
                                  )}

                                  {quickCreateLabel && (
                                    <div className="px-3 py-3 border-t border-gray-100 bg-gray-50">
                                      <div className="text-[12px] text-gray-500 mb-2">
                                        Elige un color para "<span style={{ fontWeight: 500 }}>{labelSearchQuery.trim()}</span>":
                                      </div>
                                      <div className="flex items-center gap-1.5 mb-3">
                                        {LABEL_COLORS.map((c) => {
                                          const s = labelColorStyles[c];
                                          const isSel = c === quickCreateColor;
                                          return (
                                            <button
                                              key={c}
                                              type="button"
                                              onClick={() => setQuickCreateColor(c)}
                                              className={`w-6 h-6 flex items-center justify-center cursor-pointer border ${
                                                isSel ? "border-gray-600" : "border-transparent hover:border-gray-300"
                                              }`}
                                            >
                                              <span className={`w-3.5 h-3.5 ${s.dot}`} />
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={handleQuickCreateGroupLabel}
                                          className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
                                          style={{ fontWeight: 500 }}
                                        >
                                          Crear y asignar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setQuickCreateLabel(false)}
                                          className="px-3 py-1 text-[12px] text-gray-500 border border-gray-300 hover:bg-gray-100 cursor-pointer"
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Assigned labels */}
                  {assignedLabelIds.length === 0 ? (
                    <div className="border border-dashed border-gray-300 py-6 flex flex-col items-center gap-2">
                      <Tag size={20} className="text-gray-300" />
                      <span className="text-[12px] text-gray-400">
                        Ninguna label asignada aún
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedLabelIds.map((labelId) => {
                        const label = allLabels.find((l) => l.id === labelId);
                        if (!label) return null;
                        return (
                          <LabelChip
                            key={labelId}
                            label={label}
                            size="sm"
                            onRemove={() => removeLabelFromGroup(labelId)}
                          />
                        );
                      })}
                    </div>
                  )}
                  </div>
                  )}
                </div>

                {/* ── Plantillas (accordion) ── */}
                <div className="border-t border-gray-200 mt-5 pt-5 mb-5">
                  <button
                    type="button"
                    onClick={() => setTemplatesAccOpen(!templatesAccOpen)}
                    className="w-full flex items-center gap-2 cursor-pointer"
                  >
                    {templatesAccOpen ? (
                      <ChevronDown size={13} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={13} className="text-gray-400" />
                    )}
                    <FileStack size={13} className="text-gray-400" />
                    <span className="text-[12px] text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Plantillas
                    </span>
                    {!templatesAccOpen && assignedTemplates.size > 0 && (
                      <span className="text-[11px] text-gray-400 ml-auto">
                        {assignedTemplates.size} asignada{assignedTemplates.size !== 1 ? "s" : ""}
                      </span>
                    )}
                  </button>

                  {templatesAccOpen && (
                  <div className="mt-3">

                  {/* Tabs Chat / Email */}
                  <div className="flex items-center gap-0 mb-3 border-b border-gray-200">
                    {(["chat", "email"] as const).map((tab) => {
                      const isActive = templateTab === tab;
                      const countInTab = availableTemplates.filter((t) => t.type === tab).length;
                      const assignedInTab = availableTemplates.filter(
                        (t) => t.type === tab && assignedTemplates.has(t.id)
                      ).length;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setTemplateTab(tab);
                            setTemplateSearch("");
                          }}
                          className={`px-4 py-2 text-[12px] cursor-pointer border-b-2 transition-colors ${
                            isActive
                              ? "border-gray-800 text-gray-800"
                              : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                          style={{ fontWeight: isActive ? 600 : 400 }}
                        >
                          <span className="flex items-center gap-1.5">
                            {tab === "chat" ? <MessageSquare size={12} /> : <Mail size={12} />}
                            {tab === "chat" ? "Chat" : "Email"}
                            <span className="text-[11px] text-gray-400">
                              {assignedInTab}/{countInTab}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Buscar plantilla..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-gray-500 bg-white"
                    />
                    {templateSearch && (
                      <button
                        onClick={() => setTemplateSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Template list — no Tipo column, checkbox on hover */}
                  <div className="border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="w-8 px-2 py-2">
                            <input
                              type="checkbox"
                              checked={filteredTemplates.length > 0 && filteredTemplates.every((t) => assignedTemplates.has(t.id))}
                              onChange={() => {
                                const allChecked = filteredTemplates.every((t) => assignedTemplates.has(t.id));
                                const next = new Set(assignedTemplates);
                                filteredTemplates.forEach((t) => {
                                  if (allChecked) next.delete(t.id);
                                  else next.add(t.id);
                                });
                                setAssignedTemplates(next);
                                setFormTouched(true);
                              }}
                              className="w-3.5 h-3.5 cursor-pointer"
                              aria-label="Seleccionar todas las plantillas"
                            />
                          </th>
                          <th className="text-left px-3 py-2 text-[11px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                            Título
                          </th>
                          <th className="text-left px-3 py-2 text-[11px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                            Vista previa
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTemplates.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-[12px] text-gray-400">
                              No se encontraron plantillas de {templateTab}
                            </td>
                          </tr>
                        ) : (
                          filteredTemplates.map((tpl) => {
                            const isChecked = assignedTemplates.has(tpl.id);
                            return (
                              <tr
                                key={tpl.id}
                                className={`group/tplrow border-b border-gray-100 last:border-b-0 cursor-pointer ${isChecked ? "bg-gray-50" : "hover:bg-gray-50"}`}
                                onClick={() => {
                                  const next = new Set(assignedTemplates);
                                  if (next.has(tpl.id)) next.delete(tpl.id);
                                  else next.add(tpl.id);
                                  setAssignedTemplates(next);
                                  setFormTouched(true);
                                }}
                              >
                                <td className="px-2 py-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className={`w-3.5 h-3.5 cursor-pointer transition-opacity ${isChecked ? "opacity-100" : "opacity-0 group-hover/tplrow:opacity-100"}`}
                                    tabIndex={-1}
                                    aria-label={`Seleccionar ${tpl.title}`}
                                  />
                                </td>
                                <td className="px-3 py-2.5 text-[13px] text-gray-600" style={{ fontWeight: 500 }}>
                                  {tpl.title}
                                </td>
                                <td className="px-3 py-2.5 text-[12px] text-gray-400 max-w-[280px]">
                                  <span className="block truncate">{tpl.body}</span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  </div>
                  )}
                </div>

                {/* ── Tiempos y configuración ── */}
                <div className="border-t border-gray-200 mt-5 pt-5 grid grid-cols-2 gap-x-8 gap-y-5">
                  <div className="space-y-5">
                    <div>
                      <FieldLabel
                        text="Tiempo de transferencia"
                        tooltipKey="transferTime"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={transferTime}
                          onChange={(e) => { setFormTouched(true); setTransferTime(e.target.value); }}
                          className={`w-20 ${inputSmClass} text-center`}
                        />
                        <span className="text-[12px] text-gray-400">seg</span>
                      </div>
                    </div>

                    <div>
                      <FieldLabel
                        text="Tiempo máx. espera en cola"
                        tooltipKey="maxWaitTime"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={maxWaitTime}
                          onChange={(e) => { setFormTouched(true); setMaxWaitTime(e.target.value); }}
                          className={`w-20 ${inputSmClass} text-center`}
                        />
                        <span className="text-[12px] text-gray-400">seg</span>
                      </div>
                    </div>

                    <div>
                      <FieldLabel
                        text="Tiempo % de servicio"
                        tooltipKey="serviceTime"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={serviceTime}
                          onChange={(e) => { setFormTouched(true); setServiceTime(e.target.value); }}
                          className={`w-20 ${inputSmClass} text-center`}
                        />
                        <span className="text-[12px] text-gray-400">seg</span>
                      </div>
                    </div>

                    <div>
                      <FieldLabel
                        text="Tiempo admin entre llamadas"
                        tooltipKey="adminTime"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={adminTime}
                          onChange={(e) => { setFormTouched(true); setAdminTime(e.target.value); }}
                          className={`w-20 ${inputSmClass} text-center`}
                          placeholder=""
                        />
                        <span className="text-[12px] text-gray-400">seg</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <FieldLabel text="Voz" />
                      <select
                        value={voice}
                        onChange={(e) => { setFormTouched(true); setVoice(e.target.value); }}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option>Jorge (masculino, Español)</option>
                        <option>Lucía (femenino, Español)</option>
                        <option>Carlos (masculino, Español)</option>
                      </select>
                    </div>

                    <div>
                      <FieldLabel
                        text="Desbordar llamadas"
                        tooltipKey="overflowCalls"
                      />
                      <div className="flex items-center gap-2.5">
                        <ToggleSwitch
                          checked={overflowCalls}
                          onChange={() => { setFormTouched(true); setOverflowCalls(!overflowCalls); }}
                          label="Desbordar llamadas"
                        />
                        <span className="text-[12px] text-gray-500">
                          {overflowCalls ? "Activado" : "Desactivado"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <FieldLabel
                        text="Desbordar sesión"
                        tooltipKey="overflowSession"
                      />
                      <div className="flex items-center gap-2.5">
                        <ToggleSwitch
                          checked={overflowSession}
                          onChange={() => { setFormTouched(true); setOverflowSession(!overflowSession); }}
                          label="Desbordar sesión"
                        />
                        {overflowSession && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] text-gray-400">
                              tras
                            </span>
                            <input
                              type="number"
                              value={overflowSessionTime}
                              onChange={(e) =>
                                { setFormTouched(true); setOverflowSessionTime(e.target.value); }
                              }
                              className={`w-16 ${inputSmClass} text-center`}
                              placeholder="0"
                            />
                            <span className="text-[12px] text-gray-400">
                              min
                            </span>
                          </div>
                        )}
                        {!overflowSession && (
                          <span className="text-[12px] text-gray-500">
                            Desactivado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Capacidad máxima */}
                  <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
                    <FieldLabel text="Capacidad máxima" tooltipKey="capacity" />
                    <div className="flex items-center gap-5 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-500">
                        <input
                          type="radio"
                          name="capacityType"
                          checked={capacityType === "fixed"}
                          onChange={() => { setFormTouched(true); setCapacityType("fixed"); }}
                        />
                        Fija
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-500">
                        <input
                          type="radio"
                          name="capacityType"
                          checked={capacityType === "variable"}
                          onChange={() => { setFormTouched(true); setCapacityType("variable"); }}
                        />
                        Variable
                      </label>
                    </div>
                    {capacityType === "fixed" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={capacityFixed}
                          onChange={(e) => { setFormTouched(true); setCapacityFixed(e.target.value); }}
                          className={`w-20 ${inputSmClass} text-center`}
                        />
                        <span className="text-[12px] text-gray-400">
                          conversaciones en cola
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={capacityVariable}
                          onChange={(e) => { setFormTouched(true); setCapacityVariable(e.target.value); }}
                          className={`w-20 ${inputSmClass} text-center`}
                          placeholder="0"
                        />
                        <span className="text-[12px] text-gray-400">
                          conversaciones por agente conectado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Apertura de ficha */}
                  <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
                    <span
                      className="text-[13px] text-gray-500 mb-3 block"
                      style={{ fontWeight: 600 }}
                    >
                      Apertura de ficha
                    </span>

                    <div className="mb-4">
                      <FieldLabel text="Tipo" />
                      <div className="flex border border-gray-300">
                        <button
                          type="button"
                          onClick={() => { setFormTouched(true); setFichaType("window"); }}
                          className={`flex-1 px-3 py-2 text-[12px] cursor-pointer transition-colors ${
                            fichaType === "window"
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                          style={{ fontWeight: fichaType === "window" ? 500 : 400 }}
                        >
                          Nueva ventana
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFormTouched(true); setFichaType("embedded"); }}
                          className={`flex-1 px-3 py-2 text-[12px] cursor-pointer border-l border-gray-300 transition-colors ${
                            fichaType === "embedded"
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                          style={{ fontWeight: fichaType === "embedded" ? 500 : 400 }}
                        >
                          Embebida
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <FieldLabel text="URL" />
                      <input
                        type="url"
                        value={fichaUrl}
                        onChange={(e) => { setFormTouched(true); setFichaUrl(e.target.value); }}
                        className={inputClass}
                      />
                    </div>

                    {fichaType === "embedded" && (
                      <div className="mb-4">
                        <FieldLabel text="Alto" />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={fichaHeight}
                            onChange={(e) => { setFormTouched(true); setFichaHeight(e.target.value); }}
                            className={`w-24 ${inputSmClass} text-center`}
                          />
                          <span className="text-[12px] text-gray-400">px</span>
                        </div>
                      </div>
                    )}

                    <p className="text-[12px] text-gray-500 flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-gray-400 shrink-0" />
                      Si la URL no utiliza HTTPS, se abrirá en una nueva ventana
                    </p>
                  </div>

                  {/* Chat script (only when Chat channel active) */}
                  {channels.chat && (
                    <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
                      <button
                        onClick={() => setChatScriptOpen(!chatScriptOpen)}
                        className="flex items-center gap-2 text-gray-600 cursor-pointer w-full"
                      >
                        {chatScriptOpen ? (
                          <ChevronDown size={14} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={14} className="text-gray-400" />
                        )}
                        <span className="text-[13px]" style={{ fontWeight: 500 }}>
                          Script de chat
                        </span>
                      </button>

                      {chatScriptOpen && (
                        <div className="mt-3">
                          <pre className="text-[11px] bg-gray-50 border border-gray-200 p-2.5 overflow-x-auto whitespace-pre-wrap break-all" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
{`<script src="https://agentwebchat.jmeservicios.com/messages/javascriptFilesChat/jquery"></script>
<script type="text/javascript">var jMe = $.noConflict(true);</script>
<script src="https://agentwebchat.jmeservicios.com/messages/externalchat/[TOKEN]=="></script>`}
                          </pre>
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `<script src="https://agentwebchat.jmeservicios.com/messages/javascriptFilesChat/jquery"></script>\n<script type="text/javascript">var jMe = $.noConflict(true);</script>\n<script src="https://agentwebchat.jmeservicios.com/messages/externalchat/[TOKEN]=="></script>`
                                );
                                setScriptCopied(true);
                                setTimeout(() => setScriptCopied(false), 2000);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-[12px] text-gray-600 hover:bg-gray-100 cursor-pointer bg-white"
                            >
                              {scriptCopied ? (
                                <>
                                  <Check size={13} className="text-green-500" />
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <Copy size={13} />
                                  Copiar
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-2">
                            Pégalo en el &lt;head&gt; de tu web.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>
              )}
          </div>

          {/* ── Zona peligrosa (only in edit mode) ── */}
          {isEditing && editingGroup && (
            <div className="border border-red-200 bg-white mb-8">
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <span
                    className="text-[13px] text-red-500"
                    style={{ fontWeight: 600 }}
                  >
                    Eliminar grupo
                  </span>
                  <p className="text-[12px] text-gray-400 mt-1">
                    Esta acción no se puede deshacer. Los {assignedAgents.size} agentes asignados no serán eliminados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[13px] text-red-500 border border-red-300 hover:bg-red-50 cursor-pointer shrink-0"
                  style={{ fontWeight: 500 }}
                >
                  <Trash2 size={14} />
                  Eliminar grupo
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* ── Discard changes dialog ── */}
      {blocker.state === "blocked" && (
        <DiscardDialog
          onStay={() => blocker.reset?.()}
          onDiscard={() => blocker.proceed?.()}
        />
      )}

      {/* ── Delete from edit dialog (with copy-paste confirmation) ── */}
      {deleteDialogOpen && editingGroup && (
        <DeleteEntityDialog
          type="single"
          items={[{ id: editingGroup.id, name: editingGroup.name }]}
          entitySingular="grupo"
          entityPlural="grupos"
          singleDetailMessage={`Los ${assignedAgents.size} agentes asignados a este grupo no serán eliminados.`}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={() => {
            const groupName = editingGroup.name;
            setDeleteDialogOpen(false);
            setFormTouched(false);
            deleteGroup(editingGroup.id);
            toast.success(`Grupo «${groupName}» eliminado`);
            navigate("/");
          }}
        />
      )}
    </>
  );
}