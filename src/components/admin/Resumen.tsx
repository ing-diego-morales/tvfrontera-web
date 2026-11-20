// src/components/admin/Resumen.tsx — GET /api/admin/resumen
"use client";

import { AlertTriangle, BadgeCheck, CalendarClock, Mail, Newspaper, Receipt, Store, Users, Wallet, Wifi } from "lucide-react";
import { Aviso, Cargando } from "@/components/ui";
import { Estadistica } from "@/components/panel/PanelUI";
import { formatCOP } from "@/lib/format";
import type { useApi } from "@/lib/useApi";

export type DatosResumen = {
  usuarios: { total: number; clientes: number; socios: number; admins: number; verificacion_pendiente: number; en_linea: number; aliados_en_linea: number };
  socios: { total: number; pendientes: number; vigentes: number; vencidos: number; suspendidos: number; por_vencer: number };
  noticias: { total: number; publicadas: number; borradores: number };
  pedidos: { total: number; pendientes: number; monto: number };
  suscriptores: { total: number; activos: number };
  visitas: number;
};

export type Tab = "resumen" | "inicio" | "categorias" | "preguntas" | "referidos" | "aliados" | "usuarios" | "verificaciones" | "noticias" | "programacion" | "avisos" | "suscriptores" | "pedidos";

/** irA(pestaña, filtro): abre la sección ya filtrada (ej. aliados "PENDIENTE", usuarios "en_linea") */
export default function Resumen({ estado, irA }: { estado: ReturnType<typeof useApi<DatosResumen>>; irA: (t: Tab, filtro?: string) => void }) {
  if (estado.cargando) return <Cargando />;
  if (!estado.data) return <Aviso>{estado.error ?? "No se pudo cargar el resumen"}</Aviso>;
  const { usuarios, socios, noticias, pedidos, visitas } = estado.data;

  const tareas = [
    socios.pendientes > 0 && { texto: `${socios.pendientes} solicitud(es) de Punto Aliado por revisar`, tab: "aliados" as const, filtro: "PENDIENTE" },
    usuarios.verificacion_pendiente > 0 && { texto: `${usuarios.verificacion_pendiente} verificación(es) de identidad pendientes`, tab: "verificaciones" as const, filtro: "" },
    socios.por_vencer > 0 && { texto: `${socios.por_vencer} aliado(s) vencen en los próximos 5 días`, tab: "aliados" as const, filtro: "APROBADO" },
    socios.vencidos > 0 && { texto: `${socios.vencidos} aliado(s) con la mensualidad vencida (no se muestran en el sitio)`, tab: "aliados" as const, filtro: "VENCIDO" },
  ].filter(Boolean) as { texto: string; tab: Tab; filtro: string }[];

  return (
    <div className="space-y-8">
      {tareas.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="font-bold text-indigo mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-naranja" /> Pendientes
          </h2>
          <ul className="space-y-2">
            {tareas.map((t) => (
              <li key={t.texto}>
                <button onClick={() => irA(t.tab, t.filtro)} className="text-sm text-indigo hover:text-naranja hover:underline text-left">
                  → {t.texto}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Estadistica label="En línea ahora" valor={usuarios.en_linea} icon={Wifi} tono="verde" onClick={() => irA("usuarios", "en_linea")} />
        <Estadistica label="Aliados activos (al día)" valor={socios.vigentes} icon={Store} tono="verde" onClick={() => irA("aliados", "APROBADO")} />
        <Estadistica label="Solicitudes pendientes" valor={socios.pendientes} icon={CalendarClock} tono="amarillo" onClick={() => irA("aliados", "PENDIENTE")} />
        <Estadistica label="Identidades por revisar" valor={usuarios.verificacion_pendiente} icon={BadgeCheck} tono="amarillo" onClick={() => irA("verificaciones")} />
        <Estadistica label="Usuarios registrados" valor={usuarios.total} icon={Users} onClick={() => irA("usuarios")} />
        <Estadistica label="Noticias publicadas" valor={noticias.publicadas} icon={Newspaper} onClick={() => irA("noticias", "PUBLICADA")} />
        <Estadistica label="Pedidos pendientes" valor={pedidos.pendientes} icon={Receipt} tono="rojo" onClick={() => irA("pedidos", "PENDIENTE")} />
        <Estadistica label="Ventas totales (sin cancelados)" valor={formatCOP(pedidos.monto)} icon={Wallet} tono="verde" onClick={() => irA("pedidos")} />
        <Estadistica label="Suscriptores del boletín" valor={estado.data.suscriptores?.activos ?? 0} icon={Mail} tono="amarillo" onClick={() => irA("suscriptores")} />
      </div>

      <p className="text-xs text-gray-400">
        {usuarios.clientes} clientes · {usuarios.socios} aliados ({usuarios.aliados_en_linea} en línea) · {usuarios.admins} administradores ·{" "}
        {socios.suspendidos} aliados suspendidos · {noticias.borradores} borradores · {visitas.toLocaleString("es-CO")} visitas al sitio
      </p>
    </div>
  );
}
