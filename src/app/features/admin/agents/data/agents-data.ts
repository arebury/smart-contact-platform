export type PresenceStatus = 'disponible' | 'no_disponible' | 'bano' | 'comida' | 'formacion';

export const PRESENCE_LABEL_KEYS: Readonly<Record<PresenceStatus, string>> = {
  disponible: 'agents.presence.available',
  no_disponible: 'agents.presence.unavailable',
  bano: 'agents.presence.bathroom',
  comida: 'agents.presence.lunch',
  formacion: 'agents.presence.training',
};

export type AgentChannel = 'phone' | 'chat' | 'email';
export const AGENT_CHANNELS: readonly AgentChannel[] = ['phone', 'chat', 'email'];

export type AgentType = 'normal' | 'cuscare' | 'cuscare_carrier' | 'admin_cuscare';
export const AGENT_TYPES: readonly AgentType[] = [
  'normal',
  'cuscare',
  'cuscare_carrier',
  'admin_cuscare',
];
export const AGENT_TYPE_LABEL_KEYS: Readonly<Record<AgentType, string>> = {
  normal: 'agents.type.normal',
  cuscare: 'agents.type.cuscare',
  cuscare_carrier: 'agents.type.cuscare_carrier',
  admin_cuscare: 'agents.type.admin_cuscare',
};

export type ExtensionType = 'phone' | 'webrtc';
export type PickupType = 'auto' | 'manual';

export interface AgentGroupRef {
  readonly id: number;
  readonly name: string;
  readonly active: boolean;
}

export interface AgentPermissions {
  readonly manageDevices: boolean;
  readonly selfActivate: boolean;
  readonly externalDevices: boolean;
  readonly callsEnabled: boolean;
  readonly transfersEnabled: boolean;
  readonly callsDestFixed: boolean;
  readonly callsDestMobile: boolean;
  readonly callsDestInternational: boolean;
  readonly callsDestSpecial: boolean;
  readonly transfersDestFixed: boolean;
  readonly transfersDestMobile: boolean;
  readonly transfersDestInternational: boolean;
  readonly transfersDestSpecial: boolean;
  readonly recording: boolean;
}

export const DEFAULT_AGENT_PERMISSIONS: AgentPermissions = {
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

export interface PermissionGroupDef {
  readonly key: keyof AgentPermissions;
  readonly labelKey: string;
}

export const DEVICE_PERMISSIONS: readonly PermissionGroupDef[] = [
  { key: 'manageDevices', labelKey: 'agents.permission.manage_devices' },
  { key: 'selfActivate', labelKey: 'agents.permission.self_activate' },
  { key: 'externalDevices', labelKey: 'agents.permission.external_devices' },
  { key: 'recording', labelKey: 'agents.permission.recording' },
];

export const CALL_PERMISSIONS: readonly PermissionGroupDef[] = [
  { key: 'callsEnabled', labelKey: 'agents.permission.calls_enabled' },
  { key: 'callsDestFixed', labelKey: 'agents.permission.calls_dest_fixed' },
  { key: 'callsDestMobile', labelKey: 'agents.permission.calls_dest_mobile' },
  { key: 'callsDestInternational', labelKey: 'agents.permission.calls_dest_international' },
  { key: 'callsDestSpecial', labelKey: 'agents.permission.calls_dest_special' },
];

export const TRANSFER_PERMISSIONS: readonly PermissionGroupDef[] = [
  { key: 'transfersEnabled', labelKey: 'agents.permission.transfers_enabled' },
  { key: 'transfersDestFixed', labelKey: 'agents.permission.transfers_dest_fixed' },
  { key: 'transfersDestMobile', labelKey: 'agents.permission.transfers_dest_mobile' },
  { key: 'transfersDestInternational', labelKey: 'agents.permission.transfers_dest_international' },
  { key: 'transfersDestSpecial', labelKey: 'agents.permission.transfers_dest_special' },
];

/**
 * Full Agent shape. Backward-compatible with the slim stub the Labels and
 * Seguridad features adopted earlier (they only consume id / name / code /
 * extension / email / status / labels).
 */
export interface Agent {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly extension: string;
  readonly extensionType: ExtensionType;
  readonly agentType: AgentType;
  readonly channels: readonly AgentChannel[];
  readonly status: 'active' | 'inactive';
  readonly presenceStatus?: PresenceStatus;
  readonly phone?: string;
  readonly email?: string;
  readonly pin?: string;
  readonly groups: readonly AgentGroupRef[];
  readonly defaultOutboundGroup?: string;
  readonly iframeUrl?: string;
  readonly permissions: AgentPermissions;
  readonly languages?: readonly string[];
  readonly randomOrder?: boolean;
  readonly pickupType?: PickupType;
  readonly photo?: string;
  readonly maxChats?: number;
  readonly labels?: readonly number[];
  readonly schedules?: readonly number[];
  /** Draft flag — set on duplicated entities until the user saves (DD#294). */
  readonly isDraft?: boolean;
}

export interface ExtensionOption {
  readonly number: string;
  readonly type: ExtensionType;
}

export const AVAILABLE_EXTENSIONS: readonly ExtensionOption[] = [
  { number: '100', type: 'webrtc' },
  { number: '101', type: 'webrtc' },
  { number: '102', type: 'webrtc' },
  { number: '103', type: 'phone' },
  { number: '104', type: 'webrtc' },
  { number: '105', type: 'webrtc' },
  { number: '106', type: 'webrtc' },
  { number: '108', type: 'webrtc' },
  { number: '110', type: 'webrtc' },
  { number: '112', type: 'webrtc' },
  { number: '113', type: 'webrtc' },
  { number: '114', type: 'webrtc' },
  { number: '116', type: 'webrtc' },
  { number: '118', type: 'webrtc' },
  { number: '120', type: 'webrtc' },
  { number: '122', type: 'webrtc' },
  { number: '123', type: 'webrtc' },
  { number: '124', type: 'webrtc' },
  { number: '126', type: 'phone' },
  { number: '128', type: 'webrtc' },
  { number: '130', type: 'phone' },
  { number: '132', type: 'webrtc' },
  { number: '134', type: 'webrtc' },
  { number: '136', type: 'webrtc' },
  { number: '138', type: 'webrtc' },
  { number: '140', type: 'webrtc' },
];

export const AVAILABLE_GROUPS_REF: readonly AgentGroupRef[] = [
  { id: 1, name: 'ACD Demo C2CB', active: true },
  { id: 2, name: 'ACD demo cuscare', active: true },
  { id: 3, name: 'ACD outbound', active: true },
  { id: 4, name: 'Campaigns', active: true },
  { id: 5, name: 'Exclusivo', active: true },
  { id: 6, name: 'Grupo de prueba 1', active: true },
  { id: 7, name: 'Grupo de prueba 2', active: true },
  { id: 8, name: 'Grupo demo', active: true },
  { id: 9, name: 'Grupo pedidos', active: true },
  { id: 10, name: 'Nodo AED 1', active: true },
  { id: 11, name: 'Online Support', active: true },
  { id: 12, name: 'Reclamaciones', active: true },
  { id: 13, name: 'Soporte Taller', active: true },
  { id: 14, name: 'Telemarketing', active: true },
];

const DP = DEFAULT_AGENT_PERMISSIONS;

export const AGENTS_SEED: readonly Agent[] = [
  {
    id: 1,
    code: '10001',
    name: 'Agente AED 1',
    extension: '122',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone'],
    status: 'active',
    presenceStatus: 'disponible',
    pin: '392',
    groups: [
      { id: 1, name: 'ACD Demo C2CB', active: true },
      { id: 3, name: 'ACD outbound', active: true },
    ],
    permissions: { ...DP },
    pickupType: 'auto',
  },
  {
    id: 2,
    code: '10002',
    name: 'Agente AED 2',
    extension: '123',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone'],
    status: 'active',
    presenceStatus: 'disponible',
    pin: '507',
    groups: [
      { id: 1, name: 'ACD Demo C2CB', active: true },
      { id: 4, name: 'Campaigns', active: true },
      { id: 8, name: 'Grupo demo', active: true },
      { id: 12, name: 'Reclamaciones', active: true },
    ],
    permissions: { ...DP },
    pickupType: 'auto',
    schedules: [1],
  },
  {
    id: 3,
    code: '10003',
    name: 'Agente demo',
    extension: '124',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone', 'chat'],
    status: 'active',
    presenceStatus: 'comida',
    pin: '135',
    iframeUrl: 'https://crm.example.com/agent-panel',
    groups: [
      { id: 1, name: 'ACD Demo C2CB', active: true },
      { id: 4, name: 'Campaigns', active: true },
      { id: 8, name: 'Grupo demo', active: true },
    ],
    permissions: { ...DP, manageDevices: true, recording: true },
    pickupType: 'auto',
    schedules: [1, 3],
  },
  {
    id: 4,
    code: '10004',
    name: 'Agente Jose',
    extension: '114',
    extensionType: 'webrtc',
    agentType: 'cuscare_carrier',
    channels: ['phone', 'chat'],
    status: 'active',
    presenceStatus: 'disponible',
    pin: '638',
    groups: [
      { id: 1, name: 'ACD Demo C2CB', active: true },
      { id: 4, name: 'Campaigns', active: true },
      { id: 8, name: 'Grupo demo', active: true },
      { id: 12, name: 'Reclamaciones', active: true },
    ],
    permissions: { ...DP },
    pickupType: 'auto',
    schedules: [1],
  },
  {
    id: 5,
    code: '10005',
    name: 'Agente Jose',
    extension: '103',
    extensionType: 'phone',
    agentType: 'normal',
    channels: ['phone'],
    status: 'active',
    presenceStatus: 'bano',
    pin: '990',
    groups: [
      { id: 3, name: 'ACD outbound', active: true },
      { id: 9, name: 'Grupo pedidos', active: true },
    ],
    permissions: { ...DP },
    pickupType: 'manual',
    schedules: [4],
  },
  {
    id: 6,
    code: '10006',
    name: 'Jose Barcala',
    extension: '120',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone'],
    status: 'inactive',
    presenceStatus: 'no_disponible',
    phone: '612345678',
    email: 'jbarcala@company.com',
    pin: '614',
    groups: [{ id: 4, name: 'Campaigns', active: false }],
    permissions: { ...DP },
    pickupType: 'auto',
  },
  {
    id: 7,
    code: '10007',
    name: 'Mario Perez',
    extension: '118',
    extensionType: 'webrtc',
    agentType: 'admin_cuscare',
    channels: ['phone', 'chat', 'email'],
    status: 'active',
    presenceStatus: 'disponible',
    phone: '698765432',
    email: 'mperez@company.com',
    iframeUrl: 'https://crm.example.com/mario',
    pin: '246',
    groups: [
      { id: 1, name: 'ACD Demo C2CB', active: true },
      { id: 4, name: 'Campaigns', active: true },
      { id: 11, name: 'Online Support', active: true },
      { id: 12, name: 'Reclamaciones', active: true },
    ],
    defaultOutboundGroup: 'ACD Demo C2CB',
    permissions: { ...DP, selfActivate: true, manageDevices: true, recording: true },
    languages: ['Español', 'Inglés'],
    pickupType: 'auto',
    schedules: [1, 2],
  },
  {
    id: 8,
    code: '10008',
    name: 'Marta Recio',
    extension: '106',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone', 'chat'],
    status: 'active',
    presenceStatus: 'formacion',
    email: 'mrecio@company.com',
    pin: '835',
    groups: [
      { id: 1, name: 'ACD Demo C2CB', active: true },
      { id: 3, name: 'ACD outbound', active: true },
      { id: 11, name: 'Online Support', active: true },
    ],
    permissions: { ...DP, recording: true },
    pickupType: 'auto',
    schedules: [2],
  },
  {
    id: 9,
    code: '10009',
    name: 'Miguel Palacios',
    extension: '102',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone'],
    status: 'inactive',
    presenceStatus: 'no_disponible',
    pin: '773',
    groups: [
      { id: 3, name: 'ACD outbound', active: false },
      { id: 8, name: 'Grupo demo', active: false },
    ],
    permissions: { ...DP },
    pickupType: 'auto',
  },
  {
    id: 10,
    code: '10010',
    name: 'Miguel Palacios 2',
    extension: '104',
    extensionType: 'webrtc',
    agentType: 'cuscare_carrier',
    channels: ['phone', 'chat'],
    status: 'active',
    presenceStatus: 'disponible',
    pin: '482',
    groups: [
      { id: 5, name: 'Exclusivo', active: true },
      { id: 9, name: 'Grupo pedidos', active: true },
      { id: 13, name: 'Soporte Taller', active: true },
    ],
    permissions: { ...DP, recording: true },
    pickupType: 'auto',
  },
  {
    id: 11,
    code: '10011',
    name: 'Miguel Palacios 3',
    extension: '108',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone'],
    status: 'active',
    presenceStatus: 'disponible',
    pin: '419',
    groups: [{ id: 5, name: 'Exclusivo', active: true }],
    permissions: { ...DP },
    pickupType: 'auto',
    schedules: [1, 3],
  },
  {
    id: 12,
    code: '10012',
    name: 'Oscar Bello',
    extension: '105',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone'],
    status: 'active',
    presenceStatus: 'comida',
    pin: '551',
    groups: [
      { id: 1, name: 'ACD Demo C2CB', active: true },
      { id: 6, name: 'Grupo de prueba 1', active: true },
    ],
    permissions: { ...DP },
    pickupType: 'auto',
  },
  {
    id: 13,
    code: '10013',
    name: 'Oscar Fernandez',
    extension: '116',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone', 'chat'],
    status: 'active',
    presenceStatus: 'disponible',
    pin: '284',
    groups: [
      { id: 1, name: 'ACD Demo C2CB', active: true },
      { id: 3, name: 'ACD outbound', active: true },
      { id: 11, name: 'Online Support', active: true },
    ],
    permissions: { ...DP, externalDevices: true, recording: true },
    pickupType: 'auto',
    schedules: [1, 3],
  },
  {
    id: 14,
    code: '10014',
    name: 'Oscar Quobis',
    extension: '110',
    extensionType: 'webrtc',
    agentType: 'cuscare',
    channels: ['phone'],
    status: 'active',
    presenceStatus: 'disponible',
    pin: '706',
    groups: [
      { id: 5, name: 'Exclusivo', active: true },
      { id: 8, name: 'Grupo demo', active: true },
    ],
    permissions: { ...DP },
    pickupType: 'auto',
  },
  {
    id: 15,
    code: '10015',
    name: 'Rafael',
    extension: '113',
    extensionType: 'webrtc',
    agentType: 'admin_cuscare',
    channels: ['phone', 'chat'],
    status: 'active',
    presenceStatus: 'disponible',
    pin: '139',
    groups: [
      { id: 3, name: 'ACD outbound', active: true },
      { id: 10, name: 'Nodo AED 1', active: true },
      { id: 13, name: 'Soporte Taller', active: true },
    ],
    permissions: { ...DP, recording: true },
    pickupType: 'auto',
    schedules: [4, 5],
  },
  {
    id: 16,
    code: '10016',
    name: 'Angel personal',
    extension: '109',
    extensionType: 'phone',
    agentType: 'normal',
    channels: ['phone'],
    status: 'inactive',
    presenceStatus: 'no_disponible',
    pin: '672',
    groups: [{ id: 7, name: 'Grupo de prueba 2', active: false }],
    permissions: { ...DP },
    pickupType: 'manual',
  },
];
