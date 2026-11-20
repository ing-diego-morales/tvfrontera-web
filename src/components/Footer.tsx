// src/components/Footer.tsx — pie de página corporativo
import Logo from "./Logo";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { MapPin, Mail, Phone, Radio } from "lucide-react";
import { categories } from "@/lib/categories";
import { SITIO } from "@/lib/sitio";

const columnas = [
  {
    titulo: "Noticias",
    enlaces: [{ href: "/noticias", label: "Últimas noticias" }, ...categories.slice(0, 5).map((c) => ({ href: `/noticias?categoria=${c.slug}`, label: c.label }))],
  },
  {
    titulo: "Puntos Aliados",
    enlaces: [
      { href: "/puntos-aliados", label: "Directorio de aliados" },
      { href: "/productos", label: "Productos" },
      { href: "/registro?tipo=aliado", label: "Quiero ser Punto Aliado" },
      { href: "/login", label: "Ingreso de aliados" },
    ],
  },
  {
    titulo: "TV Frontera",
    enlaces: [
      { href: "/nosotros", label: "Quiénes somos" },
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
      { href: "/contacto", label: "Contacto y publicidad" },
      { href: "/privacidad", label: "Política de privacidad" },
      { href: "/terminos", label: "Términos y condiciones" },
    ],
  },
];

const redes = [
  { href: SITIO.redes.facebook, icon: FaFacebook, label: "Facebook" },
  { href: SITIO.redes.instagram, icon: FaInstagram, label: "Instagram" },
  { href: SITIO.redes.tiktok, icon: FaTiktok, label: "TikTok" },
  { href: `https://wa.me/${SITIO.whatsapp}`, icon: FaWhatsapp, label: "WhatsApp" },
];

export default function Footer() {
  return (
    <footer className="bg-indigo-oscuro text-gray-300 mt-auto">
      {/* Franja de marca */}
      <div className="h-1.5 bg-gradient-to-r from-rojo via-amarillo to-naranja" />

      <div className="max-w-6xl mx-auto px-4 pt-14 pb-10 grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">
        <div className="col-span-2 md:col-span-3">
          <Link href="/" className="flex items-center gap-3">
            <Logo alto={58} />
          </Link>
          <p className="text-sm mt-4 leading-relaxed max-w-xs">
            {SITIO.eslogan}. {SITIO.descripcion} Un servicio de {SITIO.empresa}, canal de televisión de Cúcuta.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-amarillo mt-0.5 shrink-0" /> {SITIO.ciudad}
            </li>
            <li>
              <a href={`https://wa.me/${SITIO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white">
                <Phone size={16} className="text-amarillo shrink-0" /> {SITIO.telefono}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITIO.correo}`} className="flex items-center gap-2.5 hover:text-white">
                <Mail size={16} className="text-amarillo shrink-0" /> {SITIO.correo}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Radio size={16} className="text-amarillo shrink-0" /> Transmisión en vivo 24/7
            </li>
          </ul>
        </div>

        {columnas.map((col) => (
          <nav key={col.titulo} className="md:col-span-2" aria-label={col.titulo}>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{col.titulo}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.enlaces.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-2 md:col-span-3">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Síguenos</h3>
          <div className="flex flex-wrap gap-2">
            {redes.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} de TV Frontera`}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-naranja text-white flex items-center justify-center transition-colors"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
          <Link
            href="/registro?tipo=aliado"
            className="inline-block whitespace-nowrap mt-6 text-sm font-bold bg-amarillo hover:bg-amarillo-oscuro text-indigo px-4 py-2 rounded-full transition-colors"
          >
            Anúnciate con nosotros
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} {SITIO.nombre} · {SITIO.empresa}. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-white">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-white">
              Términos
            </Link>
            <Link href="/contacto" className="hover:text-white">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
