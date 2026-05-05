/**
 * Global undo stack (DD#293)
 *
 * Module-level singleton — any component can push an undoable action
 * and the global Ctrl+Z listener (in AppLayout) pops & executes it.
 * Each entry has a toastId so the associated toast can be dismissed.
 */

export interface UndoEntry {
  id: string;
  toastId: string | number;
  callback: () => void;
  description: string;
  /** Timestamp for auto-expiry */
  ts: number;
}

const EXPIRY_MS = 9000; // slightly longer than toast duration (8s)
const MAX_STACK = 20;

let stack: UndoEntry[] = [];

function prune() {
  const now = Date.now();
  stack = stack.filter((e) => now - e.ts < EXPIRY_MS);
}

/** Push an undoable action. Returns the entry id. */
export function pushUndo(
  toastId: string | number,
  callback: () => void,
  description: string
): string {
  prune();
  const id = `undo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  stack.push({ id, toastId, callback, description, ts: Date.now() });
  if (stack.length > MAX_STACK) stack.shift();
  return id;
}

/** Pop and execute the most recent undoable action. Returns true if one was executed. */
export function popUndo(): { executed: boolean; toastId?: string | number; description?: string } {
  prune();
  const entry = stack.pop();
  if (!entry) return { executed: false };
  entry.callback();
  return { executed: true, toastId: entry.toastId, description: entry.description };
}

/** Remove a specific entry (e.g. when its toast is manually undone). */
export function removeUndo(toastId: string | number) {
  stack = stack.filter((e) => e.toastId !== toastId);
}

/** Check if there are undoable actions available. */
export function hasUndo(): boolean {
  prune();
  return stack.length > 0;
}
