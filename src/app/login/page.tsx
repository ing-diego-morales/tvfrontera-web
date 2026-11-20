// src/app/login/page.tsx
import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; restablecida?: string }> }) {
  const { next, restablecida } = await searchParams;
  return (
    <AuthCard titulo="Bienvenido de nuevo" subtitulo="Ingresa a tu cuenta de Televentas Fest">
      <LoginForm next={next} aviso={restablecida ? "¡Listo! Tu contraseña se cambió. Inicia sesión con la nueva." : undefined} />
    </AuthCard>
  );
}
