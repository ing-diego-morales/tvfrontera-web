// src/app/panel/page.tsx — panel del Punto Aliado
"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, Package, Receipt, Settings, ShoppingBag, Wallet } from "lucide-react";
import { Aviso, Cargando, Etiqueta } from "@/components/ui";
import { Estadistica, PanelEncabezado, Pestanas, type Pestana } from "@/components/panel/PanelUI";
import type { Pedido } from "@/components/panel/PedidoCard";
import type { Producto } from "@/lib/aliados";
import type { RespuestaPerfil } from "@/components/aliado/tipos";
import MisProductos from "@/components/aliado/MisProductos";
import MisVentas from "@/components/aliado/MisVentas";
import MiNegocio from "@/components/aliado/MiNegocio";
import { formatCOP, formatDia } from "@/lib/format";
import { useApi } from "@/lib/useApi";

type Tab = "productos" | "ventas" | "negocio";

export default function PanelAliadoPage() {
  const perfil = useApi<RespuestaPerfil>("/api/socios/me");
  const productos = useApi<{ productos: Producto[]; limite_destacados: number }>("/api/productos/mios");
  const ventas = useApi<{ pedidos: Pedido[] }>("/api/pedidos/ventas");
  const [tab, setTab] = useState<Tab>("productos");

  if (perfil.cargando) return <Cargando />;
  if (!perfil.data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <Aviso>{perfil.error ?? "No pudimos cargar tu perfil de Punto Aliado."}</Aviso>
      </div>
    );
  }

  const { perfil: s, motivo } = perfil.data;
  const lista = productos.data?.productos ?? [];
  const pedidos = ventas.data?.pedidos ?? [];
  const pendientes = pedidos.filter((p) => p.estado === "PENDIENTE").length;
  const vendido = pedidos.filter((p) => p.estado !== "CANCELADO").reduce((a, p) => a + p.total, 0);
  const estado = !s.vigente && s.estado === "APROBADO" ? "VENCIDO" : s.estado;

  const TABS: Pestana<Tab>[] = [
    { id: "productos", label: "Productos", icon: Package },
    { id: "ventas", label: "Ventas", icon: Receipt, contador: pendientes },
    { id: "negocio", label: "Mi negocio", icon: Settings },
  ];

  return (
    <main className="flex-1 bg-gray-50">
      <PanelEncabezado
        titulo={s.nombre_negocio}
        subtitulo={
          <span className="flex flex-wrap items-center gap-2">
            Plan {s.plan === "PREMIUM" ? "Premium" : "Básico"} · <PanelEstado estado={estado} />
          </span>
        }
      >
        {s.vigente && (
          <Link
            href={`/puntos-aliados/${s.slug}`}
            target="_blank"
            className="flex items-center gap-2 bg-amarillo text-indigo font-bold px-5 py-2 rounded-full hover:bg-amarillo-oscuro transition-colors"
          >
            Ver mi tienda <ExternalLink size={16} />
          </Link>
        )}
      </PanelEncabezado>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {s.vigente ? (
          <Aviso tipo="ok">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} /> Tu tienda está publicada. Mensualidad pagada hasta el <b>{formatDia(s.pagado_hasta)}</b>.
            </span>
          </Aviso>
        ) : (
          <Aviso tipo="alerta">
            <span className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                <b>Tu tienda no está visible.</b> {motivo} Puedes ver tu información, pero no publicar ni editar.
                Escríbenos al WhatsApp +57 310 851 1162.
              </span>
            </span>
          </Aviso>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Estadistica label="Productos activos" valor={lista.filter((p) => p.activo).length} icon={Package} />
          <Estadistica label="Pedidos por atender" valor={pendientes} icon={ShoppingBag} tono="rojo" />
          <Estadistica label="Total vendido" valor={formatCOP(vendido)} icon={Wallet} tono="verde" />
        </div>
      </div>

      <div className="mt-6">
        <Pestanas items={TABS} activa={tab} onChange={setTab} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {tab === "productos" && <MisProductos estado={productos} vigente={s.vigente} />}
        {tab === "ventas" && <MisVentas estado={ventas} vigente={s.vigente} />}
        {tab === "negocio" && <MiNegocio perfil={s} vigente={s.vigente} onGuardado={perfil.recargar} />}
      </div>
    </main>
  );
}

function PanelEstado({ estado }: { estado: string }) {
  const clases: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    APROBADO: "bg-green-100 text-green-800",
    SUSPENDIDO: "bg-red-100 text-red-700",
    VENCIDO: "bg-orange-100 text-orange-800",
  };
  const nombres: Record<string, string> = { PENDIENTE: "En revisión", APROBADO: "Activo", SUSPENDIDO: "Suspendido", VENCIDO: "Mensualidad vencida" };
  return <Etiqueta clase={clases[estado]}>{nombres[estado]}</Etiqueta>;
}
