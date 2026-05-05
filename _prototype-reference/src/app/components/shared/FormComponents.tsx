import { useState, useRef, useEffect, type ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip } from "./Tooltip";

/* ───── Tooltip Icon (DD#132, DD#203: uses shared Tooltip) ───── */
export function TooltipIcon({
  text,
  tooltipKey,
  tooltipMap,
}: {
  text?: string;
  tooltipKey?: string;
  tooltipMap?: Record<string, string>;
}) {
  const content = text || (tooltipKey && tooltipMap ? tooltipMap[tooltipKey] : "");
  if (!content) return null;

  return (
    <Tooltip content={content} placement="top" maxWidth={300} className="ml-1.5">
      <span
        className="inline-flex items-center cursor-help"
        tabIndex={0}
        role="note"
        aria-label={content}
      >
        <Info size={14} className="text-gray-400 hover:text-gray-500" />
      </span>
    </Tooltip>
  );
}

/* ───── Field Label ───── */
export function FieldLabel({
  text,
  required,
  tooltipKey,
  tooltipMap,
  tooltipText,
}: {
  text: string;
  required?: boolean;
  tooltipKey?: string;
  tooltipMap?: Record<string, string>;
  tooltipText?: string;
}) {
  return (
    <label
      className="flex items-center text-[13px] text-gray-600 mb-1.5"
      style={{ fontWeight: 500 }}
    >
      {text}
      {required && <span className="text-red-400 ml-0.5">*</span>}
      {(tooltipKey || tooltipText) && (
        <TooltipIcon
          text={tooltipText}
          tooltipKey={tooltipKey}
          tooltipMap={tooltipMap}
        />
      )}
    </label>
  );
}

/* ───── Section Card ───── */
export function SectionCard({
  title,
  icon,
  headerExtra,
  children,
}: {
  title: string;
  icon?: ReactNode;
  headerExtra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border border-gray-200 bg-white mb-5">
      <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <h2
            className="text-[14px] text-gray-800 flex items-center gap-2"
            style={{ fontWeight: 600 }}
          >
            {icon}
            {title}
          </h2>
          {headerExtra}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

/* ───── Toggle Switch ───── */
export function ToggleSwitch({
  checked,
  onChange,
  size = "md",
  label,
}: {
  checked: boolean;
  onChange: () => void;
  size?: "sm" | "md";
  label?: string;
}) {
  const w = size === "sm" ? "w-8" : "w-9";
  const h = size === "sm" ? "h-4" : "h-5";
  const knob = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const translate = size === "sm" ? "translate-x-[16px]" : "translate-x-4";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative ${w} ${h} transition-colors cursor-pointer ${
        checked ? "bg-gray-800" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 ${knob} bg-white transition-transform ${
          checked ? translate : ""
        }`}
      />
    </button>
  );
}

/* ───── Discard Changes Dialog (DD#136: focus return to trigger) ───── */
export function DiscardDialog({
  onStay,
  onDiscard,
}: {
  onStay: () => void;
  onDiscard: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      // DD#136: restore focus to trigger on unmount
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onStay} />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="discard-title"
        aria-describedby="discard-desc"
        tabIndex={-1}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white border border-gray-300 z-50 focus:outline-none"
        onKeyDown={(e) => { if (e.key === "Escape") onStay(); }}
      >
        <div className="px-6 pt-6 pb-2">
          <h3
            id="discard-title"
            className="text-[16px] text-gray-800"
            style={{ fontWeight: 600 }}
          >
            ¿Descartar cambios?
          </h3>
        </div>
        <div className="px-6 py-4">
          <p id="discard-desc" className="text-[13px] text-gray-500">
            Los cambios no guardados se perderán.
          </p>
        </div>
        <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-2.5">
          <button
            onClick={onStay}
            className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-700 cursor-pointer border border-gray-300 hover:bg-gray-100"
          >
            Seguir editando
          </button>
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-gray-800 text-white text-[13px] hover:bg-gray-700 cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Descartar
          </button>
        </div>
      </div>
    </>
  );
}

/* ───── Shared input class ───── */
export const inputClass =
  "w-full px-3 py-2 border border-gray-300 text-[13px] text-gray-700 focus:outline-none focus:border-gray-500 bg-white";

export const inputSmClass =
  "px-2.5 py-2 border border-gray-300 text-[13px] text-gray-700 focus:outline-none focus:border-gray-500 bg-white";