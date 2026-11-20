// src/components/aliados/ProductoCard.tsx — producto del catálogo general (lleva a la tienda del aliado)
import Link from "next/link";
import { Star } from "lucide-react";
import Imagen from "@/components/Imagen";
import { formatCOP } from "@/lib/format";
import type { Producto } from "@/lib/aliados";

export default function ProductoCard({ producto: p }: { producto: Producto }) {
  const href = `/puntos-aliados/${p.socio_slug}`;
  return (
    <Link href={href} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 hover:shadow-xl hover:-translate-y-0.5 transition-all">
      <div className="relative aspect-square img-ph overflow-hidden">
        <Imagen src={p.imagen_url} alt={p.nombre} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
        {(p.destacado || p.socio_destacado) && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-amarillo text-indigo text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full shadow">
            <Star size={10} fill="currentColor" /> {p.socio_destacado ? "Destacado" : "Recomendado"}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 line-clamp-1">{p.vendedor}</p>
        <h3 className="font-bold text-indigo leading-snug line-clamp-2 mt-1 group-hover:text-naranja transition-colors">{p.nombre}</h3>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <p className="text-lg font-extrabold text-naranja">{formatCOP(p.precio)}</p>
          {p.ultimas && <span className="text-[10px] font-bold uppercase text-orange-600">¡Últimas!</span>}
        </div>
      </div>
    </Link>
  );
}
