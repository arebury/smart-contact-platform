import { useCallback } from "react";
import { createLocalStore } from "../shared/createLocalStore";
import { groupsData as defaults, type Group } from "./groupsData";

const store = createLocalStore<Group>({
  storageKey: "smartcontact_groups",
  versionKey: "smartcontact_groups_v",
  currentVersion: 9,
  defaults,
});

/* ════════════════════════════════════════════════════
   Hook: useGroupsStore  (DD#297: migrated to createLocalStore factory)
   ════════════════════════════════════════════════════ */
export function useGroupsStore() {
  const base = store.useStore();

  const addGroup = useCallback(
    (group: Omit<Group, "id" | "code">) => {
      return base.addItem(group as Omit<Group, "id">, (prev) => {
        const maxCode = prev.reduce((m, g) => Math.max(m, parseInt(g.code || "20000")), 20000);
        return { code: String(maxCode + 1) };
      });
    },
    [base.addItem]
  );

  const duplicateGroup = useCallback(
    (sourceId: number, newName: string): Group | null => {
      const snapshot = store.getRawSnapshot();
      const source = snapshot.find((g) => g.id === sourceId);
      if (!source) return null;
      const maxId = snapshot.reduce((m, g) => Math.max(m, g.id), 0);
      const maxCode = snapshot.reduce((m, g) => Math.max(m, parseInt(g.code || "20000")), 20000);
      const newGroup: Group = {
        ...source,
        id: maxId + 1,
        code: String(maxCode + 1),
        name: newName,
        isDraft: true, // Marked as draft until user edits & saves (DD#294)
      };
      store.writeToStorage([...snapshot, newGroup]);
      return newGroup;
    },
    []
  );

  /** Bulk update a field on multiple groups (DD#147: type-safe mappings) */
  const bulkUpdate = useCallback(
    (ids: number[], field: string, value: string) => {
      const idSet = new Set(ids);
      base.setItems((prev) =>
        prev.map((g) => {
          if (!idSet.has(g.id)) return g;
          if (field === "priority") return { ...g, priority: value as Group["priority"] };
          if (field === "strategy") return { ...g, strategy: value };
          if (field === "channels") {
            const ch = value.toLowerCase();
            const channelMap: Record<string, string[]> = {
              "teléfono": ["phone"],
              "chat": ["chat"],
              "email": ["email"],
              "teléfono, chat": ["phone", "chat"],
              "teléfono, chat, email": ["phone", "chat", "email"],
            };
            return { ...g, channels: channelMap[ch] || g.channels };
          }
          return g;
        })
      );
    },
    [base.setItems]
  );

  return {
    groups: base.items,
    addGroup,
    updateGroup: base.updateItem,
    deleteGroup: base.deleteItem,
    deleteGroups: base.deleteItems,
    duplicateGroup,
    getGroup: base.getItem,
    bulkUpdate,
  };
}
