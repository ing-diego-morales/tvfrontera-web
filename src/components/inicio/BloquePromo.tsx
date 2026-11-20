// src/components/inicio/BloquePromo.tsx — bloque promocional editable desde Admin > Inicio
// (sorteo anual, campañas, la Gran Tienda Virtual...). Texto plano: ningún HTML del admin se ejecuta.
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import Imagen from "@/components/Imagen";
import CuentaRegresiva from "./CuentaRegresiva";
import type { DatosPromo } from "@/lib/secciones";

const ESTILOS = {
  naranja: { fondo: "fondo-marca text-white", etiqueta: "bg-indigo text-white", sub: "text-white/90", boton: "bg-white text-naranja hover:bg-naranja-claro", oscuro: true },
  indigo: { fondo: "bg-indigo text-white", etiqueta: "bg-amarillo text-indigo", sub: "text-white/85", boton: "bg-amarillo text-indigo hover:bg-amarillo-oscuro", oscuro: true },
  amarillo: { fondo: "bg-amarillo text-indigo", etiqueta: "bg-indigo text-white", sub: "text-indigo/80", boton: "bg-naranja text-white hover:bg-naranja-oscuro", oscuro: false },
  claro: { fondo: "bg-white text-indigo ring-1 ring-black/5", etiqueta: "bg-naranja text-white", sub: "text-gray-600", boton: "bg-naranja text-white hover:bg-naranja-oscuro", oscuro: false },
} as const;

const fechaLarga = (f: string) =>
  new Date(f.replace(" ", "T")).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default function BloquePromo({ titulo, datos }: { titulo: string; datos: DatosPromo }) {
  const e = ESTILOS[datos.estilo] ?? ESTILOS.naranja;
  const externo = datos.boton_enlace?.startsWith("https://");
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className={`${e.fondo} rounded-3xl overflow-hidden shadow-xl grid ${datos.imagen_url ? "md:grid-cols-2" : ""} items-center`}>
        <div className="p-8 md:p-12">
          {datos.etiqueta && <p className={`inline-block ${e.etiqueta} text-xs font-extrabold uppercase tracking-[0.18em] px-3 py-1 rounded-full`}>{datos.etiqueta}</p>}
          <h2 className="text-3xl md:text-4xl font-extrabold mt-4 leading-tight">{titulo}</h2>
          {datos.subtitulo && <p className={`text-lg font-semibold mt-2 ${e.sub}`}>{datos.subtitulo}</p>}
          {datos.texto && <p className={`mt-4 leading-relaxed whitespace-pre-line ${e.sub}`}>{datos.texto}</p>}

          {datos.fecha_evento && (
            <div className="mt-6 space-y-3">
              <p className={`flex items-center gap-2 text-sm font-bold capitalize ${e.sub}`}>
                <CalendarDays size={16} /> {fechaLarga(datos.fecha_evento)}
              </p>
              <CuentaRegresiva fecha={datos.fecha_evento} oscuro={e.oscuro} />
            </div>
          )}

          {datos.boton_texto && datos.boton_enlace && (
            <Link
              href={datos.boton_enlace}
              {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`inline-block mt-8 font-extrabold px-7 py-3.5 rounded-full shadow-lg transition-colors ${e.boton}`}
            >
              {datos.boton_texto}
            </Link>
          )}
        </div>
        {datos.imagen_url && (
          <div className="relative h-80 md:h-full md:min-h-[26rem]">
            <Imagen src={datos.imagen_url} alt={titulo} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain md:object-cover object-center" />
          </div>
        )}
      </div>
    </section>
  );
}
