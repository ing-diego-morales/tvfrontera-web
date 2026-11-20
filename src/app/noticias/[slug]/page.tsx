// src/app/noticias/[slug]/page.tsx — detalle desde /api/noticias/:slug (caché 60 s)
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaFacebook, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { formatDate } from "@/lib/date-utils";
import { apiPublica } from "@/lib/api-server";
import { esOptimizable, imagenSegura } from "@/lib/images";
import { etiquetaCategoria, videoEmbed, type ListaNoticias, type Noticia } from "@/lib/news";
import NewsRating from "@/components/NewsRating";
import { SITIO as SITIO_DATOS } from "@/lib/sitio";

const SITIO = SITIO_DATOS.url;

// Misma petición en generateMetadata y en la página: Next la hace una sola vez
const obtener = (slug: string) => apiPublica<{ noticia: Noticia }>(`/api/noticias/${encodeURIComponent(slug)}`);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await obtener(slug).catch(() => null);
  if (!data) return { title: "Noticia no encontrada" };
  const n = data.noticia;
  const img = imagenSegura(n.imagen_url);
  return {
    title: n.titulo,
    description: n.resumen ?? undefined,
    alternates: { canonical: `/noticias/${n.slug}` },
    openGraph: {
      type: "article",
      title: n.titulo,
      description: n.resumen ?? undefined,
      url: `/noticias/${n.slug}`,
      images: [{ url: img }],
      publishedTime: n.publicada_en ?? undefined,
      modifiedTime: n.updated_at,
    },
    twitter: { card: "summary_large_image", title: n.titulo, description: n.resumen ?? undefined, images: [img] },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await obtener(slug);
  if (!data) notFound();
  const news = data.noticia;

  const relacionadas = await apiPublica<ListaNoticias>(`/api/noticias?categoria=${news.categoria}&limit=4`).catch(() => null);
  const related = (relacionadas?.noticias ?? []).filter((n) => n.slug !== news.slug).slice(0, 3);

  const img = imagenSegura(news.imagen_url);
  const video = videoEmbed(news.video_url);
  const url = `${SITIO}/noticias/${news.slug}`;
  const autor = news.autor ?? "Redacción TV Frontera";

  // Datos estructurados para Google Noticias. "<" se escapa para que el JSON no pueda cerrar el <script>.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.titulo,
    description: news.resumen ?? undefined,
    image: [img.startsWith("/") ? `${SITIO}${img}` : img],
    datePublished: news.publicada_en ?? undefined,
    dateModified: news.updated_at,
    author: [{ "@type": "Organization", name: autor }],
    publisher: { "@type": "NewsMediaOrganization", name: "TV Frontera", logo: { "@type": "ImageObject", url: `${SITIO}/logo.png` } },
    mainEntityOfPage: url,
  }).replace(/</g, "\\u003c");

  const compartir = [
    { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, icon: FaFacebook, label: "Facebook" },
    { href: `https://wa.me/?text=${encodeURIComponent(`${news.titulo} ${url}`)}`, icon: FaWhatsapp, label: "WhatsApp" },
    { href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(news.titulo)}`, icon: FaXTwitter, label: "X" },
  ];

  return (
    <main className="flex-1 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="relative h-72 md:h-96 w-full bg-gray-100">
        <Image src={img} alt={news.titulo} fill sizes="100vw" unoptimized={!esOptimizable(img)} className="object-cover" loading="eager" fetchPriority="high" />
      </div>

      <article className="max-w-3xl mx-auto px-4 py-10">
        <nav aria-label="Ruta" className="text-xs text-gray-400 mb-3">
          <Link href="/noticias" className="hover:text-indigo">Noticias</Link> /{" "}
          <Link href={`/noticias?categoria=${news.categoria}`} className="hover:text-indigo">
            {etiquetaCategoria(news.categoria)}
          </Link>
        </nav>
        <span className="text-xs font-bold text-naranja uppercase">{etiquetaCategoria(news.categoria)}</span>
        <h1 className="text-3xl font-extrabold text-indigo mt-2 mb-4">{news.titulo}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Por {autor}
          {news.publicada_en && (
            <>
              {" · "}
              <time dateTime={news.publicada_en}>{formatDate(news.publicada_en)}</time>
            </>
          )}
        </p>
        {news.resumen && <p className="text-lg text-gray-600 font-medium mb-6">{news.resumen}</p>}
        {video && (
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-6 bg-black">
            <iframe
              src={video}
              title={news.titulo}
              className="w-full h-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}
        {/* Texto plano: React lo escapa, así que ningún HTML/script del contenido se ejecuta */}
        <div className="max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{news.contenido}</div>

        {news.fuente === "FACEBOOK" && news.fuente_url && (
          <a href={news.fuente_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-[#1877F2] hover:underline">
            <FaFacebook size={16} /> Ver la publicación original en Facebook
          </a>
        )}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
          <span className="text-sm font-bold text-gray-600">Compartir:</span>
          {compartir.map(({ href, icon: Icon, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Compartir en ${label}`} className="text-indigo hover:text-naranja transition-colors">
              <Icon size={20} />
            </a>
          ))}
        </div>
        <NewsRating slug={news.slug} />
      </article>

      {related.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-14">
          <h2 className="text-xl font-bold text-indigo mb-4">Te puede interesar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((r) => {
              const rImg = imagenSegura(r.imagen_url);
              return (
                <Link key={r.slug} href={`/noticias/${r.slug}`} className="block group">
                  <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2 bg-gray-100">
                    <Image src={rImg} alt={r.titulo} fill unoptimized={!esOptimizable(rImg)} className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <p className="text-sm font-bold text-indigo line-clamp-2">{r.titulo}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
