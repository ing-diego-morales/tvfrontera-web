// src/app/page.tsx — portada armada desde Admin > Inicio (orden, secciones visibles y bloques promocionales)
// Cada sección es un Server Component en caché; cuando el admin cambia algo se ve al instante.
import HeroSection from "@/components/HeroSection";
import LatestNews from "@/components/LatestNews";
import FeaturedVideos from "@/components/FeaturedVideos";
import Schedule from "@/components/Schedule";
import PartnersPreview from "@/components/PartnersPreview";
import ProductosDestacados from "@/components/aliados/ProductosDestacados";
import PicoYPlaca from "@/components/PicoYPlaca";
import NewsletterSignup from "@/components/NewsletterSignup";
import SocialFeed from "@/components/SocialFeed";
import HeroTienda from "@/components/inicio/HeroTienda";
import BloquePromo from "@/components/inicio/BloquePromo";
import BannerReferidos from "@/components/inicio/BannerReferidos";
import DesdeFacebook from "@/components/inicio/DesdeFacebook";
import { apiPublicaSegura } from "@/lib/api-server";
import { FEATURES } from "@/lib/features";
import { SECCIONES_POR_DEFECTO, type Seccion } from "@/lib/secciones";

function Servicio() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <PicoYPlaca />
      </div>
      <div className="md:col-span-2">
        <Schedule />
      </div>
    </section>
  );
}

const SISTEMA: Record<string, () => React.ReactNode> = {
  tienda: () => <HeroTienda />,
  vitrina: () => <ProductosDestacados />,
  aliados: () => <PartnersPreview />,
  noticias: () => <LatestNews />,
  servicio: () => <Servicio />,
  videos: () => <FeaturedVideos />,
  boletin: () => <NewsletterSignup />,
  redes: () => <SocialFeed />,
  referidos: () => <BannerReferidos />,
  facebook: () => <DesdeFacebook />,
};

export default async function Home() {
  const data = await apiPublicaSegura<{ secciones: Seccion[] }>("/api/secciones");
  const secciones = data?.secciones ?? SECCIONES_POR_DEFECTO;

  return (
    <main className="flex-1 bg-gray-50">
      {/* TV en vivo apagado hasta que la señal funcione. Para reactivarlo: NEXT_PUBLIC_TV_EN_VIVO=true en .env.local */}
      {FEATURES.tvEnVivo && <HeroSection />}

      {secciones.map((s, i) => {
        const contenido = s.tipo === "PROMO" ? (s.datos ? <BloquePromo titulo={s.titulo} datos={s.datos} /> : null) : s.clave && SISTEMA[s.clave] ? SISTEMA[s.clave]() : null;
        if (!contenido) return null;
        // Las dos primeras ya se ven al cargar: sin animación (no "parpadean")
        return i < 2 ? <div key={s.id}>{contenido}</div> : <div key={s.id} data-revelar="">{contenido}</div>;
      })}
    </main>
  );
}
