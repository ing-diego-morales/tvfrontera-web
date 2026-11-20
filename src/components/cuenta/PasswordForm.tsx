// src/components/cuenta/PasswordForm.tsx — POST /api/auth/password
"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Aviso, Boton, Campo, Tarjeta } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";

export default function PasswordForm() {
  const [f, setF] = useState({ actual: "", nueva: "", confirmar: "" });
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (f.nueva.length < 8) return setMsg({ tipo: "error", texto: "La nueva contraseña debe tener mínimo 8 caracteres." });
    if (f.nueva !== f.confirmar) return setMsg({ tipo: "error", texto: "Las contraseñas nuevas no coinciden." });
    if (f.nueva === f.actual) return setMsg({ tipo: "error", texto: "La nueva contraseña debe ser distinta a la actual." });
    setEnviando(true);
    try {
      await api("/api/auth/password", { method: "POST", json: { actual: f.actual, nueva: f.nueva } });
      setF({ actual: "", nueva: "", confirmar: "" });
      setMsg({ tipo: "ok", texto: "Tu contraseña se cambió correctamente." });
    } catch (err) {
      setMsg({ tipo: "error", texto: mensajeError(err) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tarjeta titulo="Cambiar contraseña">
      <form suppressHydrationWarning onSubmit={guardar} className="space-y-4">
        {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
        <Campo label="Contraseña actual" name="actual" type="password" autoComplete="current-password" required value={f.actual} onChange={(e) => setF({ ...f, actual: e.target.value })} />
        <Campo label="Nueva contraseña" name="nueva" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={f.nueva} onChange={(e) => setF({ ...f, nueva: e.target.value })} ayuda="Mínimo 8 caracteres. Usa una frase que solo tú conozcas." />
        <Campo label="Confirmar nueva contraseña" name="confirmar" type="password" autoComplete="new-password" required maxLength={72} value={f.confirmar} onChange={(e) => setF({ ...f, confirmar: e.target.value })} />
        <Boton type="submit" cargando={enviando} variante="azul">
          <KeyRound size={16} /> Cambiar contraseña
        </Boton>
      </form>
    </Tarjeta>
  );
}
