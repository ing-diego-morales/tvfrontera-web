// src/components/cuenta/AvisoConfirmarCorreo.tsx — recordatorio mientras el correo no esté confirmado
"use client";

import { useState } from "react";
import { MailWarning } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Boton } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";

export default function AvisoConfirmarCorreo() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const [enviando, setEnviando] = useState(false);
  if (!user || user.email_verificado) return null;

  const reenviar = async () => {
    setEnviando(true);
    try {
      const r = await api<{ mensaje: string }>("/api/auth/reenviar-confirmacion", { method: "POST" });
      setMsg(r.mensaje);
    } catch (e) {
      setMsg(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-amarillo/20 ring-1 ring-amarillo px-4 py-3">
      <MailWarning className="text-naranja shrink-0" size={22} />
      <p className="text-sm text-indigo flex-1">
        <b>Confirma tu correo ({user.email}).</b> Te enviamos un enlace al registrarte. {msg}
      </p>
      {!msg && (
        <Boton variante="borde" className="text-sm whitespace-nowrap" cargando={enviando} onClick={reenviar}>
          Reenviar enlace
        </Boton>
      )}
    </div>
  );
}
