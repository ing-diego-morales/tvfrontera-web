// src/components/aliados/ProductosDestacados.tsx — vitrina del inicio (estilo tienda virtual)
// Primero los productos "recomendados" (máx. 2 por aliado, por posicionamiento). Si aún hay pocos,
// se completa con los más nuevos del catálogo para que la portada nunca se vea vacía.
import { apiPublicaSegura } from "@/lib/api-server";
import type { ListaProductos, Producto } from "@/lib/aliados";
import { TituloSeccion } from "@/components/ui";
import ProductoCard from "./ProductoCard";

export default async function ProductosDestacados() {
  const [destacados, recientes] = await Promise.all([
    apiPublicaSegura<ListaProductos>("/api/productos?destacados=1&limit=8"),
    apiPublicaSegura<ListaProductos>("/api/productos?limit=8"),
  ]);
  const vistos = new Set<number>();
  const productos: Producto[] = [];
  for (const p of [...(destacados?.productos ?? []), ...(recientes?.productos ?? [])]) {
    if (productos.length >= 8 || vistos.has(p.id)) continue;
    vistos.add(p.id);
    productos.push(p);
  }
  if (!productos.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <TituloSeccion titulo="Lo más destacado" subtitulo="Productos de los negocios de la región, directo a tu casa" href="/productos" enlace="Ver todos" />
      <div data-revelar-hijos="" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {productos.map((p) => (
          <ProductoCard key={p.id} producto={p} />
        ))}
      </div>
    </section>
  );
}
