// next.config.ts
import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { IMAGE_HOSTS } from "./src/lib/images";

const isProd = process.env.NODE_ENV === "production";

// Cabeceras de seguridad para todas las páginas
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" }, // el navegador no "adivina" tipos de archivo
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // no filtra URLs completas a otros sitios
  { key: "X-Frame-Options", value: "SAMEORIGIN" }, // nadie puede meter tu sitio en un iframe (clickjacking)
  // Cámara solo para este sitio (verificación de identidad); micrófono, ubicación y pagos bloqueados
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
  // HTTPS obligatorio durante 2 años (solo en producción; en local rompería http://localhost)
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

/** IPv4 de este equipo en la red local (Wi-Fi / cable) */
function ipsLocales() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal)
    .map((i) => i!.address);
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Oculta el botón "N" de Next en desarrollo (en producción nunca aparece). Los errores se siguen mostrando.
  devIndicators: false,
  // No generar AGENTS.md (instrucciones para asistentes de IA) al correr next dev
  agentRules: false,
  experimental: {
    // Lo máximo que la web reenvía a la API en una petición: la verificación de identidad manda
    // 3 fotos (la API acepta hasta 12 MB en esa ruta y 100 KB en las demás).
    proxyClientMaxBodySize: "13mb",
  },
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
    formats: ["image/avif", "image/webp"],
    // Solo en desarrollo: el navegador carga las imágenes directo y Next
    // no las descarga ni optimiza (evita los "upstream image response timed out").
    unoptimized: !isProd,
  },
  // Solo desarrollo: deja abrir el sitio desde el celular con la IP del equipo en la red local.
  // Se detecta sola (el router puede cambiarla: .101, .106, .107...), no hay que editarla a mano.
  allowedDevOrigins: ipsLocales(),
  async headers() {
    // Los paneles (/cuenta, /panel, /admin) no llevan datos privados en el HTML:
    // los piden desde el navegador con la cookie de sesión, así que no hay nada sensible que cachear.
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // La API se sirve bajo el mismo dominio del sitio: /api/* y /uploads/* se reenvían a tvfrontera-api.
  // "afterFiles": las rutas propias de la web (ej. /api/revalidar) tienen prioridad.
  async rewrites() {
    const api = (process.env.API_INTERNA_URL ?? "http://localhost:4000").replace(/\/$/, "");
    return {
      beforeFiles: [],
      afterFiles: [
        { source: "/api/:path*", destination: `${api}/api/:path*` },
        { source: "/uploads/:path*", destination: `${api}/uploads/:path*` },
      ],
      fallback: [],
    };
  },
  async redirects() {
    return [
      { source: "/register", destination: "/registro", permanent: true }, // enlaces viejos
      { source: "/privacy-policy", destination: "/privacidad", permanent: true },
      { source: "/terms-and-conditions", destination: "/terminos", permanent: true },
    ];
  },
};
export default nextConfig;
