// src/components/admin/AdminAvisos.tsx — la cinta de avisos bajo el menú (texto, enlaces, orden, fechas, mostrar/ocultar)
"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Link2, Pencil, Plus, Save } from "lucide-react";
import { Aviso as Alerta, Boton, Campo, Cargando, Tarjeta, Vacio } from "@/components/ui";
import { BotonConfirmar, Interruptor } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";

type AvisoAdmin = { id: number; texto: string; enlace: string | null; activo: number; orden: number; desde: string | null; hasta: string | null };
type Respuesta = { activo: boolean; titulo: string; anuncios: AvisoAdmin[] };

const aLocal = (v: string | null) => (v ? v.slice(0, 16).replace(" ", "T") : "");


export default function AdminAvisos() {
  const { data, error, cargando, recargar } = useApi<Respuesta>("/api/anuncios/admin");
  const [editando, setEditando] = useState<AvisoAdmin | "nuevo" | null>(null);
  const [errorAccion, setErrorAccion] = useState("");
  const [titulo, setTitulo] = useState<string | null>(null);

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
  if (!data) return <Alerta>{error ?? "No se pudieron cargar los avisos"}</Alerta>;

  const avisos = data.anuncios;
  const mover = (i: number, dir: -1 | 1) => {
    const a = avisos[i];
    const b = avisos[i + dir];
    if (!b) return;
    // Reasigna órdenes consecutivos para que el intercambio siempre funcione
    accion(async () => {
      await Promise.all(
        avisos.map((x, k) => {
          const nuevo = x.id === a.id ? i + dir : x.id === b.id ? i : k;
          return x.orden === nuevo ? null : api(`/api/anuncios/${x.id}`, { method: "PUT", json: { orden: nuevo } });
        })
      );
    });
  };

  const visibles = avisos.filter((a) => a.activo);

  return (
    <div className="space-y-6">
      {(error || errorAccion) && <Alerta>{error || errorAccion}</Alerta>}

      {/* Interruptor general + vista previa */}
      <Tarjeta>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-indigo">Cinta de avisos bajo el menú</p>
            <p className="text-sm text-gray-500">
              {data.activo ? `Visible en todo el sitio: se muestran ${visibles.length} de ${avisos.length} avisos.` : "Oculta: no aparece en ninguna página."} Deja visibles solo los que quieras; los cambios se ven al instante.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input suppressHydrationWarning
              value={titulo ?? data.titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={30}
              aria-label="Título de la cinta"
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
            />
            {titulo !== null && titulo.trim() && titulo !== data.titulo && (
              <Boton variante="azul" className="text-sm" onClick={() => accion(() => api("/api/anuncios/ajustes", { method: "PUT", json: { activo: data.activo, titulo: titulo.trim() } }).then(() => setTitulo(null)))}>
                <Save size={14} />
              </Boton>
            )}
            <Boton variante={data.activo ? "borde" : "rojo"} onClick={() => accion(() => api("/api/anuncios/ajustes", { method: "PUT", json: { activo: !data.activo } }))}>
              {data.activo ? <EyeOff size={16} /> : <Eye size={16} />} {data.activo ? "Ocultar cinta" : "Mostrar cinta"}
            </Boton>
          </div>
        </div>

        <div className={`mt-5 rounded-lg overflow-hidden flex h-10 ${data.activo ? "" : "opacity-40 grayscale"}`} aria-hidden>
          <div className="bg-indigo text-white text-[11px] font-extrabold uppercase tracking-[0.12em] flex items-center gap-2 px-4">
            <span className="w-2 h-2 rounded-full bg-amarillo" />
            {titulo ?? data.titulo}
          </div>
          <div className="flex-1 bg-naranja text-white text-[13px] font-medium flex items-center overflow-hidden whitespace-nowrap px-4">
            {visibles.length ? visibles.map((a) => a.texto).join("   ◆   ") : "Sin avisos activos"}
          </div>
        </div>
      </Tarjeta>

      {editando ? (
        <FormAviso
          aviso={editando === "nuevo" ? null : editando}
          ordenNuevo={avisos.length}
          onCerrar={(ok) => {
            setEditando(null);
            if (ok) recargar();
          }}
        />
      ) : (
        <div className="flex justify-end">
          <Boton onClick={() => setEditando("nuevo")}>
            <Plus size={16} /> Nuevo aviso
          </Boton>
        </div>
      )}

      {!avisos.length ? (
        <Vacio>Aún no hay avisos.</Vacio>
      ) : (
        <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
          {avisos.map((a, i) => (
            <div key={a.id} className={`flex items-center gap-3 p-4 ${a.activo ? "" : "opacity-50"}`}>
              <div className="flex flex-col">
                <button onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="p-1 text-gray-400 hover:text-indigo disabled:opacity-20">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => mover(i, 1)} disabled={i === avisos.length - 1} aria-label="Bajar" className="p-1 text-gray-400 hover:text-indigo disabled:opacity-20">
                  <ArrowDown size={14} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">{a.texto}</p>
                <p className="text-xs text-gray-400 flex flex-wrap gap-x-3">
                  {a.enlace && (
                    <span className="flex items-center gap-1">
                      <Link2 size={11} /> {a.enlace}
                    </span>
                  )}
                  {(a.desde || a.hasta) && (
                    <span>
                      Programado: {a.desde ? aLocal(a.desde).replace("T", " ") : "ya"} → {a.hasta ? aLocal(a.hasta).replace("T", " ") : "sin fin"}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Interruptor
                  activo={!!a.activo}
                  etiqueta={a.activo ? "Ocultar este aviso" : "Mostrar este aviso"}
                  onClick={() => accion(() => api(`/api/anuncios/${a.id}`, { method: "PUT", json: { activo: !a.activo } }))}
                />
                <Boton variante="texto" className="px-2" onClick={() => setEditando(a)} aria-label="Editar">
                  <Pencil size={16} />
                </Boton>
                <BotonConfirmar variante="texto" onConfirm={() => accion(() => api(`/api/anuncios/${a.id}`, { method: "DELETE" }))} pregunta="¿Borrar?">
                  Borrar
                </BotonConfirmar>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormAviso({ aviso, ordenNuevo, onCerrar }: { aviso: AvisoAdmin | null; ordenNuevo: number; onCerrar: (ok: boolean) => void }) {
  const [f, setF] = useState({
    texto: aviso?.texto ?? "",
    enlace: aviso?.enlace ?? "",
    desde: aLocal(aviso?.desde ?? null),
    hasta: aLocal(aviso?.hasta ?? null),
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const cambiar = (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [e.target.name]: e.target.value });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (f.desde && f.hasta && f.desde > f.hasta) return setError("La fecha de fin debe ser posterior a la de inicio.");
    setEnviando(true);
    try {
      const json = { texto: f.texto.trim(), enlace: f.enlace.trim(), desde: f.desde, hasta: f.hasta };
      if (aviso) await api(`/api/anuncios/${aviso.id}`, { method: "PUT", json });
      else await api("/api/anuncios", { method: "POST", json: { ...json, orden: ordenNuevo } });
      onCerrar(true);
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <Tarjeta titulo={aviso ? "Editar aviso" : "Nuevo aviso"}>
      <form suppressHydrationWarning onSubmit={guardar} className="space-y-4">
        {error && <Alerta>{error}</Alerta>}
        <Campo label="Texto del aviso" name="texto" required minLength={3} maxLength={200} value={f.texto} onChange={cambiar} ayuda={`${f.texto.length}/200 · Corto y directo se lee mejor en movimiento`} />
        <Campo label="Enlace (opcional)" name="enlace" maxLength={300} value={f.enlace} onChange={cambiar} placeholder="/puntos-aliados  o  https://..." ayuda="Página del sitio (empieza por /) o enlace externo seguro (https://)" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Mostrar desde (opcional)" name="desde" type="datetime-local" value={f.desde} onChange={cambiar} />
          <Campo label="Mostrar hasta (opcional)" name="hasta" type="datetime-local" value={f.hasta} onChange={cambiar} />
        </div>
        <div className="flex gap-2">
          <Boton type="submit" cargando={enviando}>
            <Save size={16} /> Guardar
          </Boton>
          <Boton type="button" variante="texto" onClick={() => onCerrar(false)}>
            Cancelar
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
