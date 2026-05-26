/**
 * Local persistence layer for translation history.
 * Mirrors the Firestore API shape so swapping in a real backend is mechanical.
 */
export interface TranslationRecord {
  id: string;
  userId: string;
  sentence: string;
  emotion: string | null;
  audioUrl: string | null;
  createdAt: number;
}

const KEY = (uid: string) => `signbridge:history:${uid}`;

export function listHistory(uid: string): TranslationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY(uid));
    if (!raw) return [];
    const arr = JSON.parse(raw) as TranslationRecord[];
    return arr.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function addHistory(uid: string, rec: Omit<TranslationRecord, "id" | "userId" | "createdAt">): TranslationRecord {
  const full: TranslationRecord = {
    ...rec,
    id: crypto.randomUUID(),
    userId: uid,
    createdAt: Date.now(),
  };
  const cur = listHistory(uid);
  cur.unshift(full);
  window.localStorage.setItem(KEY(uid), JSON.stringify(cur));
  return full;
}

export function deleteHistory(uid: string, id: string): void {
  const next = listHistory(uid).filter((r) => r.id !== id);
  window.localStorage.setItem(KEY(uid), JSON.stringify(next));
}
