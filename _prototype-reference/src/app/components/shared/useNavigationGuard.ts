import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router";

/**
 * Custom navigation guard — drop-in replacement for React Router's
 * `useBlocker` that avoids the StrictMode warning
 * "A router only supports one blocker at a time".
 *
 * How it works:
 *   `useNavigate()`, sidebar `<Link>` clicks, and breadcrumbs all
 *   flow through `navigator.push / replace / go` from React Router's
 *   NavigationContext.  This hook patches those three methods to
 *   intercept the call, store it, and show a confirmation dialog.
 *
 *   `beforeunload` (handled separately in the page component)
 *   protects against tab-close and hard refresh.
 *
 * API surface is the same as useBlocker:
 *   blocker.state  — "unblocked" | "blocked"
 *   blocker.proceed() — replay the intercepted navigation
 *   blocker.reset()   — dismiss the dialog, stay on page
 */

type BlockerResult =
  | { state: "unblocked"; reset?: undefined; proceed?: undefined }
  | { state: "blocked"; reset: () => void; proceed: () => void };

export function useNavigationGuard(active: boolean): BlockerResult {
  const { navigator } = useContext(NavigationContext);

  const activeRef = useRef(active);
  activeRef.current = active;

  /** Stored navigation callback awaiting user decision. */
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);

  /** Skips interception while proceed() replays the stored navigation. */
  const proceedingRef = useRef(false);

  /**
   * Tracks whether we currently own the navigator methods.
   * Prevents the StrictMode remount from stacking a second patch on
   * top of an already-patched navigator.
   */
  const patchedRef = useRef(false);
  const originalsRef = useRef<{
    push: typeof navigator.push;
    replace: typeof navigator.replace;
    go: typeof navigator.go;
  } | null>(null);

  // ── Patch navigator methods ──────────────────────────────────────
  useEffect(() => {
    // When the guard is OFF, restore originals (if we patched them).
    if (!active) {
      if (patchedRef.current && originalsRef.current) {
        navigator.push = originalsRef.current.push;
        navigator.replace = originalsRef.current.replace;
        navigator.go = originalsRef.current.go;
        patchedRef.current = false;
        originalsRef.current = null;
      }
      return;
    }

    // StrictMode guard: don't re-patch if already patched.
    if (patchedRef.current) return;

    const origPush = navigator.push;
    const origReplace = navigator.replace;
    const origGo = navigator.go;
    originalsRef.current = { push: origPush, replace: origReplace, go: origGo };

    navigator.push = (...args: Parameters<typeof origPush>) => {
      if (!activeRef.current || proceedingRef.current) {
        return origPush.apply(navigator, args);
      }
      setPendingNav(() => () => origPush.apply(navigator, args));
    };

    navigator.replace = (...args: Parameters<typeof origReplace>) => {
      if (!activeRef.current || proceedingRef.current) {
        return origReplace.apply(navigator, args);
      }
      setPendingNav(() => () => origReplace.apply(navigator, args));
    };

    navigator.go = (...args: Parameters<typeof origGo>) => {
      if (!activeRef.current || proceedingRef.current) {
        return origGo.apply(navigator, args);
      }
      setPendingNav(() => () => origGo.apply(navigator, args));
    };

    patchedRef.current = true;

    return () => {
      navigator.push = origPush;
      navigator.replace = origReplace;
      navigator.go = origGo;
      patchedRef.current = false;
      originalsRef.current = null;
    };
  }, [active, navigator]);

  // ── Reset when the guard deactivates (e.g. saving starts) ───────
  useEffect(() => {
    if (!active) {
      setPendingNav(null);
      proceedingRef.current = false;
    }
  }, [active]);

  // ── Public API ───────────────────────────────────────────────────
  const proceed = useCallback(() => {
    if (!pendingNav) return;
    const nav = pendingNav;
    proceedingRef.current = true;
    setPendingNav(null);
    nav();
  }, [pendingNav]);

  const reset = useCallback(() => {
    setPendingNav(null);
  }, []);

  if (pendingNav) {
    return { state: "blocked", proceed, reset };
  }
  return { state: "unblocked" };
}
