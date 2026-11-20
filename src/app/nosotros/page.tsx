// src/app/nosotros/page.tsx — Server Component. La historia se edita en Admin > Inicio > Textos del sitio.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper, Radio, ShoppingBag, Store, Tv, type LucideIcon } from "lucide-react";
import { EncabezadoPagina } from "@/components/ui";
import { apiPublicaSegura } from "@/lib/api-server";
import { FEATURES } from "@/lib/features";
import { SITIO } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description: `${SITIO.nombre} es la gran tienda virtual de ${SITIO.empresa}, el canal de televisión y medio digital de Cúcuta.`,
  alternates: { canonical: "/nosotros" },
};

type Servicio = { icon: LucideIcon; titulo: string; texto: string; href: string | null; accion: string };

const servicios: Servicio[] = [
  {
    icon: ShoppingBag,
    titulo: "Televentas Fest",
    texto: "La gran tienda virtual: compra a los negocios de la región y gana premios.",
    href: "/productos",
    accion: "Ir a la tienda",
  },
  {
    icon: Radio,
    titulo: "Radio en vivo",
    texto: "Nuestra señal de radio te acompaña en casa, en el trabajo o en el camino.",
    href: "/radio",
    accion: "Escuchar ahora",
  },
  {
    icon: Newspaper,
    titulo: "Noticias",
    texto: "Lo que pasa en Cúcuta, la frontera y el país, contado por nuestro equipo periodístico.",
    href: "/noticias",
    accion: "Leer noticias",
  },
  {
    icon: Store,
    titulo: "Puntos Aliados",
    texto: "Una red de negocios locales que confían en nosotros para llegar a más clientes.",
    href: "/puntos-aliados",
    accion: "Ver aliados",
  },
  {
    icon: Tv,
    titulo: "Televisión 24/7",
    texto: "Programación en vivo con información y entretenimiento para toda la familia.",
    href: FEATURES.tvEnVivo ? "/" : null, // la señal de TV en línea aún no está activa
    accion: "Ver en vivo",
  },
];

export default async function NosotrosPage() {
  const data = await apiPublicaSegura<{ textos: Record<string, string> }>("/api/sitio");
  const historia = data?.textos.nosotros_historia ?? "";
  const parrafos = historia.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <main className="flex-1 bg-gray-50">
      <EncabezadoPagina etiqueta={SITIO.empresa} titulo="Quiénes somos" subtitulo={`${SITIO.nombre}: ${SITIO.eslogan.toLowerCase()}. Informamos y conectamos a nuestra comunidad, 24/7.`} />

      {parrafos.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-extrabold text-indigo mb-4">Nuestra historia</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
            {parrafos.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-extrabold text-indigo mb-6 text-center">Qué hacemos</h2>
        <div data-revelar-hijos="" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {servicios.map(({ icon: Icon, titulo, texto, href, accion }) => {
            const contenido = (
              <>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${href ? "bg-naranja text-white" : "bg-gray-100 text-gray-400"}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-extrabold text-indigo mb-2">{titulo}</h3>
                <p className="text-sm text-gray-500 flex-1">{texto}</p>
                {href ? (
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-naranja group-hover:gap-2 transition-all">
                    {accion} <ArrowRight size={16} />
                  </span>
                ) : (
                  <span className="mt-4 inline-block self-start text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                    Próximamente
                  </span>
                )}
              </>
            );
            return href ? (
              <Link
                key={titulo}
                href={href}
                className="group flex flex-col bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 hover:ring-naranja/40 transition-all"
              >
                {contenido}
              </Link>
            ) : (
              <div key={titulo} className="flex flex-col bg-white/60 rounded-2xl ring-1 ring-black/5 p-6" aria-disabled="true">
                {contenido}
              </div>
            );
          })}
        </div>
      </section>

      <section className="fondo-marca py-14 px-4 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-extrabold">¿Tienes un negocio en la región?</h2>
        <p className="text-white/90 mt-2 mb-6 max-w-xl mx-auto">Vende en {SITIO.nombre} y muestra tus productos a toda la audiencia de {SITIO.empresa}.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/registro?tipo=aliado" className="bg-indigo hover:bg-indigo-oscuro text-white font-bold px-6 py-3 rounded-full shadow-lg transition-colors">
            Quiero vender
          </Link>
          <Link href="/contacto" className="bg-white hover:bg-naranja-claro text-naranja font-bold px-6 py-3 rounded-full transition-colors">
            Contáctanos
          </Link>
        </div>
      </section>
    </main>
  );
}
