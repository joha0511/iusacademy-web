const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

type HttpOptions = RequestInit & { json?: unknown };

async function http(path: string, options: HttpOptions = {}) {
  const url = `${API_BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // cookies httpOnly
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  const isJson =
    res.headers.get("content-type")?.includes("application/json") ?? false;

  const data = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    const message = (data as any)?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export { http, API_BASE };
