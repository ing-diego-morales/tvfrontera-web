// src/app/noticias/page.tsx — listado desde /api/noticias (caché 60 s por combinación de filtros)
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Play, Search } from "lucide-react";
import { categories } from "@/lib/categories";
import { timeAgo } from "@/lib/date-utils";
import { apiPublica } from "@/lib/api-server";
import { esOptimizable, imagenSegura } from "@/lib/images";
import { etiquetaCategoria, type ListaNoticias } from "@/lib/news";
import Pagination from "@/components/Pagination";
import NewsCard from "@/components/NewsCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import ReportForm from "@/components/ReportForm";
import PicoYPlaca from "@/components/PicoYPlaca";
import { Aviso } from "@/components/ui";

const POR_PAGINA = 7; // 1 destacada + 6 en la cuadrícula

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}): Promise<Metadata> {
  const { categoria } = await searchParams;
  const cat = categories.find((c) => c.slug === categoria);
  return {
    title: cat ? `Noticias de ${cat.label}` : "Noticias",
    description: "Mantente informado con la actualidad de Cúcuta y la frontera.",
    alternates: { canonical: cat ? `/noticias?categoria=${cat.slug}` : "/noticias" },
  };
}

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string; page?: string }>;
}) {
  const { categoria: catParam, buscar: buscarParam, page } = await searchParams;
  const categoria = categories.some((c) => c.slug === catParam) ? catParam : undefined;
  const buscar = buscarParam?.trim().slice(0, 100) || undefined;
  const currentPage = Math.max(1, Number(page) || 1);

  const qs = new URLSearchParams({ page: String(currentPage), limit: String(POR_PAGINA) });
  if (categoria) qs.set("categoria", categoria);
  if (buscar) qs.set("q", buscar);

  let data: ListaNoticias | null = null;
  let caida = false;
  try {
    data = await apiPublica<ListaNoticias>(`/api/noticias?${qs}`);
  } catch {
    caida = true;
  }
  const noticias = data?.noticias ?? [];
  const [featured, ...rest] = noticias;
  const featuredImg = imagenSegura(featured?.imagen_url);

  return (
    <main className="flex-1 bg-gray-50">
      <section className="fondo-marca py-14 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">Noticias</h1>
        <p className="text-white/90 mt-2">Mantente informado con la actualidad de la frontera</p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-3">
          <form suppressHydrationWarning action="/noticias" method="GET" className="flex gap-2 mb-6 max-w-md" role="search">
            {categoria && <input suppressHydrationWarning type="hidden" name="categoria" value={categoria} />}
            <input suppressHydrationWarning
              type="search"
              name="buscar"
              defaultValue={buscar}
              maxLength={100}
              aria-label="Buscar noticias"
              placeholder="Buscar noticias..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo"
            />
            <button type="submit" aria-label="Buscar" className="bg-indigo text-white p-2 rounded-full hover:bg-indigo-oscuro transition-colors">
              <Search size={18} />
            </button>
          </form>

          <div className="flex gap-3 flex-wrap mb-8">
            <Link
              href="/noticias"
              className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${
                !categoria ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"
              }`}
            >
              Todas
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/noticias?categoria=${cat.slug}`}
                className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${
                  categoria === cat.slug ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {buscar && (
            <p className="text-sm text-gray-500 mb-4">
              Resultados para: <span className="font-bold text-indigo">&quot;{buscar}&quot;</span>
            </p>
          )}

          {caida ? (
            <Aviso tipo="alerta">Las noticias no están disponibles en este momento. Intenta de nuevo en unos minutos.</Aviso>
          ) : !featured ? (
            <p className="text-center text-gray-500 py-20">No se encontraron noticias con esos criterios.</p>
          ) : (
            <>
              <Link
                href={`/noticias/${featured.slug}`}
                className="block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group mb-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative h-64 md:h-full min-h-70 overflow-hidden bg-gray-100">
                    <Image
                      src={featuredImg}
                      alt={featured.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized={!esOptimizable(featuredImg)}
                      className="object-cover group-hover:scale-105 transition-transform"
                      loading="eager"
                      fetchPriority="high"
                    />
                    {featured.video_url && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-4">
                          <Play size={28} className="text-naranja" fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <span className="text-xs text-naranja font-bold uppercase">
                      {etiquetaCategoria(featured.categoria)}
                      {featured.publicada_en && ` · ${timeAgo(featured.publicada_en)}`}
                    </span>
                    <h2 className="text-2xl font-extrabold text-indigo mt-2 mb-3">{featured.titulo}</h2>
                    {featured.resumen && <p className="text-gray-500">{featured.resumen}</p>}
                  </div>
                </div>
              </Link>

              <div data-revelar-hijos="" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rest.map((news) => (
                  <NewsCard key={news.slug} news={news} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={data?.pages ?? 1}
                basePath="/noticias"
                params={{ categoria, buscar }}
              />
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <PicoYPlaca />
          <ReportForm />
        </aside>
      </div>

      <NewsletterSignup />
    </main>
  );
}
