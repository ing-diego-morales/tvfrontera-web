// src/components/FeaturedVideos.tsx — videos REALES: las últimas noticias con video de YouTube/Vimeo
// Antes eran datos de prueba (mock-videos.ts). Si no hay noticias con video, la sección no aparece.
import Link from "next/link";
import { Play } from "lucide-react";
import Imagen from "./Imagen";
import { TituloSeccion } from "./ui";
import { apiPublicaSegura } from "@/lib/api-server";
import { youtubeId, type ListaNoticias } from "@/lib/news";

export default async function FeaturedVideos() {
  const data = await apiPublicaSegura<ListaNoticias>("/api/noticias?con_video=1&limit=4");
  const videos = data?.noticias ?? [];
  if (!videos.length) return null;

  return (
    <section className="bg-indigo-oscuro py-14">
      <div className="max-w-6xl mx-auto px-4">
        <TituloSeccion titulo="Videos" subtitulo="Nuestras coberturas y programas" href="/noticias" enlace="Ver más" claro />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {videos.map((v) => {
            const id = youtubeId(v.video_url);
            const miniatura = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : v.imagen_url;
            return (
              <Link key={v.id} href={`/noticias/${v.slug}`} className="group">
                <div className="relative aspect-video rounded-xl overflow-hidden img-ph ring-1 ring-white/10">
                  <Imagen src={miniatura} alt={v.titulo} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-naranja flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={20} fill="white" className="text-white ml-0.5" />
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mt-3 line-clamp-2 group-hover:text-amarillo transition-colors">{v.titulo}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
