import { useCallback } from "react";
import { createLocalStore } from "../shared/createLocalStore";
import { agentsData as defaults, type Agent, type PresenceStatus } from "./agentsData";

const store = createLocalStore<Agent>({
  storageKey: "smartcontact_agents",
  versionKey: "smartcontact_agents_v",
  currentVersion: 11,
  defaults,
});

/* ════════════════════════════════════════════════════
   Hook: useAgentsStore  (DD#297: migrated to createLocalStore factory)
   ═══════════════════════════════════════════════════ */
export function useAgentsStore() {
  const base = store.useStore();

  const addAgent = useCallback(
    (agent: Omit<Agent, "id" | "code">) => {
      return base.addItem(agent as Omit<Agent, "id">, (prev) => {
        const maxCode = prev.reduce((m, a) => Math.max(m, parseInt(a.code || "10000")), 10000);
        return { code: String(maxCode + 1) };
      });
    },
    [base.addItem]
  );

  const duplicateAgent = useCallback(
    (sourceId: number, newName: string): Agent | null => {
      const snapshot = store.getRawSnapshot();
      const source = snapshot.find((a) => a.id === sourceId);
      if (!source) return null;
      const maxId = snapshot.reduce((m, a) => Math.max(m, a.id), 0);
      const maxCode = snapshot.reduce((m, a) => Math.max(m, parseInt(a.code || "10000")), 10000);
      const newAgent: Agent = {
        ...source,
        id: maxId + 1,
        code: String(maxCode + 1),
        name: newName,
        extension: "", // Must be selected from available extensions dropdown
        email: undefined, // Two agents cannot share the same email
        status: "inactive", // Drafts start inactive (DD#294)
        isDraft: true, // Marked as draft until user edits & saves
      };
      store.writeToStorage([...snapshot, newAgent]);
      return newAgent;
    },
    []
  );

  const bulkUpdate = useCallback(
    (ids: number[], field: string, value: string) => {
      const idSet = new Set(ids);
      base.setItems((prev) =>
        prev.map((a) => {
          if (!idSet.has(a.id)) return a;
          if (field === "status") return { ...a, status: value as Agent["status"] };
          if (field === "presenceStatus") {
            const presenceMap: Record<string, PresenceStatus> = {
              "Disponible": "disponible",
              "No disponible": "no_disponible",
              "Baño": "bano",
              "Comida": "comida",
              "Formación": "formacion",
            };
            return { ...a, presenceStatus: presenceMap[value] || a.presenceStatus };
          }
          if (field === "agentType") {
            const typeMap: Record<string, Agent["agentType"]> = {
              "Agente normal": "normal",
              "Agente Cuscare": "cuscare",
              "Agente Cuscare Carrier": "cuscare_carrier",
              "Admin Cuscare": "admin_cuscare",
            };
            return {
              ...a,
              agentType: typeMap[value] || a.agentType,
            };
          }
          if (field === "recording") {
            return { ...a, permissions: { ...a.permissions, recording: value === "Activada" } };
          }
          if (field === "defaultOutboundGroup") {
            return { ...a, defaultOutboundGroup: value };
          }
          if (field === "channels") {
            const ch = value.toLowerCase();
            const channelMap: Record<string, ("phone" | "chat" | "email")[]> = {
              "teléfono": ["phone"],
              "chat": ["chat"],
              "email": ["email"],
              "teléfono, chat": ["phone", "chat"],
              "teléfono, chat, email": ["phone", "chat", "email"],
            };
            return { ...a, channels: channelMap[ch] || a.channels };
          }
          return a;
        })
      );
    },
    [base.setItems]
  );

  const updatePresence = useCallback(
    (id: number, presence: PresenceStatus) => {
      base.setItems((prev) =>
        prev.map((a) => (a.id === id ? { ...a, presenceStatus: presence } : a))
      );
    },
    [base.setItems]
  );

  return {
    agents: base.items,
    addAgent,
    updateAgent: base.updateItem,
    deleteAgent: base.deleteItem,
    deleteAgents: base.deleteItems,
    duplicateAgent,
    getAgent: base.getItem,
    bulkUpdate,
    updatePresence,
  };
}