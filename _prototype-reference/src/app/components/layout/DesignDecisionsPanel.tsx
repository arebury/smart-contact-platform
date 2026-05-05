import { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Check,
  Clock,
  Filter,
  Compass,
  Eye,
  MousePointerClick,
  FormInput,
  LayoutPanelTop,
  Crosshair,
  List,
  Database,
  PackageCheck,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  CalendarDays,
  Search,
  ChevronsUpDown,
  Hash,
  ArrowDownUp,
  Blocks,
  Palette,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  designDecisions as initialDecisions,
  LAST_UPDATED,
  type DesignDecision,
  type DecisionCategory,
  type DecisionStatus,
} from "./designDecisions";

/* ───── Category metadata ───── */
const categoryMeta: Record<
  DecisionCategory,
  { icon: LucideIcon; label: string }
> = {
  Navegación: { icon: Compass, label: "Navegación" },
  Visualización: { icon: Eye, label: "Visualización" },
  Interacción: { icon: MousePointerClick, label: "Interacción" },
  Formularios: { icon: FormInput, label: "Formularios" },
  Estructura: { icon: LayoutPanelTop, label: "Estructura" },
  Listas: { icon: List, label: "Listas" },
  Datos: { icon: Database, label: "Datos" },
  "Auditoría UX": { icon: Crosshair, label: "Auditoría UX" },
  "Patch UX": { icon: PackageCheck, label: "Patch UX" },
  Arquitectura: { icon: Blocks, label: "Arquitectura" },
  Limpieza: { icon: Trash2, label: "Limpieza" },
  UI: { icon: Palette, label: "UI" },
};

const allCategories: DecisionCategory[] = [
  "Navegación",
  "Visualización",
  "Interacción",
  "Formularios",
  "Estructura",
  "Listas",
  "Datos",
  "Auditoría UX",
  "Patch UX",
  "Arquitectura",
  "Limpieza",
  "UI",
];

/* ───── Helpers ───── */
function statusBadge(status: DecisionStatus) {
  if (status === "reviewed")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200" style={{ fontWeight: 500 }}>
        <Check size={9} />
        Revisada
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200" style={{ fontWeight: 500 }}>
      <Clock size={9} />
      Pendiente
    </span>
  );
}

/* ───── Single decision row ───── */
function DecisionRow({
  decision,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  highlight,
}: {
  decision: DesignDecision;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: () => void;
  highlight: string;
}) {
  const meta = categoryMeta[decision.category];
  const Icon = meta.icon;

  // highlight matching text
  const hl = (text: string) => {
    if (!highlight) return text;
    const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-yellow-900 px-0.5">{text.slice(idx, idx + highlight.length)}</mark>
        {text.slice(idx + highlight.length)}
      </>
    );
  };

  return (
    <div className={`border-b border-gray-200 ${isExpanded ? "bg-gray-50" : "hover:bg-gray-50/60"}`}>
      {/* Collapsed row — always visible */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer group"
      >
        {/* Expand chevron */}
        <span className="shrink-0 text-gray-300 group-hover:text-gray-500">
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>

        {/* ID */}
        <span className="shrink-0 text-[10px] text-gray-400 font-mono w-7 text-right">
          {decision.id}
        </span>

        {/* Category icon */}
        <Icon size={13} className="shrink-0 text-gray-400" />

        {/* Title */}
        <span className="flex-1 text-[12px] text-gray-700 truncate" style={{ fontWeight: 500 }}>
          {hl(decision.title)}
        </span>

        {/* Discovery indicator */}
        {decision.discovery && (
          <Lightbulb size={11} className="shrink-0 text-amber-400" />
        )}

        {/* Status */}
        {statusBadge(decision.status)}
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="pl-[72px] pr-4 pb-3.5">
          {/* Category + ID tags */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5" style={{ fontWeight: 500 }}>
              <Icon size={9} />
              {decision.category}
            </span>
            <span className="text-[10px] text-gray-300 font-mono">
              DD#{decision.id}
            </span>
            {decision.date && (
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-300 font-mono">
                <CalendarDays size={9} />
                {decision.date}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus();
              }}
              className="ml-auto text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer underline decoration-dotted"
            >
              {decision.status === "reviewed" ? "Marcar pendiente" : "Marcar revisada"}
            </button>
          </div>

          {/* Description */}
          <p className="text-[11.5px] text-gray-500 mb-0" style={{ lineHeight: "1.65" }}>
            {hl(decision.description)}
          </p>

          {/* Discovery */}
          {decision.discovery && (
            <div className="mt-2.5 border-l-2 border-amber-300 bg-amber-50/50 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb size={10} className="text-amber-500" />
                <span className="text-[10px] text-amber-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  Discovery
                </span>
              </div>
              <p className="text-[11px] text-amber-800/70" style={{ lineHeight: "1.6" }}>
                {hl(decision.discovery)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───── Category section ───── */
function CategorySection({
  category,
  decisions,
  expandedIds,
  onToggleExpand,
  onToggleStatus,
  highlight,
  defaultOpen,
}: {
  category: DecisionCategory;
  decisions: DesignDecision[];
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onToggleStatus: (id: number) => void;
  highlight: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = categoryMeta[category];
  const Icon = meta.icon;
  const reviewed = decisions.filter((d) => d.status === "reviewed").length;

  return (
    <div className="border-b border-gray-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-gray-50 cursor-pointer border-b border-gray-200"
      >
        <span className="text-gray-400">
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
        <Icon size={14} className="text-gray-500" />
        <span className="text-[12px] text-gray-700 flex-1 text-left" style={{ fontWeight: 600 }}>
          {category}
        </span>
        <span className="text-[10px] text-gray-400 font-mono">
          {reviewed}/{decisions.length}
        </span>
        {/* Progress micro-bar */}
        <div className="w-12 h-1 bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gray-500 transition-all"
            style={{ width: `${decisions.length > 0 ? (reviewed / decisions.length) * 100 : 0}%` }}
          />
        </div>
      </button>

      {open && (
        <div>
          {decisions.map((d) => (
            <DecisionRow
              key={d.id}
              decision={d}
              isExpanded={expandedIds.has(d.id)}
              onToggleExpand={() => onToggleExpand(d.id)}
              onToggleStatus={() => onToggleStatus(d.id)}
              highlight={highlight}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════ MAIN PANEL ═══════ */
interface DesignDecisionsPanelProps {
  onClose: () => void;
}

export function DesignDecisionsPanel({ onClose }: DesignDecisionsPanelProps) {
  const [decisions, setDecisions] = useState<DesignDecision[]>(initialDecisions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<DecisionStatus | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [chronoSort, setChronoSort] = useState(false); // newest-first within category
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Ctrl/Cmd+F focuses search
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleStatus = (id: number) => {
    setDecisions((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === "reviewed" ? "pending" : "reviewed" }
          : d
      )
    );
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filtered.map((d) => d.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return decisions.filter((d) => {
      if (filterStatus && d.status !== filterStatus) return false;
      if (q) {
        const haystack = `${d.title} ${d.description} ${d.discovery || ""} ${d.category} DD#${d.id}`.toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [decisions, searchQuery, filterStatus]);

  /* ── Stats ── */
  const totalCount = decisions.length;
  const reviewedCount = decisions.filter((d) => d.status === "reviewed").length;
  const pendingCount = decisions.filter((d) => d.status === "pending").length;
  const discoveryCount = decisions.filter((d) => d.discovery).length;

  /* ── Grouped decisions ── */
  const grouped = useMemo(() => {
    const map = new Map<DecisionCategory, DesignDecision[]>();
    for (const cat of allCategories) {
      let items = filtered.filter((d) => d.category === cat);
      if (chronoSort) {
        items = [...items].sort((a, b) => {
          // Sort by date desc, fallback to ID desc
          if (a.date && b.date) return b.date.localeCompare(a.date) || b.id - a.id;
          if (a.date) return -1; // dated items first
          if (b.date) return 1;
          return b.id - a.id;
        });
      }
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [filtered, chronoSort]);

  /* ── Flat sorted (newest first) ── */
  const flatSorted = useMemo(() => [...filtered].sort((a, b) => b.id - a.id), [filtered]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 left-[220px] h-full w-[520px] bg-white border-r border-gray-300 z-50 flex flex-col">
        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-300 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Hash size={15} className="text-gray-400" />
              <h2 className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>
                Decisiones de diseño
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[11px] mb-3">
            <span className="text-gray-500" style={{ fontWeight: 500 }}>
              {totalCount} total
            </span>
            <span className="w-px h-3 bg-gray-200" />
            <button
              onClick={() => setFilterStatus(filterStatus === "reviewed" ? null : "reviewed")}
              className={`inline-flex items-center gap-1 cursor-pointer ${
                filterStatus === "reviewed" ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Check size={11} />
              {reviewedCount} revisadas
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === "pending" ? null : "pending")}
              className={`inline-flex items-center gap-1 cursor-pointer ${
                filterStatus === "pending" ? "text-amber-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Clock size={11} />
              {pendingCount} pendientes
            </button>
            <span className="w-px h-3 bg-gray-200" />
            <span className="inline-flex items-center gap-1 text-gray-400">
              <Lightbulb size={11} />
              {discoveryCount} discovery
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 mb-3">
            <div
              className="h-full bg-gray-600 transition-all"
              style={{ width: `${totalCount > 0 ? (reviewedCount / totalCount) * 100 : 0}%` }}
            />
          </div>

          {/* Search + controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar por título, descripción, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 border border-gray-300 text-[12px] text-gray-600 focus:outline-none focus:border-gray-500 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Group toggle */}
            <button
              onClick={() => setGroupByCategory(!groupByCategory)}
              className={`p-1.5 border cursor-pointer ${
                groupByCategory
                  ? "border-gray-400 bg-gray-100 text-gray-600"
                  : "border-gray-300 text-gray-400 hover:text-gray-600"
              }`}
              title={groupByCategory ? "Vista plana" : "Agrupar por categoría"}
            >
              <Filter size={13} />
            </button>

            {/* Chrono sort toggle (within category) */}
            {groupByCategory && (
              <button
                onClick={() => setChronoSort(!chronoSort)}
                className={`p-1.5 border cursor-pointer ${
                  chronoSort
                    ? "border-gray-400 bg-gray-100 text-gray-600"
                    : "border-gray-300 text-gray-400 hover:text-gray-600"
                }`}
                title={chronoSort ? "Orden por ID" : "Orden cronológico (recientes primero)"}
              >
                <ArrowDownUp size={13} />
              </button>
            )}

            {/* Expand/collapse all */}
            <button
              onClick={expandedIds.size > 0 ? collapseAll : expandAll}
              className="p-1.5 border border-gray-300 text-gray-400 hover:text-gray-600 cursor-pointer"
              title={expandedIds.size > 0 ? "Colapsar todo" : "Expandir todo"}
            >
              <ChevronsUpDown size={13} />
            </button>
          </div>

          {/* Active filter + last update */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {filterStatus && (
                <button
                  onClick={() => setFilterStatus(null)}
                  className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer border border-gray-200 px-2 py-0.5"
                >
                  <X size={9} />
                  {filterStatus === "reviewed" ? "Revisadas" : "Pendientes"}
                </button>
              )}
              {searchQuery && (
                <span className="text-[10px] text-gray-400">
                  {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays size={10} className="text-gray-300" />
              <span className="text-[10px] text-gray-400">{LAST_UPDATED}</span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto bg-white">
          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Search size={20} className="text-gray-200 mx-auto mb-3" />
              <div className="text-[12px] text-gray-500" style={{ fontWeight: 500 }}>
                Sin resultados
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                {searchQuery
                  ? `No hay decisiones que coincidan con "${searchQuery}"`
                  : "Prueba a cambiar los filtros"}
              </div>
              {(searchQuery || filterStatus) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus(null);
                  }}
                  className="mt-3 px-3 py-1.5 text-[11px] text-gray-500 border border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : groupByCategory ? (
            /* ── Grouped view ── */
            Array.from(grouped.entries()).map(([cat, items]) => (
              <CategorySection
                key={cat}
                category={cat}
                decisions={items}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                onToggleStatus={toggleStatus}
                highlight={searchQuery}
                defaultOpen={!!searchQuery || grouped.size <= 3}
              />
            ))
          ) : (
            /* ── Flat view ── */
            <div>
              {flatSorted.map((d) => (
                <DecisionRow
                  key={d.id}
                  decision={d}
                  isExpanded={expandedIds.has(d.id)}
                  onToggleExpand={() => toggleExpand(d.id)}
                  onToggleStatus={() => toggleStatus(d.id)}
                  highlight={searchQuery}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-2.5 border-t border-gray-300 bg-gray-50 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {filtered.length} de {totalCount} · {groupByCategory ? (chronoSort ? "agrupado · cronológico" : "agrupado · por ID") : "cronológico"}
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <Check size={10} />
              {reviewedCount}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-500">
              <Clock size={10} />
              {pendingCount}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}