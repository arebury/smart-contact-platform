import { useCallback } from "react";
import { createLocalStore } from "../shared/createLocalStore";
import { defaultTemplates as defaults, type Template } from "./templatesData";

const store = createLocalStore<Template>({
  storageKey: "smartcontact_templates",
  versionKey: "smartcontact_templates_v",
  currentVersion: 1,
  defaults,
});

/* ════════════════════════════════════════════════════
   Hook: useTemplatesStore  (DD#297: migrated to createLocalStore factory)
   ═══════════════════════════════════════════════════ */
export function useTemplatesStore() {
  const base = store.useStore();

  const addTemplate = useCallback(
    (template: Omit<Template, "id" | "createdAt" | "updatedAt">): Template => {
      const now = new Date().toISOString().slice(0, 10);
      return base.addItem({ ...template, createdAt: now, updatedAt: now } as Omit<Template, "id">);
    },
    [base.addItem]
  );

  const updateTemplate = useCallback(
    (id: number, updates: Partial<Omit<Template, "id" | "createdAt">>) => {
      const now = new Date().toISOString().slice(0, 10);
      base.updateItem(id, { ...updates, updatedAt: now });
    },
    [base.updateItem]
  );

  return {
    templates: base.items,
    addTemplate,
    updateTemplate,
    deleteTemplate: base.deleteItem,
    deleteTemplates: base.deleteItems,
  };
}
