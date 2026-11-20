// src/components/inicio/CuentaRegresiva.tsx — "Faltan 12 días 05 h 30 min" para el sorteo u otro evento
"use client";

import { useEffect, useState } from "react";

const partes = (ms: number) => ({
  dias: Math.floor(ms / 86_400_000),
  horas: Math.floor((ms / 3_600_000) % 24),
  min: Math.floor((ms / 60_000) % 60),
  seg: Math.floor((ms / 1000) % 60),
});

export default function CuentaRegresiva({ fecha, oscuro = false }: { fecha: string; oscuro?: boolean }) {
  const objetivo = new Date(fecha.replace(" ", "T")).getTime();
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setAhora(Date.now());
    const primero = window.setTimeout(tick, 0); // primer valor tras montar (evita diferencias servidor/navegador)
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(primero);
      window.clearInterval(id);
    };
  }, []);

  if (Number.isNaN(objetivo)) return null;
  if (ahora !== null && objetivo <= ahora) {
    return <p className="font-extrabold text-lg">¡Es hoy! 🎉</p>;
  }
  const p = ahora === null ? null : partes(objetivo - ahora);
  const caja = oscuro ? "bg-white/15 text-white" : "bg-white text-indigo shadow";
  return (
    <div className="flex gap-2" role="timer" aria-label="Tiempo restante">
      {(["dias", "horas", "min", "seg"] as const).map((k) => (
        <div key={k} className={`${caja} rounded-xl w-16 py-2 text-center`}>
          <p className="text-2xl font-extrabold tabular-nums leading-none">{p ? String(p[k]).padStart(2, "0") : "--"}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">{k === "dias" ? "días" : k}</p>
        </div>
      ))}
    </div>
  );
}
