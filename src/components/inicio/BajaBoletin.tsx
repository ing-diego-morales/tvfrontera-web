// src/components/inicio/BajaBoletin.tsx — confirma la baja con un clic (no se da de baja solo con abrir el enlace,
// así los antivirus de correo que "visitan" los enlaces no dan de baja a nadie por error)
"use client";

import { useState } from "react";
import Link from "next/link";
import { MailX } from "lucide-react";
import { Aviso, Boton } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";

export default function BajaBoletin({ token }: { token: string }) {
  const [estado, setEstado] = useState<"pregunta" | "hecho">("pregunta");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  if (!token) return <Aviso>El enlace no es válido. Usa el enlace que llegó en el correo del boletín.</Aviso>;

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      await api("/api/suscriptores/baja", { method: "POST", json: { token } });
      setEstado("hecho");
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-5">
      <span className="w-16 h-16 mx-auto rounded-full bg-naranja-claro text-naranja flex items-center justify-center">
        <MailX size={28} />
      </span>
      {estado === "hecho" ? (
        <>
          <h1 className="text-2xl font-extrabold text-indigo">Listo, te diste de baja</h1>
          <p className="text-gray-500">Ya no recibirás el boletín. Puedes volver a suscribirte cuando quieras desde el inicio.</p>
          <Link href="/" className="inline-block font-bold text-naranja hover:underline">
            Ir al inicio →
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold text-indigo">¿Darte de baja del boletín?</h1>
          <p className="text-gray-500">Dejarás de recibir noticias, ofertas y la información del sorteo anual.</p>
          {error && <Aviso>{error}</Aviso>}
          <Boton onClick={confirmar} cargando={enviando} className="w-full py-3">
            Sí, darme de baja
          </Boton>
          <Link href="/" className="block text-sm text-gray-500 hover:text-indigo">
            No, seguir suscrito
          </Link>
        </>
      )}
    </div>
  );
}
