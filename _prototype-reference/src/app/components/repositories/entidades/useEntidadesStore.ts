import { createLocalStore } from "../../shared/createLocalStore";
import { entidadesData as defaults, type Entidad } from "./entidadesData";

const store = createLocalStore<Entidad>({
  storageKey: "smartcontact_entidades",
  versionKey: "smartcontact_entidades_v",
  currentVersion: 1,
  defaults,
});

export function useEntidadesStore() {
  const base = store.useStore();
  return {
    entidades: base.items,
    addEntidad: (data: Omit<Entidad, "id">) => base.addItem(data),
    updateEntidad: base.updateItem,
    deleteEntidad: base.deleteItem,
    deleteEntidades: base.deleteItems,
  };
}
