// src/lib/api-server.ts — lecturas PÚBLICAS desde el servidor de Next (Server Components)
// Rendimiento: las respuestas se cachean `revalidate` segundos. Miles de visitas = 1 consulta a la API por minuto.
// Al instante: cada lectura lleva una ETIQUETA (avisos, noticias, aliados, productos). Cuando el admin o un
// aliado cambia algo, la API llama a /api/revalidar y Next borra esa etiqueta: la próxima visita ya ve el cambio.
// Seguridad: aquí nunca se envía la cookie del usuario; solo se lee contenido público.
import { API_URL, ApiError } from "./api";

export type EtiquetaCache = "avisos" | "noticias" | "aliados" | "productos" | "secciones" | "programacion" | "sitio" | "referidos" | "categorias" | "preguntas";

/** Etiqueta según la ruta de la API */
function etiquetas(path: string): EtiquetaCache[] {
  if (path.startsWith("/api/anuncios")) return ["avisos"];
  if (path.startsWith("/api/secciones")) return ["secciones"];
  if (path.startsWith("/api/programacion")) return ["programacion"];
  if (path.startsWith("/api/sitio")) return ["sitio"];
  if (path.startsWith("/api/referidos")) return ["referidos"];
  if (path.startsWith("/api/categorias")) return ["categorias"];
  if (path.startsWith("/api/preguntas")) return ["preguntas"];
  if (path.startsWith("/api/noticias")) return ["noticias"];
  if (path.startsWith("/api/productos")) return ["productos"];
  if (path.startsWith("/api/socios")) return ["aliados", "productos"]; // la tienda incluye productos
  return [];
}

export async function apiPublica<T>(path: string, revalidate = 60): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { next: { revalidate, tags: etiquetas(path) } });
  } catch {
    throw new ApiError("API no disponible", 0);
  }
  if (res.status === 404) return null; // la página decide: notFound()
  if (!res.ok) throw new ApiError(`Error ${res.status}`, res.status);
  return (await res.json()) as T;
}

/** Igual que apiPublica pero nunca lanza: si la API falla devuelve null (para secciones opcionales del inicio). */
export async function apiPublicaSegura<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    return await apiPublica<T>(path, revalidate);
  } catch {
    return null;
  }
}
