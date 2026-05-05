import { useCallback } from "react";
import { createLocalStore } from "../shared/createLocalStore";
import { labelsData as defaults, type Label } from "./labelsData";

const store = createLocalStore<Label>({
  storageKey: "smartcontact_labels",
  versionKey: "smartcontact_labels_v",
  currentVersion: 1,
  defaults,
});

/* ════════════════════════════════════════════════════
   Hook: useLabelsStore  (DD#297: migrated to createLocalStore factory)
   ═══════════════════════════════════════════════════ */
export function useLabelsStore() {
  const base = store.useStore();

  const addLabel = useCallback(
    (label: Omit<Label, "id">): Label => {
      return base.addItem(label);
    },
    [base.addItem]
  );

  const updateLabel = useCallback(
    (id: number, updates: Partial<Omit<Label, "id">>) => {
      base.updateItem(id, updates);
    },
    [base.updateItem]
  );

  return {
    labels: base.items,
    addLabel,
    updateLabel,
    deleteLabel: base.deleteItem,
    deleteLabels: base.deleteItems,
    getLabel: base.getItem,
  };
}
