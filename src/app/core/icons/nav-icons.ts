import {
  Activity,
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  FolderOpen,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Paintbrush,
  Phone,
  Plug,
  Radio,
  Settings,
  Shield,
  User,
  UserCog,
  Users,
  UsersRound,
  Workflow,
} from 'lucide-angular';

/**
 * Lucide icon registry for navigation and chrome.
 *
 * Components that render dynamic icons by string key import this map and
 * resolve `iconKey -> LucideIconData`. Keep keys kebab-case so the data files
 * (e.g. nav-data.ts) read like configuration, not code.
 */
export const NAV_ICONS = {
  activity: Activity,
  'bar-chart-3': BarChart3,
  'book-open': BookOpen,
  'brain-circuit': BrainCircuit,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  database: Database,
  'file-text': FileText,
  'folder-open': FolderOpen,
  headphones: Headphones,
  'help-circle': HelpCircle,
  'layout-dashboard': LayoutDashboard,
  'log-out': LogOut,
  megaphone: Megaphone,
  'message-square': MessageSquare,
  paintbrush: Paintbrush,
  phone: Phone,
  plug: Plug,
  radio: Radio,
  settings: Settings,
  shield: Shield,
  user: User,
  'user-cog': UserCog,
  users: Users,
  'users-round': UsersRound,
  workflow: Workflow,
} as const;

export type NavIconKey = keyof typeof NAV_ICONS;
