// src/components/admin/AdminProgramacion.tsx — parrilla del canal ("Nuestra Programación")
"use client";

import { useState } from "react";
import { Clock, Pencil, Plus, Save } from "lucide-react";
import { Aviso, Boton, Campo, Cargando, Tarjeta, Vacio } from "@/components/ui";
import { BotonConfirmar, Interruptor } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { hora12, textoDias, type Programa } from "@/lib/programacion";
import { useApi } from "@/lib/useApi";

const DIAS = [
  { d: "1", l: "L" },
  { d: "2", l: "M" },
  { d: "3", l: "X" },
  { d: "4", l: "J" },
  { d: "5", l: "V" },
  { d: "6", l: "S" },
  { d: "7", l: "D" },
];

export default function AdminProgramacion() {
  const { data, error, cargando, recargar } = useApi<{ programas: Programa[] }>("/api/programacion/admin");
  const [editando, setEditando] = useState<Programa | "nuevo" | null>(null);
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
  const programas = data?.programas ?? [];

  return (
    <div className="space-y-6">
      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}
      {editando ? (
        <FormPrograma
          programa={editando === "nuevo" ? null : editando}
          onCerrar={(ok) => {
            setEditando(null);
            if (ok) recargar();
          }}
        />
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">Se muestra en el inicio y en la página de Radio. El programa que está al aire se resalta solo.</p>
          <Boton onClick={() => setEditando("nuevo")} className="whitespace-nowrap">
            <Plus size={16} /> Nuevo programa
          </Boton>
        </div>
      )}

      {!programas.length ? (
        <Vacio>Aún no hay programas.</Vacio>
      ) : (
        <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
          {programas.map((p) => (
            <div key={p.id} className={`flex items-center gap-4 p-4 ${p.activo ? "" : "opacity-50"}`}>
              <span className="w-11 h-11 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center shrink-0">
                <Clock size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-indigo truncate">{p.titulo}</p>
                <p className="text-sm text-gray-500">
                  {hora12(p.hora_inicio)}
                  {p.hora_fin && ` – ${hora12(p.hora_fin)}`} · {textoDias(p.dias)}
                </p>
              </div>
              <Interruptor
                activo={p.activo}
                etiqueta={p.activo ? `Ocultar ${p.titulo}` : `Mostrar ${p.titulo}`}
                onClick={() => accion(() => api(`/api/programacion/${p.id}`, { method: "PUT", json: { activo: !p.activo } }))}
              />
              <Boton variante="texto" className="px-2" onClick={() => setEditando(p)} aria-label={`Editar ${p.titulo}`}>
                <Pencil size={16} />
              </Boton>
              <BotonConfirmar variante="texto" pregunta="¿Borrar?" onConfirm={() => accion(() => api(`/api/programacion/${p.id}`, { method: "DELETE" }))}>
                Borrar
              </BotonConfirmar>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormPrograma({ programa, onCerrar }: { programa: Programa | null; onCerrar: (ok: boolean) => void }) {
  const [f, setF] = useState({
    titulo: programa?.titulo ?? "",
    descripcion: programa?.descripcion ?? "",
    hora_inicio: programa?.hora_inicio ?? "",
    hora_fin: programa?.hora_fin ?? "",
  });
  const [dias, setDias] = useState(programa?.dias ?? "1234567");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const cambiar = (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [e.target.name]: e.target.value });
  const alternarDia = (d: string) => setDias((x) => (x.includes(d) ? x.replace(d, "") : [...x, d].sort().join("")));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!dias) return setError("Elige al menos un día.");
    if (f.hora_fin && f.hora_fin <= f.hora_inicio) return setError("La hora de fin debe ser después de la de inicio.");
    setEnviando(true);
    try {
      const json = { titulo: f.titulo.trim(), descripcion: f.descripcion.trim(), hora_inicio: f.hora_inicio, hora_fin: f.hora_fin, dias };
      if (programa) await api(`/api/programacion/${programa.id}`, { method: "PUT", json });
      else await api("/api/programacion", { method: "POST", json });
      onCerrar(true);
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  };

  const atajo = (valor: string, label: string) => (
    <button type="button" onClick={() => setDias(valor)} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${dias === valor ? "bg-indigo text-white border-indigo" : "border-gray-300 text-gray-600"}`}>
      {label}
    </button>
  );

  return (
    <Tarjeta titulo={programa ? "Editar programa" : "Nuevo programa"}>
      <form suppressHydrationWarning onSubmit={guardar} className="space-y-4 max-w-2xl">
        {error && <Aviso>{error}</Aviso>}
        <Campo label="Nombre del programa" name="titulo" required minLength={2} maxLength={120} value={f.titulo} onChange={cambiar} />
        <Campo label="Descripción corta (opcional)" name="descripcion" maxLength={300} value={f.descripcion} onChange={cambiar} />
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Hora de inicio" name="hora_inicio" type="time" required value={f.hora_inicio} onChange={cambiar} />
          <Campo label="Hora de fin (opcional)" name="hora_fin" type="time" value={f.hora_fin} onChange={cambiar} />
        </div>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">Días</legend>
          <div className="flex flex-wrap items-center gap-2">
            {DIAS.map(({ d, l }) => (
              <button
                key={d}
                type="button"
                onClick={() => alternarDia(d)}
                aria-pressed={dias.includes(d)}
                className={`w-9 h-9 rounded-full font-bold text-sm transition-colors ${dias.includes(d) ? "bg-naranja text-white" : "bg-gray-100 text-gray-500"}`}
              >
                {l}
              </button>
            ))}
            <span className="w-px h-6 bg-gray-200 mx-1" />
            {atajo("1234567", "Todos")}
            {atajo("12345", "Lun-Vie")}
            {atajo("67", "Fin de semana")}
          </div>
          <p className="text-xs text-gray-500 mt-2">{dias ? textoDias(dias) : "Sin días"}</p>
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
    </Tarjeta>
  );
}
