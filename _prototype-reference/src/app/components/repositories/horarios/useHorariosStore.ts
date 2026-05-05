import { createLocalStore } from "../../shared/createLocalStore";
import { horariosData as defaults, type Horario } from "./horariosData";

const store = createLocalStore<Horario>({
  storageKey: "smartcontact_horarios",
  versionKey: "smartcontact_horarios_v",
  currentVersion: 1,
  defaults,
});

export function useHorariosStore() {
  const base = store.useStore();
  return {
    horarios: base.items,
    addHorario: (data: Omit<Horario, "id">) => base.addItem(data),
    updateHorario: base.updateItem,
    deleteHorario: base.deleteItem,
    deleteHorarios: base.deleteItems,
  };
}
