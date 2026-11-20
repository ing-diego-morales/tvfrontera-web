// src/components/admin/AdminUsuarios.tsx — rol, activo y verificación de identidad
"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useAuth, type Rol, type Verificacion } from "@/components/AuthProvider";
import { Aviso, Boton, Cargando, Etiqueta, Vacio, inputClase } from "@/components/ui";
import { BotonConfirmar, Paginador } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { VERIFICACION } from "@/lib/format";
import { formatDate, timeAgo } from "@/lib/date-utils";
import { useApi } from "@/lib/useApi";
import { EstadoConexion, Verificado } from "@/components/Insignias";

type UsuarioAdmin = {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  cedula: string | null;
  rol: Rol;
  activo: number;
  verificacion: Verificacion;
  created_at: string;
  ultimo_acceso: string | null;
  en_linea: boolean;
};

type Lista = { usuarios: UsuarioAdmin[]; total: number; page: number; pages: number };

const ROLES: Record<Rol, string> = { ADMIN: "Admin", SOCIO: "Aliado", CLIENTE: "Cliente" };

export default function AdminUsuarios({ filtroInicial = "" }: { filtroInicial?: string }) {
  // filtroInicial: "en_linea" o "verificacion:PENDIENTE" (desde las tarjetas del resumen)
  const verifInicial = filtroInicial.startsWith("verificacion:") ? filtroInicial.split(":")[1] : "";
  const { user: yo } = useAuth();
  const [page, setPage] = useState(1);
  const [rol, setRol] = useState("");
  const [verif, setVerif] = useState(verifInicial);
  const [soloEnLinea, setSoloEnLinea] = useState(filtroInicial === "en_linea");
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const qs = new URLSearchParams({ page: String(page) });
  if (rol) qs.set("rol", rol);
  if (verif) qs.set("verificacion", verif);
  if (soloEnLinea) qs.set("en_linea", "1");
  if (busqueda) qs.set("q", busqueda);
  const { data, error, cargando, recargar } = useApi<Lista>(`/api/admin/usuarios?${qs}`);
  const [errorAccion, setErrorAccion] = useState("");

  const patch = async (id: number, json: object) => {
    setErrorAccion("");
    try {
      await api(`/api/admin/usuarios/${id}`, { method: "PATCH", json });
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  const filtro = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <select suppressHydrationWarning value={rol} onChange={filtro(setRol)} aria-label="Filtrar por rol" className={`${inputClase} py-1.5 text-sm w-auto`}>
            <option value="">Todos los roles</option>
            {Object.entries(ROLES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select suppressHydrationWarning value={verif} onChange={filtro(setVerif)} aria-label="Filtrar por verificación" className={`${inputClase} py-1.5 text-sm w-auto`}>
            <option value="">Toda verificación</option>
            {Object.entries(VERIFICACION).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg px-3 whitespace-nowrap cursor-pointer">
            <input suppressHydrationWarning
              type="checkbox"
              checked={soloEnLinea}
              onChange={(e) => {
                setSoloEnLinea(e.target.checked);
                setPage(1);
              }}
              className="accent-green-600"
            />
            <EstadoConexion enLinea /> Solo en línea
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
          <input suppressHydrationWarning value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, correo o cédula" aria-label="Buscar usuarios" className={`${inputClase} py-1.5 text-sm`} maxLength={100} />
          <Boton type="submit" variante="azul" className="px-3" aria-label="Buscar">
            <Search size={16} />
          </Boton>
        </form>
      </div>

      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}

      {cargando ? (
        <Cargando />
      ) : !data?.usuarios.length ? (
        <Vacio>No hay usuarios con estos filtros.</Vacio>
      ) : (
        <>
          <p className="text-xs text-gray-500">{data.total} usuario(s)</p>
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Cédula</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Identidad</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.usuarios.map((u) => {
                  const soyYo = u.id === yo?.id;
                  const v = VERIFICACION[u.verificacion];
                  return (
                    <tr key={u.id} className={u.activo ? "" : "bg-gray-50 text-gray-400"}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-indigo flex items-center gap-2 flex-wrap">
                          <EstadoConexion enLinea={u.en_linea} ultimoAcceso={u.ultimo_acceso} />
                          {u.nombre} {soyYo && <span className="text-xs font-normal text-gray-400">(tú)</span>}
                          {u.verificacion === "VERIFICADO" && <Verificado tamano="xs" />}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-400">
                          Desde {formatDate(u.created_at)} · {u.en_linea ? <span className="text-green-700 font-medium">en línea</span> : u.ultimo_acceso ? `visto ${timeAgo(u.ultimo_acceso).toLowerCase()}` : "nunca ha entrado"}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{u.cedula ?? "—"}</td>
                      <td className="px-4 py-3">
                        <select suppressHydrationWarning
                          value={u.rol}
                          disabled={soyYo}
                          onChange={(e) => patch(u.id, { rol: e.target.value })}
                          aria-label={`Rol de ${u.nombre}`}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900 bg-white disabled:bg-gray-100"
                        >
                          {Object.entries(ROLES).map(([k, label]) => (
                            <option key={k} value={k}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <Etiqueta clase={v.clase}>{v.label}</Etiqueta>
                          {u.verificacion === "PENDIENTE" && <span className="text-[11px] text-gray-500">Revisa sus fotos en la pestaña Verificaciones</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {soyYo ? (
                          <Etiqueta clase="bg-green-100 text-green-800">Activo</Etiqueta>
                        ) : u.activo ? (
                          <BotonConfirmar onConfirm={() => patch(u.id, { activo: false })} pregunta="¿Desactivar? Pierde la sesión">
                            Desactivar
                          </BotonConfirmar>
                        ) : (
                          <Boton variante="azul" className="text-xs px-3 py-1.5" onClick={() => patch(u.id, { activo: true })}>
                            Activar
                          </Boton>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Paginador page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
