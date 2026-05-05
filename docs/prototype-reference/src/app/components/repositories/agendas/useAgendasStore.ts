import { createLocalStore } from "../../shared/createLocalStore";
import { agendasData as defaults, type Agenda } from "./agendasData";

const store = createLocalStore<Agenda>({
  storageKey: "smartcontact_agendas",
  versionKey: "smartcontact_agendas_v",
  currentVersion: 1,
  defaults,
});

export function useAgendasStore() {
  const base = store.useStore();
  return {
    agendas: base.items,
    addAgenda: (data: Omit<Agenda, "id">) => base.addItem(data),
    updateAgenda: base.updateItem,
    deleteAgenda: base.deleteItem,
    deleteAgendas: base.deleteItems,
  };
}
