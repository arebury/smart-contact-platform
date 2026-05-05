import { createBrowserRouter } from "react-router";
import { AppLayout, AppLayoutError } from "./components/layout/AppLayout";
import { GroupsListPage } from "./components/groups/GroupsListPage";
import { CreateGroupPage } from "./components/groups/CreateGroupPage";
import { AgentsListPage } from "./components/agents/AgentsListPage";
import { CreateAgentPage } from "./components/agents/CreateAgentPage";
import { PlaceholderPage } from "./components/layout/PlaceholderPage";
import { LabelsPage } from "./components/labels/LabelsPage";
import { TemplatesPage } from "./components/templates/TemplatesPage";
import { UsersListPage } from "./components/users/UsersListPage";
import { CreateUserPage } from "./components/users/CreateUserPage";
import { RepositoriosHubPage } from "./components/repositories/RepositoriosHubPage";
import { AgendasPage } from "./components/repositories/agendas/AgendasPage";
import { HorariosPage } from "./components/repositories/horarios/HorariosPage";
import { TipificacionesPage } from "./components/repositories/tipificaciones/TipificacionesPage";
import { VariablesPage } from "./components/repositories/variables/VariablesPage";
import { EntidadesPage } from "./components/repositories/entidades/EntidadesPage";
import { IntencionesPage } from "./components/repositories/intenciones/IntencionesPage";
import { ReglasIAPage } from "./components/repositories/reglas-ia/ReglasIAPage";
import { EntidadesIAPage } from "./components/repositories/entidades-ia/EntidadesIAPage";
import { ClasificacionIAPage } from "./components/repositories/clasificacion-ia/ClasificacionIAPage";
import { AEDPage } from "./components/config/AEDPage";
import { SeguridadPage } from "./components/config/SeguridadPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    ErrorBoundary: AppLayoutError,
    children: [
      { index: true, Component: PlaceholderPage },
      { path: "admin/grupos", Component: GroupsListPage },
      { path: "admin/grupos/crear", Component: CreateGroupPage },
      { path: "admin/grupos/editar/:id", Component: CreateGroupPage },
      { path: "admin/agentes", Component: AgentsListPage },
      { path: "admin/agentes/crear", Component: CreateAgentPage },
      { path: "admin/agentes/editar/:id", Component: CreateAgentPage },
      { path: "dashboard", Component: PlaceholderPage },
      { path: "servicios", Component: PlaceholderPage },
      { path: "nodo-ia", Component: PlaceholderPage },
      { path: "campanas", Component: PlaceholderPage },
      { path: "conversaciones", Component: PlaceholderPage },
      { path: "informes", Component: PlaceholderPage },
      { path: "analizador", Component: PlaceholderPage },
      { path: "scc", Component: PlaceholderPage },
      { path: "vui-designer", Component: PlaceholderPage },
      { path: "admin/usuarios", Component: UsersListPage },
      { path: "admin/usuarios/crear", Component: CreateUserPage },
      { path: "admin/usuarios/editar/:id", Component: CreateUserPage },
      { path: "admin/repositorios", Component: RepositoriosHubPage },
      { path: "admin/agendas", Component: AgendasPage },
      { path: "admin/horarios", Component: HorariosPage },
      { path: "admin/plantillas", Component: TemplatesPage },
      { path: "admin/tipificaciones", Component: TipificacionesPage },
      { path: "admin/labels", Component: LabelsPage },
      { path: "admin/variables", Component: VariablesPage },
      { path: "admin/entidades", Component: EntidadesPage },
      { path: "admin/intenciones", Component: IntencionesPage },
      { path: "admin/reglas-ia", Component: ReglasIAPage },
      { path: "admin/entidades-ia", Component: EntidadesIAPage },
      { path: "admin/clasificacion-ia", Component: ClasificacionIAPage },
      { path: "config/seguridad", Component: SeguridadPage },
      { path: "config/personalizacion", Component: PlaceholderPage },
      { path: "config/aed", Component: AEDPage },
      { path: "config/integraciones", Component: PlaceholderPage },
      { path: "config/sistema", Component: PlaceholderPage },
      { path: "*", Component: PlaceholderPage },
    ],
  },
]);