// src/components/VisitorCounter.tsx — contador de visitas flotante (abajo a la izquierda)
// En celular solo se ve el ojito; al tocarlo muestra el total unos segundos. En PC se ve completo.
"use client";

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { api } from "@/lib/api";

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Solo suma una visita la primera vez en esta pestaña; el resto solo lee el total
    let method: "GET" | "POST" = "GET";
    try {
      if (!sessionStorage.getItem("tvf_visita")) {
        sessionStorage.setItem("tvf_visita", "1");
        method = "POST";
      }
    } catch {}

    api<{ count: number | null }>("/api/visitors", { method })
      .then((d) => (d.count === null ? setError(true) : setCount(d.count)))
      .catch(() => setError(true));
    return () => window.clearTimeout(temporizador.current);
  }, []);

  if (error) return null; // si la API no responde, no deja el "Cargando..." pegado

  const alternar = () => {
    window.clearTimeout(temporizador.current);
    if (!abierto) temporizador.current = window.setTimeout(() => setAbierto(false), 4000);
    setAbierto(!abierto);
  };

  const texto = count !== null ? `${count.toLocaleString("es-CO")} visitas` : "Cargando...";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={texto}
      aria-expanded={abierto}
      className="fixed bottom-6 left-4 md:left-6 z-50 flex items-center justify-center gap-2 h-11 min-w-11 px-3 md:px-4 bg-indigo/90 backdrop-blur text-white text-sm font-medium rounded-full shadow-lg md:cursor-default"
    >
      <Eye size={18} className="text-amarillo shrink-0" />
      <span className={`${abierto ? "inline" : "hidden"} md:inline whitespace-nowrap`}>{texto}</span>
    </button>
  );
}
