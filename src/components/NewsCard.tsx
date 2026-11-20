// src/components/NewsCard.tsx
import Link from "next/link";
import { Play } from "lucide-react";
import Imagen from "./Imagen";
import { timeAgo } from "@/lib/date-utils";
import { etiquetaCategoria, type Noticia } from "@/lib/news";

export default function NewsCard({ news }: { news: Noticia }) {
  return (
    <Link
      href={`/noticias/${news.slug}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 hover:shadow-xl hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden img-ph">
        <Imagen
          src={news.imagen_url}
          alt={news.titulo}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-naranja text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded">
          {etiquetaCategoria(news.categoria)}
        </span>
        {news.video_url && (
          <span className="absolute bottom-3 right-3 bg-black/70 text-white rounded-full p-2" aria-label="Incluye video">
            <Play size={14} fill="white" />
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-indigo leading-snug line-clamp-3 group-hover:text-naranja transition-colors">{news.titulo}</h3>
        {news.resumen && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{news.resumen}</p>}
        {news.publicada_en && (
          <time dateTime={news.publicada_en} className="mt-auto pt-3 text-xs text-gray-400">
            {timeAgo(news.publicada_en)}
          </time>
        )}
      </div>
    </Link>
  );
}
