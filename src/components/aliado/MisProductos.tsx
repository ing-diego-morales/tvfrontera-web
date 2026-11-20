// src/components/aliado/MisProductos.tsx — GET /api/productos/mios · POST/PUT /api/productos
"use client";

import { useState } from "react";
import { Eye, EyeOff, Package, Pencil, Plus, Star } from "lucide-react";
import Imagen from "@/components/Imagen";
import { Aviso, Boton, Cargando, Etiqueta, Tarjeta } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";
import { formatCOP } from "@/lib/format";
import type { Producto } from "@/lib/aliados";
import type { useApi } from "@/lib/useApi";
import ProductoForm from "./ProductoForm";

type Estado = ReturnType<typeof useApi<{ productos: Producto[]; limite_destacados: number }>>;

export default function MisProductos({ estado, vigente }: { estado: Estado; vigente: boolean }) {
  const [editando, setEditando] = useState<Producto | "nuevo" | null>(null);
  const [error, setError] = useState("");

  if (estado.cargando) return <Cargando />;
  const productos = estado.data?.productos ?? [];
  const limite = estado.data?.limite_destacados ?? 2;
  const estrellas = productos.filter((p) => p.activo && p.destacado).length;

  const actualizar = async (p: Producto, json: object) => {
    setError("");
    try {
      await api(`/api/productos/${p.id}`, { method: "PUT", json });
      estado.recargar();
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  if (editando) {
    return (
      <ProductoForm
        producto={editando === "nuevo" ? null : editando}
        onCancelar={() => setEditando(null)}
        onGuardado={() => {
          setEditando(null);
          estado.recargar();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {(estado.error || error) && <Aviso>{estado.error || error}</Aviso>}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-indigo">Tus productos ({productos.length})</h2>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Star size={12} className="text-amarillo" fill="currentColor" /> Recomendados: {estrellas} de {limite} · aparecen primero en tu tienda y en la vitrina del inicio
          </p>
        </div>
        <Boton onClick={() => setEditando("nuevo")} disabled={!vigente} title={vigente ? undefined : "Tu membresía no está activa"}>
          <Plus size={16} /> Nuevo producto
        </Boton>
      </div>

      {!productos.length ? (
        <Tarjeta>
          <div className="text-center py-10">
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aún no tienes productos. {vigente && "Publica el primero para que tus clientes te encuentren."}</p>
          </div>
        </Tarjeta>
      ) : (
        <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
          {productos.map((p) => {
            return (
              <div key={p.id} className={`flex items-center gap-4 p-4 ${p.activo ? "" : "opacity-60"}`}>
                <div className="relative w-16 h-16 rounded-lg overflow-hidden img-ph shrink-0">
                  <Imagen src={p.imagen_url} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-indigo truncate">{p.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {formatCOP(p.precio)}
                    {!!p.maneja_stock && (
                      <>
                        {" · "}
                        <span className={(p.stock ?? 0) <= 0 ? "text-naranja font-bold" : ""}>{p.stock} unidades</span>
                      </>
                    )}
                  </p>
                </div>
                {!p.activo && <Etiqueta clase="bg-gray-200 text-gray-600">Oculto</Etiqueta>}
                {/* Interruptor rápido Disponible / Agotado */}
                <button
                  type="button"
                  // Si cuenta unidades y llegó a 0, hay que cargar unidades: se abre el formulario
                  onClick={() => (p.maneja_stock && (p.stock ?? 0) <= 0 ? setEditando(p) : actualizar(p, { disponible: !p.se_puede_pedir }))}
                  disabled={!vigente}
                  title="Cambiar disponibilidad"
                  className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
                    p.se_puede_pedir ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.se_puede_pedir ? "bg-green-500" : "bg-gray-500"}`} />
                  {p.se_puede_pedir ? "Disponible" : "Agotado"}
                </button>
                <div className="flex gap-1">
                  <Boton
                    variante="texto"
                    className="px-2"
                    onClick={() => actualizar(p, { destacado: !p.destacado })}
                    disabled={!vigente || !p.activo || (!p.destacado && estrellas >= limite)}
                    aria-pressed={!!p.destacado}
                    aria-label={p.destacado ? `Quitar recomendado a ${p.nombre}` : `Marcar ${p.nombre} como recomendado`}
                    title={!p.destacado && estrellas >= limite ? `Tu plan permite ${limite} recomendados` : "Producto recomendado"}
                  >
                    <Star size={16} className={p.destacado ? "text-amarillo" : ""} fill={p.destacado ? "currentColor" : "none"} />
                  </Boton>
                  <Boton variante="texto" className="px-2" onClick={() => setEditando(p)} disabled={!vigente} aria-label={`Editar ${p.nombre}`}>
                    <Pencil size={16} />
                  </Boton>
                  <Boton variante="texto" className="px-2" onClick={() => actualizar(p, { activo: !p.activo })} disabled={!vigente} aria-label={p.activo ? `Ocultar ${p.nombre}` : `Mostrar ${p.nombre}`}>
                    {p.activo ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Boton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
