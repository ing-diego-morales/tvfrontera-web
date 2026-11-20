// src/components/referidos/PanelReferidos.tsx — "Mi programa de referidos": enlace, compartir, progreso y premios
"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Gift, Share2, Trophy, Users } from "lucide-react";
import { FaFacebook, FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/components/AuthProvider";
import { Aviso, Cargando, Etiqueta, Tarjeta } from "@/components/ui";
import { Estadistica } from "@/components/panel/PanelUI";
import { formatDate } from "@/lib/date-utils";
import { useApi } from "@/lib/useApi";
import type { MisReferidos, Programa } from "@/lib/referidos";
import Progreso from "./Progreso";

const ESTADO = {
  VALIDO: { label: "Cuenta ✓", clase: "bg-green-100 text-green-800" },
  PENDIENTE: { label: "Falta confirmar", clase: "bg-yellow-100 text-yellow-800" },
  RECHAZADO: { label: "No válido", clase: "bg-gray-200 text-gray-600" },
} as const;

export default function PanelReferidos() {
  const { user } = useAuth();
  const mio = useApi<MisReferidos>(user ? "/api/referidos/mio" : null);
  const programa = useApi<Programa>("/api/referidos/programa");
  const [copiado, setCopiado] = useState(false);

  if (!user) {
    return (
      <Tarjeta>
        <div className="text-center py-6">
          <Gift className="mx-auto text-naranja mb-3" size={36} />
          <p className="font-bold text-indigo text-lg">Crea tu cuenta gratis y empieza a ganar</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">Recibe tu enlace personal, compártelo y gana premios por cada amigo que se registre.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/registro?next=/referidos" className="bg-naranja hover:bg-naranja-oscuro text-white font-bold px-6 py-3 rounded-full">
              Crear mi cuenta
            </Link>
            <Link href="/login?next=/referidos" className="border border-gray-300 text-indigo font-bold px-6 py-3 rounded-full hover:bg-gray-50">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </Tarjeta>
    );
  }
  if (user.rol === "ADMIN") return <Aviso tipo="info">Las cuentas de administrador no participan en el programa de referidos. Adminístralo en Administración → Referidos.</Aviso>;
  if (mio.cargando || programa.cargando) return <Cargando />;
  if (!mio.data) return <Aviso>{mio.error ?? "No se pudo cargar tu programa de referidos"}</Aviso>;

  const d = mio.data;
  const p = programa.data;
  const mensaje = `¡Únete a Televentas Fest, la gran tienda virtual de TV Frontera! Compra fácil y gana premios. Regístrate con mi enlace: ${d.enlace}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(d.enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };
  const compartirNativo = async () => {
    try {
      await navigator.share({ title: "Televentas Fest", text: mensaje, url: d.enlace });
    } catch {
      /* el usuario canceló */
    }
  };

  return (
    <div className="space-y-6">
      {!user.email_verificado && (
        <Aviso tipo="alerta">Confirma tu correo para recibir tus premios. Revisa tu bandeja de entrada.</Aviso>
      )}

      {/* Enlace para compartir */}
      <section className="fondo-marca text-white rounded-2xl p-6 md:p-8 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-wider text-white/85">Tu enlace personal</p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input suppressHydrationWarning readOnly value={d.enlace} aria-label="Tu enlace de invitación" onFocus={(e) => e.target.select()} className="flex-1 rounded-xl bg-white text-indigo font-semibold px-4 py-3 text-sm" />
          <button onClick={copiar} className="flex items-center justify-center gap-2 bg-indigo hover:bg-indigo-oscuro text-white font-bold px-5 py-3 rounded-xl">
            {copiado ? <Check size={18} /> : <Copy size={18} />} {copiado ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
        <p className="text-xs text-white/85 mt-2">
          Código: <b className="tracking-widest">{d.codigo}</b> · {d.requisito_texto}
        </p>
        <div className="flex flex-wrap gap-2 mt-5">
          <a href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] font-bold px-4 py-2.5 rounded-full">
            <FaWhatsapp size={18} /> WhatsApp
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(d.enlace)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#0d5bbf] font-bold px-4 py-2.5 rounded-full">
            <FaFacebook size={18} /> Facebook
          </a>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button onClick={compartirNativo} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 font-bold px-4 py-2.5 rounded-full">
              <Share2 size={18} /> Más opciones
            </button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Estadistica label="Referidos que cuentan" valor={d.total_validos} icon={Users} tono="verde" />
        <Estadistica label="Hoy" valor={d.hoy_validos} icon={Gift} tono="amarillo" />
        <Estadistica label="Por confirmar" valor={d.pendientes} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {p?.reto_hoy?.activo && (
          <Tarjeta titulo="Reto de hoy">
            <p className="font-bold text-indigo">{p.reto_hoy.premio}</p>
            <p className="text-sm text-gray-500 mb-3">
              Los primeros {p.reto_hoy.ganadores} en conseguir {p.reto_hoy.referidos_necesarios} referidos hoy ganan. Quedan{" "}
              <b>{Math.max(0, p.reto_hoy.ganadores - (p.reto_hoy.ganadores_actuales ?? 0))}</b> cupos.
            </p>
            <Progreso actual={d.hoy_validos} meta={p.reto_hoy.referidos_necesarios} />
          </Tarjeta>
        )}
        {!!p?.metas.length && (
          <Tarjeta titulo="Metas">
            <ul className="space-y-4">
              {p.metas.map((m) => (
                <li key={m.id}>
                  <p className="text-sm font-bold text-indigo flex items-center justify-between gap-2">
                    {m.nombre}
                    {m.agotado && <Etiqueta clase="bg-gray-200 text-gray-600">Agotado</Etiqueta>}
                  </p>
                  <Progreso actual={d.total_validos} meta={m.referidos_necesarios} />
                </li>
              ))}
            </ul>
          </Tarjeta>
        )}
      </div>

      {d.premios.length > 0 && (
        <Tarjeta titulo="Mis premios">
          <ul className="divide-y divide-gray-100">
            {d.premios.map((g) => (
              <li key={g.id} className="flex items-center gap-3 py-3">
                <Trophy className="text-amarillo shrink-0" size={22} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-indigo">{g.premio}</p>
                  <p className="text-xs text-gray-500">
                    {g.tipo === "RETO" ? `Reto del ${g.fecha_reto}${g.posicion ? ` · puesto ${g.posicion}` : ""}` : "Meta alcanzada"} · {formatDate(g.created_at)}
                  </p>
                </div>
                <Etiqueta clase={g.estado === "ENTREGADO" ? "bg-green-100 text-green-800" : g.estado === "ANULADO" ? "bg-gray-200 text-gray-600" : "bg-amarillo/30 text-indigo"}>
                  {g.estado === "ENTREGADO" ? "Entregado" : g.estado === "ANULADO" ? "Anulado" : "Te contactaremos"}
                </Etiqueta>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <Tarjeta titulo={`Mis invitados (${d.referidos.length})`}>
        {!d.referidos.length ? (
          <p className="text-sm text-gray-500">Aún no has invitado a nadie. ¡Comparte tu enlace!</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {d.referidos.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-medium text-indigo">{r.nombre}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatDate(r.fecha)}</span>
                  <Etiqueta clase={r.en_revision ? "bg-blue-50 text-indigo" : ESTADO[r.estado].clase}>{r.en_revision ? "En revisión" : ESTADO[r.estado].label}</Etiqueta>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
