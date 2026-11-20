// src/components/radio/RadioProvider.tsx — reproductor de radio ÚNICO para todo el sitio
// Un solo <audio> vive en el layout: la radio sigue sonando al cambiar de página, y el botón flotante
// y la página /radio controlan el mismo reproductor.
// - Al pausar se corta la descarga (un stream en vivo no se "pausa": así no gasta datos en el celular).
// - Al reanudar se vuelve a conectar para escuchar lo que suena AHORA, no lo que quedó en búfer.
// - "Sonando ahora" se consulta cada 20 s solo si alguien está escuchando o mirando el reproductor.
// - Controles en la pantalla de bloqueo del celular (Media Session API).
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { RADIO, tituloLegible } from "@/lib/radio";

type Estado = "detenida" | "conectando" | "sonando" | "error";
type Cancion = { titulo: string; artista: string };

type Radio = {
  estado: Estado;
  actual: Cancion | null;
  historial: Cancion[];
  volumen: number;
  alternar: () => void;
  setVolumen: (v: number) => void;
  /** Mientras esté en true se actualiza "sonando ahora" aunque no esté reproduciendo (ej. panel abierto) */
  setObservando: (v: boolean) => void;
};

const Contexto = createContext<Radio | null>(null);

export function useRadio() {
  const r = useContext(Contexto);
  if (!r) throw new Error("useRadio debe usarse dentro de <RadioProvider>");
  return r;
}

const VOLUMEN_KEY = "tvf_radio_volumen";

export default function RadioProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [estado, setEstado] = useState<Estado>("detenida");
  const [actual, setActual] = useState<Cancion | null>(null);
  const [historial, setHistorial] = useState<Cancion[]>([]);
  const [volumen, setVolumenEstado] = useState(0.9);
  const [observando, setObservando] = useState(false);

  // Volumen recordado (solo en este navegador)
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(VOLUMEN_KEY));
      if (v > 0 && v <= 1) setTimeout(() => setVolumenEstado(v), 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (audio.current) audio.current.volume = volumen;
  }, [volumen]);

  const setVolumen = useCallback((v: number) => {
    const limpio = Math.min(1, Math.max(0, v));
    setVolumenEstado(limpio);
    try {
      localStorage.setItem(VOLUMEN_KEY, String(limpio));
    } catch {}
  }, []);

  const detener = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    a.pause();
    a.removeAttribute("src"); // corta la conexión con el stream
    a.load();
    setEstado("detenida");
  }, []);

  const reproducir = useCallback(async () => {
    const a = audio.current;
    if (!a) return;
    setEstado("conectando");
    a.src = `${RADIO.stream}?t=${Date.now()}`; // siempre el punto en vivo
    a.volume = volumen;
    try {
      await a.play();
    } catch (e) {
      // El navegador puede bloquear el audio si no hubo un toque del usuario: no es un error de la radio
      if ((e as DOMException)?.name !== "AbortError") setEstado("error");
    }
  }, [volumen]);

  const alternar = useCallback(() => {
    if (estado === "sonando" || estado === "conectando") detener();
    else reproducir();
  }, [estado, detener, reproducir]);

  // "Sonando ahora": solo si está sonando o alguien mira el reproductor, y con la pestaña visible
  useEffect(() => {
    if (estado !== "sonando" && !observando) return;
    let vivo = true;
    const consultar = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch(RADIO.ahoraSuena, { cache: "no-store", signal: AbortSignal.timeout(8000) });
        const d = (await r.json()) as { songtitle?: string; artist?: string; song_history?: { song: { title: string; artist: string } }[] };
        if (!vivo) return;
        setActual(tituloLegible(d.songtitle ?? "", d.artist ?? ""));
        setHistorial(
          (d.song_history ?? [])
            .slice(1, 10)
            .map((h) => tituloLegible(h.song.title, h.song.artist))
            .filter((c): c is Cancion => Boolean(c))
            .filter((c, i, lista) => i === 0 || c.titulo !== lista[i - 1].titulo) // sin repetidos seguidos
            .slice(0, 5)
        );
      } catch {
        /* sin "sonando ahora" no pasa nada: la radio sigue */
      }
    };
    consultar();
    const id = window.setInterval(consultar, 20_000);
    return () => {
      vivo = false;
      window.clearInterval(id);
    };
  }, [estado, observando]);

  // Controles en la pantalla de bloqueo / notificación del celular
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: actual?.titulo ?? "Radio TV Frontera en vivo",
      artist: actual?.artista || "Radio TV Frontera · Cúcuta",
      artwork: [{ src: "/marca/icono-512.png", sizes: "512x512", type: "image/png" }],
    });
    navigator.mediaSession.setActionHandler("play", () => reproducir());
    navigator.mediaSession.setActionHandler("pause", () => detener());
    navigator.mediaSession.setActionHandler("stop", () => detener());
  }, [actual, reproducir, detener]);

  const valor = useMemo(
    () => ({ estado, actual, historial, volumen, alternar, setVolumen, setObservando }),
    [estado, actual, historial, volumen, alternar, setVolumen]
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      <audio
        ref={audio}
        preload="none"
        onPlaying={() => setEstado("sonando")}
        onWaiting={() => setEstado((e) => (e === "detenida" ? e : "conectando"))}
        onError={() => setEstado((e) => (e === "detenida" ? e : "error"))}
        hidden
      />
    </Contexto.Provider>
  );
}
