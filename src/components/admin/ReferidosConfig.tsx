// src/components/admin/ReferidosConfig.tsx — retos (Lun-Dom + fechas), metas y configuración del programa
"use client";

import { useState } from "react";
import { Pencil, Plus, Save } from "lucide-react";
import { Aviso, Boton, Campo, Cargando, Tarjeta, Vacio } from "@/components/ui";
import { BotonConfirmar, Interruptor } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { DIAS_SEMANA, fechaCorta, type Meta, type Reto } from "@/lib/referidos";

// ===================== RETOS =====================
type RetosResp = { semana: (Reto & { dia: number })[]; fechas: Reto[]; hoy: string };

export function RetosAdmin() {
  const { data, error, cargando, recargar } = useApi<RetosResp>("/api/referidos/admin/retos");
  const [editDia, setEditDia] = useState<number | null>(null);
  const [editFecha, setEditFecha] = useState<Reto | "nueva" | null>(null);
  if (cargando) return <Cargando />;
  if (!data) return <Aviso>{error ?? "No se pudieron cargar los retos"}</Aviso>;

  return (
    <div className="space-y-6">
      <Tarjeta titulo="Reto predeterminado de cada día">
        <p className="text-sm text-gray-500 mb-4">
          Se repite todas las semanas. &quot;Los primeros <b>X ganadores</b> que consigan <b>N referidos</b> ese día ganan el premio&quot;. Para un día especial, crea un reto por fecha abajo.
        </p>
        <div className="divide-y divide-gray-100 rounded-xl ring-1 ring-black/5 overflow-hidden">
          {data.semana.map((d) =>
            editDia === d.dia ? (
              <FormReto
                key={d.dia}
                titulo={DIAS_SEMANA[d.dia]}
                reto={d}
                url={`/api/referidos/admin/retos/semana/${d.dia}`}
                onCerrar={(ok) => {
                  setEditDia(null);
                  if (ok) recargar();
                }}
              />
            ) : (
              <div key={d.dia} className={`flex items-center gap-4 p-4 bg-white ${d.activo ? "" : "opacity-50"}`}>
                <span className="w-24 font-extrabold text-indigo">{DIAS_SEMANA[d.dia]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-indigo truncate">{d.premio}</p>
                  <p className="text-xs text-gray-500">
                    Primeros {d.ganadores} en llegar a {d.referidos_necesarios} referidos {d.activo ? "" : "· desactivado"}
                  </p>
                </div>
                <Boton variante="texto" className="px-2" onClick={() => setEditDia(d.dia)} aria-label={`Editar ${DIAS_SEMANA[d.dia]}`}>
                  <Pencil size={16} />
                </Boton>
              </div>
            )
          )}
        </div>
      </Tarjeta>

      <Tarjeta
        titulo="Retos por fecha (días especiales)"
        accion={
          <Boton onClick={() => setEditFecha("nueva")}>
            <Plus size={16} /> Programar fecha
          </Boton>
        }
      >
        <p className="text-sm text-gray-500 mb-4">Reemplazan el reto predeterminado de ese día (ej. Black Friday o aniversario del canal).</p>
        {editFecha && (
          <FormReto
            titulo={editFecha === "nueva" ? "Nuevo reto por fecha" : fechaCorta(editFecha.fecha)}
            reto={editFecha === "nueva" ? null : editFecha}
            conFecha={editFecha === "nueva" ? data.hoy : undefined}
            url={editFecha === "nueva" ? null : `/api/referidos/admin/retos/fecha/${editFecha.fecha}`}
            onCerrar={(ok) => {
              setEditFecha(null);
              if (ok) recargar();
            }}
          />
        )}
        {!data.fechas.length ? (
          <Vacio>No hay días especiales programados.</Vacio>
        ) : (
          <div className="divide-y divide-gray-100 rounded-xl ring-1 ring-black/5 overflow-hidden mt-4">
            {data.fechas.map((f) => (
              <div key={f.fecha} className={`flex items-center gap-4 p-4 bg-white ${f.fecha < data.hoy ? "opacity-50" : ""}`}>
                <span className="w-36 font-extrabold text-indigo capitalize">{fechaCorta(f.fecha)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-indigo truncate">{f.premio}</p>
                  <p className="text-xs text-gray-500">
                    Primeros {f.ganadores} en llegar a {f.referidos_necesarios} · {f.ganadores_actuales ?? 0} ganadores {f.activo ? "" : "· desactivado"}
                  </p>
                </div>
                <Boton variante="texto" className="px-2" onClick={() => setEditFecha(f)} aria-label="Editar">
                  <Pencil size={16} />
                </Boton>
                <BotonConfirmar
                  variante="texto"
                  pregunta="¿Quitar?"
                  onConfirm={async () => {
                    await api(`/api/referidos/admin/retos/fecha/${f.fecha}`, { method: "DELETE" });
                    recargar();
                  }}
                >
                  Quitar
                </BotonConfirmar>
              </div>
            ))}
          </div>
        )}
      </Tarjeta>
    </div>
  );
}

function FormReto({ titulo, reto, url, conFecha, onCerrar }: { titulo: string; reto: Reto | null; url: string | null; conFecha?: string; onCerrar: (ok: boolean) => void }) {
  const [f, setF] = useState({
    fecha: conFecha ?? "",
    premio: reto?.premio ?? "",
    descripcion: reto?.descripcion ?? "",
    referidos_necesarios: String(reto?.referidos_necesarios ?? 3),
    ganadores: String(reto?.ganadores ?? 5),
  });
  const [activo, setActivo] = useState(reto?.activo ?? true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const cambiar = (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [e.target.name]: e.target.value });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const destino = url ?? `/api/referidos/admin/retos/fecha/${f.fecha}`;
      await api(destino, {
        method: "PUT",
        json: { activo, premio: f.premio.trim(), descripcion: f.descripcion.trim(), referidos_necesarios: Number(f.referidos_necesarios), ganadores: Number(f.ganadores) },
      });
      onCerrar(true);
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <form suppressHydrationWarning onSubmit={guardar} className="bg-naranja-claro/60 p-4 space-y-3">
      <p className="font-extrabold text-indigo capitalize">{titulo}</p>
      {error && <Aviso>{error}</Aviso>}
      {conFecha !== undefined && <Campo label="Fecha" name="fecha" type="date" required min={conFecha} value={f.fecha} onChange={cambiar} />}
      <Campo label="Premio" name="premio" required minLength={2} maxLength={200} value={f.premio} onChange={cambiar} />
      <Campo label="Descripción (opcional)" name="descripcion" maxLength={500} value={f.descripcion} onChange={cambiar} />
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Referidos necesarios ese día" name="referidos_necesarios" type="number" min={1} max={1000} required value={f.referidos_necesarios} onChange={cambiar} />
        <Campo label="Cantidad de ganadores (los primeros)" name="ganadores" type="number" min={1} max={10000} required value={f.ganadores} onChange={cambiar} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Interruptor activo={activo} etiqueta="Reto activo" onClick={() => setActivo(!activo)} />
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

// ===================== METAS =====================
export function MetasAdmin() {
  const { data, error, cargando, recargar } = useApi<{ metas: Meta[] }>("/api/referidos/admin/metas");
  const [editando, setEditando] = useState<Meta | "nueva" | null>(null);
  if (cargando) return <Cargando />;
  const metas = data?.metas ?? [];

  return (
    <div className="space-y-4">
      {error && <Aviso>{error}</Aviso>}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Premios por referidos acumulados (sin importar el día). El cupo limita cuántas personas pueden ganarlo.</p>
        <Boton onClick={() => setEditando("nueva")} className="whitespace-nowrap">
          <Plus size={16} /> Nueva meta
        </Boton>
      </div>
      {editando && (
        <FormMeta
          meta={editando === "nueva" ? null : editando}
          onCerrar={(ok) => {
            setEditando(null);
            if (ok) recargar();
          }}
        />
      )}
      {!metas.length ? (
        <Vacio>No hay metas.</Vacio>
      ) : (
        <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
          {metas.map((m) => (
            <div key={m.id} className={`flex items-center gap-4 p-4 ${m.activo ? "" : "opacity-50"}`}>
              <span className="w-14 h-14 rounded-xl bg-naranja text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-extrabold leading-none">{m.referidos_necesarios}</span>
                <span className="text-[9px] font-bold uppercase">refer.</span>
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-indigo truncate">{m.nombre}</p>
                <p className="text-xs text-gray-500">
                  {m.ganadores} ganador(es){m.cupo ? ` de ${m.cupo}` : " · sin límite"}
                </p>
              </div>
              <Interruptor
                activo={!!m.activo}
                etiqueta={m.activo ? "Desactivar" : "Activar"}
                onClick={async () => {
                  await api(`/api/referidos/admin/metas/${m.id}`, { method: "PUT", json: { activo: !m.activo } });
                  recargar();
                }}
              />
              <Boton variante="texto" className="px-2" onClick={() => setEditando(m)} aria-label="Editar">
                <Pencil size={16} />
              </Boton>
              <BotonConfirmar
                variante="texto"
                pregunta="¿Borrar?"
                onConfirm={async () => {
                  await api(`/api/referidos/admin/metas/${m.id}`, { method: "DELETE" });
                  recargar();
                }}
              >
                Borrar
              </BotonConfirmar>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormMeta({ meta, onCerrar }: { meta: Meta | null; onCerrar: (ok: boolean) => void }) {
  const [f, setF] = useState({
    nombre: meta?.nombre ?? "",
    descripcion: meta?.descripcion ?? "",
    imagen_url: meta?.imagen_url ?? "",
    referidos_necesarios: String(meta?.referidos_necesarios ?? 5),
    cupo: meta?.cupo ? String(meta.cupo) : "",
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const cambiar = (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [e.target.name]: e.target.value });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const json = {
        nombre: f.nombre.trim(),
        descripcion: f.descripcion.trim(),
        imagen_url: f.imagen_url.trim(),
        referidos_necesarios: Number(f.referidos_necesarios),
        cupo: f.cupo ? Number(f.cupo) : null,
      };
      if (meta) await api(`/api/referidos/admin/metas/${meta.id}`, { method: "PUT", json });
      else await api("/api/referidos/admin/metas", { method: "POST", json });
      onCerrar(true);
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <Tarjeta titulo={meta ? "Editar meta" : "Nueva meta"}>
      <form suppressHydrationWarning onSubmit={guardar} className="space-y-3 max-w-2xl">
        {error && <Aviso>{error}</Aviso>}
        <Campo label="Premio" name="nombre" required minLength={2} maxLength={150} value={f.nombre} onChange={cambiar} placeholder="Televisor 32 pulgadas" />
        <Campo label="Descripción (opcional)" name="descripcion" maxLength={500} value={f.descripcion} onChange={cambiar} />
        <Campo label="Imagen (opcional)" name="imagen_url" maxLength={500} value={f.imagen_url} onChange={cambiar} placeholder="https://..." />
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Referidos necesarios" name="referidos_necesarios" type="number" min={1} required value={f.referidos_necesarios} onChange={cambiar} />
          <Campo label="Cupo de ganadores (vacío = sin límite)" name="cupo" type="number" min={1} value={f.cupo} onChange={cambiar} />
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

// ===================== CONFIGURACIÓN =====================
const REQUISITOS = [
  { v: "EMAIL", t: "Correo confirmado + cédula", d: "Recomendado. Automático y frena las cuentas falsas más comunes (una cédula = una cuenta)." },
  { v: "IDENTIDAD", t: "Identidad verificada (cédula + rostro)", d: "El más seguro. Cada referido debe pasar la verificación que apruebas en Usuarios." },
  { v: "COMPRA", t: "Primera compra entregada", d: "Ideal para premiar ventas: solo cuenta cuando el invitado compra y recibe su pedido." },
];

export function ConfigReferidos({ alCambiar }: { alCambiar: () => void }) {
  const { data, cargando, recargar } = useApi<{ ajustes: { activo: boolean; requisito: string } }>("/api/referidos/admin/resumen");
  const [msg, setMsg] = useState("");
  if (cargando || !data) return <Cargando />;
  const a = data.ajustes;

  const guardar = async (json: object) => {
    setMsg("");
    try {
      await api("/api/referidos/admin/ajustes", { method: "PUT", json });
      recargar();
      alCambiar();
      setMsg("Guardado.");
    } catch (e) {
      setMsg(mensajeError(e));
    }
  };

  return (
    <div className="space-y-6">
      {msg && <Aviso tipo="ok">{msg}</Aviso>}
      <Tarjeta titulo="Programa de referidos">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">Si lo apagas, los registros con enlace se siguen guardando pero nadie gana premios y la sección desaparece del inicio.</p>
          <Interruptor activo={a.activo} etiqueta="Programa activo" onClick={() => guardar({ activo: !a.activo })} />
        </div>
      </Tarjeta>
      <Tarjeta titulo="¿Cuándo cuenta un referido?">
        <div className="space-y-3">
          {REQUISITOS.map((r) => (
            <label key={r.v} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer ${a.requisito === r.v ? "border-naranja bg-naranja-claro/50" : "border-gray-200"}`}>
              <input suppressHydrationWarning type="radio" name="requisito" checked={a.requisito === r.v} onChange={() => guardar({ requisito: r.v })} className="mt-1 accent-naranja" />
              <span>
                <b className="text-indigo">{r.t}</b>
                <br />
                <span className="text-sm text-gray-500">{r.d}</span>
              </span>
            </label>
          ))}
        </div>
      </Tarjeta>
      <Tarjeta titulo="Protección contra fraude (siempre activa)">
        <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
          <li>Una cédula solo puede tener una cuenta (no se puede repetir).</li>
          <li>Se marcan como <b>sospechosos</b> (no cuentan hasta que tú los apruebes): misma IP de quien invita, 3 o más cuentas desde la misma IP en 24 h, o correos temporales.</li>
          <li>Robots: campo trampa invisible, tiempo mínimo para llenar el formulario y límite de intentos por IP. Opcional: Cloudflare Turnstile (ver README).</li>
          <li>Los administradores no participan, y nadie puede referirse a sí mismo.</li>
          <li>Anular un premio libera su cupo para el siguiente.</li>
        </ul>
      </Tarjeta>
    </div>
  );
}
