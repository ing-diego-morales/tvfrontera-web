// src/app/restablecer/page.tsx — destino del enlace que llega por correo
import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import RestablecerForm from "@/components/auth/RestablecerForm";

export const metadata: Metadata = {
  title: "Crear nueva contraseña",
  robots: { index: false, follow: false },
  // El token va en la URL: que no se filtre a otros sitios por la cabecera Referer
  referrer: "no-referrer",
};

export default async function RestablecerPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const limpio = token && /^[\w-]{20,100}$/.test(token) ? token : "";
  return (
    <AuthCard titulo="Crea una nueva contraseña" subtitulo="Elige una contraseña segura que no uses en otros sitios.">
      <RestablecerForm token={limpio} />
    </AuthCard>
  );
}
