import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** ===== Tipos ===== */
export type UserRole = "admin" | "docente" | "estudiante";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/** ===== Config API ===== */
const API_URL =
  (import.meta as any)?.env?.VITE_API_URL?.toString() || "http://localhost:4000";

/** ===== Estado del Contexto ===== */
interface AuthState {
  user: User | null;
  loading: boolean;
  /** Vuelve a consultar la sesión al backend */
  refresh: () => Promise<void>;
  /** Cierra sesión en el backend y limpia el estado */
  logout: () => Promise<void>;
  /** (DEV) Simula un usuario con rol para navegar sin backend */
  simulate: (role: UserRole) => void;
  /** (DEV) Desactiva la simulación */
  clearSimulation: () => void;
}

/** ===== Contexto ===== */
const AuthContext = createContext<AuthState | null>(null);

/** ===== Provider ===== */
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** --- (DEV) Soporte de simulación para navegar sin backend --- */
  const SIM_KEY = "ius.simulatedUser";
  const tryLoadSimulation = () => {
    try {
      const raw = localStorage.getItem(SIM_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  };

  const simulate = (role: UserRole) => {
    const fake: User = {
      id: "simulated",
      email: `${role}@demo.local`,
      name: `Usuario ${role}`,
      role,
    };
    localStorage.setItem(SIM_KEY, JSON.stringify(fake));
    setUser(fake);
    setLoading(false);
  };

  const clearSimulation = () => {
    localStorage.removeItem(SIM_KEY);
  };

  /** --- Llama /auth/me para obtener la sesión real --- */
  const refresh = async () => {
    setLoading(true);

    // Si hay usuario simulado, úsalo y no llames backend
    const sim = tryLoadSimulation();
    if (sim) {
      setUser(sim);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      const u: User = {
        id: data.user.sub,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      };
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /** --- Logout estándar --- */
  const logout = async () => {
    // limpia simulación si estuviera activa
    clearSimulation();

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // silencioso en dev
    } finally {
      setUser(null);
    }
  };

  /** Al montar, intenta cargar simulación o sesión real */
  useEffect(() => {
    const sim = tryLoadSimulation();
    if (sim) {
      setUser(sim);
      setLoading(false);
    } else {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, refresh, logout, simulate, clearSimulation }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** ===== Hook ===== */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
