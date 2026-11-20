// src/components/auth/RecuperarForm.tsx — pide el enlace de recuperación al correo registrado
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck, Send } from "lucide-react";
import { Aviso, Boton, Campo } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";
import { useAntiBot } from "@/components/AntiBot";

export default function RecuperarForm({ emailInicial = "" }: { emailInicial?: string }) {
  const [email, setEmail] = useState(emailInicial);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState("");
  const [error, setError] = useState("");
  const antiBot = useAntiBot();

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const r = await api<{ mensaje: string }>("/api/auth/recuperar", { method: "POST", json: { email: email.trim(), ...antiBot.datos() } });
      setEnviado(r.mensaje);
    } catch (err) {
      setError(mensajeError(err));
      antiBot.reiniciar();
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <MailCheck size={30} className="text-green-700" />
        </div>
        <p className="text-gray-600">{enviado}</p>
        <p className="text-sm text-gray-500">
          El enlace vence en <b>30 minutos</b> y sirve una sola vez. Enviado a <b className="text-indigo">{email.trim()}</b>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Boton variante="borde" onClick={() => setEnviado("")}>
            Usar otro correo
          </Boton>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 font-bold px-4 py-2 rounded-lg bg-indigo hover:bg-indigo-oscuro text-white">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form suppressHydrationWarning onSubmit={enviar} className="space-y-5 relative">
      {antiBot.campos}
      {error && <Aviso>{error}</Aviso>}
      <Campo
        label="Correo electrónico registrado"
        name="email"
        type="email"
        autoComplete="email"
        required
        autoFocus
        maxLength={150}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
      />
      <Boton type="submit" cargando={enviando} className="w-full py-3">
        <Send size={18} /> Enviarme el enlace
      </Boton>
      <Link href="/login" className="flex items-center justify-center gap-1 text-sm font-semibold text-indigo hover:text-naranja">
        <ArrowLeft size={16} /> Volver a iniciar sesión
      </Link>
    </form>
  );
}
