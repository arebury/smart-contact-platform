import { createLocalStore } from "../../shared/createLocalStore";
import { clasificacionIAData as defaults, type ClasificacionIA } from "./clasificacionIAData";

const store = createLocalStore<ClasificacionIA>({
  storageKey: "smartcontact_clasificacion_ia",
  versionKey: "smartcontact_clasificacion_ia_v",
  currentVersion: 1,
  defaults,
});

export function useClasificacionIAStore() {
  const base = store.useStore();
  return {
    clasificaciones: base.items,
    addClasificacion: (data: Omit<ClasificacionIA, "id">) => base.addItem(data),
    updateClasificacion: base.updateItem,
    deleteClasificacion: base.deleteItem,
    deleteClasificaciones: base.deleteItems,
  };
}
