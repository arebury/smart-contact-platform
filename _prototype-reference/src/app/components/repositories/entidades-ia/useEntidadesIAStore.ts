import { createLocalStore } from "../../shared/createLocalStore";
import { entidadesIAData as defaults, type EntidadIA } from "./entidadesIAData";

const store = createLocalStore<EntidadIA>({
  storageKey: "smartcontact_entidades_ia",
  versionKey: "smartcontact_entidades_ia_v",
  currentVersion: 1,
  defaults,
});

export function useEntidadesIAStore() {
  const base = store.useStore();
  return {
    entidades: base.items,
    addEntidad: (data: Omit<EntidadIA, "id">) => base.addItem(data),
    updateEntidad: base.updateItem,
    deleteEntidad: base.deleteItem,
    deleteEntidades: base.deleteItems,
  };
}
