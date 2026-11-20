// src/components/PartnersPreview.tsx — aliados en el inicio (caché 5 min).
// Los primeros 4 según el posicionamiento: impulso > Premium > prioridad > rotación diaria.
import Link from "next/link";
import { Store, TrendingUp, Users } from "lucide-react";
import { apiPublicaSegura } from "@/lib/api-server";
import type { ListaAliados } from "@/lib/aliados";
import AliadoCard from "./aliados/AliadoCard";
import { TituloSeccion } from "./ui";

export default async function PartnersPreview() {
  const data = await apiPublicaSegura<ListaAliados>("/api/socios?limit=4", 300);
  const socios = data?.socios ?? [];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <TituloSeccion titulo="Puntos Aliados" subtitulo="Negocios de la región que confían en Televentas Fest" href="/puntos-aliados" enlace="Ver directorio" />

      {socios.length > 0 && (
        <div data-revelar-hijos="" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-7 mb-8">
          {socios.map((s) => (
            <AliadoCard key={s.id} aliado={s} />
          ))}
        </div>
      )}

      {/* Llamado comercial */}
      <div className="relative overflow-hidden rounded-2xl bg-indigo text-white p-8 md:p-10">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-amarillo/15 blur-2xl" aria-hidden />
        <div className="relative grid md:grid-cols-5 gap-6 items-center">
          <div className="md:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amarillo">Para negocios</p>
            <h3 className="text-2xl md:text-3xl font-extrabold mt-2">Haz crecer tu negocio con Televentas Fest</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Users size={16} className="text-amarillo" /> Tu tienda frente a toda la audiencia del canal
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp size={16} className="text-amarillo" /> Recibe pedidos y mensajes por WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <Store size={16} className="text-amarillo" /> Plan Premium y espacios destacados para aparecer primero
              </li>
            </ul>
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row md:flex-col gap-3 md:items-end">
            <Link href="/registro?tipo=aliado" className="text-center bg-naranja hover:bg-naranja-oscuro text-white font-bold px-6 py-3 rounded-full transition-colors">
              Quiero ser Punto Aliado
            </Link>
            <Link href="/contacto" className="text-center border border-white/30 hover:bg-white/10 font-bold px-6 py-3 rounded-full transition-colors">
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
