import { useState, useRef, useEffect } from "react";
import { AlertTriangle, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "./copyToClipboard";

interface DeleteEntityDialogProps {
  type: "single" | "bulk";
  items: { id: number; name: string }[];
  entitySingular: string;   // e.g. "agente", "grupo"
  entityPlural: string;     // e.g. "agentes", "grupos"
  /** Extra detail message for single-delete (e.g. "El agente será desasignado de 3 grupos automáticamente.") */
  singleDetailMessage?: string;
  /** Footer message for bulk-delete (e.g. "Los agentes serán desasignados de sus grupos automáticamente.") */
  bulkFooterMessage?: string;
  onClose: () => void;
  onConfirm: (remainingIds?: number[]) => void;
}

export function DeleteEntityDialog({
  type,
  items,
  entitySingular,
  entityPlural,
  singleDetailMessage,
  bulkFooterMessage,
  onClose,
  onConfirm,
}: DeleteEntityDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [copied, setCopied] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Set<number>>(
    () => new Set(items.map((a) => a.id))
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const targetName = type === "single" ? items[0].name : "";
  const visibleItems = items.filter((a) => visibleIds.has(a.id));
  const isConfirmed = type === "single" ? confirmText === targetName : visibleItems.length > 0;

  useEffect(() => {
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(targetName);
    if (ok) {
      setCopied(true);
      toast.success("Nombre copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  const removeFromList = (id: number) => {
    const next = new Set(visibleIds);
    next.delete(id);
    if (next.size === 0) {
      onClose();
      return;
    }
    setVisibleIds(next);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-entity-title"
        tabIndex={-1}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white border border-gray-300 z-50 focus:outline-none"
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      >
        <div className="px-6 pt-6 pb-2 flex flex-col items-center">
          <div className="w-12 h-12 border border-dashed border-gray-300 flex items-center justify-center mb-4">
            <AlertTriangle size={22} className="text-gray-500" />
          </div>

          <h3
            id="delete-entity-title"
            className="text-[16px] text-gray-800 text-center"
            style={{ fontWeight: 600 }}
          >
            {type === "single"
              ? `\u00bfEliminar ${entitySingular}?`
              : `\u00bfEliminar ${visibleItems.length} ${entityPlural}?`}
          </h3>
        </div>

        <div className="px-6 py-4">
          {type === "single" ? (
            <>
              <p className="text-[13px] text-gray-500 text-center">
                Vas a eliminar el {entitySingular} &laquo;
                <span style={{ fontWeight: 600 }}>{items[0].name}</span>&raquo;.
                Esta acci&oacute;n no se puede deshacer.
              </p>
              {singleDetailMessage && (
                <p className="text-[12px] text-gray-500 text-center mt-3">
                  {singleDetailMessage}
                </p>
              )}

              {/* Copy-paste confirmation */}
              <div className="mt-4">
                <p className="text-[12px] text-gray-500 mb-2">
                  Escribe el nombre para confirmar:
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 border border-gray-300 text-[12px] text-gray-700 hover:bg-gray-200 cursor-pointer select-all"
                    style={{ fontWeight: 600 }}
                    title="Clic para copiar"
                  >
                    {targetName}
                    {copied ? (
                      <Check size={12} className="text-green-500" />
                    ) : (
                      <Copy size={12} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={targetName}
                  className="w-full px-3 py-2 border border-gray-300 text-[13px] focus:outline-none focus:border-gray-500 bg-white"
                  autoFocus
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] text-gray-500 text-center mb-3">
                Esta acci&oacute;n no se puede deshacer. Se eliminar&aacute;n los siguientes
                {" "}{entityPlural}:
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center mb-3 min-h-[28px]">
                {items.map((a) => {
                  const isVisible = visibleIds.has(a.id);
                  if (!isVisible) return null;
                  return (
                    <span
                      key={a.id}
                      className="group/chip inline-flex items-center px-2 py-0.5 border border-gray-300 text-gray-600 text-[12px]"
                      style={{ fontWeight: 500 }}
                    >
                      {a.name}
                      <button
                        onClick={() => removeFromList(a.id)}
                        className="ml-1 w-[14px] h-[14px] inline-flex items-center justify-center opacity-0 group-hover/chip:opacity-100 text-gray-400 hover:text-gray-600 cursor-pointer transition-opacity"
                        aria-label={`Quitar ${a.name} de la lista`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
              {bulkFooterMessage && (
                <p className="text-[12px] text-gray-500 text-center">
                  {bulkFooterMessage}
                </p>
              )}
            </>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-700 cursor-pointer border border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (type === "bulk") {
                onConfirm(Array.from(visibleIds));
              } else {
                onConfirm();
              }
            }}
            disabled={!isConfirmed}
            className="px-4 py-2 bg-red-500 text-white text-[13px] hover:bg-red-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontWeight: 500 }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </>
  );
}