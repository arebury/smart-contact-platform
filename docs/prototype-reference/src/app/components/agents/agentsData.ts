export type PresenceStatus = "disponible" | "no_disponible" | "bano" | "comida" | "formacion";

export const presenceLabels: Record<PresenceStatus, string> = {
  disponible: "Disponible",
  no_disponible: "No disponible",
  bano: "Baño",
  comida: "Comida",
  formacion: "Formación",
};

export interface AgentGroup {
  id: number;
  name: string;
  active: boolean;
}

export interface AgentPermissions {
  manageDevices: boolean;
  selfActivate: boolean;
  externalDevices: boolean;
  /* Master toggles */
  callsEnabled: boolean;
  transfersEnabled: boolean;
  /* Tipos de destino por categoría (matriz) */
  callsDestFixed: boolean;
  callsDestMobile: boolean;
  callsDestInternational: boolean;
  callsDestSpecial: boolean;
  transfersDestFixed: boolean;
  transfersDestMobile: boolean;
  transfersDestInternational: boolean;
  transfersDestSpecial: boolean;
  /* Grabación */
  recording: boolean;
}

export interface Agent {
  id: number;
  code: string;
  name: string;
  extension: string;
  extensionType: "phone" | "webrtc";
  agentType: "normal" | "cuscare" | "cuscare_carrier" | "admin_cuscare";
  channels: ("phone" | "chat" | "email")[];
  status: "active" | "inactive";
  presenceStatus?: PresenceStatus;
  phone?: string;
  email?: string;
  pin?: string;
  groups: AgentGroup[];
  defaultOutboundGroup?: string;
  iframeUrl?: string;
  permissions: AgentPermissions;
  languages?: string[];
  randomOrder?: boolean;
  pickupType?: "auto" | "manual";
  photo?: string;
  maxChats?: number;
  labels?: number[];
  schedules?: number[];
  /** Draft flag — set on duplicated entities until user saves from edit form (DD#294) */
  isDraft?: boolean;
}

export const defaultPermissions: AgentPermissions = {
  manageDevices: false,
  selfActivate: false,
  externalDevices: false,
  callsEnabled: true,
  transfersEnabled: true,
  callsDestFixed: true,
  callsDestMobile: true,
  callsDestInternational: false,
  callsDestSpecial: false,
  transfersDestFixed: true,
  transfersDestMobile: true,
  transfersDestInternational: false,
  transfersDestSpecial: false,
  recording: false,
};

/* Available extensions (pre-registered by the supervisor) */
export const availableExtensions = [
  { number: "100", type: "webrtc" as const },
  { number: "101", type: "webrtc" as const },
  { number: "102", type: "webrtc" as const },
  { number: "103", type: "phone" as const },
  { number: "104", type: "webrtc" as const },
  { number: "105", type: "webrtc" as const },
  { number: "106", type: "webrtc" as const },
  { number: "108", type: "webrtc" as const },
  { number: "110", type: "webrtc" as const },
  { number: "112", type: "webrtc" as const },
  { number: "113", type: "webrtc" as const },
  { number: "114", type: "webrtc" as const },
  { number: "116", type: "webrtc" as const },
  { number: "118", type: "webrtc" as const },
  { number: "120", type: "webrtc" as const },
  { number: "122", type: "webrtc" as const },
  { number: "123", type: "webrtc" as const },
  { number: "124", type: "webrtc" as const },
  { number: "126", type: "phone" as const },
  { number: "128", type: "webrtc" as const },
  { number: "130", type: "phone" as const },
  { number: "132", type: "webrtc" as const },
  { number: "134", type: "webrtc" as const },
  { number: "136", type: "webrtc" as const },
  { number: "138", type: "webrtc" as const },
  { number: "140", type: "webrtc" as const },
];

/* Templates now live in /src/app/components/templates/templatesData.ts and are managed via useTemplatesStore */

/* Available schedules (from Repositorios — under construction) */
export const availableSchedules = [
  { id: 1, name: "Agenda principal (900 100 200)" },
  { id: 2, name: "Agenda ventas (900 100 300)" },
  { id: 3, name: "Agenda soporte técnico (900 100 400)" },
  { id: 4, name: "Agenda cobros (900 100 500)" },
  { id: 5, name: "Agenda emergencias (900 100 600)" },
  { id: 6, name: "Agenda internacional (+1 800 555 1234)" },
];

/* All available groups (mirrors groupsData for cross-reference) */
export const availableGroups = [
  { id: 1, name: "ACD Demo C2CB", agentCount: 11 },
  { id: 2, name: "ACD demo cuscare", agentCount: 11 },
  { id: 3, name: "ACD outbound", agentCount: 12 },
  { id: 4, name: "Campaigns", agentCount: 11 },
  { id: 5, name: "Exclusivo", agentCount: 12 },
  { id: 6, name: "Grupo de prueba 1", agentCount: 4 },
  { id: 7, name: "Grupo de prueba 2", agentCount: 4 },
  { id: 8, name: "Grupo demo", agentCount: 9 },
  { id: 9, name: "Grupo pedidos", agentCount: 12 },
  { id: 10, name: "Nodo AED 1", agentCount: 10 },
  { id: 11, name: "Online Support", agentCount: 13 },
  { id: 12, name: "Reclamaciones", agentCount: 15 },
  { id: 13, name: "Soporte Taller", agentCount: 13 },
  { id: 14, name: "Telemarketing", agentCount: 11 },
];

export const agentsData: Agent[] = [
  {
    id: 1,
    code: "10001",
    name: "Agente AED 1",
    extension: "122",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone"],
    status: "active",
    presenceStatus: "disponible",
    pin: "392",
    groups: [
      { id: 1, name: "ACD Demo C2CB", active: true },
      { id: 3, name: "ACD outbound", active: true },
    ],
    permissions: { ...defaultPermissions },
    pickupType: "auto",
  },
  {
    id: 2,
    code: "10002",
    name: "Agente AED 2",
    extension: "123",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone"],
    status: "active",
    presenceStatus: "disponible",
    pin: "507",
    groups: [
      { id: 1, name: "ACD Demo C2CB", active: true },
      { id: 4, name: "Campaigns", active: true },
      { id: 8, name: "Grupo demo", active: true },
      { id: 12, name: "Reclamaciones", active: true },
    ],
    permissions: { ...defaultPermissions },
    pickupType: "auto",
    schedules: [1],
  },
  {
    id: 3,
    code: "10003",
    name: "Agente demo",
    extension: "124",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone", "chat"],
    status: "active",
    presenceStatus: "comida",
    pin: "135",
    iframeUrl: "https://crm.example.com/agent-panel",
    groups: [
      { id: 1, name: "ACD Demo C2CB", active: true },
      { id: 4, name: "Campaigns", active: true },
      { id: 8, name: "Grupo demo", active: true },
    ],
    permissions: { ...defaultPermissions, manageDevices: true, recording: true },
    pickupType: "auto",
    schedules: [1, 3],
  },
  {
    id: 4,
    code: "10004",
    name: "Agente Jose",
    extension: "114",
    extensionType: "webrtc",
    agentType: "cuscare_carrier",
    channels: ["phone", "chat"],
    status: "active",
    presenceStatus: "disponible",
    pin: "638",
    groups: [
      { id: 1, name: "ACD Demo C2CB", active: true },
      { id: 4, name: "Campaigns", active: true },
      { id: 8, name: "Grupo demo", active: true },
      { id: 12, name: "Reclamaciones", active: true },
    ],
    permissions: { ...defaultPermissions },
    pickupType: "auto",
    schedules: [1],
  },
  {
    id: 5,
    code: "10005",
    name: "Agente Jose",
    extension: "103",
    extensionType: "phone",
    agentType: "normal",
    channels: ["phone"],
    status: "active",
    presenceStatus: "bano",
    pin: "990",
    groups: [
      { id: 3, name: "ACD outbound", active: true },
      { id: 9, name: "Grupo pedidos", active: true },
    ],
    permissions: { ...defaultPermissions },
    pickupType: "manual",
    schedules: [4],
  },
  {
    id: 6,
    code: "10006",
    name: "Jose Barcala",
    extension: "120",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone"],
    status: "inactive",
    presenceStatus: "no_disponible",
    phone: "612345678",
    email: "jbarcala@company.com",
    pin: "614",
    groups: [{ id: 4, name: "Campaigns", active: false }],
    permissions: { ...defaultPermissions },
    pickupType: "auto",
  },
  {
    id: 7,
    code: "10007",
    name: "Mario Perez",
    extension: "118",
    extensionType: "webrtc",
    agentType: "admin_cuscare",
    channels: ["phone", "chat", "email"],
    status: "active",
    presenceStatus: "disponible",
    phone: "698765432",
    email: "mperez@company.com",
    iframeUrl: "https://crm.example.com/mario",
    pin: "246",
    groups: [
      { id: 1, name: "ACD Demo C2CB", active: true },
      { id: 4, name: "Campaigns", active: true },
      { id: 11, name: "Online Support", active: true },
      { id: 12, name: "Reclamaciones", active: true },
    ],
    defaultOutboundGroup: "ACD Demo C2CB",
    permissions: { ...defaultPermissions, selfActivate: true, manageDevices: true, recording: true },
    languages: ["Español", "Inglés"],
    pickupType: "auto",
    schedules: [1, 2],
  },
  {
    id: 8,
    code: "10008",
    name: "Marta Recio",
    extension: "106",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone", "chat"],
    status: "active",
    presenceStatus: "formacion",
    email: "mrecio@company.com",
    pin: "835",
    groups: [
      { id: 1, name: "ACD Demo C2CB", active: true },
      { id: 3, name: "ACD outbound", active: true },
      { id: 11, name: "Online Support", active: true },
    ],
    permissions: { ...defaultPermissions, recording: true },
    pickupType: "auto",
    schedules: [2],
  },
  {
    id: 9,
    code: "10009",
    name: "Miguel Palacios",
    extension: "102",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone"],
    status: "inactive",
    presenceStatus: "no_disponible",
    pin: "773",
    groups: [
      { id: 3, name: "ACD outbound", active: false },
      { id: 8, name: "Grupo demo", active: false },
    ],
    permissions: { ...defaultPermissions },
    pickupType: "auto",
  },
  {
    id: 10,
    code: "10010",
    name: "Miguel Palacios 2",
    extension: "104",
    extensionType: "webrtc",
    agentType: "cuscare_carrier",
    channels: ["phone", "chat"],
    status: "active",
    presenceStatus: "disponible",
    pin: "482",
    groups: [
      { id: 5, name: "Exclusivo", active: true },
      { id: 9, name: "Grupo pedidos", active: true },
      { id: 13, name: "Soporte Taller", active: true },
    ],
    permissions: { ...defaultPermissions, recording: true },
    pickupType: "auto",
  },
  {
    id: 11,
    code: "10011",
    name: "Miguel Palacios 3",
    extension: "108",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone"],
    status: "active",
    presenceStatus: "disponible",
    pin: "419",
    groups: [{ id: 5, name: "Exclusivo", active: true }],
    permissions: { ...defaultPermissions },
    pickupType: "auto",
    schedules: [1, 3],
  },
  {
    id: 12,
    code: "10012",
    name: "Oscar Bello",
    extension: "105",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone"],
    status: "active",
    presenceStatus: "comida",
    pin: "551",
    groups: [
      { id: 1, name: "ACD Demo C2CB", active: true },
      { id: 6, name: "Grupo de prueba 1", active: true },
    ],
    permissions: { ...defaultPermissions },
    pickupType: "auto",
  },
  {
    id: 13,
    code: "10013",
    name: "Oscar Fernandez",
    extension: "116",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone", "chat"],
    status: "active",
    presenceStatus: "disponible",
    pin: "284",
    groups: [
      { id: 1, name: "ACD Demo C2CB", active: true },
      { id: 3, name: "ACD outbound", active: true },
      { id: 11, name: "Online Support", active: true },
    ],
    permissions: { ...defaultPermissions, externalDevices: true, recording: true },
    pickupType: "auto",
    schedules: [1, 3],
  },
  {
    id: 14,
    code: "10014",
    name: "Oscar Quobis",
    extension: "110",
    extensionType: "webrtc",
    agentType: "cuscare",
    channels: ["phone"],
    status: "active",
    presenceStatus: "disponible",
    pin: "706",
    groups: [
      { id: 5, name: "Exclusivo", active: true },
      { id: 8, name: "Grupo demo", active: true },
    ],
    permissions: { ...defaultPermissions },
    pickupType: "auto",
  },
  {
    id: 15,
    code: "10015",
    name: "Rafael",
    extension: "113",
    extensionType: "webrtc",
    agentType: "admin_cuscare",
    channels: ["phone", "chat"],
    status: "active",
    presenceStatus: "disponible",
    pin: "139",
    groups: [
      { id: 3, name: "ACD outbound", active: true },
      { id: 10, name: "Nodo AED 1", active: true },
      { id: 13, name: "Soporte Taller", active: true },
    ],
    permissions: { ...defaultPermissions, recording: true },
    pickupType: "auto",
    schedules: [4, 5],
  },
  {
    id: 16,
    code: "10016",
    name: "Angel personal",
    extension: "109",
    extensionType: "phone",
    agentType: "normal",
    channels: ["phone"],
    status: "inactive",
    presenceStatus: "no_disponible",
    pin: "672",
    groups: [{ id: 7, name: "Grupo de prueba 2", active: false }],
    permissions: { ...defaultPermissions },
    pickupType: "manual",
  },
];