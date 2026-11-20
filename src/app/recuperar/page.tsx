// src/app/recuperar/page.tsx — "¿Olvidaste tu contraseña?"
import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import RecuperarForm from "@/components/auth/RecuperarForm";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false, follow: false } };

export default async function RecuperarPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <AuthCard titulo="¿Olvidaste tu contraseña?" subtitulo="Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva.">
      <RecuperarForm emailInicial={email?.slice(0, 150) ?? ""} />
    </AuthCard>
  );
}
