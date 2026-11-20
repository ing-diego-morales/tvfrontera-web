// src/components/admin/AdminAliados.tsx — aprobar/suspender, plan y mensualidades
"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, History, Mail, MapPin, Phone, Search, Star, TrendingUp, Wallet } from "lucide-react";
import { Aviso, Boton, Campo, Cargando, Etiqueta, Selector, Vacio, inputClase } from "@/components/ui";
import { BotonConfirmar } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { ESTADO_SOCIO, VERIFICACION, formatCOP, formatDia } from "@/lib/format";
import { formatDate, timeAgo } from "@/lib/date-utils";
import { EstadoConexion, Verificado } from "@/components/Insignias";
import { useApi } from "@/lib/useApi";

type AliadoAdmin = {
  id: number;
  slug: string;
  nombre_negocio: string;
  ciudad: string;
  categoria: string | null;
  whatsapp: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: "PENDIENTE" | "APROBADO" | "SUSPENDIDO";
  plan: "BASICO" | "PREMIUM";
  prioridad: number;
  destacado_hasta: string | null;
  destacado: boolean;
  en_linea: boolean;
  ultimo_acceso: string | null;
  pagado_hasta: string | null;
  vigente: boolean;
  created_at: string;
  responsable: string;
  email: string;
  responsable_telefono: string | null;
  cedula: string | null;
  verificacion: keyof typeof VERIFICACION;
  total_productos: number;
};

type Pago = { id: number; monto: number; meses: number; periodo_desde: string; periodo_hasta: string; metodo: string | null; referencia: string | null; registrado_por_nombre: string | null; created_at: string };

const FILTROS = [
  { v: "", label: "Todos" },
  { v: "PENDIENTE", label: "Por revisar" },
  { v: "APROBADO", label: "Aprobados" },
  { v: "VENCIDO", label: "Vencidos" },
  { v: "SUSPENDIDO", label: "Suspendidos" },
];

export default function AdminAliados({ filtroInicial = "" }: { filtroInicial?: string }) {
  const [filtro, setFiltro] = useState(filtroInicial);
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const qs = new URLSearchParams();
  if (filtro) qs.set("estado", filtro);
  if (busqueda) qs.set("q", busqueda);
  const { data, error, cargando, recargar } = useApi<{ socios: AliadoAdmin[] }>(`/api/admin/socios?${qs}`);
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
  const patch = (id: number, json: object) => accion(() => api(`/api/admin/socios/${id}`, { method: "PATCH", json }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.v}
              onClick={() => setFiltro(f.v)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${filtro === f.v ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form suppressHydrationWarning
          onSubmit={(e) => {
            e.preventDefault();
            setBusqueda(q.trim());
          }}
          className="flex gap-2"
          role="search"
        >
          <input suppressHydrationWarning value={q} onChange={(e) => setQ(e.target.value)} placeholder="Negocio, nombre o correo" aria-label="Buscar aliados" className={`${inputClase} py-1.5 text-sm`} maxLength={100} />
          <Boton type="submit" variante="azul" className="px-3" aria-label="Buscar">
            <Search size={16} />
          </Boton>
        </form>
      </div>

      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}

      {cargando ? (
        <Cargando />
      ) : !data?.socios.length ? (
        <Vacio>No hay Puntos Aliados con este filtro.</Vacio>
      ) : (
        <div className="space-y-4">
          {data.socios.map((s) => (
            <FilaAliado key={s.id} s={s} patch={patch} onPago={recargar} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilaAliado({ s, patch, onPago }: { s: AliadoAdmin; patch: (id: number, json: object) => Promise<void>; onPago: () => void }) {
  const [panel, setPanel] = useState<"pago" | "historial" | "posicion" | null>(null);
  const estado = s.estado === "APROBADO" && !s.vigente ? "VENCIDO" : s.estado;
  const est = ESTADO_SOCIO[estado];
  const ver = VERIFICACION[s.verificacion];

  return (
    <article className={`bg-white rounded-xl shadow-md overflow-hidden ${s.destacado ? "ring-2 ring-amarillo" : ""}`}>
      <div className="p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <EstadoConexion enLinea={s.en_linea} ultimoAcceso={s.ultimo_acceso} />
            <h3 className="font-bold text-indigo text-lg">{s.nombre_negocio}</h3>
            <Etiqueta clase={est.clase}>{est.label}</Etiqueta>
            {s.verificacion === "VERIFICADO" && <Verificado tamano="xs" />}
            {s.vigente && (
              <Link href={`/puntos-aliados/${s.slug}`} target="_blank" className="text-gray-400 hover:text-indigo" aria-label="Ver tienda pública">
                <ExternalLink size={14} />
              </Link>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {[s.categoria, s.ciudad, `${s.total_productos} productos`].filter(Boolean).join(" · ")}
            {" · "}
            {s.en_linea ? <span className="text-green-700 font-medium">en línea</span> : s.ultimo_acceso ? `visto ${timeAgo(s.ultimo_acceso).toLowerCase()}` : "nunca ha entrado"}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
            <span className="font-bold text-gray-700">{s.responsable}</span>
            <span className="flex items-center gap-1">
              <Mail size={12} /> {s.email}
            </span>
            {(s.whatsapp || s.responsable_telefono) && (
              <span className="flex items-center gap-1">
                <Phone size={12} /> {s.whatsapp || s.responsable_telefono}
              </span>
            )}
            {s.direccion ? (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {s.direccion}
              </span>
            ) : (
              <Etiqueta clase="bg-red-50 text-red-700">Sin dirección</Etiqueta>
            )}
            <span>CC {s.cedula ?? "—"}</span>
            {s.verificacion !== "VERIFICADO" && <Etiqueta clase={ver.clase}>Identidad: {ver.label}</Etiqueta>}
          </div>
          <p className="text-xs mt-2">
            <span className="text-gray-500">Mensualidad pagada hasta: </span>
            <b className={s.vigente ? "text-green-700" : "text-naranja"}>{formatDia(s.pagado_hasta)}</b>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0">
          {s.estado !== "APROBADO" && (
            <Boton variante="azul" className="text-xs px-3 py-1.5" onClick={() => patch(s.id, { estado: "APROBADO" })}>
              {s.estado === "SUSPENDIDO" ? "Reactivar" : "Aprobar"}
            </Boton>
          )}
          {s.estado === "APROBADO" && (
            <BotonConfirmar onConfirm={() => patch(s.id, { estado: "SUSPENDIDO" })} pregunta="¿Suspender? Desaparece del sitio">
              Suspender
            </BotonConfirmar>
          )}
          <Boton variante="rojo" className="text-xs px-3 py-1.5" onClick={() => setPanel(panel === "pago" ? null : "pago")}>
            <Wallet size={14} /> Registrar pago
          </Boton>
          <Boton variante="texto" className="text-xs px-3 py-1.5" onClick={() => setPanel(panel === "historial" ? null : "historial")}>
            <History size={14} /> Historial de pagos
          </Boton>
        </div>
      </div>

      {/* POSICIONAMIENTO: siempre visible (quién aparece primero en el sitio) */}
      <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-indigo">
          <TrendingUp size={16} className="text-naranja" /> Posicionamiento
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={14} className={s.destacado ? "text-amarillo" : "text-gray-300"} fill={s.destacado ? "currentColor" : "none"} />
          Impulso: <b className={s.destacado ? "text-indigo" : "text-gray-400"}>{s.destacado ? `hasta ${formatDia(s.destacado_hasta)}` : "sin impulso"}</b>
        </span>
        <span>
          Plan: <b className="text-indigo">{s.plan === "PREMIUM" ? "Premium" : "Básico"}</b>
        </span>
        <span>
          Prioridad: <b className="text-indigo">{s.prioridad}</b>
          <span className="text-gray-400">/100</span>
        </span>
        <span className="ml-auto flex gap-2">
          <Boton variante="borde" className="text-xs px-3 py-1.5" onClick={() => patch(s.id, { plan: s.plan === "PREMIUM" ? "BASICO" : "PREMIUM" })}>
            {s.plan === "PREMIUM" ? "Pasar a Básico" : "Pasar a Premium"}
          </Boton>
          <Boton variante={panel === "posicion" ? "azul" : "amarillo"} className="text-xs px-3 py-1.5" onClick={() => setPanel(panel === "posicion" ? null : "posicion")}>
            <TrendingUp size={14} /> {panel === "posicion" ? "Cerrar" : "Impulso y prioridad"}
          </Boton>
        </span>
      </div>

      <div className="px-5 empty:hidden [&>*]:pb-5">
        {panel === "pago" && (
          <FormPago
            socioId={s.id}
            onListo={() => {
              setPanel("historial");
              onPago();
            }}
          />
        )}
        {panel === "historial" && <HistorialPagos socioId={s.id} />}
        {panel === "posicion" && <FormPosicion s={s} patch={patch} onListo={() => setPanel(null)} />}
      </div>
    </article>
  );
}

/** Hoy + n días en formato AAAA-MM-DD (zona horaria local) */
function sumarDias(base: string | null, dias: number) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const desde = base ? new Date(`${base.slice(0, 10)}T00:00:00`) : hoy;
  const d = new Date(Math.max(desde.getTime(), hoy.getTime()));
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * POSICIONAMIENTO: quién sale primero en el directorio, el inicio y el catálogo.
 * 1) Impulso (destacado hasta una fecha)  2) Plan Premium  3) Prioridad 0-100  4) Rotación diaria automática
 */
function FormPosicion({ s, patch, onListo }: { s: AliadoAdmin; patch: (id: number, json: object) => Promise<void>; onListo: () => void }) {
  const [prioridad, setPrioridad] = useState(s.prioridad);
  const [hasta, setHasta] = useState(s.destacado ? (s.destacado_hasta ?? "").slice(0, 10) : "");
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    await patch(s.id, { prioridad, destacado_hasta: hasta || null });
    setGuardando(false);
    onListo();
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p className="text-sm font-bold text-indigo flex items-center gap-1">
          <Star size={14} className="text-amarillo" fill="currentColor" /> Impulso (espacio destacado)
        </p>
        <p className="text-xs text-gray-500 mb-3">Aparece de primero con marco dorado hasta la fecha elegida. Ideal para vender como servicio adicional.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {[7, 15, 30].map((d) => (
            <Boton key={d} type="button" variante="borde" className="text-xs px-3 py-1.5" onClick={() => setHasta(sumarDias(hasta || null, d))}>
              +{d} días
            </Boton>
          ))}
          {hasta && (
            <Boton type="button" variante="texto" className="text-xs px-3 py-1.5 text-naranja" onClick={() => setHasta("")}>
              Quitar impulso
            </Boton>
          )}
        </div>
        <input suppressHydrationWarning type="date" value={hasta} min={sumarDias(null, 0)} onChange={(e) => setHasta(e.target.value)} aria-label="Destacado hasta" className={`${inputClase} py-1.5 text-sm w-auto`} />
      </div>
      <div>
        <p className="text-sm font-bold text-indigo">Prioridad manual: {prioridad}</p>
        <p className="text-xs text-gray-500 mb-3">Desempata entre aliados del mismo nivel (0 = normal, 100 = máxima). Entre iguales el orden rota cada día.</p>
        <input suppressHydrationWarning type="range" min={0} max={100} step={5} value={prioridad} onChange={(e) => setPrioridad(Number(e.target.value))} aria-label="Prioridad" className="w-full accent-naranja" />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
        <Boton className="mt-4" cargando={guardando} onClick={guardar}>
          Guardar posicionamiento
        </Boton>
      </div>
    </div>
  );
}

function FormPago({ socioId, onListo }: { socioId: number; onListo: () => void }) {
  const [f, setF] = useState({ meses: "1", monto: "", metodo: "efectivo", referencia: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const monto = Number(f.monto);
    if (!(monto >= 0) || f.monto === "") return setError("Escribe el monto recibido.");
    setEnviando(true);
    try {
      await api(`/api/admin/socios/${socioId}/pagos`, {
        method: "POST",
        json: { meses: Number(f.meses), monto, metodo: f.metodo || undefined, referencia: f.referencia.trim() || undefined },
      });
      onListo();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form suppressHydrationWarning onSubmit={enviar} className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
      {error && (
        <div className="sm:col-span-5">
          <Aviso>{error}</Aviso>
        </div>
      )}
      <Selector label="Meses" name="meses" value={f.meses} onChange={(e) => setF({ ...f, meses: e.target.value })}>
        {[1, 2, 3, 6, 12].map((m) => (
          <option key={m} value={m}>
            {m} {m === 1 ? "mes" : "meses"}
          </option>
        ))}
      </Selector>
      <Campo label="Monto (COP)" name="monto" type="number" min={0} required value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} />
      <Selector label="Método" name="metodo" value={f.metodo} onChange={(e) => setF({ ...f, metodo: e.target.value })}>
        <option value="efectivo">Efectivo</option>
        <option value="transferencia">Transferencia</option>
        <option value="nequi">Nequi</option>
        <option value="daviplata">Daviplata</option>
        <option value="otro">Otro</option>
      </Selector>
      <Campo label="Referencia" name="referencia" maxLength={120} placeholder="Nº comprobante" value={f.referencia} onChange={(e) => setF({ ...f, referencia: e.target.value })} />
      <Boton type="submit" cargando={enviando}>
        Registrar
      </Boton>
      <p className="sm:col-span-5 text-xs text-gray-500">
        Si el aliado está al día, los meses se suman desde su vencimiento; si está vencido, desde hoy.
      </p>
    </form>
  );
}

function HistorialPagos({ socioId }: { socioId: number }) {
  const { data, error, cargando } = useApi<{ pagos: Pago[] }>(`/api/admin/socios/${socioId}/pagos`);
  if (cargando) return <Cargando />;
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {error && <Aviso>{error}</Aviso>}
      {!data?.pagos.length ? (
        <p className="text-sm text-gray-500">Sin pagos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 text-left">
              <tr>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Periodo</th>
                <th className="py-2 pr-4">Monto</th>
                <th className="py-2 pr-4">Método</th>
                <th className="py-2 pr-4">Referencia</th>
                <th className="py-2">Registró</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.pagos.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pr-4 whitespace-nowrap">{formatDate(p.created_at)}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {formatDia(p.periodo_desde)} → {formatDia(p.periodo_hasta)}
                  </td>
                  <td className="py-2 pr-4 font-bold">{formatCOP(p.monto)}</td>
                  <td className="py-2 pr-4 capitalize">{p.metodo ?? "—"}</td>
                  <td className="py-2 pr-4">{p.referencia ?? "—"}</td>
                  <td className="py-2">{p.registrado_por_nombre ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
