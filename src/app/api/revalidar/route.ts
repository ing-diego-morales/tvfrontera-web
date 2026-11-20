// src/app/api/revalidar/route.ts — la API avisa aquí para que los cambios se vean AL INSTANTE
// Seguridad: solo acepta llamadas con el secreto compartido (REVALIDATE_SECRET en ambos .env),
// comparado en tiempo constante, y solo borra etiquetas conocidas.
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

const PERMITIDAS = new Set(["avisos", "noticias", "aliados", "productos", "secciones", "programacion", "sitio", "referidos", "categorias", "preguntas"]);

function secretoValido(recibido: string | null) {
  // En desarrollo, si está vacío en .env, se usa el mismo valor por defecto que la API (src/config.js).
  // En producción es obligatorio: sin él esta ruta rechaza todo.
  const esperado =
    process.env.REVALIDATE_SECRET ||
    (process.env.NODE_ENV === "production" ? undefined : "desarrollo-local-no-usar-en-produccion-REVALIDATE_SECRET");
  if (!esperado || !recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!secretoValido(request.headers.get("x-revalidate-secret"))) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string" && PERMITIDAS.has(t)) : [];
  // expire: 0 = la próxima visita trae los datos frescos (sin mostrar la versión vieja)
  for (const t of tags) revalidateTag(t, { expire: 0 });
  return Response.json({ ok: true, tags });
}
