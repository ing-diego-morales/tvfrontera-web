// src/app/puntos-aliados/[slug]/page.tsx — tienda pública de un Punto Aliado (caché 60 s)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronLeft, Clock, MapPin, Star } from "lucide-react";
import { apiPublica } from "@/lib/api-server";
import { imagenSegura } from "@/lib/images";
import type { TiendaAliado } from "@/lib/aliados";
import Imagen from "@/components/Imagen";
import ContactoAliado from "@/components/aliados/ContactoAliado";
import TiendaProductos from "@/components/aliados/TiendaProductos";
import { TituloSeccion } from "@/components/ui";
import { EstadoConexion, Verificado } from "@/components/Insignias";

const obtener = (slug: string) => apiPublica<TiendaAliado>(`/api/socios/${encodeURIComponent(slug)}`);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await obtener(slug).catch(() => null);
  if (!data) return { title: "Punto Aliado no disponible" };
  const s = data.socio;
  const descripcion = s.descripcion?.slice(0, 160) ?? `${s.nombre_negocio}, Punto Aliado de Televentas Fest en ${s.ciudad}.`;
  return {
    title: s.nombre_negocio,
    description: descripcion,
    alternates: { canonical: `/puntos-aliados/${s.slug}` },
    openGraph: { title: s.nombre_negocio, description: descripcion, images: [{ url: imagenSegura(s.logo_url) }] },
  };
}

export default async function TiendaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await obtener(slug);
  if (!data) notFound(); // no existe, no está aprobado o la mensualidad venció
  const { socio, productos } = data;

  return (
    <main className="flex-1 bg-gray-50">
      <section className="relative overflow-hidden fondo-marca text-white">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-naranja/15 blur-3xl" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-20">
          <Link href="/puntos-aliados" className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white mb-8">
            <ChevronLeft size={16} /> Todos los Puntos Aliados
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden img-ph ring-4 ring-white/15 shadow-xl">
              <Imagen src={socio.logo_url} alt={socio.nombre_negocio} fill loading="eager" fetchPriority="high" sizes="112px" className="object-cover" />
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {socio.destacado && (
                  <span className="flex items-center gap-1 bg-amarillo text-indigo text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <Star size={12} fill="currentColor" /> Destacado
                  </span>
                )}
                {socio.verificado && <Verificado claro />}
                {socio.plan === "PREMIUM" && (
                  <span className="flex items-center gap-1 bg-white/15 text-white text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <BadgeCheck size={12} /> Aliado Premium
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold">{socio.nombre_negocio}</h1>
              <div className="mt-2">
                <EstadoConexion enLinea={socio.en_linea} conTexto claro />
              </div>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/90 mt-2 text-sm">
                {socio.categoria && <span className="bg-indigo/90 text-white font-bold px-2.5 py-0.5 rounded-full">{socio.categoria}</span>}
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {socio.ciudad}
                </span>
                {socio.horario && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {socio.horario}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tarjeta de contacto: acceso rápido siempre visible arriba */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-2">Sobre el negocio</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{socio.descripcion || "Punto Aliado de Televentas Fest."}</p>
          </div>
          <div className="lg:col-span-3 lg:border-l lg:border-gray-100 lg:pl-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">Contacto directo</h2>
            <ContactoAliado aliado={socio} />
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <TituloSeccion titulo="Productos" subtitulo={productos.length ? `${productos.length} disponibles` : undefined} />
        <TiendaProductos productos={productos} socioId={socio.id} negocio={socio.nombre_negocio} slug={socio.slug} />
      </section>
    </main>
  );
}
