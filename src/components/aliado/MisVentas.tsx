// src/components/aliado/MisVentas.tsx — GET /api/pedidos/ventas · PATCH /api/pedidos/ventas/:id
"use client";

import { useState } from "react";
import { Mail, Phone, Receipt } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Aviso, Cargando, Tarjeta } from "@/components/ui";
import { BotonConfirmar } from "@/components/panel/PanelUI";
import PedidoCard, { type Pedido } from "@/components/panel/PedidoCard";
import { api, mensajeError } from "@/lib/api";
import { ESTADO_PEDIDO, waLink } from "@/lib/format";
import type { useApi } from "@/lib/useApi";

type Estado = ReturnType<typeof useApi<{ pedidos: Pedido[] }>>;

// Flujo normal del pedido: PENDIENTE -> PAGADO -> ENVIADO -> ENTREGADO
const SIGUIENTE: Record<string, "PAGADO" | "ENVIADO" | "ENTREGADO" | undefined> = {
  PENDIENTE: "PAGADO",
  PAGADO: "ENVIADO",
  ENVIADO: "ENTREGADO",
};

export default function MisVentas({ estado, vigente }: { estado: Estado; vigente: boolean }) {
  const [filtro, setFiltro] = useState<string>("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState<number | null>(null);

  if (estado.cargando) return <Cargando />;
  const pedidos = (estado.data?.pedidos ?? []).filter((p) => !filtro || p.estado === filtro);

  const cambiar = async (id: number, nuevo: string) => {
    setError("");
    setOcupado(id);
    try {
      await api(`/api/pedidos/ventas/${id}`, { method: "PATCH", json: { estado: nuevo } });
      estado.recargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div className="space-y-4">
      {(estado.error || error) && <Aviso>{estado.error || error}</Aviso>}
      <div className="flex flex-wrap gap-2">
        {["", ...Object.keys(ESTADO_PEDIDO)].map((k) => (
          <button
            key={k || "todos"}
            onClick={() => setFiltro(k)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
              filtro === k ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"
            }`}
          >
            {k ? ESTADO_PEDIDO[k].label : "Todos"}
          </button>
        ))}
      </div>

      {!pedidos.length ? (
        <Tarjeta>
          <div className="text-center py-10">
            <Receipt size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay pedidos {filtro && "con este estado"}.</p>
          </div>
        </Tarjeta>
      ) : (
        pedidos.map((p) => {
          const sig = SIGUIENTE[p.estado];
          return (
            <PedidoCard
              key={p.id}
              pedido={p}
              titulo={p.cliente_nombre}
              acciones={
                <>
                  <span className="flex flex-wrap gap-3 text-xs text-gray-500 mr-2">
                    {p.cliente_telefono && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {p.cliente_telefono}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {p.cliente_email}
                    </span>
                  </span>
                  {p.cliente_telefono && (
                    <a
                      href={waLink(p.cliente_telefono, `Hola ${p.cliente_nombre}, te escribo por tu pedido #${p.id} en Televentas Fest.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold bg-[#25D366] hover:bg-[#1ebe5a] text-white px-3 py-1.5 rounded-lg"
                    >
                      <FaWhatsapp size={14} /> WhatsApp
                    </a>
                  )}
                  {vigente && sig && (
                    <BotonConfirmar variante="azul" onConfirm={() => cambiar(p.id, sig)} pregunta={`¿Marcar ${ESTADO_PEDIDO[sig].label.toLowerCase()}?`}>
                      {ocupado === p.id ? "..." : `Marcar ${ESTADO_PEDIDO[sig].label.toLowerCase()}`}
                    </BotonConfirmar>
                  )}
                  {vigente && p.estado !== "CANCELADO" && p.estado !== "ENTREGADO" && (
                    <BotonConfirmar onConfirm={() => cambiar(p.id, "CANCELADO")} pregunta="¿Cancelar? Se devuelve el stock">
                      Cancelar
                    </BotonConfirmar>
                  )}
                </>
              }
            />
          );
        })
      )}
    </div>
  );
}
