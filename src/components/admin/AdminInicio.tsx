// src/components/admin/AdminInicio.tsx — la portada se arma desde aquí, sin tocar código:
// orden de las secciones, cuáles se ven, bloques promocionales (sorteo, campañas) y textos del sitio.
"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, LayoutTemplate, Megaphone, Pencil, Plus } from "lucide-react";
import { Aviso, Boton, Cargando, Etiqueta, Tarjeta } from "@/components/ui";
import { BotonConfirmar, Interruptor } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { DESCRIPCION_SISTEMA, type Seccion } from "@/lib/secciones";
import { useApi } from "@/lib/useApi";
import PromoForm from "./PromoForm";
import TextosSitio from "./TextosSitio";

export default function AdminInicio() {
  const { data, error, cargando, recargar } = useApi<{ secciones: Seccion[] }>("/api/secciones/admin");
  const [editando, setEditando] = useState<Seccion | "nueva" | null>(null);
  const [errorAccion, setErrorAccion] = useState("");

  const accion = async (fn: () => Promise<unknown>) => {
    setErrorAccion("");
    try {
      await fn();
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  if (cargando) return <Cargando />;
  const secciones = data?.secciones ?? [];

  const mover = (i: number, dir: -1 | 1) => {
    const ids = secciones.map((s) => s.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    accion(() => api("/api/secciones/orden", { method: "PUT", json: { ids } }));
  };

  if (editando) {
    return (
      <PromoForm
        seccion={editando === "nueva" ? null : editando}
        onCerrar={(guardado) => {
          setEditando(null);
          if (guardado) recargar();
        }}
      />
    );
  }

  const visibles = secciones.filter((s) => s.activo).length;

  return (
    <div className="space-y-6">
      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}

      <Tarjeta
        titulo="Secciones de la portada"
        accion={
          <div className="flex gap-2">
            <a href="/" target="_blank" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-indigo border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo">
              <ExternalLink size={14} /> Ver portada
            </a>
            <Boton onClick={() => setEditando("nueva")}>
              <Plus size={16} /> Bloque promocional
            </Boton>
          </div>
        }
      >
        <p className="text-sm text-gray-500 mb-4">
          Se muestran {visibles} de {secciones.length} secciones, de arriba hacia abajo en este orden. Usa las flechas para reordenar y el interruptor para mostrar u ocultar. Los cambios se ven al instante.
        </p>

        <ol className="divide-y divide-gray-100 rounded-xl ring-1 ring-black/5 overflow-hidden">
          {secciones.map((s, i) => (
            <li key={s.id} className={`flex items-center gap-3 p-4 bg-white ${s.activo ? "" : "opacity-60"}`}>
              <div className="flex flex-col">
                <button onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="p-1 text-gray-400 hover:text-indigo disabled:opacity-20">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => mover(i, 1)} disabled={i === secciones.length - 1} aria-label="Bajar" className="p-1 text-gray-400 hover:text-indigo disabled:opacity-20">
                  <ArrowDown size={14} />
                </button>
              </div>
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.tipo === "PROMO" ? "bg-naranja text-white" : "bg-indigo/10 text-indigo"}`}>
                {s.tipo === "PROMO" ? <Megaphone size={18} /> : <LayoutTemplate size={18} />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-indigo truncate flex items-center gap-2">
                  {s.titulo}
                  <Etiqueta clase={s.tipo === "PROMO" ? "bg-naranja-claro text-naranja" : "bg-gray-100 text-gray-500"}>{s.tipo === "PROMO" ? "Promocional" : "Fija"}</Etiqueta>
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {s.tipo === "PROMO" ? s.datos?.subtitulo || s.datos?.texto || "Bloque promocional" : DESCRIPCION_SISTEMA[s.clave ?? ""]}
                  {s.datos?.fecha_evento && ` · Cuenta regresiva al ${s.datos.fecha_evento}`}
                  {(s.desde || s.hasta) && ` · Programado: ${s.desde ?? "ya"} → ${s.hasta ?? "sin fin"}`}
                </p>
              </div>
              <Interruptor
                activo={!!s.activo}
                etiqueta={s.activo ? `Ocultar ${s.titulo}` : `Mostrar ${s.titulo}`}
                onClick={() => accion(() => api(`/api/secciones/${s.id}`, { method: "PUT", json: { activo: !s.activo } }))}
              />
              {s.tipo === "PROMO" && (
                <>
                  <Boton variante="texto" className="px-2" onClick={() => setEditando(s)} aria-label={`Editar ${s.titulo}`}>
                    <Pencil size={16} />
                  </Boton>
                  <BotonConfirmar variante="texto" pregunta="¿Borrar bloque?" onConfirm={() => accion(() => api(`/api/secciones/${s.id}`, { method: "DELETE" }))}>
                    Borrar
                  </BotonConfirmar>
                </>
              )}
            </li>
          ))}
        </ol>
      </Tarjeta>

      <TextosSitio />
    </div>
  );
}
