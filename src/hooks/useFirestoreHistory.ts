import { useCallback, useEffect, useState } from "react";
import { addHistory, deleteHistory, listHistory, type TranslationRecord } from "@/lib/firestoreHelpers";
import { useAuth } from "@/components/auth/AuthProvider";

export function useFirestoreHistory() {
  const { user } = useAuth();
  const [items, setItems] = useState<TranslationRecord[]>([]);

  const refresh = useCallback(() => {
    if (!user) return setItems([]);
    setItems(listHistory(user.uid));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback((rec: Omit<TranslationRecord, "id" | "userId" | "createdAt">) => {
    if (!user) return null;
    const created = addHistory(user.uid, rec);
    refresh();
    return created;
  }, [user, refresh]);

  const remove = useCallback((id: string) => {
    if (!user) return;
    deleteHistory(user.uid, id);
    refresh();
  }, [user, refresh]);

  return { items, add, remove, refresh };
}
