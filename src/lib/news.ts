// src/lib/news.ts — tipos y helpers de noticias (vienen de /api/noticias)
import { categories } from "./categories";

export type Noticia = {
  id: number;
  slug: string;
  titulo: string;
  resumen: string | null;
  contenido?: string | null;
  categoria: string;
  imagen_url: string | null;
  video_url: string | null;
  destacada: number;
  estado: "BORRADOR" | "PUBLICADA";
  publicada_en: string | null;
  updated_at: string;
  autor: string | null;
  fuente?: "MANUAL" | "FACEBOOK";
  fuente_url?: string | null;
};

export type ListaNoticias = { noticias: Noticia[]; total: number; page: number; pages: number };

export const etiquetaCategoria = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;

/** ID de un video de YouTube (para la miniatura i.ytimg.com) o null */
export function youtubeId(url: string | null | undefined): string | null {
  const embed = videoEmbed(url);
  const m = embed?.match(/youtube-nocookie\.com\/embed\/([\w-]+)/);
  return m ? m[1] : null;
}

/**
 * Seguridad: solo se incrusta video de YouTube o Vimeo (nunca un iframe a cualquier sitio).
 * Acepta enlaces normales (watch?v=, youtu.be, vimeo.com/123) y los convierte a "embed".
 */
export function videoEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    const id = (s: string | null | undefined) => (s && /^[\w-]{6,20}$/.test(s) ? s : null);
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : u.searchParams.get("v");
      const ok = id(v) ?? id(u.pathname.startsWith("/shorts/") ? u.pathname.split("/")[2] : null);
      return ok ? `https://www.youtube-nocookie.com/embed/${ok}` : null;
    }
    if (host === "youtu.be") {
      const ok = id(u.pathname.slice(1));
      return ok ? `https://www.youtube-nocookie.com/embed/${ok}` : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const ok = u.pathname.split("/").filter(Boolean).pop();
      return ok && /^\d+$/.test(ok) ? `https://player.vimeo.com/video/${ok}` : null;
    }
  } catch {}
  return null;
}
