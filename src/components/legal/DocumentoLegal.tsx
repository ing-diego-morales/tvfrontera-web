// src/components/legal/DocumentoLegal.tsx — presentación profesional para Privacidad y Términos
// Server Component: índice lateral fijo, secciones numeradas con ancla y ficha del documento.
import Link from "next/link";
import { CalendarDays, FileText, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { SITIO } from "@/lib/sitio";

export type SeccionLegal = { id: string; titulo: string; contenido: React.ReactNode };

export default function DocumentoLegal({
  titulo,
  resumen,
  actualizado,
  version,
  secciones,
  relacionado,
}: {
  titulo: string;
  resumen: string;
  actualizado: string;
  version: string;
  secciones: SeccionLegal[];
  relacionado: { href: string; label: string };
}) {
  return (
    <main className="flex-1 bg-gray-50">
      <section className="relative overflow-hidden fondo-marca text-white">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-naranja/15 blur-3xl" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 py-14">
          <nav aria-label="Ruta" className="text-xs text-white/75 mb-4">
            <Link href="/" className="hover:text-white">
              Inicio
            </Link>{" "}
            / <span className="text-white">Legal</span>
          </nav>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] bg-indigo/90 px-3 py-1 rounded-full">
            <ShieldCheck size={14} /> Documento legal
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3">{titulo}</h1>
          <p className="text-white/90 mt-4 max-w-2xl text-lg">{resumen}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-white/90">
            <span className="flex items-center gap-2">
              <CalendarDays size={16} /> Última actualización: {actualizado}
            </span>
            <span className="flex items-center gap-2">
              <FileText size={16} /> Versión {version}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Índice */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--alto-header)+1.5rem)] space-y-4">
            <nav aria-label="Contenido" className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">Contenido</p>
              <ol className="space-y-1 text-sm">
                {secciones.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex gap-2 rounded-md px-2 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-naranja transition-colors">
                      <span className="font-bold text-indigo tabular-nums w-5 shrink-0">{i + 1}.</span>
                      <span>{s.titulo}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <Link href={relacionado.href} className="block bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-5 text-sm font-bold text-indigo hover:text-naranja transition-colors">
              {relacionado.label} →
            </Link>
          </div>
        </aside>

        {/* Documento */}
        <article className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 md:p-10">
          <div className="space-y-10 text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mt-3 [&_p+p]:mt-3 [&_strong]:text-indigo">
            {secciones.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-32">
                <h2 className="flex items-baseline gap-3 text-xl font-extrabold text-indigo mb-3">
                  <span className="text-naranja tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {s.titulo}
                </h2>
                {s.contenido}
              </section>
            ))}
          </div>

          {/* Responsable */}
          <div className="mt-12 rounded-xl bg-gray-50 ring-1 ring-black/5 p-6">
            <p className="font-extrabold text-indigo">¿Preguntas sobre este documento?</p>
            <p className="text-sm text-gray-600 mt-1">Escríbenos y te respondemos dentro de los plazos de ley.</p>
            <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm">
              <a href={`mailto:${SITIO.correo}`} className="flex items-center gap-2 text-indigo hover:text-naranja">
                <Mail size={16} /> {SITIO.correo}
              </a>
              <a href={`https://wa.me/${SITIO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo hover:text-naranja">
                <Phone size={16} /> {SITIO.telefono}
              </a>
              <span className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} /> Cúcuta, Colombia
              </span>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
