import { createLocalStore } from "../../shared/createLocalStore";
import { variablesData as defaults, type Variable } from "./variablesData";

const store = createLocalStore<Variable>({
  storageKey: "smartcontact_variables",
  versionKey: "smartcontact_variables_v",
  currentVersion: 1,
  defaults,
});

export function useVariablesStore() {
  const base = store.useStore();
  return {
    variables: base.items,
    addVariable: (data: Omit<Variable, "id">) => base.addItem(data),
    updateVariable: base.updateItem,
    deleteVariable: base.deleteItem,
    deleteVariables: base.deleteItems,
  };
}
