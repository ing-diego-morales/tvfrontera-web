// src/components/cuenta/MisPedidos.tsx — GET /api/pedidos · PATCH /api/pedidos/:id/cancelar
"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Aviso, Cargando, Tarjeta } from "@/components/ui";
import { BotonConfirmar } from "@/components/panel/PanelUI";
import PedidoCard, { type Pedido } from "@/components/panel/PedidoCard";
import { api, mensajeError } from "@/lib/api";
import { waLink } from "@/lib/format";
import { useApi } from "@/lib/useApi";

export default function MisPedidos() {
  const { data, error, cargando, recargar } = useApi<{ pedidos: Pedido[] }>("/api/pedidos");
  const [errorAccion, setErrorAccion] = useState("");

  const cancelar = async (id: number) => {
    setErrorAccion("");
    try {
      await api(`/api/pedidos/${id}/cancelar`, { method: "PATCH" });
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  if (cargando) return <Cargando />;

  return (
    <div className="space-y-4">
      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}
      {!data?.pedidos.length ? (
        <Tarjeta>
          <div className="text-center py-10">
            <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">Aún no has hecho pedidos.</p>
            <Link href="/puntos-aliados" className="inline-block bg-naranja hover:bg-naranja-oscuro text-white font-bold px-5 py-2 rounded-full transition-colors">
              Explorar Puntos Aliados
            </Link>
          </div>
        </Tarjeta>
      ) : (
        data.pedidos.map((p) => (
          <PedidoCard
            key={p.id}
            pedido={p}
            titulo={
              p.socio_slug ? (
                <Link href={`/puntos-aliados/${p.socio_slug}`} className="hover:underline">
                  {p.socio_nombre}
                </Link>
              ) : (
                p.socio_nombre
              )
            }
            acciones={
              <>
                {p.socio_whatsapp && p.estado !== "CANCELADO" && (
                  <a
                    href={waLink(p.socio_whatsapp, `Hola, te escribo por mi pedido #${p.id} de Televentas Fest.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold bg-[#25D366] hover:bg-[#1ebe5a] text-white px-3 py-1.5 rounded-lg"
                  >
                    <FaWhatsapp size={14} /> Escribir al negocio
                  </a>
                )}
                {p.estado === "PENDIENTE" && (
                  <BotonConfirmar onConfirm={() => cancelar(p.id)} pregunta="¿Cancelar pedido?">
                    Cancelar
                  </BotonConfirmar>
                )}
              </>
            }
          />
        ))
      )}
    </div>
  );
}
