// src/components/admin/AdminSuscriptores.tsx — correos del boletín "No te pierdas ninguna noticia"
// Exportar a CSV (Excel) para enviar campañas desde Gmail, Mailchimp, Brevo, etc.
"use client";

import { useState } from "react";
import { Download, Mail, Search, UserCheck } from "lucide-react";
import { Aviso, Boton, Cargando, Etiqueta, Vacio, inputClase } from "@/components/ui";
import { BotonConfirmar, Estadistica, Paginador } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import { useApi } from "@/lib/useApi";
import EnviarBoletin from "./EnviarBoletin";

type Suscriptor = { id: number; email: string; activo: boolean; origen: string | null; created_at: string; baja_en: string | null };
type Lista = { suscriptores: Suscriptor[]; total: number; activos: number; page: number; pages: number };

export default function AdminSuscriptores() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState("");
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [exportando, setExportando] = useState(false);

  const qs = new URLSearchParams({ page: String(page) });
  if (estado) qs.set("estado", estado);
  if (busqueda) qs.set("q", busqueda);
  const { data, error, cargando, recargar } = useApi<Lista>(`/api/suscriptores?${qs}`);
  const totales = useApi<Lista>("/api/suscriptores?page=1&limit=1");

  const exportar = async () => {
    setErrorAccion("");
    setExportando(true);
    try {
      const d = await api<Lista>("/api/suscriptores?todos=1&estado=activos");
      // Comillas escapadas y BOM para que Excel lea bien las tildes
      const filas = [["correo", "origen", "fecha"], ...d.suscriptores.map((s) => [s.email, s.origen ?? "", s.created_at.slice(0, 10)])];
      const csv = "﻿" + filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: `suscriptores-${new Date().toISOString().slice(0, 10)}.csv` });
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErrorAccion(mensajeError(e));
    } finally {
      setExportando(false);
    }
  };

  const borrar = async (id: number) => {
    setErrorAccion("");
    try {
      await api(`/api/suscriptores/${id}`, { method: "DELETE" });
      recargar();
      totales.recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Estadistica label="Suscriptores activos" valor={totales.data?.activos ?? "…"} icon={UserCheck} tono="verde" />
        <Estadistica label="Registros totales (incluye bajas)" valor={totales.data?.total ?? "…"} icon={Mail} />
      </div>

      <EnviarBoletin activos={totales.data?.activos ?? 0} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { v: "", l: "Todos" },
            { v: "activos", l: "Activos" },
            { v: "bajas", l: "Dados de baja" },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => {
                setEstado(f.v);
                setPage(1);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${estado === f.v ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"}`}
            >
              {f.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <form suppressHydrationWarning
            onSubmit={(e) => {
              e.preventDefault();
              setBusqueda(q.trim());
              setPage(1);
            }}
            className="flex gap-2"
            role="search"
          >
            <input suppressHydrationWarning value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar correo" aria-label="Buscar correo" className={`${inputClase} py-1.5 text-sm`} maxLength={100} />
            <Boton type="submit" variante="azul" className="px-3" aria-label="Buscar">
              <Search size={16} />
            </Boton>
          </form>
          <Boton variante="borde" onClick={exportar} cargando={exportando} className="whitespace-nowrap">
            <Download size={16} /> Exportar CSV
          </Boton>
        </div>
      </div>

      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}

      {cargando ? (
        <Cargando />
      ) : !data?.suscriptores.length ? (
        <Vacio>Aún no hay suscriptores con este filtro.</Vacio>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Origen</th>
                  <th className="px-4 py-3">Suscrito</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.suscriptores.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium text-indigo">{s.email}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{s.origen ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3">
                      {s.activo ? <Etiqueta clase="bg-green-100 text-green-800">Activo</Etiqueta> : <Etiqueta clase="bg-gray-200 text-gray-600">Se dio de baja</Etiqueta>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BotonConfirmar variante="texto" pregunta="¿Borrar para siempre?" onConfirm={() => borrar(s.id)}>
                        Borrar
                      </BotonConfirmar>
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
