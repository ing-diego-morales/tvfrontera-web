// src/components/inicio/HeroTienda.tsx — portada de la tienda (estilo afiche)
// Escritorio: titular + botones (izq.) y beneficios (der.) · debajo, categorías en círculos (Admin > Categorías)
// en una cinta infinita que avanza sola si no caben todas.
// El buscador está en el menú (siempre visible), por eso aquí no se repite.
import Link from "next/link";
import { Gift, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { apiPublicaSegura } from "@/lib/api-server";
import { iconoDe, type Categoria } from "@/lib/iconos-categorias";
import FilaDeslizable from "@/components/FilaDeslizable";

const BENEFICIOS: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: ShieldCheck, titulo: "Compra segura", texto: "Negocios aprobados y verificados por TV Frontera" },
  { icono: Truck, titulo: "Directo del negocio", texto: "Pide y coordina la entrega por WhatsApp" },
  { icono: Gift, titulo: "Gana premios", texto: "Retos diarios y el gran sorteo anual" },
];

export default async function HeroTienda() {
  const data = await apiPublicaSegura<{ categorias: Categoria[] }>("/api/categorias");
  const categorias = data?.categorias ?? [];

  return (
    <section className="fondo-marca text-white">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-6 md:pt-10">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-center">
          <div className="lg:col-span-3">
            <p className="inline-block bg-indigo/90 text-[11px] font-extrabold uppercase tracking-[0.2em] px-3 py-1 rounded-full">La gran tienda virtual</p>
            <h1 className="text-[1.9rem] leading-[1.1] sm:text-4xl md:text-[2.6rem] font-extrabold mt-3 drop-shadow-[0_2px_0_rgba(43,47,138,0.35)]">
              Pide online fácil, seguro y rápido <span className="text-amarillo">y gana increíbles premios.</span>
            </h1>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/productos" className="bg-white text-naranja hover:bg-naranja-claro font-extrabold px-6 py-3 rounded-full shadow-lg transition-colors">
                Ver productos
              </Link>
              <Link href="/referidos" className="inline-flex items-center gap-2 bg-indigo hover:bg-indigo-oscuro font-bold px-6 py-3 rounded-full shadow-lg transition-colors">
                <Gift size={18} /> Refiere y gana
              </Link>
            </div>
          </div>
          <ul className="lg:col-span-2 grid grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-3">
            {BENEFICIOS.map(({ icono: Icon, titulo, texto }) => (
              <li key={titulo} className="flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-2 lg:gap-3 rounded-2xl bg-white/12 backdrop-blur-sm ring-1 ring-white/20 p-3 lg:p-4">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-white text-naranja flex items-center justify-center">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block font-extrabold text-sm leading-tight">{titulo}</span>
                  <span className="hidden lg:block text-xs text-white/85 mt-0.5">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {categorias.length > 0 && (
          <nav aria-label="Categorías" className="mt-7 -mx-4 md:mx-0">
            {/* py-2: el anillo y el efecto al pasar el mouse no se recortan */}
            <FilaDeslizable etiqueta="Categorías" bucle auto tono="marca" className="gap-3 md:gap-4 px-4 md:px-1 py-2">
              {categorias.map((c) => {
                const Icon = iconoDe(c.icono);
                return (
                  <li key={c.id} className="shrink-0">
                    <Link href={`/productos?categoria=${encodeURIComponent(c.nombre)}`} className="group flex flex-col items-center gap-1.5 w-[4.5rem] md:w-20 outline-none">
                      <span className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-naranja flex items-center justify-center shadow-md ring-2 ring-white/40 transition-transform group-hover:scale-105 group-hover:ring-amarillo group-focus-visible:ring-amarillo">
                        <Icon size={24} strokeWidth={1.9} />
                      </span>
                      <span className="text-[11px] font-semibold text-center leading-tight line-clamp-2">{c.nombre}</span>
                    </Link>
                  </li>
                );
              })}
            </FilaDeslizable>
          </nav>
        )}
      </div>
    </section>
  );
}
