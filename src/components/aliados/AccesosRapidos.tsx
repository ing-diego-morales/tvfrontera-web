// src/components/aliados/AccesosRapidos.tsx — botones de contacto inmediato de un Punto Aliado
// Presentacional (sin estado): sirve en tarjetas y en la tienda.
// Sin sesión: WhatsApp/Llamar/Cómo llegar llevan al login y regresan aquí (los datos no viajan al navegador).
import Link from "next/link";
import { Lock, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { waLink } from "@/lib/format";
import { instagramLink, mapaLink, telLink, type AliadoPublico, type ContactoAliado } from "@/lib/aliados";

type Props = {
  aliado: AliadoPublico;
  contacto: ContactoAliado | null;
  volverA: string;
  variante?: "tarjeta" | "tienda";
};

export default function AccesosRapidos({ aliado, contacto, volverA, variante = "tarjeta" }: Props) {
  const login = `/login?next=${encodeURIComponent(volverA)}`;
  const grande = variante === "tienda";
  const base = grande
    ? "flex items-center justify-center gap-2 rounded-lg font-bold text-sm py-3 px-4 transition-colors"
    : "flex items-center justify-center rounded-lg h-9 transition-colors";
  const msg = `Hola ${aliado.nombre_negocio}, te encontré en Televentas Fest.`;

  const botones = contacto
    ? [
        contacto.whatsapp && { href: waLink(contacto.whatsapp, msg), label: "WhatsApp", icon: FaWhatsapp, clase: "bg-[#25D366] hover:bg-[#1ebe5a] text-white", externo: true },
        (contacto.telefono || contacto.whatsapp) && {
          href: telLink((contacto.telefono || contacto.whatsapp)!),
          label: "Llamar",
          icon: Phone,
          clase: "bg-indigo hover:bg-indigo-oscuro text-white",
          externo: false,
        },
        contacto.direccion && { href: mapaLink(contacto.direccion, aliado.ciudad), label: "Cómo llegar", icon: MapPin, clase: "bg-naranja hover:bg-naranja-oscuro text-white", externo: true },
      ].filter(Boolean)
    : [
        { href: login, label: "WhatsApp", icon: FaWhatsapp, clase: "bg-gray-100 hover:bg-gray-200 text-gray-500", externo: false },
        { href: login, label: "Llamar", icon: Phone, clase: "bg-gray-100 hover:bg-gray-200 text-gray-500", externo: false },
        { href: login, label: "Cómo llegar", icon: MapPin, clase: "bg-gray-100 hover:bg-gray-200 text-gray-500", externo: false },
      ];

  const redes = [
    aliado.instagram && { href: instagramLink(aliado.instagram), label: "Instagram", icon: FaInstagram },
    aliado.facebook && { href: aliado.facebook, label: "Facebook", icon: FaFacebook },
  ].filter(Boolean) as { href: string; label: string; icon: typeof FaInstagram }[];

  return (
    <div className="space-y-2">
      <div className={`grid gap-2 ${grande ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-3"}`}>
        {(botones as { href: string; label: string; icon: typeof Phone; clase: string; externo: boolean }[]).map(({ href, label, icon: Icon, clase, externo }) => (
          <a
            key={label}
            href={href}
            {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            aria-label={contacto ? `${label} a ${aliado.nombre_negocio}` : `Inicia sesión para ${label.toLowerCase()}`}
            title={contacto ? label : "Inicia sesión para ver el contacto"}
            className={`${base} ${clase}`}
          >
            <Icon size={grande ? 18 : 16} />
            {grande && <span>{label}</span>}
          </a>
        ))}
      </div>

      {!contacto && (
        <p className={`flex items-center gap-1.5 text-gray-500 ${grande ? "text-sm" : "text-[11px] justify-center"}`}>
          <Lock size={grande ? 14 : 11} />
          <Link href={login} className="hover:text-indigo underline-offset-2 hover:underline">
            Inicia sesión gratis para contactar
          </Link>
        </p>
      )}

      {grande && redes.length > 0 && (
        <div className="flex gap-2 pt-1">
          {redes.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-indigo border border-gray-200 hover:border-indigo rounded-lg px-3 py-2 transition-colors"
            >
              <Icon size={16} /> {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
