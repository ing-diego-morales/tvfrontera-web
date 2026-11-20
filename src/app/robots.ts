// src/app/robots.ts — /robots.txt: los paneles privados no se indexan
import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/cuenta", "/panel", "/admin", "/login", "/registro", "/recuperar", "/restablecer", "/confirmar", "/baja"] }],
    sitemap: `${SITIO.url}/sitemap.xml`,
  };
}
