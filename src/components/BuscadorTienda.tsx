// src/components/BuscadorTienda.tsx — "¿Qué producto buscas?"
// Formulario GET normal: funciona aunque el JavaScript aún no haya cargado (rápido y accesible).
import { Search } from "lucide-react";

export default function BuscadorTienda({ grande = false, valor, className = "" }: { grande?: boolean; valor?: string; className?: string }) {
  return (
    <form suppressHydrationWarning action="/productos" method="GET" role="search" className={`relative flex w-full ${className}`}>
      <label htmlFor={grande ? "buscar-grande" : "buscar-header"} className="sr-only">
        Buscar productos
      </label>
      <input suppressHydrationWarning
        id={grande ? "buscar-grande" : "buscar-header"}
        type="search"
        name="q"
        defaultValue={valor}
        maxLength={100}
        autoComplete="off"
        placeholder="¿Qué producto buscas?"
        className={`w-full rounded-full bg-white text-gray-900 placeholder:text-gray-400 shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-amarillo ${
          grande ? "pl-6 pr-16 py-4 text-base" : "pl-5 pr-14 py-2.5 text-sm"
        }`}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-rojo hover:bg-[#c62828] text-white flex items-center justify-center transition-colors ${
          grande ? "w-12 h-12" : "w-9 h-9"
        }`}
      >
        <Search size={grande ? 22 : 18} />
      </button>
    </form>
  );
}
