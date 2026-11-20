// src/components/LatestNews.tsx — portada editorial: la noticia MÁS RECIENTE en grande + las siguientes
// Server Component (caché 60 s): al publicar una noticia aparece arriba en menos de un minuto.
import Link from "next/link";
import { Play } from "lucide-react";
import Imagen from "./Imagen";
import NewsCard from "./NewsCard";
import { TituloSeccion } from "./ui";
import { apiPublicaSegura } from "@/lib/api-server";
import { timeAgo } from "@/lib/date-utils";
import { etiquetaCategoria, type ListaNoticias } from "@/lib/news";

export default async function LatestNews() {
  const data = await apiPublicaSegura<ListaNoticias>("/api/noticias?limit=8");
  const noticias = data?.noticias ?? [];
  if (!noticias.length) return null; // si la API falla, el inicio carga igual sin esta sección

  const [principal, ...resto] = noticias;
  const laterales = resto.slice(0, 4);
  const abajo = resto.slice(4, 7);

  return (
    <section className="max-w-6xl mx-auto px-4 pt-10 pb-12">
      <TituloSeccion titulo="Lo último" subtitulo="La actualidad de Cúcuta y la frontera" href="/noticias" enlace="Todas las noticias" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Noticia principal */}
        <Link
          href={`/noticias/${principal.slug}`}
          className="group relative lg:col-span-3 rounded-2xl overflow-hidden min-h-80 lg:min-h-[28rem] img-ph shadow-lg"
        >
          <Imagen
            src={principal.imagen_url}
            alt={principal.titulo}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          {principal.video_url && (
            <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <Play size={12} fill="white" /> Video
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <span className="inline-block bg-naranja text-white text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded">
              {etiquetaCategoria(principal.categoria)}
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-white mt-3 leading-tight group-hover:underline decoration-amarillo underline-offset-4">
              {principal.titulo}
            </h3>
            {principal.resumen && <p className="text-gray-200 mt-3 line-clamp-2 max-w-2xl">{principal.resumen}</p>}
            {principal.publicada_en && (
              <time dateTime={principal.publicada_en} className="block text-xs text-gray-300 mt-4">
                {timeAgo(principal.publicada_en)}
              </time>
            )}
          </div>
        </Link>

        {/* Siguientes en lista */}
        {laterales.length > 0 && (
          <ol className="lg:col-span-2 flex flex-col divide-y divide-gray-200 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm px-5">
            {laterales.map((n) => (
              <li key={n.id}>
                <Link href={`/noticias/${n.slug}`} className="group flex gap-4 py-4">
                  <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden img-ph">
                    <Imagen src={n.imagen_url} alt="" fill sizes="112px" className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-naranja">{etiquetaCategoria(n.categoria)}</span>
                    <h3 className="font-bold text-indigo text-sm leading-snug line-clamp-3 group-hover:text-naranja transition-colors">{n.titulo}</h3>
                    {n.publicada_en && (
                      <time dateTime={n.publicada_en} className="text-xs text-gray-400">
                        {timeAgo(n.publicada_en)}
                      </time>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      {abajo.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {abajo.map((n) => (
            <NewsCard key={n.id} news={n} />
          ))}
        </div>
      )}
    </section>
  );
}
