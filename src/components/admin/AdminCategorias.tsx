// src/components/admin/AdminCategorias.tsx — categorías de la tienda (círculos del inicio y formularios)
"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Save } from "lucide-react";
import { Aviso, Boton, Campo, Cargando, Tarjeta } from "@/components/ui";
import { BotonConfirmar, Interruptor } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { ICONOS_CATEGORIA, iconoDe, type Categoria } from "@/lib/iconos-categorias";
import { useApi } from "@/lib/useApi";

export default function AdminCategorias() {
  const { data, error, cargando, recargar } = useApi<{ categorias: (Categoria & { aliados: number })[]; iconos: string[] }>("/api/categorias/admin");
  const [editando, setEditando] = useState<Categoria | "nueva" | null>(null);
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
  const lista = data?.categorias ?? [];
  const mover = (i: number, dir: -1 | 1) => {
    const ids = lista.map((c) => c.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    accion(() => api("/api/categorias/orden", { method: "PUT", json: { ids } }));
  };

  return (
    <Tarjeta
      titulo="Categorías de la tienda"
      accion={
        <Boton onClick={() => setEditando("nueva")}>
          <Plus size={16} /> Nueva categoría
        </Boton>
      }
    >
      <p className="text-sm text-gray-500 mb-4">
        Son los círculos del inicio, los filtros de productos y la lista que eligen los aliados al registrarse. Si renombras una, sus negocios se actualizan solos.
      </p>
      {(error || errorAccion) && (
        <div className="mb-4">
          <Aviso>{error || errorAccion}</Aviso>
        </div>
      )}
      {editando && (
        <FormCategoria
          categoria={editando === "nueva" ? null : editando}
          iconos={data?.iconos ?? Object.keys(ICONOS_CATEGORIA)}
          onCerrar={(ok) => {
            setEditando(null);
            if (ok) recargar();
          }}
        />
      )}
      <ol className="divide-y divide-gray-100 rounded-xl ring-1 ring-black/5 overflow-hidden">
        {lista.map((c, i) => {
          const Icon = iconoDe(c.icono);
          return (
            <li key={c.id} className={`flex items-center gap-3 p-3 bg-white ${c.activo ? "" : "opacity-50"}`}>
              <div className="flex flex-col">
                <button onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="p-0.5 text-gray-400 hover:text-indigo disabled:opacity-20">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => mover(i, 1)} disabled={i === lista.length - 1} aria-label="Bajar" className="p-0.5 text-gray-400 hover:text-indigo disabled:opacity-20">
                  <ArrowDown size={14} />
                </button>
              </div>
              <span className="w-10 h-10 rounded-full bg-naranja-claro text-naranja flex items-center justify-center shrink-0">
                <Icon size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-indigo truncate">{c.nombre}</p>
                <p className="text-xs text-gray-500">{c.aliados} negocio(s)</p>
              </div>
              <Interruptor
                activo={!!c.activo}
                etiqueta={c.activo ? `Ocultar ${c.nombre}` : `Mostrar ${c.nombre}`}
                onClick={() => accion(() => api(`/api/categorias/${c.id}`, { method: "PUT", json: { activo: !c.activo } }))}
              />
              <Boton variante="texto" className="px-2" onClick={() => setEditando(c)} aria-label={`Editar ${c.nombre}`}>
                <Pencil size={16} />
              </Boton>
              <BotonConfirmar variante="texto" pregunta="¿Borrar?" onConfirm={() => accion(() => api(`/api/categorias/${c.id}`, { method: "DELETE" }))}>
                Borrar
              </BotonConfirmar>
            </li>
          );
        })}
      </ol>
    </Tarjeta>
  );
}

function FormCategoria({ categoria, iconos, onCerrar }: { categoria: Categoria | null; iconos: string[]; onCerrar: (ok: boolean) => void }) {
  const [nombre, setNombre] = useState(categoria?.nombre ?? "");
  const [icono, setIcono] = useState(categoria?.icono ?? "grid");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const json = { nombre: nombre.trim(), icono };
      if (categoria) await api(`/api/categorias/${categoria.id}`, { method: "PUT", json });
      else await api("/api/categorias", { method: "POST", json });
      onCerrar(true);
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <form suppressHydrationWarning onSubmit={guardar} className="mb-5 rounded-xl bg-naranja-claro/60 p-4 space-y-4">
      {error && <Aviso>{error}</Aviso>}
      <Campo label="Nombre" name="nombre" required minLength={2} maxLength={80} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">Ícono</legend>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {iconos.map((k) => {
            const Icon = iconoDe(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => setIcono(k)}
                aria-pressed={icono === k}
                title={ICONOS_CATEGORIA[k]?.nombre ?? k}
                className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${icono === k ? "bg-naranja text-white" : "bg-white text-indigo hover:bg-gray-50 ring-1 ring-gray-200"}`}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="flex gap-2">
        <Boton type="submit" cargando={enviando}>
          <Save size={16} /> Guardar
        </Boton>
        <Boton type="button" variante="texto" onClick={() => onCerrar(false)}>
          Cancelar
        </Boton>
      </div>
    </form>
  );
}
