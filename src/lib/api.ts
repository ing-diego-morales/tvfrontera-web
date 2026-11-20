// src/lib/api.ts — llamadas a tvfrontera-api desde el NAVEGADOR (con cookie de sesión)
// En el navegador se usan rutas relativas (/api/...): Next las reenvía a la API (rewrites en next.config.ts).
// Así el sitio funciona igual desde el PC, el celular (IP de la red) o el dominio final, y la cookie de
// sesión es del mismo sitio. En el servidor (Server Components) se llama directo a la API.
export const API_INTERNA = (process.env.API_INTERNA_URL ?? "http://localhost:4000").replace(/\/$/, "");
export const API_URL = typeof window === "undefined" ? API_INTERNA : "";

/** Error de la API con el status HTTP y el `code` que manda el backend (ej. MEMBRESIA_INACTIVA). */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Options = Omit<RequestInit, "body"> & { json?: unknown };

export async function api<T = unknown>(path: string, { json, headers, ...init }: Options = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include", // envía/recibe la cookie de sesión
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch {
    throw new ApiError("No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.", 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? `Error ${res.status}`, res.status, data?.code);
  return data as T;
}

/** Mensaje legible de cualquier error (para mostrar en formularios). */
export function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : "Ocurrió un error inesperado";
}
