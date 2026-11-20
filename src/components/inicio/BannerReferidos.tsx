// src/components/inicio/BannerReferidos.tsx — sección de la portada "Refiere y gana" (Admin > Portada)
import Link from "next/link";
import { Gift, Trophy, Users } from "lucide-react";
import { apiPublicaSegura } from "@/lib/api-server";
import type { Programa } from "@/lib/referidos";

export default async function BannerReferidos() {
  const p = await apiPublicaSegura<Programa>("/api/referidos/programa");
  if (!p?.activo) return null;
  const reto = p.reto_hoy?.activo ? p.reto_hoy : null;
  const cupos = reto ? Math.max(0, reto.ganadores - (reto.ganadores_actuales ?? 0)) : 0;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-indigo text-white shadow-xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-naranja/40 blur-3xl" aria-hidden />
        <div className="relative grid md:grid-cols-5 gap-6 items-center p-8 md:p-10">
          <div className="md:col-span-3">
            <p className="inline-flex items-center gap-2 bg-amarillo text-indigo text-xs font-extrabold uppercase tracking-[0.18em] px-3 py-1 rounded-full">
              <Gift size={14} /> Refiere y gana
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-4 leading-tight">Invita a tus amigos y gana premios todos los días</h2>
            <p className="text-white/80 mt-3">Comparte tu enlace. Cada amigo que se registre y se verifique suma para el reto del día y para las metas.</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/referidos#mi-programa" className="bg-naranja hover:bg-naranja-oscuro font-extrabold px-6 py-3 rounded-full shadow-lg">
                Obtener mi enlace
              </Link>
              <Link href="/referidos" className="bg-white/10 hover:bg-white/20 font-bold px-6 py-3 rounded-full">
                Ver premios
              </Link>
            </div>
          </div>
          {reto && (
            <div className="md:col-span-2 bg-white text-indigo rounded-2xl p-6">
              <p className="text-xs font-extrabold uppercase tracking-wider text-naranja">Reto de hoy</p>
              <p className="text-xl font-extrabold mt-1">{reto.premio}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Users size={16} className="text-naranja" /> {reto.referidos_necesarios} referidos hoy
                </li>
                <li className="flex items-center gap-2">
                  <Trophy size={16} className="text-naranja" /> {cupos > 0 ? `${cupos} cupos disponibles` : "Cupos agotados: ¡mañana hay otro reto!"}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
