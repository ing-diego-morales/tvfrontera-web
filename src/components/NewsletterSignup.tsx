// src/components/NewsletterSignup.tsx — boletín: guarda el correo en la BD (Admin > Suscriptores)
// y envía un correo de bienvenida con enlace para darse de baja.
"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { api, mensajeError } from "@/lib/api";
import { useAntiBot } from "@/components/AntiBot";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState("");
  const [error, setError] = useState("");
  const antiBot = useAntiBot();

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!acepta) return setError("Acepta la política de datos para suscribirte.");
    setEnviando(true);
    try {
      const r = await api<{ mensaje: string }>("/api/suscriptores", { method: "POST", json: { email: email.trim(), acepta: true, origen: "inicio", ...antiBot.datos() } });
      setListo(r.mensaje);
      setEmail("");
    } catch (err) {
      setError(mensajeError(err));
      antiBot.reiniciar();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="bg-amarillo">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="flex items-start gap-4">
          <span className="hidden sm:flex w-14 h-14 rounded-2xl bg-indigo text-amarillo items-center justify-center shrink-0 shadow-lg">
            <Mail size={26} />
          </span>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-indigo">No te pierdas ninguna noticia</h2>
            <p className="text-indigo/80 mt-1">Recibe las noticias más importantes de la frontera, las ofertas de Televentas Fest y la información del sorteo anual.</p>
          </div>
        </div>

        {listo ? (
          <p role="status" className="flex items-center gap-2 bg-white rounded-2xl px-5 py-4 text-green-700 font-bold shadow">
            <CheckCircle2 size={22} /> {listo}
          </p>
        ) : (
          <form suppressHydrationWarning onSubmit={enviar} className="space-y-3 relative">
            {antiBot.campos}
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="boletin-email" className="sr-only">
                Correo electrónico
              </label>
              <input suppressHydrationWarning
                id="boletin-email"
                type="email"
                required
                maxLength={150}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-5 py-3.5 rounded-full bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo"
              />
              <button
                type="submit"
                disabled={enviando}
                className="flex items-center justify-center gap-2 bg-indigo hover:bg-indigo-oscuro text-white font-bold px-7 py-3.5 rounded-full shadow transition-colors disabled:opacity-60"
              >
                {enviando && <Loader2 size={18} className="animate-spin" />} Suscribirme
              </button>
            </div>
            <label className="flex items-start gap-2 text-xs text-indigo/80">
              <input suppressHydrationWarning type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 accent-indigo" />
              <span>
                Acepto recibir correos y la{" "}
                <Link href="/privacidad" className="font-bold underline">
                  política de tratamiento de datos
                </Link>
                . Puedo darme de baja cuando quiera.
              </span>
            </label>
            {error && (
              <p role="alert" className="text-sm font-bold text-rojo">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
