import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Headphones,
  BrainCircuit,
  Megaphone,
  MessageSquare,
  BarChart3,
  FileText,
  Activity,
  Radio,
  Users,
  UsersRound,
  UserCog,
  FolderOpen,
  Shield,
  Paintbrush,
  Database,
  Plug,
  Settings,
  BookOpen,
  Workflow,
} from "lucide-react";
import { DesignDecisionsPanel } from "./DesignDecisionsPanel";

interface NavItem {
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: NavItem[];
  defaultExpanded?: boolean;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "HERRAMIENTAS",
    items: [
      {
        label: "Supervisión",
        icon: <Headphones size={16} />,
        children: [
          { label: "Dashboard", icon: <LayoutDashboard size={14} />, path: "/dashboard" },
          { label: "Servicios", icon: <Radio size={14} />, path: "/servicios" },
          { label: "Nodo IA", icon: <BrainCircuit size={14} />, path: "/nodo-ia" },
          { label: "Campañas", icon: <Megaphone size={14} />, path: "/campanas" },
          { label: "Conversaciones", icon: <MessageSquare size={14} />, path: "/conversaciones" },
          {
            label: "Estadísticas",
            icon: <BarChart3 size={14} />,
            children: [
              { label: "Informes de Datos", icon: <FileText size={13} />, path: "/informes" },
              { label: "Analizador de Flujo", icon: <Activity size={13} />, path: "/analizador" },
            ],
          },
          { label: "SCC", icon: <Radio size={14} />, path: "/scc" },
        ],
      },
      {
        label: "VUI Designer",
        icon: <Workflow size={16} />,
        path: "/vui-designer",
      },
    ],
  },
  {
    title: "AJUSTES",
    items: [
      {
        label: "Administración",
        icon: <Users size={16} />,
        defaultExpanded: true,
        children: [
          { label: "Usuarios", icon: <UserCog size={14} />, path: "/admin/usuarios" },
          { label: "Grupos", icon: <UsersRound size={14} />, path: "/admin/grupos" },
          { label: "Agentes", icon: <Headphones size={14} />, path: "/admin/agentes" },
          {
            label: "Repositorios",
            icon: <FolderOpen size={14} />,
            path: "/admin/repositorios",
          },
        ],
      },
      {
        label: "Configuración",
        icon: <Settings size={16} />,
        children: [
          { label: "Seguridad", icon: <Shield size={14} />, path: "/config/seguridad" },
          { label: "Personalización", icon: <Paintbrush size={14} />, path: "/config/personalizacion" },
          { label: "AED", icon: <Database size={14} />, path: "/config/aed" },
          { label: "Integraciones", icon: <Plug size={14} />, path: "/config/integraciones" },
          { label: "Sistema", icon: <Settings size={14} />, path: "/config/sistema" },
        ],
      },
    ],
  },
];

function NavItemComponent({
  item,
  depth = 0,
  currentPath,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(item.defaultExpanded || false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === currentPath || (item.path === "/" && currentPath === "/");

  /* Recursive child-active check (DD#302: supports 4+ nesting levels) */
  const checkChildActive = (children: NavItem[]): boolean =>
    children.some((child) => {
      if (child.path === currentPath) return true;
      if (child.children) return checkChildActive(child.children);
      return false;
    });

  const isChildActive = hasChildren && checkChildActive(item.children!);

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else if (item.path) {
      onNavigate(item.path);
    }
  };

  const paddingLeft = depth === 0 ? "pl-3" : depth === 1 ? "pl-8" : depth === 2 ? "pl-12" : "pl-14";
  const fontSize = depth >= 3 ? "text-[12px]" : "text-[13px]";

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-2 pr-3 py-[6px] ${fontSize} cursor-pointer border-l-2 ${paddingLeft}
          ${isActive
            ? "bg-white/15 text-white border-white"
            : isChildActive
              ? "text-white/90 border-transparent"
              : "text-white/60 hover:text-white/90 hover:bg-white/5 border-transparent"
          }`}
        style={isActive ? { fontWeight: 500 } : {}}
      >
        {item.icon && (
          <span className={`shrink-0 ${isActive ? "text-white" : "text-white/50"}`}>
            {item.icon}
          </span>
        )}
        <span className="flex-1 text-left truncate">{item.label}</span>
        {hasChildren && (
          <span className="shrink-0 text-white/30">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
      </button>
      {hasChildren && expanded && (
        <div>
          {item.children!.map((child) => (
            <NavItemComponent
              key={child.label}
              item={child}
              depth={depth + 1}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [decisionsOpen, setDecisionsOpen] = useState(false);

  /* Normalize current path for active-state matching (strip /crear, /editar/:id suffixes) */
  const rawPath = location.pathname;
  const stripped = rawPath.replace(/\/(crear|editar\/\d+)$/, "");

  /* DD#302: repo sub-paths map to /admin/repositorios for sidebar active state */
  const repoSubPaths = [
    "/admin/agendas", "/admin/horarios", "/admin/plantillas", "/admin/tipificaciones",
    "/admin/labels", "/admin/variables", "/admin/entidades",
    "/admin/intenciones", "/admin/reglas-ia", "/admin/entidades-ia",
    "/admin/clasificacion-ia",
  ];
  const currentPath = repoSubPaths.some((p) => stripped === p || stripped.startsWith(p + "/"))
    ? "/admin/repositorios"
    : stripped;

  return (
    <>
      <aside className="w-[var(--sidebar-w,220px)] min-w-[var(--sidebar-w,220px)] h-screen flex flex-col overflow-hidden bg-gray-800">
        {/* Logo */}
        <div className="px-4 pt-4 pb-3 border-b border-white/10">
          <div className="text-white text-[16px] tracking-tight" style={{ fontWeight: 600 }}>
            SmartContact
          </div>
          <div className="text-white/40 text-[10px] tracking-wider mt-0.5">
            a Digital Virgo tool
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-3">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-4 py-1 text-[10px] tracking-[0.15em] text-white/30 uppercase" style={{ fontWeight: 600 }}>
                {section.title}
              </div>
              <div className="mt-0.5">
                {section.items.map((item) => (
                  <NavItemComponent
                    key={item.label}
                    item={item}
                    currentPath={currentPath}
                    onNavigate={(path) => navigate(path)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom — Design Decisions (visible en todos los entornos; para ocultar en prod, envolver con import.meta.env.DEV) */}
        <div className="px-2 py-2 border-t border-white/10">
          <button
            onClick={() => setDecisionsOpen(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 text-[12px] cursor-pointer"
            title="Decisiones de diseño"
          >
            <BookOpen size={15} />
            <span>Decisiones de diseño</span>
          </button>
        </div>
      </aside>

      {/* Decisions panel */}
      {decisionsOpen && (
        <DesignDecisionsPanel onClose={() => setDecisionsOpen(false)} />
      )}
    </>
  );
}