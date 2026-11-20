// src/components/referidos/Progreso.tsx — barra de progreso de referidos
export default function Progreso({ actual, meta, claro = false }: { actual: number; meta: number; claro?: boolean }) {
  const pct = Math.min(100, Math.round((actual / Math.max(1, meta)) * 100));
  return (
    <div>
      <div className={`h-2.5 rounded-full overflow-hidden ${claro ? "bg-white/25" : "bg-gray-100"}`} role="progressbar" aria-valuenow={actual} aria-valuemin={0} aria-valuemax={meta}>
        <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-green-500" : claro ? "bg-amarillo" : "bg-naranja"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-xs mt-1 font-semibold ${claro ? "text-white/90" : "text-gray-500"}`}>
        {Math.min(actual, meta)} de {meta} referidos
      </p>
    </div>
  );
}
