import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const STORAGE_KEY = "signbridge:auth:user";
const AuthCtx = createContext<AuthState | null>(null);

function loadUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(loadUser());
    setLoading(false);
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!email || !password) throw new Error("Email and password are required");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    await new Promise((r) => setTimeout(r, 400));
    persist({ uid: btoa(email).slice(0, 16), email, name: email.split("@")[0] });
  }, [persist]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!name || !email || !password) throw new Error("All fields are required");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    await new Promise((r) => setTimeout(r, 400));
    persist({ uid: btoa(email).slice(0, 16), email, name });
  }, [persist]);

  const signInWithGoogle = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 400));
    persist({ uid: "google-user", email: "user@google.com", name: "Google User" });
  }, [persist]);

  const signOut = useCallback(async () => {
    persist(null);
  }, [persist]);

  const resetPassword = useCallback(async (email: string) => {
    if (!email) throw new Error("Email is required");
    await new Promise((r) => setTimeout(r, 400));
  }, []);

  const value = useMemo<AuthState>(() => ({
    user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword,
  }), [user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
