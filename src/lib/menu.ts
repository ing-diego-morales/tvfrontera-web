// src/lib/menu.ts — menú principal (lo usan Header y MobileMenu)
import { categories } from "./categories";

export type EnlaceMenu = { href: string; label: string; destacado?: boolean };
export type ItemMenu = { href: string; label: string; destacado?: boolean; hijos?: EnlaceMenu[] };

export const MENU: ItemMenu[] = [
  { href: "/", label: "Inicio" },
  {
    href: "/noticias",
    label: "Noticias",
    hijos: [{ href: "/noticias", label: "Todas las noticias", destacado: true }, ...categories.map((c) => ({ href: `/noticias?categoria=${c.slug}`, label: c.label }))],
  },
  {
    href: "/puntos-aliados",
    label: "Puntos Aliados",
    hijos: [
      { href: "/puntos-aliados", label: "Directorio de aliados" },
      { href: "/productos", label: "Productos" },
      { href: "/registro?tipo=aliado", label: "Quiero ser Punto Aliado", destacado: true },
    ],
  },
  { href: "/referidos", label: "Refiere y gana", destacado: true },
  {
    href: "/nosotros",
    label: "Nosotros",
    hijos: [
      { href: "/nosotros", label: "Quiénes somos" },
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
      { href: "/radio", label: "Radio en vivo" },
    ],
  },
  { href: "/contacto", label: "Contacto" },
];

/** ¿El enlace corresponde a la página actual? */
export function esActivo(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  if (href === "/nosotros") return pathname.startsWith("/nosotros") || pathname.startsWith("/preguntas-frecuentes");
  if (href === "/puntos-aliados") return pathname.startsWith("/puntos-aliados") || pathname.startsWith("/productos");
  return pathname.startsWith(href);
}
