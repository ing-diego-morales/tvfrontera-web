// src/components/faq/ListaPreguntas.tsx — buscador + temas + acordeón de preguntas frecuentes
// El acordeón usa <details>/<summary> nativos: funciona sin JavaScript, con teclado y lectores de pantalla.
// Con JS se suma el buscador instantáneo (ignora tildes y mayúsculas) y el filtro por tema.
"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, SearchX } from "lucide-react";

export type Pregunta = { id: number; tema: string; pregunta: string; respuesta: string };

const normalizar = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function ListaPreguntas({ preguntas }: { preguntas: Pregunta[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [tema, setTema] = useState<string | null>(null);

  const temas = useMemo(() => [...new Set(preguntas.map((p) => p.tema))], [preguntas]);

  const visibles = useMemo(() => {
    const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);
    return preguntas.filter((p) => {
      if (tema && p.tema !== tema) return false;
      if (!palabras.length) return true;
      const texto = normalizar(`${p.pregunta} ${p.respuesta} ${p.tema}`);
      return palabras.every((w) => texto.includes(w));
    });
  }, [preguntas, busqueda, tema]);

  const grupos = useMemo(() => {
    const m = new Map<string, Pregunta[]>();
    for (const p of visibles) m.set(p.tema, [...(m.get(p.tema) ?? []), p]);
    return [...m.entries()];
  }, [visibles]);

  const chip = (activo: boolean) =>
    `whitespace-nowrap text-sm font-semibold px-4 py-2 rounded-full transition-colors ${activo ? "bg-indigo text-white" : "bg-white text-indigo ring-1 ring-gray-200 hover:ring-indigo"}`;

  return (
    <div>
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
        <input
          suppressHydrationWarning
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          maxLength={100}
          placeholder="Busca tu duda: pago, envío, premios, contraseña..."
          aria-label="Buscar en preguntas frecuentes"
          className="w-full rounded-2xl bg-white ring-1 ring-black/10 shadow-sm pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-naranja"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-5" role="group" aria-label="Filtrar por tema">
        <button type="button" onClick={() => setTema(null)} aria-pressed={!tema} className={chip(!tema)}>
          Todas
        </button>
        {temas.map((t) => (
          <button key={t} type="button" onClick={() => setTema(tema === t ? null : t)} aria-pressed={tema === t} className={chip(tema === t)}>
            {t}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {visibles.length} pregunta{visibles.length === 1 ? "" : "s"}
      </p>

      {grupos.length ? (
        <div className="mt-8 space-y-10">
          {grupos.map(([nombre, lista], g) => (
            <section key={nombre} aria-labelledby={`tema-${g}`}>
              <h2 id={`tema-${g}`} className="text-xs font-extrabold uppercase tracking-[0.18em] text-naranja mb-3">
                {nombre}
              </h2>
              <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-sm divide-y divide-gray-100 overflow-hidden">
                {lista.map((p) => (
                  <details key={p.id} name="faq" className="group">
                    <summary className="flex items-center gap-4 cursor-pointer list-none px-5 py-4 md:px-6 md:py-5 font-bold text-indigo hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                      <span className="flex-1">{p.pregunta}</span>
                      <span className="w-8 h-8 shrink-0 rounded-full bg-naranja-claro text-naranja flex items-center justify-center transition-transform duration-300 group-open:rotate-180">
                        <ChevronDown size={18} />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 md:px-6 md:pb-6 -mt-1 text-gray-600 leading-relaxed whitespace-pre-line">{p.respuesta}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-10 text-center rounded-2xl bg-white ring-1 ring-black/5 px-6 py-10">
          <SearchX size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-bold text-indigo">No encontramos preguntas con “{busqueda}”</p>
          <p className="text-sm text-gray-500 mt-1">Prueba con otra palabra o escríbenos: con gusto te ayudamos.</p>
        </div>
      )}
    </div>
  );
}
