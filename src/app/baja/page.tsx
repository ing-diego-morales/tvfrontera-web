// src/app/baja/page.tsx — "Darme de baja del boletín" (enlace del correo de bienvenida)
import type { Metadata } from "next";
import BajaBoletin from "@/components/inicio/BajaBoletin";

export const metadata: Metadata = { title: "Darse de baja del boletín", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function BajaPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const limpio = token && /^[\w-]{20,60}$/.test(token) ? token : "";
  return (
    <main className="flex-1 bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-3xl shadow-xl ring-1 ring-black/5 p-8 md:p-10 max-w-md w-full text-center">
        <BajaBoletin token={limpio} />
      </div>
    </main>
  );
}
