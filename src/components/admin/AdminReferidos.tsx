// src/components/admin/AdminReferidos.tsx — administración manual del programa "Refiere y gana"
"use client";

import { useState } from "react";
import { AlertTriangle, CalendarDays, Gift, Medal, Search, Settings, ShieldAlert, Trophy, Users } from "lucide-react";
import { Aviso, Boton, Cargando, Etiqueta, Vacio, inputClase } from "@/components/ui";
import { BotonConfirmar, Estadistica, Paginador } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import { useApi } from "@/lib/useApi";
import { RetosAdmin, MetasAdmin, ConfigReferidos } from "./ReferidosConfig";

type Sub = "referidos" | "ganadores" | "retos" | "metas" | "config";
type Resumen = {
  referidos: { total: number; validos: number; pendientes: number; por_revisar: number; rechazados: number; validos_hoy: number };
  premios: { total: number; por_entregar: number };
  ajustes: { activo: boolean; requisito: string };
};

const SUBS: { id: Sub; label: string; icon: typeof Users }[] = [
  { id: "referidos", label: "Referidos", icon: Users },
  { id: "ganadores", label: "Ganadores", icon: Trophy },
  { id: "retos", label: "Retos Lun-Dom", icon: CalendarDays },
  { id: "metas", label: "Metas", icon: Medal },
  { id: "config", label: "Configuración", icon: Settings },
];

export default function AdminReferidos() {
  const [sub, setSub] = useState<Sub>("referidos");
  const resumen = useApi<Resumen>("/api/referidos/admin/resumen");
  const r = resumen.data;

  return (
    <div className="space-y-6">
      {r && !r.ajustes.activo && <Aviso tipo="alerta">El programa está apagado: los referidos se registran pero no ganan premios. Actívalo en Configuración.</Aviso>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Estadistica label="Referidos que cuentan" valor={r?.referidos.validos ?? "…"} icon={Users} tono="verde" onClick={() => setSub("referidos")} />
        <Estadistica label="Válidos hoy" valor={r?.referidos.validos_hoy ?? "…"} icon={Gift} tono="amarillo" />
        <Estadistica label="Sospechosos por revisar" valor={r?.referidos.por_revisar ?? "…"} icon={ShieldAlert} tono="rojo" onClick={() => setSub("referidos")} />
        <Estadistica label="Premios por entregar" valor={r?.premios.por_entregar ?? "…"} icon={Trophy} tono="azul" onClick={() => setSub("ganadores")} />
      </div>

      <div className="flex gap-2 overflow-x-auto sin-scrollbar">
        {SUBS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className={`flex items-center gap-2 whitespace-nowrap text-sm font-bold px-4 py-2 rounded-full transition-colors ${sub === id ? "bg-indigo text-white" : "bg-white text-indigo ring-1 ring-gray-200"}`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {sub === "referidos" && <ListaReferidos alCambiar={resumen.recargar} />}
      {sub === "ganadores" && <Ganadores alCambiar={resumen.recargar} />}
      {sub === "retos" && <RetosAdmin />}
      {sub === "metas" && <MetasAdmin />}
      {sub === "config" && <ConfigReferidos alCambiar={resumen.recargar} />}
    </div>
  );
}

type Fila = {
  id: number;
  estado: "PENDIENTE" | "VALIDO" | "RECHAZADO";
  sospechoso: boolean;
  motivo: string | null;
  created_at: string;
  referidor_nombre: string;
  referidor_email: string;
  referidor_cedula: string | null;
  codigo_ref: string;
  referido_nombre: string;
  referido_email: string;
  referido_cedula: string | null;
  referido_correo_ok: boolean;
  referido_verificacion: string;
  referido_ip: string | null;
};

const ESTADO = {
  VALIDO: "bg-green-100 text-green-800",
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  RECHAZADO: "bg-gray-200 text-gray-600",
};

function ListaReferidos({ alCambiar }: { alCambiar: () => void }) {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState("");
  const [soloSospechosos, setSoloSospechosos] = useState(false);
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const qs = new URLSearchParams({ page: String(page) });
  if (estado) qs.set("estado", estado);
  if (soloSospechosos) qs.set("sospechoso", "1");
  if (busqueda) qs.set("q", busqueda);
  const { data, error, cargando, recargar } = useApi<{ referidos: Fila[]; total: number; page: number; pages: number }>(`/api/referidos/admin/lista?${qs}`);

  const cambiar = async (id: number, nuevo: "VALIDO" | "RECHAZADO") => {
    setErrorAccion("");
    try {
      await api(`/api/referidos/admin/${id}`, { method: "PATCH", json: { estado: nuevo, motivo: nuevo === "RECHAZADO" ? "Rechazado por el administrador" : undefined } });
      recargar();
      alCambiar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {["", "PENDIENTE", "VALIDO", "RECHAZADO"].map((e) => (
            <button
              key={e || "todos"}
              onClick={() => {
                setEstado(e);
                setPage(1);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${estado === e ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"}`}
            >
              {e ? { PENDIENTE: "Pendientes", VALIDO: "Válidos", RECHAZADO: "Rechazados" }[e] : "Todos"}
            </button>
          ))}
          <label className="flex items-center gap-1.5 text-xs font-bold text-rojo ml-1">
            <input suppressHydrationWarning type="checkbox" checked={soloSospechosos} onChange={(e) => (setSoloSospechosos(e.target.checked), setPage(1))} className="accent-rojo" />
            Solo sospechosos
          </label>
        </div>
        <form suppressHydrationWarning
          onSubmit={(e) => {
            e.preventDefault();
            setBusqueda(q.trim());
            setPage(1);
          }}
          className="flex gap-2"
          role="search"
        >
          <input suppressHydrationWarning value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cédula, correo, nombre o código" aria-label="Buscar referidos" className={`${inputClase} py-1.5 text-sm lg:w-72`} maxLength={100} />
          <Boton type="submit" variante="azul" className="px-3" aria-label="Buscar">
            <Search size={16} />
          </Boton>
        </form>
      </div>
      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}
      {cargando ? (
        <Cargando />
      ) : !data?.referidos.length ? (
        <Vacio>No hay referidos con estos filtros.</Vacio>
      ) : (
        <>
          <p className="text-xs text-gray-500">{data.total} referido(s)</p>
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Quien invita</th>
                  <th className="px-4 py-3">Invitado</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.referidos.map((r) => (
                  <tr key={r.id} className={r.sospechoso && r.estado === "PENDIENTE" ? "bg-red-50/50" : ""}>
                    <td className="px-4 py-3 align-top">
                      <p className="font-bold text-indigo">{r.referidor_nombre}</p>
                      <p className="text-xs text-gray-500">CC {r.referidor_cedula ?? "—"} · {r.codigo_ref}</p>
                      <p className="text-xs text-gray-400">{r.referidor_email}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-bold text-indigo">{r.referido_nombre}</p>
                      <p className="text-xs text-gray-500">CC {r.referido_cedula ?? <span className="text-rojo font-bold">sin cédula</span>}</p>
                      <p className="text-xs text-gray-400">
                        {r.referido_email} · {r.referido_correo_ok ? "correo ✓" : <span className="text-naranja font-bold">correo sin confirmar</span>}
                        {r.referido_verificacion === "VERIFICADO" && " · identidad ✓"}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {formatDate(r.created_at)}
                        {r.referido_ip && ` · IP ${r.referido_ip}`}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Etiqueta clase={ESTADO[r.estado]}>{r.estado === "VALIDO" ? "Válido" : r.estado === "PENDIENTE" ? "Pendiente" : "Rechazado"}</Etiqueta>
                      {r.sospechoso && r.estado === "PENDIENTE" && (
                        <p className="flex items-start gap-1 text-[11px] text-rojo font-bold mt-1 max-w-48">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {r.motivo}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                      {r.estado !== "VALIDO" && (
                        <Boton variante="azul" className="text-xs px-3 py-1.5" onClick={() => cambiar(r.id, "VALIDO")}>
                          Aprobar
                        </Boton>
                      )}{" "}
                      {r.estado !== "RECHAZADO" && (
                        <BotonConfirmar pregunta="¿Rechazar?" onConfirm={() => cambiar(r.id, "RECHAZADO")}>
                          Rechazar
                        </BotonConfirmar>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginador page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

type Ganador = {
  id: number;
  tipo: "META" | "RETO";
  premio: string;
  posicion: number | null;
  estado: "PENDIENTE" | "ENTREGADO" | "ANULADO";
  notas: string | null;
  created_at: string;
  fecha_reto: string | null;
  nombre: string;
  email: string;
  cedula: string | null;
  telefono: string | null;
  total_referidos: number;
};

function Ganadores({ alCambiar }: { alCambiar: () => void }) {
  const [estado, setEstado] = useState("PENDIENTE");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const qs = new URLSearchParams({ page: String(page) });
  if (estado) qs.set("estado", estado);
  if (busqueda) qs.set("q", busqueda);
  const { data, error, cargando, recargar } = useApi<{ ganadores: Ganador[]; total: number; page: number; pages: number }>(`/api/referidos/admin/ganadores?${qs}`);

  const marcar = async (id: number, nuevo: Ganador["estado"]) => {
    setErrorAccion("");
    try {
      await api(`/api/referidos/admin/ganadores/${id}`, { method: "PATCH", json: { estado: nuevo } });
      recargar();
      alCambiar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { v: "PENDIENTE", l: "Por entregar" },
            { v: "ENTREGADO", l: "Entregados" },
            { v: "ANULADO", l: "Anulados" },
            { v: "", l: "Todos" },
          ].map((f) => (
            <button
              key={f.v || "todos"}
              onClick={() => (setEstado(f.v), setPage(1))}
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${estado === f.v ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"}`}
            >
              {f.l}
            </button>
          ))}
        </div>
        <form suppressHydrationWarning onSubmit={(e) => (e.preventDefault(), setBusqueda(q.trim()), setPage(1))} className="flex gap-2" role="search">
          <input suppressHydrationWarning value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cédula, correo o nombre" aria-label="Buscar ganadores" className={`${inputClase} py-1.5 text-sm`} maxLength={100} />
          <Boton type="submit" variante="azul" className="px-3" aria-label="Buscar">
            <Search size={16} />
          </Boton>
        </form>
      </div>
      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}
      {cargando ? (
        <Cargando />
      ) : !data?.ganadores.length ? (
        <Vacio>No hay ganadores con este filtro.</Vacio>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.ganadores.map((g) => (
              <article key={g.id} className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-indigo flex items-center gap-2">
                      <Trophy size={16} className="text-amarillo" /> {g.premio}
                    </p>
                    <p className="text-xs text-gray-500">
                      {g.tipo === "RETO" ? `Reto del ${g.fecha_reto}${g.posicion ? ` · puesto ${g.posicion}` : ""}` : `Meta · ganador #${g.posicion ?? "—"}`} · {formatDate(g.created_at)}
                    </p>
                  </div>
                  <Etiqueta clase={g.estado === "ENTREGADO" ? "bg-green-100 text-green-800" : g.estado === "ANULADO" ? "bg-gray-200 text-gray-600" : "bg-amarillo/30 text-indigo"}>
                    {g.estado === "PENDIENTE" ? "Por entregar" : g.estado === "ENTREGADO" ? "Entregado" : "Anulado"}
                  </Etiqueta>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-bold text-indigo">{g.nombre}</p>
                  <p className="text-xs">
                    CC {g.cedula ?? "—"} · {g.email}
                    {g.telefono && ` · ${g.telefono}`}
                  </p>
                  <p className="text-xs text-gray-400">{g.total_referidos} referidos válidos en total</p>
                  {g.notas && <p className="text-xs mt-1 bg-gray-50 rounded px-2 py-1">{g.notas}</p>}
                </div>
                <div className="flex gap-2 mt-4">
                  {g.estado !== "ENTREGADO" && (
                    <Boton variante="azul" className="text-xs px-3 py-1.5" onClick={() => marcar(g.id, "ENTREGADO")}>
                      Marcar entregado
                    </Boton>
                  )}
                  {g.estado !== "ANULADO" && (
                    <BotonConfirmar pregunta="¿Anular? (libera el cupo)" onConfirm={() => marcar(g.id, "ANULADO")}>
                      Anular
                    </BotonConfirmar>
                  )}
                </div>
              </article>
            ))}
          </div>
          <Paginador page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
