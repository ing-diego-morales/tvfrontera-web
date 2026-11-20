// src/app/productos/page.tsx — catálogo de productos de todos los aliados (caché 60 s)
// Orden por rondas: el mejor producto de cada aliado primero, con prioridad para impulso y Premium.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX, ShoppingBag, Search, Sparkles, Store } from "lucide-react";
import { apiPublica, apiPublicaSegura } from "@/lib/api-server";
import type { ListaProductos } from "@/lib/aliados";
import ProductoCard from "@/components/aliados/ProductoCard";
import Pagination from "@/components/Pagination";
import { Aviso, EncabezadoPagina } from "@/components/ui";
import FilaDeslizable from "@/components/FilaDeslizable";

export const metadata: Metadata = {
  title: "Productos de nuestros aliados",
  description: "Compra directo a los negocios de Cúcuta y la región que hacen parte de los Puntos Aliados de Televentas Fest.",
  alternates: { canonical: "/productos" },
};

export default async function ProductosPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; categoria?: string }> }) {
  const { q: qParam, page, categoria: catParam } = await searchParams;
  const q = qParam?.trim().slice(0, 100) || undefined;
  const categoria = catParam?.trim().slice(0, 80) || undefined;
  const currentPage = Math.max(1, Number(page) || 1);

  const qs = new URLSearchParams({ page: String(currentPage), limit: "20" });
  if (q) qs.set("q", q);
  if (categoria) qs.set("categoria", categoria);

  let data: ListaProductos | null = null;
  let caida = false;
  try {
    data = await apiPublica<ListaProductos>(`/api/productos?${qs}`);
  } catch {
    caida = true;
  }
  // Sin resultados con filtros: se sugieren otros productos (de la misma categoría si se buscó dentro de una)
  let sugeridos: ListaProductos["productos"] = [];
  if (!caida && !data?.productos.length && (q || categoria)) {
    const base = q && categoria ? await apiPublicaSegura<ListaProductos>(`/api/productos?limit=8&categoria=${encodeURIComponent(categoria)}`) : null;
    sugeridos = base?.productos.length ? base.productos : ((await apiPublicaSegura<ListaProductos>("/api/productos?limit=8"))?.productos ?? []);
  }

  const cats = await apiPublicaSegura<{ categorias: { categoria: string; total: number }[] }>("/api/socios/categorias", 300);

  const chip = (activa: boolean) =>
    `whitespace-nowrap text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
      activa ? "bg-indigo text-white" : "bg-white text-indigo ring-1 ring-gray-200 hover:ring-indigo"
    }`;

  return (
    <main className="flex-1 bg-gray-50">
      <EncabezadoPagina etiqueta="Compra local" titulo="Productos" subtitulo="Lo que ofrecen los Puntos Aliados de Televentas Fest, directo del negocio a tu casa." />

      <div className="max-w-6xl mx-auto px-4 -mt-7 relative z-10">
        <form suppressHydrationWarning action="/productos" method="GET" role="search" className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-3 flex gap-2">
          {categoria && <input suppressHydrationWarning type="hidden" name="categoria" value={categoria} />}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input suppressHydrationWarning
              type="search"
              name="q"
              defaultValue={q}
              maxLength={100}
              aria-label="Buscar productos"
              placeholder="Buscar productos o negocios..."
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-900 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo focus:bg-white"
            />
          </div>
          <button type="submit" className="bg-naranja hover:bg-naranja-oscuro text-white font-bold px-6 rounded-xl transition-colors">
            Buscar
          </button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {!!cats?.categorias.length && (
          <div className="mb-8 -mx-4 md:mx-0">
          <FilaDeslizable etiqueta="Filtrar por categoría" className="gap-2 px-4 md:px-1 py-1">
            <li className="shrink-0">
              <Link href={q ? `/productos?q=${encodeURIComponent(q)}` : "/productos"} className={chip(!categoria)}>
                Todo
              </Link>
            </li>
            {cats.categorias.map((c) => {
              const p = new URLSearchParams({ categoria: c.categoria });
              if (q) p.set("q", q);
              return (
                <li key={c.categoria} className="shrink-0">
                  <Link href={`/productos?${p}`} className={chip(categoria === c.categoria)}>
                    {c.categoria}
                  </Link>
                </li>
              );
            })}
          </FilaDeslizable>
          </div>
        )}

        {caida ? (
          <Aviso tipo="alerta">El catálogo no está disponible en este momento. Intenta de nuevo en unos minutos.</Aviso>
        ) : !data?.productos.length ? (
          q || categoria ? (
            <>
              <div className="text-center bg-white rounded-2xl ring-1 ring-black/5 px-6 py-8">
                <SearchX size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-bold text-indigo text-lg">
                  {q ? <>No encontramos resultados para “{q}”</> : <>Aún no hay productos en {categoria}</>}
                  {q && categoria && <> en {categoria}</>}
                </p>
                <p className="text-sm text-gray-500 mt-1">Revisa la ortografía, usa una palabra más general o explora todo el catálogo.</p>
                <Link href="/productos" className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-naranja hover:gap-2 transition-all">
                  Ver todos los productos <ArrowRight size={16} />
                </Link>
              </div>
              {sugeridos.length > 0 && (
                <section className="mt-10" aria-labelledby="te-podria-interesar">
                  <h2 id="te-podria-interesar" className="flex items-center gap-2 text-xl md:text-2xl font-extrabold text-indigo mb-5">
                    <Sparkles size={22} className="text-naranja" /> Te podría interesar
                  </h2>
                  <div data-revelar-hijos="" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {sugeridos.map((p) => (
                      <ProductoCard key={p.id} producto={p} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Muy pronto verás aquí los productos de nuestros aliados.</p>
            </div>
          )
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{data.total} producto{data.total === 1 ? "" : "s"}</p>
            <div data-revelar-hijos="" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {data.productos.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={data.pages} basePath="/productos" params={{ q, categoria }} />
          </>
        )}

        {!caida && (
          <p className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-500 text-center">
            <Store size={16} className="text-naranja" /> ¿Tienes un negocio? Vuélvete Punto Aliado y ofrece lo tuyo aquí.
            <Link href="/registro?tipo=aliado" className="font-bold text-naranja hover:underline underline-offset-2">
              Quiero vender
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
