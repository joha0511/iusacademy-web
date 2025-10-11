// src/api.ts
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

export type RoleApi = "ADMIN" | "DOCENTE" | "ESTUDIANTE";

export async function loginApi(usernameOrEmail: string, password: string) {
  const r = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ usernameOrEmail, password }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error ?? "No se pudo iniciar sesión");
  return data as { message: string; role: RoleApi };
}

export async function meApi() {
  const r = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
  if (r.status === 401) return null;
  return (await r.json()) as {
    id: string; firstName: string; lastName: string; email: string; username: string; role: RoleApi;
  };
}

export async function logoutApi() {
  await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
}

