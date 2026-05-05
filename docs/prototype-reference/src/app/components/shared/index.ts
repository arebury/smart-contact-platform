/**
 * ══════════════════════════════════════════════════════════════════
 *  SHARED COMPONENTS HUB — SmartContact Supervisor
 * ══════════════════════════════════════════════════════════════════
 *
 *  This file serves as the central catalog/index for all reusable
 *  components, hooks, and utilities in the /shared directory.
 *
 *  It is organized into categories so any developer (or LLM) can
 *  quickly discover what is available before building new features.
 *
 *  USAGE:
 *    import { SectionCard, FieldLabel, ToggleSwitch } from "../shared";
 *    import { ContextMenu, SortableHeader } from "../shared";
 *    import { useClickOutside } from "../shared";
 *
 * ══════════════════════════════════════════════════════════════════
 */

/* ─────────────────────────────────────────────────────────────────
   1. FORM COMPONENTS
   Reusable form building blocks used across all Create/Edit pages.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Tooltip icon (i) — renders Info icon with edge-aware tooltip (DD#132, DD#203) */
  TooltipIcon,
  /** Standard field label with optional required asterisk and tooltip (DD#132) */
  FieldLabel,
  /** Bordered card with grey header — used for form sections (DD#145) */
  SectionCard,
  /** Custom toggle switch in low-fi style (DD#296: fixed visual bug) */
  ToggleSwitch,
  /** "Discard changes?" confirmation dialog with focus management (DD#136) */
  DiscardDialog,
  /** Standard input className string for consistent text inputs */
  inputClass,
  /** Smaller input className variant */
  inputSmClass,
} from "./FormComponents";

/* ─────────────────────────────────────────────────────────────────
   2. TABLE COMPONENTS
   Building blocks for list pages: context menus, sortable headers,
   channel badges, inline-edit rows, and bulk context menus.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Right-click context menu with viewport clamping and fade-in (DD#134, DD#151) */
  ContextMenu,
  /** Bulk right-click context menu for multi-selection (DD#144) */
  BulkContextMenu,
  /** Sortable table header cell with asc/desc/none icons (DD#120) */
  SortableHeader,
  /** Phone/Chat/Email channel icon badges (DD#121) */
  ChannelBadges,
  /** Inline duplicate row with name editing + confirm/cancel (DD#294) */
  InlineDuplicateRow,
} from "./TableComponents";

/* ─────────────────────────────────────────────────────────────────
   3. DIALOGS
   Modal dialogs for destructive or high-impact operations.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Delete confirmation dialog — single (copy-paste) or bulk (removable chips) (DD#146, DD#295) */
  DeleteEntityDialog,
} from "./DeleteEntityDialog";

export {
  /** Bulk operation preview dialog — shows affected items with remove buttons (DD#199) */
  ImpactPreviewDialog,
} from "./ImpactPreviewDialog";

/* ─────────────────────────────────────────────────────────────────
   4. COLUMN SELECTOR
   Toggle table column visibility with localStorage persistence.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Column visibility dropdown with checkbox list (DD#160) */
  ColumnSelector,
  /** Column definition type */
  type ColumnDef,
} from "./ColumnSelector";

/* ─────────────────────────────────────────────────────────────────
   5. LABEL FILTER
   Unified label filter dropdown with multiple visual variants.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Label filter dropdown — "action-bar", "compact", or "header" variant (DD#221) */
  LabelFilterButton,
} from "./LabelFilterButton";

/* ─────────────────────────────────────────────────────────────────
   5b. BULK ACTION BAR
   Fixed bottom bar for multi-selection actions in list pages.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Fixed-bottom bar with count + clear + custom actions (DD#298) */
  BulkActionBar,
} from "./BulkActionBar";

/* ─────────────────────────────────────────────────────────────────
   5c. STICKY FORM HEADER
   Shared header for Create/Edit pages with inline name editing.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Header bar with inline name editing + Cancel/Save/Delete buttons (DD#299) */
  StickyFormHeader,
  /** Ref handle type for StickyFormHeader — exposes startEditing() */
  type StickyFormHeaderHandle,
} from "./StickyFormHeader";

/* ─────────────────────────────────────────────────────────────────
   6. TOOLTIP
   Edge-aware tooltip with arrow, supporting top/bottom placement.
   ───────────────────────────────────────────────────────────────── */
export {
  /** General-purpose tooltip wrapper (DD#200, DD#286) */
  Tooltip,
  /** Simplified tooltip for icon buttons */
  IconTooltip,
} from "./Tooltip";

/* ─────────────────────────────────────────────────────────────────
   7. HOOKS
   Reusable React hooks for common interaction patterns.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Close dropdown/popover on outside click or Escape (DD#134) */
  useClickOutside,
} from "./useClickOutside";

export {
  /** Arrow key navigation for dropdown menus (DD#135) */
  useKeyboardNav,
} from "./useKeyboardNav";

export {
  /** Block in-app navigation when form has unsaved changes (DD#136) */
  useNavigationGuard,
} from "./useNavigationGuard";

export {
  /** Detect concurrent editing of the same entity across browser tabs (DD#169) */
  useCrossTabWarning,
} from "./useCrossTabWarning";

/* ─────────────────────────────────────────────────────────────────
   8. UTILITIES
   Pure functions (no React) for common operations.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Clipboard copy with Clipboard API + textarea fallback (DD#146) */
  copyToClipboard,
} from "./copyToClipboard";

export {
  /** XLSX export helper — headers, rows, auto-fit, styled header, timestamped file (DD#296) */
  exportToXlsx,
} from "./exportXlsx";

export {
  /** Global undo stack — push/pop undoable actions, consumed by AppLayout Ctrl+Z (DD#293) */
  pushUndo,
  popUndo,
  removeUndo,
  hasUndo,
} from "./undoStack";

/* ─────────────────────────────────────────────────────────────────
   9. STORE FACTORY
   Generic localStorage-backed store with pub/sub + useSyncExternalStore.
   ───────────────────────────────────────────────────────────────── */
export {
  /** Factory function to create a typed store with CRUD operations (DD#297) */
  createLocalStore,
} from "./createLocalStore";