import { useCallback } from "react";
import { createLocalStore } from "../shared/createLocalStore";
import { usersData as defaults, type User } from "./usersData";

const store = createLocalStore<User>({
  storageKey: "smartcontact_users",
  versionKey: "smartcontact_users_v",
  currentVersion: 1,
  defaults,
});

/* ════════════════════════════════════════════════════
   Hook: useUsersStore  (DD#297: uses createLocalStore factory)
   ═══════════════════════════════════════════════════ */
export function useUsersStore() {
  const base = store.useStore();

  const addUser = useCallback(
    (user: Omit<User, "id" | "code">) => {
      return base.addItem(user as Omit<User, "id">, (prev) => {
        const maxCode = prev.reduce(
          (m, u) => Math.max(m, parseInt(u.code.replace("U", "") || "0")),
          0
        );
        return { code: `U${String(maxCode + 1).padStart(3, "0")}` };
      });
    },
    [base.addItem]
  );

  const duplicateUser = useCallback(
    (sourceId: number, newName: string): User | null => {
      const snapshot = store.getRawSnapshot();
      const source = snapshot.find((u) => u.id === sourceId);
      if (!source) return null;
      const maxId = snapshot.reduce((m, u) => Math.max(m, u.id), 0);
      const maxCode = snapshot.reduce(
        (m, u) => Math.max(m, parseInt(u.code.replace("U", "") || "0")),
        0
      );
      const newUser: User = {
        ...source,
        id: maxId + 1,
        code: `U${String(maxCode + 1).padStart(3, "0")}`,
        name: newName,
        email: "", // Two users cannot share the same email
        status: "inactive",
        isDraft: true,
      };
      store.writeToStorage([...snapshot, newUser]);
      return newUser;
    },
    []
  );

  return {
    users: base.items,
    addUser,
    updateUser: base.updateItem,
    deleteUser: base.deleteItem,
    deleteUsers: base.deleteItems,
    duplicateUser,
    getUser: base.getItem,
    setUsers: base.setItems,
  };
}
