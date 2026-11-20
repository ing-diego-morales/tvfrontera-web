// src/components/aliados/AliadoCard.tsx — tarjeta del directorio con acceso rápido de contacto
import Link from "next/link";
import { BadgeCheck, Clock, MapPin, Package, Star } from "lucide-react";
import Imagen from "@/components/Imagen";
import AccesosRapidos from "./AccesosRapidos";
import { EstadoConexion, Verificado } from "@/components/Insignias";
import type { AliadoPublico, ContactoAliado } from "@/lib/aliados";

export default function AliadoCard({ aliado, contacto = null }: { aliado: AliadoPublico; contacto?: ContactoAliado | null }) {
  const href = `/puntos-aliados/${aliado.slug}`;
  const premium = aliado.plan === "PREMIUM";
  return (
    <article
      className={`relative flex flex-col bg-white rounded-2xl p-5 shadow-sm ring-1 transition-all hover:shadow-xl hover:-translate-y-0.5 ${
        aliado.destacado ? "ring-2 ring-amarillo" : "ring-black/5"
      }`}
    >
      {(aliado.destacado || premium) && (
        <span
          className={`absolute -top-2.5 left-5 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full shadow-sm ${
            aliado.destacado ? "bg-amarillo text-indigo" : "bg-indigo text-white"
          }`}
        >
          {aliado.destacado ? <Star size={10} fill="currentColor" /> : <BadgeCheck size={11} />}
          {aliado.destacado ? "Destacado" : "Premium"}
        </span>
      )}

      <Link href={href} className="group flex items-start gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden img-ph ring-1 ring-black/5">
            <Imagen src={aliado.logo_url} alt={aliado.nombre_negocio} fill sizes="64px" className="object-cover" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5">
            <EstadoConexion enLinea={aliado.en_linea} />
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-indigo leading-snug line-clamp-2 group-hover:text-naranja transition-colors">{aliado.nombre_negocio}</h3>
          {aliado.categoria && <p className="text-xs text-naranja font-bold mt-0.5">{aliado.categoria}</p>}
          {aliado.verificado && (
            <span className="inline-block mt-1.5">
              <Verificado tamano="xs" />
            </span>
          )}
        </div>
      </Link>

      <ul className="mt-4 space-y-1.5 text-xs text-gray-500 flex-1">
        <li className="flex items-center gap-1.5">
          <MapPin size={13} className="shrink-0 text-gray-400" /> {aliado.ciudad}
        </li>
        {aliado.horario && (
          <li className="flex items-center gap-1.5">
            <Clock size={13} className="shrink-0 text-gray-400" /> <span className="line-clamp-1">{aliado.horario}</span>
          </li>
        )}
        {aliado.total_productos !== undefined && (
          <li className="flex items-center gap-1.5">
            <Package size={13} className="shrink-0 text-gray-400" /> {aliado.total_productos} producto{aliado.total_productos === 1 ? "" : "s"}
          </li>
        )}
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
        <AccesosRapidos aliado={aliado} contacto={contacto} volverA={href} />
        <Link href={href} className="block text-center text-sm font-bold text-indigo hover:text-naranja transition-colors">
          Ver tienda →
        </Link>
      </div>
    </article>
  );
}
