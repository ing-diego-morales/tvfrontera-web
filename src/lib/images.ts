// src/lib/images.ts — dominios de imágenes que Next puede optimizar (WebP/AVIF, tamaño justo)
// Lo usa next.config.ts. Las imágenes de otros dominios se muestran igual, pero sin optimizar.
export const IMAGE_HOSTS = ["picsum.photos", "res.cloudinary.com", "i.ytimg.com", "img.youtube.com"];

export function esOptimizable(src: string | null | undefined): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && IMAGE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

/** Solo URLs http(s) válidas llegan a <Image>/<img> (evita javascript: y datos basura). */
export function imagenSegura(src: string | null | undefined, porDefecto = "/logo.png"): string {
  if (!src) return porDefecto;
  if (src.startsWith("/")) return src;
  try {
    const u = new URL(src);
    return u.protocol === "https:" || u.protocol === "http:" ? src : porDefecto;
  } catch {
    return porDefecto;
  }
}
