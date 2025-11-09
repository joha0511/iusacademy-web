import { http } from "./http";

export type Role = "ADMIN" | "DOCENTE" | "ESTUDIANTE";

export type Me = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: Role;
};

export async function loginApi(usernameOrEmail: string, password: string) {
  return http("/api/auth/login", {
    method: "POST",
    json: { usernameOrEmail, password },
  }) as Promise<{ message: string; role: Role }>;
}

export async function meApi() {
  try {
    const me = await http("/api/auth/me", { method: "GET" });
    return me as Me;
  } catch (e: any) {
    // si 401, devolvemos null
    if (/401|unauthorized/i.test(String(e?.message))) return null;
    throw e;
  }
}

export async function logoutApi() {
  await http("/api/auth/logout", { method: "POST" });
}
