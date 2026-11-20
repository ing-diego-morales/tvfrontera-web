// src/components/radio/ReproductorRadio.tsx — interfaz del reproductor (panel flotante y página /radio)
// Pestañas: "En vivo" (play, volumen, sonando ahora, últimas canciones) y "Pedir canción" (llega por WhatsApp).
"use client";

import { useEffect, useState } from "react";
import { Loader2, Music2, Pause, Play, Radio, Send, Volume1, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { waLink } from "@/lib/format";
import { RADIO } from "@/lib/radio";
import { SITIO } from "@/lib/sitio";
import { useRadio } from "./RadioProvider";

export default function ReproductorRadio({ compacto = false }: { compacto?: boolean }) {
  const { estado, actual, historial, volumen, alternar, setVolumen, setObservando } = useRadio();
  const [pestana, setPestana] = useState<"vivo" | "pedir">("vivo");

  // Mientras el reproductor está a la vista, mantener actualizado "sonando ahora"
  useEffect(() => {
    setObservando(true);
    return () => setObservando(false);
  }, [setObservando]);

  const sonando = estado === "sonando";
  const IconoVolumen = volumen === 0 ? VolumeX : volumen < 0.5 ? Volume1 : Volume2;

  return (
    <div className="bg-white">
      {/* Pestañas */}
      <div role="tablist" aria-label="Radio" className="grid grid-cols-2 border-b border-gray-100 text-sm font-bold">
        {(
          [
            ["vivo", "En vivo", Radio],
            ["pedir", "Pedir canción", Music2],
          ] as const
        ).map(([id, texto, Icono]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={pestana === id}
            onClick={() => setPestana(id)}
            className={`flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
              pestana === id ? "border-naranja text-naranja" : "border-transparent text-gray-500 hover:text-indigo"
            }`}
          >
            <Icono size={16} /> {texto}
          </button>
        ))}
      </div>

      {pestana === "vivo" ? (
        <div className={compacto ? "p-5" : "p-6 md:p-8"}>
          {/* Portada + estado */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0 rounded-2xl fondo-marca flex items-center justify-center shadow-md overflow-hidden">
              <Radio size={34} className="text-white drop-shadow" />
              {sonando && <Ecualizador className="absolute bottom-2 left-1/2 -translate-x-1/2" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-rojo">
                <span className={`w-2 h-2 rounded-full bg-rojo ${sonando ? "animate-pulse motion-reduce:animate-none" : ""}`} /> En vivo
              </p>
              <p className="font-extrabold text-indigo leading-tight truncate" title={actual?.titulo}>
                {actual?.titulo ?? RADIO.nombre}
              </p>
              <p className="text-sm text-gray-500 truncate">{actual?.artista || "Música, noticias y compañía desde Cúcuta"}</p>
            </div>
          </div>

          {/* Controles */}
          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={alternar}
              aria-label={sonando || estado === "conectando" ? "Pausar la radio" : "Escuchar la radio"}
              className="w-16 h-16 shrink-0 rounded-full bg-naranja hover:bg-naranja-oscuro text-white flex items-center justify-center shadow-lg transition-colors"
            >
              {estado === "conectando" ? (
                <Loader2 size={28} className="animate-spin" />
              ) : sonando ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" className="ml-1" />
              )}
            </button>
            <div className="flex-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVolumen(volumen === 0 ? 0.9 : 0)}
                aria-label={volumen === 0 ? "Activar sonido" : "Silenciar"}
                className="text-indigo hover:text-naranja"
              >
                <IconoVolumen size={20} />
              </button>
              <input
                suppressHydrationWarning
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volumen}
                onChange={(e) => setVolumen(Number(e.target.value))}
                aria-label="Volumen"
                className="flex-1 accent-naranja h-1.5 cursor-pointer"
              />
            </div>
          </div>

          <p className="mt-3 text-xs min-h-4" aria-live="polite">
            {estado === "error" ? (
              <span className="text-rojo font-semibold">No pudimos conectar con la radio. Revisa tu conexión e intenta de nuevo.</span>
            ) : estado === "conectando" ? (
              <span className="text-gray-500">Conectando con la señal…</span>
            ) : null}
          </p>

          {historial.length > 0 && (
            <div className="mt-4">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Sonó hace poco</h3>
              <ol className="space-y-1.5">
                {historial.slice(0, compacto ? 3 : 5).map((c, i) => (
                  <li key={`${c.titulo}-${i}`} className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                    <Music2 size={14} className="text-naranja shrink-0" />
                    <span className="truncate">
                      {c.titulo}
                      {c.artista && <span className="text-gray-400"> · {c.artista}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : (
        <PedirCancion compacto={compacto} />
      )}
    </div>
  );
}

/** Formulario propio: la solicitud llega a la emisora por WhatsApp con todo ya escrito */
function PedirCancion({ compacto }: { compacto: boolean }) {
  const { user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [cancion, setCancion] = useState("");
  const [artista, setArtista] = useState("");
  const [dedicatoria, setDedicatoria] = useState("");

  const quien = nombre.trim() || user?.nombre || "";
  const mensaje = [
    `🎵 Hola ${RADIO.nombre}, quiero pedir una canción:`,
    "",
    `• Canción: ${cancion.trim()}`,
    ...(artista.trim() ? [`• Artista: ${artista.trim()}`] : []),
    ...(dedicatoria.trim() ? [`• Dedicatoria: ${dedicatoria.trim()}`] : []),
    ...(quien ? ["", `De parte de: ${quien}`] : []),
  ].join("\n");

  const campo =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-naranja focus:bg-white";

  return (
    <form
      suppressHydrationWarning
      className={`space-y-3 ${compacto ? "p-5" : "p-6 md:p-8"}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (!cancion.trim()) return;
        window.open(waLink(SITIO.whatsapp, mensaje), "_blank", "noopener,noreferrer");
      }}
    >
      <p className="text-sm text-gray-500">Pide tu canción y dedícala. Tu solicitud llega a la cabina por WhatsApp.</p>
      <input suppressHydrationWarning className={campo} value={cancion} onChange={(e) => setCancion(e.target.value)} maxLength={120} required placeholder="Canción *" aria-label="Canción" />
      <input suppressHydrationWarning className={campo} value={artista} onChange={(e) => setArtista(e.target.value)} maxLength={120} placeholder="Artista" aria-label="Artista" />
      <input
        suppressHydrationWarning
        className={campo}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        maxLength={80}
        placeholder={user?.nombre ? `Tu nombre (${user.nombre})` : "Tu nombre"}
        aria-label="Tu nombre"
      />
      <textarea
        suppressHydrationWarning
        className={`${campo} resize-none`}
        rows={compacto ? 2 : 3}
        value={dedicatoria}
        onChange={(e) => setDedicatoria(e.target.value)}
        maxLength={300}
        placeholder="Dedicatoria (opcional)"
        aria-label="Dedicatoria"
      />
      <button
        type="submit"
        disabled={!cancion.trim()}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-colors"
      >
        <Send size={18} /> Enviar por WhatsApp
      </button>
    </form>
  );
}

/** Barras animadas mientras suena */
export function Ecualizador({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-end gap-0.5 h-3 ${className}`} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-0.5 rounded-full bg-amarillo motion-safe:animate-[ecualizador_0.9s_ease-in-out_infinite] h-full origin-bottom"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
