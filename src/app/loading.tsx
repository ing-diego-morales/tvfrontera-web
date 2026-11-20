// src/app/loading.tsx — se muestra al instante mientras carga una página (si tarda)
import Image from "next/image";

export default function Cargando() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-5 py-32 bg-gray-50" aria-busy="true" aria-live="polite">
      <div className="relative w-20 h-20">
        <span className="absolute inset-0 rounded-full bg-naranja/25 animate-ping motion-reduce:animate-none" />
        <span className="relative flex w-20 h-20 rounded-full bg-white shadow-lg ring-4 ring-naranja-claro items-center justify-center">
          <Image src="/marca/icono-180.png" alt="" width={48} height={48} loading="eager" fetchPriority="high" />
        </span>
      </div>
      <div className="w-40 h-1.5 rounded-full bg-naranja-claro overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-naranja barra-carga" />
      </div>
      <p className="text-sm font-semibold text-indigo">Cargando…</p>
    </main>
  );
}
