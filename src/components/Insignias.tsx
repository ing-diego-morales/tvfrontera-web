// src/components/Insignias.tsx — indicadores visuales reutilizables (solo informativos)
import { BadgeCheck } from "lucide-react";
import { timeAgo } from "@/lib/date-utils";

/** Punto verde (en línea) o gris (desconectado). Con `ultimoAcceso` muestra "hace X" al pasar el mouse. */
export function EstadoConexion({
  enLinea,
  ultimoAcceso,
  conTexto = false,
  claro = false,
}: {
  enLinea: boolean;
  ultimoAcceso?: string | null;
  conTexto?: boolean;
  claro?: boolean;
}) {
  const detalle = enLinea ? "En línea" : ultimoAcceso ? `Última vez: ${timeAgo(ultimoAcceso).toLowerCase()}` : "Desconectado";
  return (
    <span className="inline-flex items-center gap-1.5" title={detalle} aria-label={detalle}>
      <span className="relative flex w-2.5 h-2.5 shrink-0">
        {enLinea && <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-75 animate-ping motion-reduce:animate-none" />}
        <span className={`relative inline-flex w-2.5 h-2.5 rounded-full ring-2 ${claro ? "ring-indigo" : "ring-white"} ${enLinea ? "bg-green-500" : "bg-gray-400"}`} />
      </span>
      {conTexto && <span className={`text-xs font-medium ${enLinea ? (claro ? "text-green-300" : "text-green-700") : claro ? "text-gray-300" : "text-gray-500"}`}>{detalle}</span>}
    </span>
  );
}

/** Insignia de identidad verificada (cédula + rostro) */
export function Verificado({ tamano = "sm", claro = false }: { tamano?: "xs" | "sm"; claro?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full ${tamano === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"} ${
        claro ? "bg-sky-400/20 text-sky-200" : "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
      }`}
      title="Identidad verificada por TV Frontera"
    >
      <BadgeCheck size={tamano === "xs" ? 11 : 13} /> Verificado
    </span>
  );
}
