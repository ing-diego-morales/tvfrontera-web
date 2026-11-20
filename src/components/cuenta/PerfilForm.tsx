// src/components/cuenta/PerfilForm.tsx — PATCH /api/auth/me
"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Aviso, Boton, Campo, Tarjeta } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";

export default function PerfilForm() {
  const { user, refrescar } = useAuth();
  const [f, setF] = useState({ nombre: user?.nombre ?? "", telefono: user?.telefono ?? "", cedula: user?.cedula ?? "" });
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  if (!user) return null;

  const cedulaBloqueada = user.verificacion === "VERIFICADO";

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (f.cedula && !/^\d{5,15}$/.test(f.cedula)) return setMsg({ tipo: "error", texto: "La cédula debe tener solo números (5 a 15 dígitos)." });
    setEnviando(true);
    try {
      await api("/api/auth/me", {
        method: "PATCH",
        json: {
          nombre: f.nombre.trim(),
          telefono: f.telefono.trim() || null,
          ...(cedulaBloqueada ? {} : { cedula: f.cedula.trim() || null }),
        },
      });
      await refrescar();
      setMsg({ tipo: "ok", texto: "Tus datos se guardaron." });
    } catch (err) {
      setMsg({ tipo: "error", texto: mensajeError(err) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tarjeta titulo="Mis datos">
      <form suppressHydrationWarning onSubmit={guardar} className="space-y-4">
        {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
        <Campo label="Nombre completo" name="nombre" required minLength={2} maxLength={100} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
        <Campo label="Correo electrónico" name="email" value={user.email} disabled ayuda="Para cambiar el correo, escríbenos." />
        <Campo label="Teléfono" name="telefono" type="tel" maxLength={30} value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} />
        <Campo
          label="Cédula"
          name="cedula"
          inputMode="numeric"
          maxLength={15}
          value={f.cedula}
          disabled={cedulaBloqueada}
          onChange={(e) => setF({ ...f, cedula: e.target.value })}
          ayuda={cedulaBloqueada ? "Tu identidad ya fue verificada: la cédula no se puede cambiar." : undefined}
        />
        <Boton type="submit" cargando={enviando}>
          <Save size={16} /> Guardar cambios
        </Boton>
      </form>
    </Tarjeta>
  );
}
