// src/components/panel/PanelUI.tsx — piezas comunes de /cuenta, /panel y /admin
"use client";

import { useState } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Boton } from "@/components/ui";

export function PanelEncabezado({ titulo, subtitulo, children }: { titulo: string; subtitulo?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="fondo-marca text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{titulo}</h1>
          {subtitulo && <div className="text-white/85 mt-1 text-sm">{subtitulo}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

export type Pestana<K extends string> = { id: K; label: string; icon: LucideIcon; contador?: number };

export function Pestanas<K extends string>({ items, activa, onChange }: { items: Pestana<K>[]; activa: K; onChange: (k: K) => void }) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-[var(--alto-header)] z-30">
      <nav className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto" role="tablist">
        {items.map(({ id, label, icon: Icon, contador }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activa === id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activa === id ? "border-naranja text-naranja" : "border-transparent text-gray-500 hover:text-indigo"
            }`}
          >
            <Icon size={16} /> {label}
            {!!contador && <span className="bg-naranja text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">{contador}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function Estadistica({
  label,
  valor,
  icon: Icon,
  tono = "azul",
  onClick,
}: {
  label: string;
  valor: React.ReactNode;
  icon: LucideIcon;
  tono?: "azul" | "rojo" | "amarillo" | "verde";
  onClick?: () => void;
}) {
  const tonos = {
    azul: "bg-indigo/10 text-indigo",
    rojo: "bg-naranja/10 text-naranja",
    amarillo: "bg-amarillo/25 text-indigo",
    verde: "bg-green-100 text-green-700",
  };
  const contenido = (
    <>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tonos[tono]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-extrabold text-indigo truncate">{valor}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      {onClick && <ChevronRight size={18} className="text-gray-300 group-hover:text-naranja group-hover:translate-x-0.5 transition-all shrink-0" />}
    </>
  );
  const base = "bg-white rounded-xl shadow-md p-5 flex items-center gap-4 text-left w-full";
  return onClick ? (
    <button type="button" onClick={onClick} className={`group ${base} hover:shadow-lg hover:ring-2 hover:ring-naranja/20 transition-all`}>
      {contenido}
    </button>
  ) : (
    <div className={base}>{contenido}</div>
  );
}

/** Botón de dos pasos para acciones delicadas (suspender, borrar, cancelar). */
export function BotonConfirmar({
  onConfirm,
  children,
  pregunta = "¿Seguro?",
  variante = "borde",
  className = "",
}: {
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode;
  pregunta?: string;
  variante?: "rojo" | "azul" | "amarillo" | "borde" | "texto";
  className?: string;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [cargando, setCargando] = useState(false);
  if (!confirmando) {
    return (
      <Boton variante={variante} className={`text-xs px-3 py-1.5 ${className}`} onClick={() => setConfirmando(true)}>
        {children}
      </Boton>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-xs text-gray-600">{pregunta}</span>
      <Boton
        variante="rojo"
        className="text-xs px-3 py-1.5"
        cargando={cargando}
        onClick={async () => {
          setCargando(true);
          try {
            await onConfirm();
          } finally {
            setCargando(false);
            setConfirmando(false);
          }
        }}
      >
        Sí
      </Boton>
      <Boton variante="texto" className="text-xs px-3 py-1.5" onClick={() => setConfirmando(false)}>
        No
      </Boton>
    </span>
  );
}

/** Paginación simple para listas de los paneles */
export function Paginador({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-6 text-sm">
      <Boton variante="borde" className="px-3 py-1.5" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </Boton>
      <span className="text-gray-500">
        Página {page} de {pages}
      </span>
      <Boton variante="borde" className="px-3 py-1.5" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Siguiente
      </Boton>
    </div>
  );
}

/** Interruptor tipo celular: verde = visible en el sitio */
export function Interruptor({ activo, onClick, etiqueta }: { activo: boolean; onClick: () => void; etiqueta: string }) {
  return (
    <button type="button" role="switch" aria-checked={activo} aria-label={etiqueta} onClick={onClick} className="inline-flex items-center gap-2 text-xs font-bold">
      <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${activo ? "bg-green-500" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${activo ? "translate-x-5.5" : "translate-x-0.5"}`} />
      </span>
      <span className={`w-12 text-left ${activo ? "text-green-700" : "text-gray-500"}`}>{activo ? "Visible" : "Oculto"}</span>
    </button>
  );
}
