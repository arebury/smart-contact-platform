import { useState, useRef, useEffect, type ReactNode } from "react";

/* ───── Unified Tooltip Component (DD#200, DD#286) ───── */
/* Replaces duplicated inline tooltip patterns across modules.
   Supports top/bottom placement, custom width, and aria-label propagation.
   DD#286: Wider default (300px), better padding, edge-aware repositioning. */

type TooltipPlacement = "top" | "bottom";

interface TooltipProps {
  /** Content shown inside the tooltip bubble */
  content: ReactNode;
  /** The element that triggers the tooltip on hover/focus */
  children: ReactNode;
  /** Placement relative to trigger. Default: "top" */
  placement?: TooltipPlacement;
  /** Max width in px. Default: 300 */
  maxWidth?: number;
  /** Pass-through className for the wrapper span */
  className?: string;
  /** If true, tooltip is disabled and won't show */
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  placement = "top",
  maxWidth = 300,
  className = "",
  disabled = false,
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [nudge, setNudge] = useState(0);

  // Reposition tooltip if it overflows viewport edges
  useEffect(() => {
    if (!show || !tooltipRef.current || !wrapperRef.current) {
      setNudge(0);
      return;
    }
    const tt = tooltipRef.current.getBoundingClientRect();
    const pad = 8; // minimum distance from viewport edge
    let n = 0;
    if (tt.left < pad) {
      n = pad - tt.left;
    } else if (tt.right > window.innerWidth - pad) {
      n = window.innerWidth - pad - tt.right;
    }
    if (n !== nudge) setNudge(n);
  }, [show, nudge]);

  if (disabled || !content) {
    return <span className={className}>{children}</span>;
  }

  const isTop = placement === "top";

  return (
    <span
      ref={wrapperRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          ref={tooltipRef}
          className={`absolute z-50 left-1/2 px-3 py-2 bg-gray-800 text-white text-[11px] whitespace-normal pointer-events-none ${
            isTop ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{
            maxWidth,
            lineHeight: "1.55",
            fontWeight: 400,
            letterSpacing: "0.01em",
            transform: `translateX(calc(-50% + ${nudge}px))`,
          }}
          role="tooltip"
        >
          {content}
          {/* Arrow */}
          <span
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-l-transparent border-r-transparent ${
              isTop
                ? "top-full border-t-[5px] border-t-gray-800"
                : "bottom-full border-b-[5px] border-b-gray-800"
            }`}
            style={{ transform: `translateX(calc(-50% - ${nudge}px))` }}
          />
        </span>
      )}
    </span>
  );
}

/* ───── Simple text-only tooltip for icon buttons ───── */
export function IconTooltip({
  label,
  children,
  placement = "top",
  className = "",
}: {
  label: string;
  children: ReactNode;
  placement?: TooltipPlacement;
  className?: string;
}) {
  return (
    <Tooltip content={label} placement={placement} maxWidth={200} className={className}>
      <span aria-label={label}>{children}</span>
    </Tooltip>
  );
}
