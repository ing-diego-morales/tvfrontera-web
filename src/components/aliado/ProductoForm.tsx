// src/components/aliado/ProductoForm.tsx — crear / editar producto
// Disponibilidad: por defecto "Disponible / Agotado" (ideal para comida o servicios).
// Opcional: contar unidades; se descuentan solas con cada pedido y al llegar a 0 queda agotado.
"use client";

import { useState } from "react";
import { CheckCircle2, Save, XCircle } from "lucide-react";
import { AreaTexto, Aviso, Boton, Campo, Tarjeta } from "@/components/ui";
import Imagen from "@/components/Imagen";
import { api, mensajeError } from "@/lib/api";
import type { Producto } from "@/lib/aliados";

export default function ProductoForm({
  producto,
  onCancelar,
  onGuardado,
}: {
  producto: Producto | null;
  onCancelar: () => void;
  onGuardado: () => void;
}) {
  const [f, setF] = useState({
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    precio: producto ? String(producto.precio) : "",
    stock: producto?.stock !== undefined ? String(producto.stock) : "0",
    imagen_url: producto?.imagen_url ?? "",
  });
  const [disponible, setDisponible] = useState(producto ? !!producto.disponible : true);
  const [manejaStock, setManejaStock] = useState(!!producto?.maneja_stock);
  const [destacado, setDestacado] = useState(!!producto?.destacado);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [e.target.name]: e.target.value });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const precio = Number(f.precio);
    const stock = Number(f.stock);
    if (!(precio > 0)) return setError("El precio debe ser mayor a 0.");
    if (manejaStock && (!Number.isInteger(stock) || stock < 0)) return setError("Las unidades deben ser un número entero (0 o más).");
    const datos = {
      nombre: f.nombre.trim(),
      descripcion: f.descripcion.trim() || null,
      precio,
      disponible,
      maneja_stock: manejaStock,
      ...(manejaStock ? { stock } : {}),
      imagen_url: f.imagen_url.trim() || null,
      destacado,
    };
    setEnviando(true);
    try {
      if (producto) await api(`/api/productos/${producto.id}`, { method: "PUT", json: datos });
      else await api("/api/productos", { method: "POST", json: datos });
      onGuardado();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const opcion = (valor: boolean, Icon: typeof CheckCircle2, titulo: string, texto: string, color: string) => (
    <button
      type="button"
      onClick={() => setDisponible(valor)}
      aria-pressed={disponible === valor}
      className={`flex-1 text-left p-3 rounded-xl border-2 transition-colors ${disponible === valor ? color : "border-gray-200 hover:border-gray-300"}`}
    >
      <span className="flex items-center gap-2 font-bold text-indigo">
        <Icon size={18} /> {titulo}
      </span>
      <span className="block text-xs text-gray-500 mt-1">{texto}</span>
    </button>
  );

  return (
    <Tarjeta titulo={producto ? "Editar producto" : "Nuevo producto"}>
      <form suppressHydrationWarning onSubmit={guardar} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {error && <Aviso>{error}</Aviso>}
          <Campo label="Nombre" name="nombre" required minLength={2} maxLength={150} value={f.nombre} onChange={cambiar} />
          <AreaTexto label="Descripción" name="descripcion" rows={4} maxLength={3000} value={f.descripcion} onChange={cambiar} />
          <Campo label="Precio (COP)" name="precio" type="number" min={1} step="any" required value={f.precio} onChange={cambiar} />

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Disponibilidad</legend>
            <div className="flex flex-col sm:flex-row gap-3">
              {opcion(true, CheckCircle2, "Disponible", "Los clientes pueden pedirlo.", "border-green-500 bg-green-50")}
              {opcion(false, XCircle, "Agotado", "Se muestra, pero no se puede pedir.", "border-gray-500 bg-gray-50")}
            </div>
            <label className="flex items-start gap-3 text-sm text-gray-700 mt-3">
              <input suppressHydrationWarning type="checkbox" checked={manejaStock} onChange={(e) => setManejaStock(e.target.checked)} className="mt-0.5 accent-naranja" />
              <span>
                <b className="text-indigo">Controlar unidades</b> (opcional)
                <br />
                <span className="text-gray-500">Se descuentan con cada pedido y al llegar a 0 queda agotado solo. Los clientes nunca ven el número.</span>
              </span>
            </label>
            {manejaStock && (
              <div className="mt-3 max-w-48">
                <Campo label="Unidades disponibles" name="stock" type="number" min={0} step={1} required value={f.stock} onChange={cambiar} />
              </div>
            )}
          </fieldset>

          <Campo
            label="URL de la imagen"
            name="imagen_url"
            type="url"
            maxLength={500}
            placeholder="https://..."
            value={f.imagen_url}
            onChange={cambiar}
            ayuda="Pega el enlace de una foto del producto (https)."
          />
          <label className="flex items-start gap-3 text-sm text-gray-700 bg-amarillo/10 rounded-lg p-3">
            <input suppressHydrationWarning type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="mt-0.5 accent-naranja" />
            <span>
              <b className="text-indigo">Producto recomendado</b>
              <br />
              Aparece primero en tu tienda y puede salir en la vitrina del inicio. Tu plan tiene un cupo limitado.
            </span>
          </label>
          <div className="flex gap-2">
            <Boton type="submit" cargando={enviando}>
              <Save size={16} /> Guardar
            </Boton>
            <Boton type="button" variante="texto" onClick={onCancelar}>
              Cancelar
            </Boton>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Vista previa</p>
          <div className="relative aspect-square rounded-xl overflow-hidden img-ph border border-gray-200">
            <Imagen src={f.imagen_url.trim()} alt="Vista previa" fill sizes="300px" className="object-cover" />
          </div>
        </div>
      </form>
    </Tarjeta>
  );
}
