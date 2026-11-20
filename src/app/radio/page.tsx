// src/app/radio/page.tsx — Radio TV Frontera en vivo (reproductor propio: el mismo del botón flotante)
import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { EncabezadoPagina } from "@/components/ui";
import Schedule from "@/components/Schedule";
import ReproductorRadio from "@/components/radio/ReproductorRadio";

export const metadata: Metadata = {
  title: "Radio en vivo",
  description: "Escucha la radio de TV Frontera en vivo desde Cúcuta, las 24 horas.",
  alternates: { canonical: "/radio" },
};

export default function RadioPage() {
  return (
    <main className="flex-1 bg-gray-50">
      <EncabezadoPagina etiqueta="En vivo" titulo="Radio TV Frontera" subtitulo="Música, noticias y compañía desde Cúcuta, las 24 horas." />
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <section className="lg:col-span-2 bg-white rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 bg-indigo text-white">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-rojo opacity-75 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-rojo" />
            </span>
            <Radio size={18} className="text-amarillo" />
            <span className="font-bold">Al aire</span>
          </div>
          <ReproductorRadio />
        </section>
        <div className="lg:col-span-3">
          <Schedule />
        </div>
      </div>
    </main>
  );
}
