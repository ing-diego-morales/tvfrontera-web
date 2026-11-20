// src/components/admin/AdminPedidos.tsx — GET /api/admin/pedidos
"use client";

import { useState } from "react";
import { Aviso, Cargando, Vacio } from "@/components/ui";
import { Paginador } from "@/components/panel/PanelUI";
import PedidoCard, { type Pedido } from "@/components/panel/PedidoCard";
import { ESTADO_PEDIDO } from "@/lib/format";
import { useApi } from "@/lib/useApi";

type Lista = { pedidos: Pedido[]; total: number; page: number; pages: number };

export default function AdminPedidos({ filtroInicial = "" }: { filtroInicial?: string }) {
  const [estado, setEstado] = useState(filtroInicial);
  const [page, setPage] = useState(1);
  const qs = new URLSearchParams({ page: String(page) });
  if (estado) qs.set("estado", estado);
  const { data, error, cargando } = useApi<Lista>(`/api/admin/pedidos?${qs}`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["", ...Object.keys(ESTADO_PEDIDO)].map((k) => (
          <button
            key={k || "todos"}
            onClick={() => {
              setEstado(k);
              setPage(1);
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${estado === k ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"}`}
          >
            {k ? ESTADO_PEDIDO[k].label : "Todos"}
          </button>
        ))}
      </div>
      {error && <Aviso>{error}</Aviso>}
      {cargando ? (
        <Cargando />
      ) : !data?.pedidos.length ? (
        <Vacio>No hay pedidos.</Vacio>
      ) : (
        <>
          <p className="text-xs text-gray-500">{data.total} pedido(s)</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.pedidos.map((p) => (
              <PedidoCard
                key={p.id}
                pedido={p}
                titulo={
                  <>
                    {p.cliente_nombre} → <b>{p.socio_nombre ?? "—"}</b>
                  </>
                }
              />
            ))}
          </div>
          <Paginador page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
