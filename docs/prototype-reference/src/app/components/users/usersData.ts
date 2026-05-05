/* ═══════ Users data model (DD#297) ═══════ */

export type UserType = "administrator" | "supervisor" | "agent" | "viewer";

export const userTypeLabels: Record<UserType, string> = {
  administrator: "Administrador",
  supervisor: "Supervisor",
  agent: "Agente",
  viewer: "Visor",
};

export const userTypeOptions: UserType[] = [
  "administrator",
  "supervisor",
  "agent",
  "viewer",
];

/* ── Section access tree ── */
export interface UserSections {
  dashboard: boolean;
  services: boolean;
  aiNode: boolean;
  groupsAgentsTypifications: boolean;
  campaigns: boolean;
  conversations: boolean;
  stats: boolean;
  statsDataReports: boolean;
  statsFlowAnalyzer: boolean;
  vuiDesigner: boolean;
  users: boolean;
}

export const defaultSections: UserSections = {
  dashboard: true,
  services: true,
  aiNode: true,
  groupsAgentsTypifications: true,
  campaigns: true,
  conversations: true,
  stats: true,
  statsDataReports: true,
  statsFlowAnalyzer: true,
  vuiDesigner: true,
  users: true,
};

export const sectionLabels: { key: keyof UserSections; label: string; parent?: keyof UserSections }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "services", label: "Servicios" },
  { key: "aiNode", label: "Nodo IA" },
  { key: "groupsAgentsTypifications", label: "Grupos/Agentes/Tipificaciones" },
  { key: "campaigns", label: "Campanas" },
  { key: "conversations", label: "Conversaciones" },
  { key: "stats", label: "Estadisticas" },
  { key: "statsDataReports", label: "Informes de Datos", parent: "stats" },
  { key: "statsFlowAnalyzer", label: "Analizador de Flujo", parent: "stats" },
  { key: "vuiDesigner", label: "VUI Designer" },
  { key: "users", label: "Usuarios" },
];

/* ── Permissions ── */
export interface UserPermissions {
  vuiDesignerManagement: boolean;
  usersManagement: boolean;
  recordingManagement: boolean;
  transcriptionsManagement: boolean;
  spyOnConversations: boolean;
}

export const defaultPermissions: UserPermissions = {
  vuiDesignerManagement: true,
  usersManagement: true,
  recordingManagement: true,
  transcriptionsManagement: true,
  spyOnConversations: true,
};

export const permissionLabels: { key: keyof UserPermissions; label: string }[] = [
  { key: "vuiDesignerManagement", label: "Gestion VUI Designer" },
  { key: "usersManagement", label: "Gestion de usuarios" },
  { key: "recordingManagement", label: "Gestion de grabaciones" },
  { key: "transcriptionsManagement", label: "Gestion de transcripciones" },
  { key: "spyOnConversations", label: "Espiar conversaciones" },
];

/* ── Full User model ── */
export interface User {
  id: number;
  code: string;
  name: string;
  email: string;
  identifier: string;
  type: UserType;
  photo?: string;
  sections: UserSections;
  permissions: UserPermissions;
  assignedGroups: number[];   // IDs from groupsData
  assignedServices: string[]; // Service names
  status: "active" | "inactive";
  createdAt: string;
  /** Draft flag — set on duplicated entities (DD#294) */
  isDraft?: boolean;
}

/* ── Available services (VUI services assigned to user) ── */
export const availableServices: string[] = [
  "Atencion general",
  "Soporte tecnico",
  "Ventas",
  "Facturacion",
  "Incidencias",
  "Atencion premium",
  "Campanas outbound",
  "Help desk",
];

/* ── Seed data ── */
export const usersData: User[] = [
  {
    id: 1,
    code: "U001",
    name: "Mario Supervisor",
    email: "mario.supervisor@empresa.com",
    identifier: "MSUP001",
    type: "administrator",
    sections: { ...defaultSections },
    permissions: { ...defaultPermissions },
    assignedGroups: [1, 2, 3],
    assignedServices: ["Atencion general", "Soporte tecnico"],
    status: "active",
    createdAt: "2025-06-15",
  },
  {
    id: 2,
    code: "U002",
    name: "Laura Martinez",
    email: "laura.martinez@empresa.com",
    identifier: "LMAR002",
    type: "supervisor",
    sections: {
      ...defaultSections,
      vuiDesigner: false,
      users: false,
    },
    permissions: {
      ...defaultPermissions,
      vuiDesignerManagement: false,
      usersManagement: false,
    },
    assignedGroups: [1, 4],
    assignedServices: ["Atencion general", "Ventas"],
    status: "active",
    createdAt: "2025-07-20",
  },
  {
    id: 3,
    code: "U003",
    name: "Carlos Garcia",
    email: "carlos.garcia@empresa.com",
    identifier: "CGAR003",
    type: "supervisor",
    sections: {
      ...defaultSections,
      aiNode: false,
      vuiDesigner: false,
      users: false,
    },
    permissions: {
      vuiDesignerManagement: false,
      usersManagement: false,
      recordingManagement: true,
      transcriptionsManagement: false,
      spyOnConversations: true,
    },
    assignedGroups: [2, 3, 5],
    assignedServices: ["Soporte tecnico", "Incidencias"],
    status: "active",
    createdAt: "2025-08-10",
  },
  {
    id: 4,
    code: "U004",
    name: "Ana Lopez",
    email: "ana.lopez@empresa.com",
    identifier: "ALOP004",
    type: "viewer",
    sections: {
      ...defaultSections,
      aiNode: false,
      campaigns: false,
      vuiDesigner: false,
      users: false,
      groupsAgentsTypifications: false,
    },
    permissions: {
      vuiDesignerManagement: false,
      usersManagement: false,
      recordingManagement: false,
      transcriptionsManagement: false,
      spyOnConversations: false,
    },
    assignedGroups: [1],
    assignedServices: ["Atencion general"],
    status: "active",
    createdAt: "2025-09-05",
  },
  {
    id: 5,
    code: "U005",
    name: "Roberto Sanchez",
    email: "roberto.sanchez@empresa.com",
    identifier: "RSAN005",
    type: "administrator",
    sections: { ...defaultSections },
    permissions: { ...defaultPermissions },
    assignedGroups: [1, 2, 3, 4, 5],
    assignedServices: ["Atencion general", "Soporte tecnico", "Ventas", "Facturacion"],
    status: "inactive",
    createdAt: "2025-10-12",
  },
  {
    id: 6,
    code: "U006",
    name: "Elena Torres",
    email: "elena.torres@empresa.com",
    identifier: "ETOR006",
    type: "supervisor",
    sections: {
      ...defaultSections,
      vuiDesigner: false,
    },
    permissions: {
      ...defaultPermissions,
      vuiDesignerManagement: false,
    },
    assignedGroups: [3, 4],
    assignedServices: ["Campanas outbound", "Ventas"],
    status: "active",
    createdAt: "2025-11-01",
  },
];
