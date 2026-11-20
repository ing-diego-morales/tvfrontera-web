// src/components/ui.tsx — piezas de formulario y estado reutilizables (mismo estilo del sitio)
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

export const inputClase =
  "w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo disabled:bg-gray-100 disabled:text-gray-500";

type CampoProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; ayuda?: string };

export const Campo = forwardRef<HTMLInputElement, CampoProps>(function Campo({ label, ayuda, id, ...props }, ref) {
  const campoId = id ?? props.name;
  return (
    <div>
      <label htmlFor={campoId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {props.required && <span className="text-naranja"> *</span>}
      </label>
      <input suppressHydrationWarning ref={ref} id={campoId} className={inputClase} {...props} />
      {ayuda && <p className="text-xs text-gray-500 mt-1">{ayuda}</p>}
    </div>
  );
});

export function AreaTexto({
  label,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const campoId = id ?? props.name;
  return (
    <div>
      <label htmlFor={campoId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {props.required && <span className="text-naranja"> *</span>}
      </label>
      <textarea suppressHydrationWarning id={campoId} className={`${inputClase} resize-y`} {...props} />
    </div>
  );
}

export function Selector({
  label,
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const campoId = id ?? props.name;
  return (
    <div>
      <label htmlFor={campoId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select suppressHydrationWarning id={campoId} className={inputClase} {...props}>
        {children}
      </select>
    </div>
  );
}

type BotonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  cargando?: boolean;
  variante?: "rojo" | "azul" | "amarillo" | "borde" | "texto";
};

const VARIANTES = {
  rojo: "bg-naranja hover:bg-naranja-oscuro text-white",
  amarillo: "bg-amarillo hover:bg-amarillo-oscuro text-indigo",
  azul: "bg-indigo hover:bg-indigo-oscuro text-white",
  borde: "border border-gray-300 text-indigo bg-white hover:bg-gray-50",
  texto: "text-indigo hover:bg-gray-100",
};

export function Boton({ cargando, variante = "rojo", className = "", children, disabled, ...props }: BotonProps) {
  return (
    <button
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {cargando && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Aviso({ tipo = "error", children }: { tipo?: "error" | "ok" | "info" | "alerta"; children: React.ReactNode }) {
  const clases = {
    error: "bg-red-50 border-red-200 text-red-700",
    ok: "bg-green-50 border-green-200 text-green-700",
    info: "bg-blue-50 border-blue-200 text-indigo",
    alerta: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }[tipo];
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={`border rounded-lg px-4 py-3 text-sm ${clases}`}>
      {children}
    </div>
  );
}

export function Etiqueta({ clase, children }: { clase: string; children: React.ReactNode }) {
  return <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${clase}`}>{children}</span>;
}

export function Cargando({ texto = "Cargando..." }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
      <Loader2 size={20} className="animate-spin text-indigo" /> {texto}
    </div>
  );
}

export function Tarjeta({ titulo, accion, children, className = "" }: { titulo?: string; accion?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {(titulo || accion) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {titulo && <h2 className="text-lg font-bold text-indigo">{titulo}</h2>}
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-gray-500 py-10">{children}</p>;
}

/** Título de sección estilo editorial: barra roja + título + enlace "Ver todo" */
export function TituloSeccion({
  titulo,
  subtitulo,
  href,
  enlace = "Ver todo",
  claro = false,
}: {
  titulo: string;
  subtitulo?: string;
  href?: string;
  enlace?: string;
  claro?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div className="flex items-stretch gap-3">
        <span className="w-1.5 rounded-full bg-naranja" aria-hidden />
        <div>
          <h2 className={`text-2xl md:text-[1.7rem] font-extrabold leading-tight ${claro ? "text-white" : "text-indigo"}`}>{titulo}</h2>
          {subtitulo && <p className={`text-sm mt-1 ${claro ? "text-gray-300" : "text-gray-500"}`}>{subtitulo}</p>}
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className={`shrink-0 text-sm font-bold whitespace-nowrap hover:underline underline-offset-4 ${claro ? "text-amarillo" : "text-naranja"}`}
        >
          {enlace} →
        </Link>
      )}
    </div>
  );
}

/** Encabezado azul de página, igual al de Contacto y Noticias */
export function EncabezadoPagina({ titulo, subtitulo, etiqueta }: { titulo: string; subtitulo?: string; etiqueta?: string }) {
  return (
    <section className="relative overflow-hidden fondo-marca py-16 text-center px-4">
      {/* Detalle gráfico sutil de marca */}
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-naranja/15 blur-3xl" aria-hidden />
      <div className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full bg-amarillo/10 blur-3xl" aria-hidden />
      <div className="relative">
        {etiqueta && <p className="inline-block bg-indigo/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-4">{etiqueta}</p>}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-[0_2px_0_rgba(43,47,138,0.35)]">{titulo}</h1>
        {subtitulo && <p className="text-white/90 mt-4 max-w-2xl mx-auto text-lg">{subtitulo}</p>}
      </div>
    </section>
  );
}
