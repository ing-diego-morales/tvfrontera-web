// src/app/preguntas-frecuentes/page.tsx — Server Component. Las preguntas se editan en Admin > Preguntas.
// Incluye datos estructurados FAQPage (schema.org) para que Google pueda mostrarlas en los resultados.
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { EncabezadoPagina } from "@/components/ui";
import ListaPreguntas, { type Pregunta } from "@/components/faq/ListaPreguntas";
import { apiPublicaSegura } from "@/lib/api-server";
import { SITIO } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: `Resolvemos tus dudas sobre compras, pagos, envíos, Puntos Aliados, premios por referidos y seguridad en ${SITIO.nombre}.`,
  alternates: { canonical: "/preguntas-frecuentes" },
};

export default async function PreguntasFrecuentesPage() {
  const data = await apiPublicaSegura<{ preguntas: Pregunta[] }>("/api/preguntas", 300);
  const preguntas = data?.preguntas ?? [];

  // JSON seguro dentro de <script>: se escapa "<" para que ningún texto pueda cerrar la etiqueta
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((p) => ({ "@type": "Question", name: p.pregunta, acceptedAnswer: { "@type": "Answer", text: p.respuesta } })),
  }).replace(/</g, "\\u003c");

  return (
    <main className="flex-1 bg-gray-50">
      {preguntas.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      <EncabezadoPagina etiqueta="Centro de ayuda" titulo="Preguntas frecuentes" subtitulo={`Todo lo que necesitas saber para comprar, vender y ganar premios en ${SITIO.nombre}.`} />

      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        {preguntas.length ? (
          <ListaPreguntas preguntas={preguntas} />
        ) : (
          <p className="text-center text-gray-500 py-10">Pronto publicaremos aquí las respuestas a las dudas más comunes.</p>
        )}

        <section className="mt-14 rounded-3xl bg-white ring-1 ring-black/5 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-indigo">¿No encontraste tu respuesta?</h2>
            <p className="text-gray-500 mt-1">Escríbenos y nuestro equipo te responde lo antes posible.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${SITIO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-5 py-3 rounded-full transition-colors"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
            <Link href="/contacto" className="inline-flex items-center gap-2 bg-indigo hover:bg-indigo-oscuro text-white font-bold px-5 py-3 rounded-full transition-colors">
              <Mail size={18} /> Contacto
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
