// src/components/RadioWidget.tsx — botón flotante de la radio + panel con el reproductor propio
// El audio vive en RadioProvider: cerrar el panel NO detiene la radio (sigue sonando al navegar).
"use client";

import { useEffect, useState } from "react";
import { Radio, X } from "lucide-react";
import ReproductorRadio, { Ecualizador } from "@/components/radio/ReproductorRadio";
import { useRadio } from "@/components/radio/RadioProvider";
import { RADIO } from "@/lib/radio";

export default function RadioWidget() {
  const [abierto, setAbierto] = useState(false);
  const { estado } = useRadio();
  const sonando = estado === "sonando";

  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-controls="panel-radio"
        aria-label={abierto ? "Cerrar la radio" : sonando ? "Radio sonando: abrir controles" : "Escuchar Radio TV Frontera en vivo"}
        className="fixed bottom-24 right-6 z-50 bg-indigo hover:bg-indigo-oscuro text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {abierto ? <X size={24} /> : sonando ? <Ecualizador className="h-5 [&>span]:w-1" /> : <Radio size={24} className="text-amarillo" />}
        {sonando && !abierto && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rojo ring-2 ring-white" aria-hidden />}
      </button>

      {abierto && (
        <section
          id="panel-radio"
          aria-label={RADIO.nombre}
          className="fixed bottom-40 right-4 sm:right-6 z-50 w-[min(360px,calc(100vw-2rem))] max-h-[calc(100dvh-11rem)] overflow-y-auto rounded-2xl shadow-2xl ring-1 ring-black/10 bg-white"
        >
          <header className="flex items-center justify-between px-5 py-3 bg-indigo text-white">
            <span className="flex items-center gap-2 font-bold text-sm">
              <Radio size={16} className="text-amarillo" /> {RADIO.nombre}
            </span>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar la radio" className="p-1 rounded-full hover:bg-white/10">
              <X size={18} />
            </button>
          </header>
          <ReproductorRadio compacto />
        </section>
      )}
    </>
  );
}
