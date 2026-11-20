// src/app/puntos-aliados/page.tsx — directorio público (caché 60 s). Solo aliados aprobados y al día,
// ordenados por posicionamiento: impulso > Premium > prioridad > rotación diaria.
import type { Metadata } from "next";
import Link from "next/link";
import { Search, ShoppingBag, Store } from "lucide-react";
import { apiPublica, apiPublicaSegura } from "@/lib/api-server";
import type { ListaAliados } from "@/lib/aliados";
import GrillaAliados from "@/components/aliados/GrillaAliados";
import Pagination from "@/components/Pagination";
import { Aviso, EncabezadoPagina } from "@/components/ui";

export const metadata: Metadata = {
  title: "Puntos Aliados",
  description: "Negocios de Cúcuta y la región que hacen parte de la red de Puntos Aliados de Televentas Fest. Contáctalos por WhatsApp o visítalos.",
  alternates: { canonical: "/puntos-aliados" },
};

export default async function PuntosAliadosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; categoria?: string }>;
}) {
  const { q: qParam, page, categoria: catParam } = await searchParams;
  const q = qParam?.trim().slice(0, 100) || undefined;
  const categoria = catParam?.trim().slice(0, 80) || undefined;
  const currentPage = Math.max(1, Number(page) || 1);

  const qs = new URLSearchParams({ page: String(currentPage), limit: "12" });
  if (q) qs.set("q", q);
  if (categoria) qs.set("categoria", categoria);

  let data: ListaAliados | null = null;
  let caida = false;
  try {
    data = await apiPublica<ListaAliados>(`/api/socios?${qs}`);
  } catch {
    caida = true;
  }
  const cats = await apiPublicaSegura<{ categorias: { categoria: string; total: number }[] }>("/api/socios/categorias", 300);

  const chip = (activa: boolean) =>
    `whitespace-nowrap text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
      activa ? "bg-indigo text-white" : "bg-white text-indigo ring-1 ring-gray-200 hover:ring-indigo"
    }`;

  return (
    <main className="flex-1 bg-gray-50">
      <EncabezadoPagina
        etiqueta="Red comercial Televentas Fest"
        titulo="Puntos Aliados"
        subtitulo="Negocios de la región que confían en Televentas Fest. Encuéntralos, escríbeles por WhatsApp o visítalos."
      />

      <div className="max-w-6xl mx-auto px-4 -mt-7 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-3 flex flex-col md:flex-row gap-3">
          <form suppressHydrationWarning action="/puntos-aliados" method="GET" className="flex flex-1 gap-2" role="search">
            {categoria && <input suppressHydrationWarning type="hidden" name="categoria" value={categoria} />}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input suppressHydrationWarning
                type="search"
                name="q"
                defaultValue={q}
                maxLength={100}
                aria-label="Buscar Puntos Aliados"
                placeholder="¿Qué buscas? Panadería, repuestos, ropa..."
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-900 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo focus:bg-white"
              />
            </div>
            <button type="submit" className="bg-naranja hover:bg-naranja-oscuro text-white font-bold px-6 rounded-xl transition-colors">
              Buscar
            </button>
          </form>
          <div className="flex gap-2">
            <Link href="/productos" className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-200 hover:border-indigo text-indigo font-bold px-4 py-3 rounded-xl transition-colors">
              <ShoppingBag size={18} /> Productos
            </Link>
            <Link href="/registro?tipo=aliado" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amarillo hover:bg-amarillo-oscuro text-indigo font-bold px-4 py-3 rounded-xl transition-colors">
              <Store size={18} /> Ser aliado
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {!!cats?.categorias.length && (
          <div className="flex gap-2 overflow-x-auto sin-scrollbar pb-2 mb-8 -mx-4 px-4">
            <Link href={q ? `/puntos-aliados?q=${encodeURIComponent(q)}` : "/puntos-aliados"} className={chip(!categoria)}>
              Todos
            </Link>
            {cats.categorias.map((c) => {
              const p = new URLSearchParams({ categoria: c.categoria });
              if (q) p.set("q", q);
              return (
                <Link key={c.categoria} href={`/puntos-aliados?${p}`} className={chip(categoria === c.categoria)}>
                  {c.categoria} <span className="opacity-60 font-normal">({c.total})</span>
                </Link>
              );
            })}
          </div>
        )}

        {caida ? (
          <Aviso tipo="alerta">El directorio no está disponible en este momento. Intenta de nuevo en unos minutos.</Aviso>
        ) : !data?.socios.length ? (
          <div className="text-center py-20">
            <Store size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {q || categoria ? "No encontramos Puntos Aliados con esos filtros." : "Muy pronto verás aquí los negocios aliados de Televentas Fest."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {data.total} Punto{data.total === 1 ? "" : "s"} Aliado{data.total === 1 ? "" : "s"}
              {q && (
                <>
                  {" "}
                  para <span className="font-bold text-indigo">&quot;{q}&quot;</span>
                </>
              )}
              {categoria && (
                <>
                  {" "}
                  en <span className="font-bold text-indigo">{categoria}</span>
                </>
              )}
            </p>
            <GrillaAliados socios={data.socios} consulta={qs.toString()} />
            <Pagination currentPage={currentPage} totalPages={data.pages} basePath="/puntos-aliados" params={{ q, categoria }} />
          </>
        )}
      </div>
    </main>
  );
}
