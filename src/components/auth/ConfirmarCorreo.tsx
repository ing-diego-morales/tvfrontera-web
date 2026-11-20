// src/components/auth/ConfirmarCorreo.tsx — confirma con un clic (no al abrir el enlace: los antivirus
// de correo "visitan" los enlaces y no deben confirmar por la persona)
"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Aviso, Boton } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";

export default function ConfirmarCorreo({ token }: { token: string }) {
  const { refrescar } = useAuth();
  const [hecho, setHecho] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  if (!token) return <Aviso>Este enlace no es válido. Pide uno nuevo desde Mi cuenta.</Aviso>;

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      await api("/api/auth/confirmar", { method: "POST", json: { token } });
      await refrescar();
      setHecho(true);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-5">
      <span className="w-16 h-16 mx-auto rounded-full bg-naranja-claro text-naranja flex items-center justify-center">
        <MailCheck size={28} />
      </span>
      {hecho ? (
        <>
          <h1 className="text-2xl font-extrabold text-indigo">¡Correo confirmado!</h1>
          <p className="text-gray-500">Tu cuenta está lista. Si alguien te invitó, su invitación ya puede contar.</p>
          <div className="flex flex-col gap-2">
            <Link href="/referidos" className="font-bold bg-naranja hover:bg-naranja-oscuro text-white px-5 py-3 rounded-full">
              Invita a tus amigos y gana premios
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-indigo">
              Ir al inicio
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold text-indigo">Confirma tu correo</h1>
          <p className="text-gray-500">Un clic y listo: así sabemos que eres tú.</p>
          {error && <Aviso>{error}</Aviso>}
          <Boton onClick={confirmar} cargando={enviando} className="w-full py-3">
            Confirmar mi correo
          </Boton>
        </>
      )}
    </div>
  );
}
