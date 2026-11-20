// src/app/referidos/page.tsx — "Refiere y gana": programa público + panel personal
import type { Metadata } from "next";
import { CalendarDays, CheckCircle2, Gift, Medal, Share2, ShieldCheck, Trophy, UserPlus } from "lucide-react";
import { apiPublicaSegura } from "@/lib/api-server";
import { DIAS_SEMANA, fechaCorta, type Programa } from "@/lib/referidos";
import PanelReferidos from "@/components/referidos/PanelReferidos";
import Imagen from "@/components/Imagen";
import { TituloSeccion } from "@/components/ui";

export const metadata: Metadata = {
  title: "Refiere y gana",
  description: "Invita a tus amigos a Televentas Fest y gana premios todos los días. Retos diarios, metas y ranking semanal.",
  alternates: { canonical: "/referidos" },
};

const PASOS = [
  { icon: Share2, titulo: "Comparte tu enlace", texto: "Crea tu cuenta y envía tu enlace personal por WhatsApp o redes." },
  { icon: UserPlus, titulo: "Tu amigo se registra", texto: "Con tu enlace, registrando su cédula y confirmando su correo." },
  { icon: Trophy, titulo: "Ganas premios", texto: "Completa el reto del día o alcanza una meta y te contactamos." },
];

export default async function ReferidosPage() {
  const p = await apiPublicaSegura<Programa>("/api/referidos/programa");
  const reto = p?.reto_hoy;

  return (
    <main className="flex-1 bg-gray-50">
      <section className="fondo-marca text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3">
            <p className="inline-block bg-indigo/90 text-xs font-extrabold uppercase tracking-[0.2em] px-3 py-1 rounded-full">Programa de referidos</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight drop-shadow-[0_2px_0_rgba(43,47,138,0.35)]">
              Refiere y gana
              <span className="block text-amarillo">premios todos los días</span>
            </h1>
            <p className="text-white/90 text-lg mt-4 max-w-xl">Invita a tus amigos a Televentas Fest. Cada amigo que se registre y se verifique te acerca a un premio.</p>
          </div>
          {reto?.activo && (
            <div className="md:col-span-2 bg-white text-indigo rounded-2xl p-6 shadow-2xl">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-naranja">
                <CalendarDays size={14} /> Reto de hoy · {fechaCorta(reto.fecha)}
              </p>
              <p className="text-2xl font-extrabold mt-2">{reto.premio}</p>
              {reto.descripcion && <p className="text-sm text-gray-500 mt-1">{reto.descripcion}</p>}
              <p className="mt-4 text-sm">
                Los primeros <b>{reto.ganadores}</b> en conseguir <b>{reto.referidos_necesarios} referidos hoy</b> ganan.
              </p>
              <p className="mt-2 inline-block bg-naranja-claro text-naranja text-sm font-bold px-3 py-1 rounded-full">
                {Math.max(0, reto.ganadores - (reto.ganadores_actuales ?? 0))} cupos disponibles
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {/* Cómo funciona */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PASOS.map(({ icon: Icon, titulo, texto }, i) => (
            <div key={titulo} className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-naranja text-white flex items-center justify-center">
                  <Icon size={22} />
                </span>
                <span className="text-4xl font-extrabold text-naranja/20">{i + 1}</span>
              </div>
              <h2 className="font-extrabold text-indigo mt-4">{titulo}</h2>
              <p className="text-sm text-gray-500 mt-1">{texto}</p>
            </div>
          ))}
        </section>

        {/* Panel personal (con sesión) o invitación a registrarse */}
        <section id="mi-programa">
          <TituloSeccion titulo="Mi programa" subtitulo="Tu enlace, tus invitados y tus premios" />
          <PanelReferidos />
        </section>

        {p && (
          <>
            {/* Semana */}
            <section>
              <TituloSeccion titulo="Premios de la semana" subtitulo="Cada día hay un reto diferente" />
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {p.semana.map((d) => (
                  <div
                    key={d.fecha}
                    className={`rounded-2xl p-4 ${d.es_hoy ? "bg-naranja text-white shadow-lg ring-4 ring-amarillo" : "bg-white ring-1 ring-black/5"} ${d.activo ? "" : "opacity-50"}`}
                  >
                    <p className={`text-xs font-extrabold uppercase ${d.es_hoy ? "text-amarillo" : "text-naranja"}`}>
                      {d.es_hoy ? "Hoy" : DIAS_SEMANA[Number(new Date(`${d.fecha}T12:00:00`).getDay() || 7)]}
                    </p>
                    <p className={`text-sm font-bold mt-1 leading-snug ${d.es_hoy ? "" : "text-indigo"}`}>{d.activo ? d.premio : "Sin reto"}</p>
                    {d.activo && (
                      <p className={`text-[11px] mt-2 ${d.es_hoy ? "text-white/85" : "text-gray-500"}`}>
                        {d.referidos_necesarios} referidos · {d.ganadores} ganadores
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Metas */}
            {p.metas.length > 0 && (
              <section>
                <TituloSeccion titulo="Metas" subtitulo="Premios por tus referidos acumulados" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {p.metas.map((m) => (
                    <div key={m.id} className={`bg-white rounded-2xl ring-1 ring-black/5 shadow-sm overflow-hidden ${m.agotado ? "opacity-60" : ""}`}>
                      {m.imagen_url && (
                        <div className="relative aspect-video img-ph">
                          <Imagen src={m.imagen_url} alt={m.nombre} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                        </div>
                      )}
                      <div className="p-5">
                        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-naranja">
                          <Medal size={14} /> {m.referidos_necesarios} referidos
                        </p>
                        <h3 className="font-extrabold text-indigo text-lg mt-1">{m.nombre}</h3>
                        {m.descripcion && <p className="text-sm text-gray-500 mt-1">{m.descripcion}</p>}
                        <p className="text-xs text-gray-400 mt-3">
                          {m.agotado ? "Premios agotados" : m.cupo ? `Quedan ${m.cupo - m.ganadores} de ${m.cupo}` : "Sin límite de ganadores"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ranking */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <TituloSeccion titulo="Ranking de la semana" />
                {p.ranking.length ? (
                  <ol className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm divide-y divide-gray-100">
                    {p.ranking.map((r, i) => (
                      <li key={i} className="flex items-center gap-4 px-5 py-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${i === 0 ? "bg-amarillo text-indigo" : i < 3 ? "bg-naranja text-white" : "bg-gray-100 text-gray-500"}`}>
                          {i + 1}
                        </span>
                        <span className="flex-1 font-semibold text-indigo">{r.nombre}</span>
                        <span className="text-sm font-bold text-naranja">{r.referidos}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-gray-500 text-sm">Esta semana todavía no hay referidos. ¡Sé el primero!</p>
                )}
              </div>
              <div>
                <TituloSeccion titulo="Reglas claras" />
                <ul className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-green-600 shrink-0" /> {p.requisito_texto}
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck size={18} className="text-green-600 shrink-0" /> Una persona = una cuenta: la cédula no se puede repetir. Las cuentas falsas o duplicadas se anulan.
                  </li>
                  <li className="flex gap-2">
                    <Gift size={18} className="text-green-600 shrink-0" /> Los premios del reto diario son para los primeros en completarlo ese día (hora de Colombia).
                  </li>
                  <li className="flex gap-2">
                    <Trophy size={18} className="text-green-600 shrink-0" /> TV Frontera revisa los referidos y entrega los premios; te contactamos por tu correo o teléfono.
                  </li>
                </ul>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
