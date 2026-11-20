// src/app/not-found.tsx — página 404 con el estilo del sitio
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 bg-gray-50 flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <p className="text-7xl font-extrabold text-naranja">404</p>
        <h1 className="text-2xl font-bold text-indigo mt-4">No encontramos esta página</h1>
        <p className="text-gray-500 mt-2">Puede que el enlace haya cambiado o que el contenido ya no esté disponible.</p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link href="/" className="bg-naranja hover:bg-naranja-oscuro text-white font-bold px-6 py-3 rounded-full transition-colors">
            Ir al inicio
          </Link>
          <Link href="/noticias" className="border border-gray-300 text-indigo font-bold px-6 py-3 rounded-full hover:bg-white transition-colors">
            Ver noticias
          </Link>
        </div>
      </div>
    </main>
  );
}
