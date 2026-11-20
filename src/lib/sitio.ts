// src/lib/sitio.ts — datos de la marca y la empresa en UN solo lugar (header, footer, legales, SEO, WhatsApp)
// Marca comercial: Televentas Fest · Empresa responsable: TV Frontera (canal de televisión de Cúcuta)
// ⚠️ Verifica el usuario real de Instagram.
const URL_SITIO = (process.env.NEXT_PUBLIC_SITE_URL || "https://tvfrontera.com").replace(/\/+$/, "");

export const SITIO = {
  nombre: "Televentas Fest",
  empresa: "TV Frontera",
  // Dominio público del sitio (SEO, sitemap, enlaces). En producción: NEXT_PUBLIC_SITE_URL en las variables.
  url: URL_SITIO,
  dominio: new URL(URL_SITIO).host,
  eslogan: "La gran tienda virtual de TV Frontera",
  descripcion: "Compra fácil, seguro y rápido a los negocios de la región, y gana increíbles premios.",
  ciudad: "Cúcuta, Norte de Santander, Colombia",
  correo: "canaltvfrontera@gmail.com",
  telefono: "+57 310 851 1162",
  whatsapp: "573108511162",
  logo: { src: "/marca/televentas-fest.png", ancho: 900, alto: 291 },
  icono: "/marca/icono-512.png",
  redes: {
    facebook: "https://www.facebook.com/canaltvfrontera",
    instagram: "https://www.instagram.com/canaltvfrontera",
    tiktok: "https://www.tiktok.com/@canaltvfrontera",
  },
} as const;
