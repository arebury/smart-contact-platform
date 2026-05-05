import { useState, useEffect } from "react";

/**
 * DD#169: Cross-tab editing conflict warning.
 * When a form mounts in edit mode, it writes a lock key to localStorage.
 * If another tab already has the lock, a warning is shown.
 * On unmount, the lock is released.
 */
export function useCrossTabWarning(entityType: string, entityId: number | undefined) {
  const [conflictWarning, setConflictWarning] = useState(false);

  useEffect(() => {
    if (!entityId) return;
    const lockKey = `sc_editing:${entityType}:${entityId}`;
    const tabId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const existing = localStorage.getItem(lockKey);
    if (existing && existing !== tabId) {
      setConflictWarning(true);
    }

    localStorage.setItem(lockKey, tabId);

    // Listen for other tabs taking the lock
    const handleStorage = (e: StorageEvent) => {
      if (e.key === lockKey && e.newValue && e.newValue !== tabId) {
        setConflictWarning(true);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      // Only release if we still hold the lock
      if (localStorage.getItem(lockKey) === tabId) {
        localStorage.removeItem(lockKey);
      }
    };
  }, [entityType, entityId]);

  return conflictWarning;
}
