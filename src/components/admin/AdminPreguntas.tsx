// src/components/admin/AdminPreguntas.tsx — preguntas frecuentes (/preguntas-frecuentes)
"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Save } from "lucide-react";
import { AreaTexto, Aviso, Boton, Campo, Cargando, Tarjeta } from "@/components/ui";
import { BotonConfirmar, Interruptor } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";

type Pregunta = { id: number; tema: string; pregunta: string; respuesta: string; activo: boolean };

export default function AdminPreguntas() {
  const { data, error, cargando, recargar } = useApi<{ preguntas: Pregunta[] }>("/api/preguntas/admin");
  const [editando, setEditando] = useState<Pregunta | "nueva" | null>(null);
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
  const lista = data?.preguntas ?? [];
  const temas = [...new Set(lista.map((p) => p.tema))];
  const mover = (i: number, dir: -1 | 1) => {
    const ids = lista.map((p) => p.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    accion(() => api("/api/preguntas/orden", { method: "PUT", json: { ids } }));
  };

  return (
    <Tarjeta
      titulo="Preguntas frecuentes"
      accion={
        <div className="flex flex-wrap gap-2">
          <a href="/preguntas-frecuentes" target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo hover:text-naranja px-3 py-2">
            <ExternalLink size={14} /> Ver página
          </a>
          <Boton onClick={() => setEditando("nueva")}>
            <Plus size={16} /> Nueva pregunta
          </Boton>
        </div>
      }
    >
      <p className="text-sm text-gray-500 mb-4">
        Se muestran en el Centro de ayuda agrupadas por tema, en este orden. Las ocultas no se ven en el sitio. Los cambios se publican al instante.
      </p>
      {(error || errorAccion) && (
        <div className="mb-4">
          <Aviso>{error || errorAccion}</Aviso>
        </div>
      )}
      {editando && (
        <FormPregunta
          pregunta={editando === "nueva" ? null : editando}
          temas={temas}
          onCerrar={(ok) => {
            setEditando(null);
            if (ok) recargar();
          }}
        />
      )}
      {lista.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">Aún no hay preguntas. Crea la primera.</p>
      ) : (
        <ol className="divide-y divide-gray-100 rounded-xl ring-1 ring-black/5 overflow-hidden">
          {lista.map((p, i) => (
            <li key={p.id} className={`flex items-start gap-3 p-3 bg-white ${p.activo ? "" : "opacity-50"}`}>
              <div className="flex flex-col pt-1">
                <button onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="p-0.5 text-gray-400 hover:text-indigo disabled:opacity-20">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => mover(i, 1)} disabled={i === lista.length - 1} aria-label="Bajar" className="p-0.5 text-gray-400 hover:text-indigo disabled:opacity-20">
                  <ArrowDown size={14} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-naranja">{p.tema}</p>
                <p className="font-bold text-indigo">{p.pregunta}</p>
                <p className="text-sm text-gray-500 line-clamp-2">{p.respuesta}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Interruptor
                  activo={p.activo}
                  etiqueta={p.activo ? "Ocultar pregunta" : "Mostrar pregunta"}
                  onClick={() => accion(() => api(`/api/preguntas/${p.id}`, { method: "PUT", json: { activo: !p.activo } }))}
                />
                <Boton variante="texto" className="px-2" onClick={() => setEditando(p)} aria-label="Editar pregunta">
                  <Pencil size={16} />
                </Boton>
                <BotonConfirmar variante="texto" pregunta="¿Borrar?" onConfirm={() => accion(() => api(`/api/preguntas/${p.id}`, { method: "DELETE" }))}>
                  Borrar
                </BotonConfirmar>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Tarjeta>
  );
}

function FormPregunta({ pregunta, temas, onCerrar }: { pregunta: Pregunta | null; temas: string[]; onCerrar: (ok: boolean) => void }) {
  const [tema, setTema] = useState(pregunta?.tema ?? temas[0] ?? "");
  const [texto, setTexto] = useState(pregunta?.pregunta ?? "");
  const [respuesta, setRespuesta] = useState(pregunta?.respuesta ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const json = { tema: tema.trim(), pregunta: texto.trim(), respuesta: respuesta.trim() };
      if (pregunta) await api(`/api/preguntas/${pregunta.id}`, { method: "PUT", json });
      else await api("/api/preguntas", { method: "POST", json });
      onCerrar(true);
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <form suppressHydrationWarning onSubmit={guardar} className="mb-5 rounded-xl bg-naranja-claro/60 p-4 space-y-4">
      {error && <Aviso>{error}</Aviso>}
      <div>
        <Campo label="Tema" name="tema" list="temas-faq" required minLength={2} maxLength={60} value={tema} onChange={(e) => setTema(e.target.value)} />
        <datalist id="temas-faq">
          {temas.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <p className="text-xs text-gray-500 mt-1">Elige uno existente o escribe uno nuevo (ej. Compras, Puntos Aliados).</p>
      </div>
      <Campo label="Pregunta" name="pregunta" required minLength={5} maxLength={200} value={texto} onChange={(e) => setTexto(e.target.value)} />
      <AreaTexto
        label="Respuesta"
        name="respuesta"
        required
        minLength={5}
        maxLength={4000}
        rows={6}
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        placeholder="Deja una línea en blanco para separar párrafos."
      />
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
