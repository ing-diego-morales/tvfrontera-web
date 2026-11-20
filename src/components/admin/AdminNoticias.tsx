// src/components/admin/AdminNoticias.tsx — lista y CRUD de noticias
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Search, Star } from "lucide-react";
import { Aviso, Boton, Cargando, Etiqueta, Vacio, inputClase } from "@/components/ui";
import { BotonConfirmar, Paginador } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import { esOptimizable, imagenSegura } from "@/lib/images";
import { etiquetaCategoria, type ListaNoticias } from "@/lib/news";
import { useApi } from "@/lib/useApi";
import NoticiaForm from "./NoticiaForm";
import FacebookNoticias from "./FacebookNoticias";
import { FaFacebook } from "react-icons/fa";

export default function AdminNoticias({ filtroInicial = "" }: { filtroInicial?: string }) {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState(filtroInicial);
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<number | "nueva" | null>(null);
  const [errorAccion, setErrorAccion] = useState("");

  const qs = new URLSearchParams({ page: String(page), limit: "15" });
  if (estado) qs.set("estado", estado);
  if (busqueda) qs.set("q", busqueda);
  const { data, error, cargando, recargar } = useApi<ListaNoticias>(`/api/noticias/admin/todas?${qs}`);

  const borrar = async (id: number) => {
    setErrorAccion("");
    try {
      await api(`/api/noticias/${id}`, { method: "DELETE" });
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  if (editando !== null) {
    return (
      <NoticiaForm
        id={editando === "nueva" ? null : editando}
        onCerrar={(guardado) => {
          setEditando(null);
          if (guardado) recargar();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <FacebookNoticias alImportar={recargar} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { v: "", l: "Todas" },
            { v: "PUBLICADA", l: "Publicadas" },
            { v: "BORRADOR", l: "Borradores" },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => {
                setEstado(f.v);
                setPage(1);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${estado === f.v ? "bg-naranja text-white" : "bg-white text-indigo border border-gray-200"}`}
            >
              {f.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <form suppressHydrationWarning
            onSubmit={(e) => {
              e.preventDefault();
              setBusqueda(q.trim());
              setPage(1);
            }}
            className="flex gap-2"
            role="search"
          >
            <input suppressHydrationWarning value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar título" aria-label="Buscar noticias" className={`${inputClase} py-1.5 text-sm`} maxLength={100} />
            <Boton type="submit" variante="azul" className="px-3" aria-label="Buscar">
              <Search size={16} />
            </Boton>
          </form>
          <Boton onClick={() => setEditando("nueva")} className="whitespace-nowrap">
            <Plus size={16} /> Nueva
          </Boton>
        </div>
      </div>

      {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}

      {cargando ? (
        <Cargando />
      ) : !data?.noticias.length ? (
        <Vacio>No hay noticias.</Vacio>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
            {data.noticias.map((n) => {
              const img = imagenSegura(n.imagen_url);
              return (
                <div key={n.id} className="flex items-center gap-4 p-4">
                  <div className="relative w-20 h-14 rounded-md overflow-hidden bg-gray-100 shrink-0 hidden sm:block">
                    <Image src={img} alt="" fill sizes="80px" unoptimized={!esOptimizable(img)} className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-indigo truncate flex items-center gap-1">
                      {!!n.destacada && <Star size={14} className="text-amarillo shrink-0" fill="currentColor" />}
                      {n.fuente === "FACEBOOK" && <FaFacebook className="text-[#1877F2] shrink-0" size={14} aria-label="Importada de Facebook" />}
                      {n.titulo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {etiquetaCategoria(n.categoria)} · {n.publicada_en ? `Publicada ${formatDate(n.publicada_en)}` : `Editada ${formatDate(n.updated_at)}`}
                      {n.autor && ` · ${n.autor}`}
                    </p>
                  </div>
                  <Etiqueta clase={n.estado === "PUBLICADA" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}>
                    {n.estado === "PUBLICADA" ? "Publicada" : "Borrador"}
                  </Etiqueta>
                  <div className="flex items-center gap-1">
                    {n.estado === "PUBLICADA" && (
                      <Link href={`/noticias/${n.slug}`} target="_blank" aria-label="Ver en el sitio" className="p-2 text-gray-400 hover:text-indigo">
                        <ExternalLink size={16} />
                      </Link>
                    )}
                    <Boton variante="texto" className="px-2" onClick={() => setEditando(n.id)} aria-label={`Editar ${n.titulo}`}>
                      <Pencil size={16} />
                    </Boton>
                    <BotonConfirmar variante="texto" onConfirm={() => borrar(n.id)} pregunta="¿Borrar?">
                      Borrar
                    </BotonConfirmar>
                  </div>
                </div>
              );
            })}
          </div>
          <Paginador page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
