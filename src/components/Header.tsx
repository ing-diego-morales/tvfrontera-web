// src/components/Header.tsx — menú estilo tienda virtual (como el afiche de Televentas Fest)
// Fila 1 (naranja): logo · buscador · cuenta   |   Fila 2: navegación (escritorio) o buscador a todo el ancho (celular)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Gift, Store } from "lucide-react";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import WeatherWidget from "./WeatherWidget";
import BuscadorTienda from "./BuscadorTienda";
import Logo from "./Logo";
import { MENU, esActivo } from "@/lib/menu";

export default function Header() {
  const pathname = usePathname();
  const activo = (href: string) => esActivo(href, pathname);

  return (
    <header className="sticky top-0 z-50 shadow-lg shadow-black/10">
      {/* Fila 1 */}
      <div className="fondo-header text-white">
        <div className="max-w-6xl mx-auto flex items-center gap-3 md:gap-6 px-4 h-16 lg:h-[4.25rem]">
          <Link href="/" className="shrink-0" aria-label="Televentas Fest, ir al inicio">
            <Logo alto={44} prioridad className="hidden sm:block" />
            <Logo alto={36} prioridad className="sm:hidden" />
          </Link>

          <div className="hidden md:block flex-1 max-w-xl">
            <BuscadorTienda />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:block">
              <WeatherWidget />
            </div>
            <UserMenu />
            <MobileMenu />
          </div>
        </div>
      </div>

      {/* Fila 2: navegación (escritorio) */}
      <div className="hidden lg:block bg-indigo text-white">
        <nav className="max-w-6xl mx-auto px-4 flex items-center gap-1 h-10 text-sm font-medium" aria-label="Principal">
          {MENU.map((item) =>
            item.hijos ? (
              <div key={item.href} className="relative group h-full flex items-center">
                <Link
                  href={item.href}
                  aria-haspopup="true"
                  className={`flex items-center gap-1 px-3 h-full border-b-2 transition-colors hover:text-amarillo ${activo(item.href) ? "border-amarillo text-amarillo" : "border-transparent"}`}
                >
                  {item.label} <ChevronDown size={14} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </Link>
                {/* Visible con mouse (hover) y con teclado (focus-within) */}
                <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all absolute top-full left-0 pt-1 z-50">
                  <div className="bg-white text-indigo rounded-lg shadow-xl ring-1 ring-black/5 py-2 w-60 overflow-hidden">
                    {item.hijos.map((h) => (
                      <Link
                        key={h.href}
                        href={h.href}
                        className={`block px-4 py-2 text-sm hover:bg-naranja-claro hover:text-naranja transition-colors ${h.destacado ? "font-bold" : ""}`}
                      >
                        {h.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={activo(item.href) ? "page" : undefined}
                className={`px-3 h-full flex items-center gap-1.5 border-b-2 transition-colors hover:text-amarillo ${activo(item.href) ? "border-amarillo text-amarillo" : "border-transparent"} ${item.destacado ? "text-amarillo font-bold" : ""}`}
              >
                {item.destacado && <Gift size={15} />}
                {item.label}
              </Link>
            )
          )}
          <Link
            href="/registro?tipo=aliado"
            className="ml-auto flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide bg-amarillo text-indigo hover:bg-amarillo-oscuro px-3 py-1.5 rounded-full transition-colors"
          >
            <Store size={14} /> Vende con nosotros
          </Link>
        </nav>
      </div>

      {/* Fila 2: buscador a todo el ancho (celular y tableta) */}
      <div className="md:hidden fondo-header px-4 pb-3">
        <BuscadorTienda />
      </div>
    </header>
  );
}
