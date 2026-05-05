import { useNavigate } from "react-router";
import { TopBar } from "../layout/TopBar";
import {
  Phone,
  Clock,
  FileStack,
  Tags,
  Tag,
  Variable,
  Box,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";

/* ── Category definitions ── */
interface RepoItem {
  label: string;
  description: string;
  icon: ReactNode;
  path: string;
  ready: boolean; // false = "próximamente"
}

interface RepoCategory {
  title: string;
  items: RepoItem[];
}

const categories: RepoCategory[] = [
  {
    title: "Comunicación",
    items: [
      {
        label: "Agendas",
        description: "Colecciones de números telefónicos para enrutamiento de llamadas",
        icon: <Phone size={20} />,
        path: "/admin/agendas",
        ready: true,
      },
      {
        label: "Horarios",
        description: "Franjas horarias y turnos operativos del contact center",
        icon: <Clock size={20} />,
        path: "/admin/horarios",
        ready: true,
      },
      {
        label: "Plantillas",
        description: "Mensajes predefinidos para respuestas rápidas y campañas",
        icon: <FileStack size={20} />,
        path: "/admin/plantillas",
        ready: true,
      },
      {
        label: "Tipificaciones",
        description: "Categorías de cierre para clasificar conversaciones",
        icon: <Tags size={20} />,
        path: "/admin/tipificaciones",
        ready: true,
      },
    ],
  },
  {
    title: "Clasificación",
    items: [
      {
        label: "Labels",
        description: "Etiquetas de color para organizar y filtrar entidades",
        icon: <Tag size={20} />,
        path: "/admin/labels",
        ready: true,
      },
      {
        label: "Variables",
        description: "Variables dinámicas para personalizar mensajes y flujos",
        icon: <Variable size={20} />,
        path: "/admin/variables",
        ready: true,
      },
    ],
  },
  {
    title: "Diseñador Conversacional",
    items: [
      {
        label: "Entidades",
        description: "Datos estructurados que el sistema extrae de las conversaciones",
        icon: <Box size={20} />,
        path: "/admin/entidades",
        ready: true,
      },
      {
        label: "Intenciones",
        description: "Propósitos del usuario detectados en el lenguaje natural",
        icon: <MessageSquare size={20} />,
        path: "/admin/intenciones",
        ready: true,
      },
    ],
  },
  {
    title: "IA",
    items: [
      {
        label: "Reglas IA",
        description: "Reglas de negocio aplicadas al motor de inteligencia artificial",
        icon: <Sparkles size={20} />,
        path: "/admin/reglas-ia",
        ready: true,
      },
      {
        label: "Entidades IA",
        description: "Entidades semánticas gestionadas por modelos de lenguaje",
        icon: <Box size={20} />,
        path: "/admin/entidades-ia",
        ready: true,
      },
      {
        label: "Clasificación IA",
        description: "Modelos de clasificación automática de conversaciones",
        icon: <Tags size={20} />,
        path: "/admin/clasificacion-ia",
        ready: true,
      },
    ],
  },
];

/* ═══════ HUB PAGE ═══════ */
export function RepositoriosHubPage() {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Administración", path: "/admin/usuarios" },
    { label: "Repositorios" },
  ];

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8 max-w-[960px]">

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-[20px] text-gray-800"
              style={{ fontWeight: 600 }}
            >
              Repositorios
            </h1>
          </div>

          {/* Categories */}
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat.title}>
                {/* Category title */}
                <div className="mb-3">
                  <span
                    className="text-[11px] text-gray-400 uppercase tracking-[0.12em]"
                    style={{ fontWeight: 600 }}
                  >
                    {cat.title}
                  </span>
                </div>

                {/* Items grid */}
                <div className="border border-gray-200 divide-y divide-gray-200">
                  {cat.items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => item.ready && navigate(item.path)}
                      disabled={!item.ready}
                      className={`group w-full text-left bg-white px-4 py-3.5 flex items-center gap-3.5 transition-colors duration-150 ${
                        item.ready
                          ? "hover:bg-gray-50/70 cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-md border ${
                          item.ready
                            ? "border-gray-200 text-gray-500 bg-white group-hover:border-gray-300 group-hover:text-gray-600"
                            : "border-gray-100 text-gray-300 bg-gray-50/50"
                        }`}
                      >
                        {item.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-[13px] ${
                            item.ready ? "text-gray-700" : "text-gray-400"
                          }`}
                          style={{ fontWeight: 500 }}
                        >
                          {item.label}
                        </span>
                        <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                          item.ready ? "text-gray-400" : "text-gray-300"
                        }`}>
                          {item.description}
                        </p>
                      </div>

                      {/* Right side */}
                      {!item.ready ? (
                        <span
                          className="shrink-0 text-[10px] text-gray-300 uppercase tracking-wider"
                          style={{ fontWeight: 500 }}
                        >
                          Próximamente
                        </span>
                      ) : (
                        <ChevronRight
                          size={15}
                          className="shrink-0 text-gray-300 group-hover:text-gray-400 transition-colors"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}