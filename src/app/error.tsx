// src/app/error.tsx — si algo falla (ej. la API está caída) se muestra esto en vez de una pantalla en blanco
"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex-1 bg-gray-50 flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-indigo">Algo salió mal</h1>
        <p className="text-gray-500 mt-2">No pudimos cargar esta página. Intenta de nuevo en unos segundos.</p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-naranja hover:bg-naranja-oscuro text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            <RefreshCw size={18} /> Reintentar
          </button>
          <Link href="/" className="border border-gray-300 text-indigo font-bold px-6 py-3 rounded-full hover:bg-white transition-colors">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
