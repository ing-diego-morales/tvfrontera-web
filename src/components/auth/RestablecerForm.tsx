// src/components/auth/RestablecerForm.tsx — crea la nueva contraseña con el enlace del correo
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Aviso, Boton, Campo } from "@/components/ui";
import { ApiError, api, mensajeError } from "@/lib/api";

/** Fortaleza orientativa (la regla real es mínimo 8 caracteres, validada en la API) */
function fortaleza(p: string) {
  let n = 0;
  if (p.length >= 8) n++;
  if (p.length >= 12) n++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) n++;
  if (/\d/.test(p)) n++;
  if (/[^A-Za-z0-9]/.test(p)) n++;
  return [
    { label: "Muy débil", clase: "bg-red-500", ancho: "w-1/5" },
    { label: "Débil", clase: "bg-red-500", ancho: "w-2/5" },
    { label: "Aceptable", clase: "bg-yellow-500", ancho: "w-3/5" },
    { label: "Buena", clase: "bg-green-500", ancho: "w-4/5" },
    { label: "Excelente", clase: "bg-green-600", ancho: "w-full" },
  ][Math.max(0, n - 1)];
}

export default function RestablecerForm({ token }: { token: string }) {
  const router = useRouter();
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [vencido, setVencido] = useState(false);

  if (!token) {
    return (
      <div className="space-y-5">
        <Aviso>Este enlace no es válido. Pide uno nuevo para restablecer tu contraseña.</Aviso>
        <Link href="/recuperar" className="inline-block font-bold text-naranja hover:underline">
          Solicitar un enlace nuevo →
        </Link>
      </div>
    );
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (nueva.length < 8) return setError("La contraseña debe tener mínimo 8 caracteres.");
    if (nueva !== confirmar) return setError("Las contraseñas no coinciden.");
    setEnviando(true);
    try {
      await api("/api/auth/restablecer", { method: "POST", json: { token, nueva } });
      router.replace("/login?restablecida=1");
    } catch (err) {
      setError(mensajeError(err));
      setVencido(err instanceof ApiError && err.code === "TOKEN_INVALIDO");
      setEnviando(false);
    }
  };

  const f = nueva ? fortaleza(nueva) : null;

  return (
    <form suppressHydrationWarning onSubmit={enviar} className="space-y-5">
      {error && (
        <Aviso>
          {error}{" "}
          {vencido && (
            <Link href="/recuperar" className="font-bold underline">
              Pedir un enlace nuevo
            </Link>
          )}
        </Aviso>
      )}
      <div>
        <div className="relative">
          <Campo
            label="Nueva contraseña"
            name="nueva"
            type={ver ? "text" : "password"}
            autoComplete="new-password"
            required
            autoFocus
            minLength={8}
            maxLength={72}
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setVer(!ver)}
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-8.5 text-gray-400 hover:text-indigo"
          >
            {ver ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {f && (
          <div className="mt-2" aria-live="polite">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${f.clase} ${f.ancho} transition-all`} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Seguridad: {f.label}</p>
          </div>
        )}
      </div>
      <Campo
        label="Confirmar contraseña"
        name="confirmar"
        type={ver ? "text" : "password"}
        autoComplete="new-password"
        required
        maxLength={72}
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
      />
      <p className="text-xs text-gray-500">Mínimo 8 caracteres. Al cambiarla cerraremos tu sesión en todos los equipos.</p>
      <Boton type="submit" cargando={enviando} className="w-full py-3">
        <KeyRound size={18} /> Guardar nueva contraseña
      </Boton>
    </form>
  );
}
