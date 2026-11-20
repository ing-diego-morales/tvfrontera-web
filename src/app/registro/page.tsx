// src/app/registro/page.tsx — /registro y /registro?tipo=aliado
import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import RegistroForm from "@/components/auth/RegistroForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en Televentas Fest como cliente o como Punto Aliado.",
  robots: { index: false, follow: true },
};

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ tipo?: string; next?: string; ref?: string }> }) {
  const { tipo, next, ref } = await searchParams;
  const refCodigo = ref && /^[A-Za-z0-9]{4,20}$/.test(ref) ? ref.toUpperCase() : undefined;
  return (
    <AuthCard titulo="Crea tu cuenta" subtitulo="Es gratis y toma menos de un minuto" ancho="ancho">
      <RegistroForm tipoInicial={tipo === "aliado" ? "SOCIO" : "CLIENTE"} next={next} refCodigo={refCodigo} />
    </AuthCard>
  );
}
