import { createLocalStore } from "../../shared/createLocalStore";
import { reglasIAData as defaults, type ReglaIA } from "./reglasIAData";

const store = createLocalStore<ReglaIA>({
  storageKey: "smartcontact_reglas_ia",
  versionKey: "smartcontact_reglas_ia_v",
  currentVersion: 1,
  defaults,
});

export function useReglasIAStore() {
  const base = store.useStore();
  return {
    reglas: base.items,
    addRegla: (data: Omit<ReglaIA, "id">) => base.addItem(data),
    updateRegla: base.updateItem,
    deleteRegla: base.deleteItem,
    deleteReglas: base.deleteItems,
  };
}
