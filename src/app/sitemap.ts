// src/app/sitemap.ts — /sitemap.xml para Google (se regenera cada hora)
import type { MetadataRoute } from "next";
import { apiPublicaSegura } from "@/lib/api-server";
import type { ListaNoticias } from "@/lib/news";
import type { ListaAliados } from "@/lib/aliados";
import { SITIO as SITIO_DATOS } from "@/lib/sitio";

const SITIO = SITIO_DATOS.url;
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [noticias, aliados] = await Promise.all([
    apiPublicaSegura<ListaNoticias>("/api/noticias?limit=50", 3600),
    apiPublicaSegura<ListaAliados>("/api/socios?limit=50", 3600),
  ]);

  const fijas = ["", "/noticias", "/puntos-aliados", "/productos", "/referidos", "/radio", "/nosotros", "/preguntas-frecuentes", "/contacto", "/privacidad", "/terminos"].map((p) => ({
    url: `${SITIO}${p}`,
    changeFrequency: p === "" || p === "/noticias" ? ("hourly" as const) : ("monthly" as const),
    priority: p === "" ? 1 : 0.7,
  }));

  return [
    ...fijas,
    ...(noticias?.noticias ?? []).map((n) => ({
      url: `${SITIO}/noticias/${n.slug}`,
      lastModified: n.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(aliados?.socios ?? []).map((s) => ({
      url: `${SITIO}/puntos-aliados/${s.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
