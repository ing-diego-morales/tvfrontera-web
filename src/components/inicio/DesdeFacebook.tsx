// src/components/inicio/DesdeFacebook.tsx — publicaciones de la página de Facebook EN VIVO (sin configurar nada)
// Usa el visor oficial de Facebook ("Page Plugin"). Se carga solo cuando el visitante llega a esta parte (lazy),
// así no hace lenta la portada. Para que además se conviertan en noticias del sitio: FB_PAGE_TOKEN en la API.
import { FaFacebook } from "react-icons/fa";
import { SITIO } from "@/lib/sitio";

export default function DesdeFacebook() {
  const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(SITIO.redes.facebook)}&tabs=timeline&width=500&height=640&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false&locale=es_LA`;
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2 lg:sticky lg:top-[calc(var(--alto-header)+1.5rem)]">
          <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#1877F2]">
            <FaFacebook size={16} /> En vivo desde Facebook
          </p>
          <h2 className="text-3xl font-extrabold text-indigo mt-3 leading-tight">Lo último de TV Frontera en Facebook</h2>
          <p className="text-gray-600 mt-3">Coberturas, transmisiones en vivo y novedades del canal apenas se publican.</p>
          <a
            href={SITIO.redes.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 bg-[#1877F2] hover:bg-[#0d5bbf] text-white font-bold px-6 py-3 rounded-full shadow"
          >
            <FaFacebook size={18} /> Seguir la página
          </a>
        </div>
        <div className="lg:col-span-3 flex justify-center">
          <div className="w-full max-w-[500px] rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-white">
            <iframe
              src={src}
              title="Publicaciones de TV Frontera en Facebook"
              width="500"
              height="640"
              loading="lazy"
              className="w-full block"
              style={{ border: 0 }}
              allow="encrypted-media; picture-in-picture; web-share"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
