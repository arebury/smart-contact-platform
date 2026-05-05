import { createLocalStore } from "../../shared/createLocalStore";
import { intencionesData as defaults, type Intencion } from "./intencionesData";

const store = createLocalStore<Intencion>({
  storageKey: "smartcontact_intenciones",
  versionKey: "smartcontact_intenciones_v",
  currentVersion: 1,
  defaults,
});

export function useIntencionesStore() {
  const base = store.useStore();
  return {
    intenciones: base.items,
    addIntencion: (data: Omit<Intencion, "id">) => base.addItem(data),
    updateIntencion: base.updateItem,
    deleteIntencion: base.deleteItem,
    deleteIntenciones: base.deleteItems,
  };
}
