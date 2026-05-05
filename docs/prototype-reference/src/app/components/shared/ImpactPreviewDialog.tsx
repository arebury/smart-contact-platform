import { useState, useRef, useEffect } from "react";
import { X, AlertCircle, ArrowRight, Copy } from "lucide-react";

/* ───── Impact Preview Dialog (DD#199) ─────
   Confirmation modal for bulk operations that shows:
   - Summary of the operation (field → new value)
   - List of affected items with individual remove buttons
   - Clear confirm / cancel actions
   Works for both bulk edit and bulk duplicate flows.
*/

export interface ImpactPreviewItem {
  id: number;
  name: string;
  /** Optional detail shown after name (e.g. "(3 grupos)") */
  detail?: string;
  /** Current value of the field being changed (for bulk edit) */
  currentValue?: string;
}

interface ImpactPreviewDialogProps {
  /** Operation type determines header icon and wording */
  operation: "bulkEdit" | "duplicate";
  /** Label of the entity type: "agentes", "grupos" */
  entityLabel: string;
  /** For bulkEdit: field being changed */
  fieldLabel?: string;
  /** For bulkEdit: new value being applied */
  newValue?: string;
  /** List of items affected */
  items: ImpactPreviewItem[];
  onConfirm: (remainingIds: number[]) => void;
  onClose: () => void;
}

export function ImpactPreviewDialog({
  operation,
  entityLabel,
  fieldLabel,
  newValue,
  items: initialItems,
  onConfirm,
  onClose,
}: ImpactPreviewDialogProps) {
  const [items, setItems] = useState(initialItems);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const isBulkEdit = operation === "bulkEdit";
  const isDuplicate = operation === "duplicate";

  const title = isBulkEdit
    ? `Cambiar ${fieldLabel} en ${items.length} ${entityLabel}`
    : `Duplicar ${items.length} ${entityLabel}`;

  const confirmLabel = isBulkEdit
    ? "Aplicar"
    : "Duplicar";

  const isEmpty = items.length === 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="impact-preview-title"
        tabIndex={-1}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-h-[80vh] bg-white border border-gray-300 z-50 flex flex-col focus:outline-none"
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-200 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-gray-300 flex items-center justify-center shrink-0">
              {isBulkEdit ? (
                <ArrowRight size={18} className="text-gray-500" />
              ) : (
                <Copy size={18} className="text-gray-500" />
              )}
            </div>
            <div>
              <h3
                id="impact-preview-title"
                className="text-[15px] text-gray-800"
                style={{ fontWeight: 600 }}
              >
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Change summary badge (for bulk edit) */}
        {isBulkEdit && fieldLabel && newValue && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-[12px]">
            <span className="text-gray-500">{fieldLabel}:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-gray-400">valor actual</span>
              <ArrowRight size={11} className="text-gray-400" />
              <span
                className="px-2 py-0.5 bg-gray-800 text-white text-[11px]"
                style={{ fontWeight: 500 }}
              >
                {newValue}
              </span>
            </span>
          </div>
        )}

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 min-h-0" style={{ maxHeight: "300px" }}>
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle size={24} className="text-gray-300 mb-2" />
              <p className="text-[13px] text-gray-400">
                No quedan {entityLabel} seleccionados
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between py-2 group ${
                    idx > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <span
                    className="text-[13px] text-gray-700 truncate min-w-0"
                    style={{ fontWeight: 500 }}
                  >
                    {item.name}
                  </span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-300 hover:text-gray-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      aria-label={`Quitar ${item.name} de la selección`}
                      title="Quitar de la selección"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-700 cursor-pointer border border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(items.map((i) => i.id))}
              disabled={isEmpty}
              className="px-4 py-2 bg-gray-800 text-white text-[13px] hover:bg-gray-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontWeight: 500 }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}