// src/app/confirmar/page.tsx — destino del enlace "Confirma tu correo"
import type { Metadata } from "next";
import ConfirmarCorreo from "@/components/auth/ConfirmarCorreo";

export const metadata: Metadata = { title: "Confirmar correo", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function ConfirmarPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const limpio = token && /^[\w-]{20,100}$/.test(token) ? token : "";
  return (
    <main className="flex-1 bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-3xl shadow-xl ring-1 ring-black/5 p-8 md:p-10 max-w-md w-full text-center">
        <ConfirmarCorreo token={limpio} />
      </div>
    </main>
  );
}
