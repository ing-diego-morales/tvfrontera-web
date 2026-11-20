// src/components/admin/AdminVerificaciones.tsx — comparar rostro vs. cédula y aprobar o rechazar
// Las fotos se piden con la sesión del admin (no son públicas) y se muestran desde memoria (blob), sin caché.
"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Trash2, XCircle, ZoomIn } from "lucide-react";
import { Aviso, Boton, Cargando, Etiqueta, Vacio, inputClase } from "@/components/ui";
import { BotonConfirmar, Paginador } from "@/components/panel/PanelUI";
import { API_URL, api, mensajeError } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import { useApi } from "@/lib/useApi";

type V = {
  id: number;
  cedula: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  motivo: string | null;
  created_at: string;
  revisado_en: string | null;
  fotos_borradas: boolean;
  usuario_id: number;
  nombre: string;
  email: string;
  cedula_cuenta: string | null;
  rol: string;
  revisor: string | null;
};

const MOTIVOS = ["La foto del rostro no coincide con la cédula", "La cédula no se lee bien", "La selfie no es clara o no es en vivo", "Documento vencido o alterado"];

/** Carga una foto privada con la cookie del admin y la muestra como blob local */
function FotoPrivada({ id, tipo, titulo }: { id: number; tipo: "selfie" | "frente" | "reverso"; titulo: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    let vivo = true;
    let creada: string | null = null;
    fetch(`${API_URL}/api/verificacion/admin/${id}/foto/${tipo}`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((b) => {
        creada = URL.createObjectURL(b);
        if (vivo) setUrl(creada);
      })
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
      if (creada) URL.revokeObjectURL(creada);
    };
  }, [id, tipo]);

  return (
    <figure className="text-center">
      <button type="button" onClick={() => url && setZoom(true)} className="relative block w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 ring-1 ring-black/10 group" aria-label={`Ampliar ${titulo}`}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto privada en memoria (blob), no debe pasar por el optimizador ni la caché
          <img src={url} alt={titulo} className="w-full h-full object-contain bg-gray-900" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">{error ? "No disponible" : "Cargando…"}</span>
        )}
        {url && <ZoomIn size={18} className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 drop-shadow" />}
      </button>
      <figcaption className="text-xs font-semibold text-gray-500 mt-1">{titulo}</figcaption>
      {zoom && url && (
        <div className="fixed inset-0 z-70 bg-black/85 flex items-center justify-center p-4" onClick={() => setZoom(false)} role="dialog" aria-label={titulo}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ampliación de la misma foto privada */}
          <img src={url} alt={titulo} className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </figure>
  );
}

export default function AdminVerificaciones({ alCambiar }: { alCambiar?: () => void }) {
  const [estado, setEstado] = useState<V["estado"]>("PENDIENTE");
  const [page, setPage] = useState(1);
  const { data, error, cargando, recargar } = useApi<{ verificaciones: V[]; total: number; page: number; pages: number }>(`/api/verificacion/admin?estado=${estado}&page=${page}`);
  const [motivos, setMotivos] = useState<Record<number, string>>({});
  const [errorAccion, setErrorAccion] = useState("");

  const decidir = async (v: V, nuevo: "APROBADA" | "RECHAZADA") => {
    setErrorAccion("");
    if (nuevo === "RECHAZADA" && !motivos[v.id]) return setErrorAccion("Elige o escribe el motivo del rechazo (se le envía al usuario).");
    try {
      await api(`/api/verificacion/admin/${v.id}`, { method: "PATCH", json: { estado: nuevo, motivo: nuevo === "RECHAZADA" ? motivos[v.id] : undefined } });
      recargar();
      alCambiar?.();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };
  const borrarFotos = async (id: number) => {
    try {
      await api(`/api/verificacion/admin/${id}/fotos`, { method: "DELETE" });
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["PENDIENTE", "APROBADA", "RECHAZADA"] as const).map((e) => (
          <button
            key={e}
            onClick={() => (setEstado(e), setPage(1))}
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${estado === e ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"}`}
          >
            {{ PENDIENTE: "Por revisar", APROBADA: "Aprobadas", RECHAZADA: "Rechazadas" }[e]}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500">Compara la selfie con la foto de la cédula y revisa que el número coincida. Las fotos son privadas: no las descargues ni las compartas.</p>
      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}
      {cargando ? (
        <Cargando />
      ) : !data?.verificaciones.length ? (
        <Vacio>{estado === "PENDIENTE" ? "No hay verificaciones por revisar. ¡Todo al día!" : "No hay registros."}</Vacio>
      ) : (
        <>
          {data.verificaciones.map((v) => (
            <article key={v.id} className="bg-white rounded-xl shadow-md p-5 space-y-4">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-indigo text-lg">{v.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {v.email} · cédula declarada <b className="text-indigo">{v.cedula}</b>
                    {v.cedula_cuenta && v.cedula_cuenta !== v.cedula && <span className="text-rojo font-bold"> (en la cuenta: {v.cedula_cuenta})</span>}
                  </p>
                  <p className="text-xs text-gray-400">
                    Enviada {formatDate(v.created_at)}
                    {v.revisado_en && ` · revisada ${formatDate(v.revisado_en)} por ${v.revisor ?? "—"}`}
                  </p>
                </div>
                <Etiqueta clase={v.estado === "APROBADA" ? "bg-green-100 text-green-800" : v.estado === "RECHAZADA" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-800"}>
                  {v.estado === "PENDIENTE" ? "Por revisar" : v.estado === "APROBADA" ? "Aprobada" : "Rechazada"}
                </Etiqueta>
              </header>

              {v.fotos_borradas ? (
                <p className="text-sm text-gray-400 italic">Las fotos fueron eliminadas.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FotoPrivada id={v.id} tipo="selfie" titulo="Selfie en vivo" />
                  <FotoPrivada id={v.id} tipo="frente" titulo="Cédula (frente)" />
                  <FotoPrivada id={v.id} tipo="reverso" titulo="Cédula (reverso)" />
                </div>
              )}

              {v.motivo && <p className="text-sm text-gray-600">Motivo: {v.motivo}</p>}

              {v.estado === "PENDIENTE" ? (
                <div className="flex flex-col md:flex-row md:items-end gap-3 pt-2 border-t border-gray-100">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`motivo-${v.id}`}>
                      Motivo si rechazas
                    </label>
                    <input suppressHydrationWarning
                      id={`motivo-${v.id}`}
                      list="motivos-rechazo"
                      value={motivos[v.id] ?? ""}
                      onChange={(e) => setMotivos({ ...motivos, [v.id]: e.target.value })}
                      maxLength={300}
                      className={`${inputClase} py-2 text-sm`}
                      placeholder="Elige o escribe…"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Boton variante="azul" onClick={() => decidir(v, "APROBADA")}>
                      <BadgeCheck size={16} /> Coincide: aprobar
                    </Boton>
                    <Boton variante="borde" onClick={() => decidir(v, "RECHAZADA")}>
                      <XCircle size={16} /> Rechazar
                    </Boton>
                  </div>
                </div>
              ) : (
                !v.fotos_borradas && (
                  <BotonConfirmar pregunta="¿Eliminar las fotos para siempre?" onConfirm={() => borrarFotos(v.id)}>
                    <Trash2 size={14} className="inline -mt-0.5" /> Eliminar fotos
                  </BotonConfirmar>
                )
              )}
            </article>
          ))}
          <Paginador page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
      <datalist id="motivos-rechazo">
        {MOTIVOS.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>
    </div>
  );
}
