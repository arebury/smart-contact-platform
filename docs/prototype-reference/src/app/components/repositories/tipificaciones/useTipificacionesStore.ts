import { createLocalStore } from "../../shared/createLocalStore";
import { tipificacionesData as defaults, type Tipificacion } from "./tipificacionesData";

const store = createLocalStore<Tipificacion>({
  storageKey: "smartcontact_tipificaciones",
  versionKey: "smartcontact_tipificaciones_v",
  currentVersion: 1,
  defaults,
});

export function useTipificacionesStore() {
  const base = store.useStore();
  return {
    tipificaciones: base.items,
    addTipificacion: (data: Omit<Tipificacion, "id">) => base.addItem(data),
    updateTipificacion: base.updateItem,
    deleteTipificacion: base.deleteItem,
    deleteTipificaciones: base.deleteItems,
  };
}
