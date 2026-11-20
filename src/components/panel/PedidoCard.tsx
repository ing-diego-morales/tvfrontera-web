// src/components/panel/PedidoCard.tsx — tarjeta de pedido (compras del cliente, ventas del aliado, admin)
import { Etiqueta } from "@/components/ui";
import { ESTADO_PEDIDO, formatCOP } from "@/lib/format";
import { formatDate } from "@/lib/date-utils";

export type PedidoItem = { id: number; producto_id: number | null; cantidad: number; precio_unitario: number; nombre: string };

export type Pedido = {
  id: number;
  total: number;
  estado: keyof typeof ESTADO_PEDIDO;
  nota: string | null;
  created_at: string;
  items: PedidoItem[];
  socio_nombre?: string | null;
  socio_slug?: string | null;
  socio_whatsapp?: string | null;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string | null;
};

export default function PedidoCard({ pedido, titulo, acciones }: { pedido: Pedido; titulo?: React.ReactNode; acciones?: React.ReactNode }) {
  const est = ESTADO_PEDIDO[pedido.estado] ?? ESTADO_PEDIDO.PENDIENTE;
  return (
    <article className="bg-white rounded-xl shadow-md p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-bold text-indigo">
            Pedido #{pedido.id} {titulo && <span className="font-normal text-gray-500">· {titulo}</span>}
          </p>
          <p className="text-xs text-gray-400">{formatDate(pedido.created_at)}</p>
        </div>
        <Etiqueta clase={est.clase}>{est.label}</Etiqueta>
      </header>

      <ul className="divide-y divide-gray-100 text-sm">
        {pedido.items.map((it) => (
          <li key={it.id} className="flex justify-between gap-3 py-2">
            <span className="text-gray-700">
              {it.cantidad} × {it.nombre}
            </span>
            <span className="text-gray-500 whitespace-nowrap">{formatCOP(it.cantidad * it.precio_unitario)}</span>
          </li>
        ))}
      </ul>

      {pedido.nota && <p className="text-sm bg-gray-50 rounded-lg px-3 py-2 mt-3 text-gray-600">📝 {pedido.nota}</p>}

      <footer className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
        <p className="font-extrabold text-indigo">Total {formatCOP(pedido.total)}</p>
        {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
      </footer>
    </article>
  );
}
