import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken, type User } from "@/lib/api";

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  /** Used after social sign-in: store the token the server gave us and load the user. */
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
}
const Ctx = createContext<AuthValue>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.me().then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const value: AuthValue = {
    user, loading,
    login: async (email, password) => { const r = await api.login({ email, password }); setToken(r.token); setUser(r.user); },
    register: async (name, email, password) => { const r = await api.register({ name, email, password }); setToken(r.token); setUser(r.user); },
    loginWithToken: async (token) => { setToken(token); try { setUser(await api.me()); } catch (e) { setToken(null); throw e; } },
    logout: () => { setToken(null); setUser(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
