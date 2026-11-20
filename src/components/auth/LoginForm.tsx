// src/components/auth/LoginForm.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Aviso, Boton, Campo } from "@/components/ui";
import { mensajeError } from "@/lib/api";
import { rutaSegura } from "@/lib/format";
import { inicioPorRol } from "@/lib/rutas";

export default function LoginForm({ next, aviso }: { next?: string; aviso?: string }) {
  const { user, cargando, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Si ya tiene sesión, no tiene sentido mostrar el login
  useEffect(() => {
    if (!cargando && user) router.replace(rutaSegura(next, inicioPorRol(user.rol)));
  }, [cargando, user, next, router]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const { user: u } = await login(email.trim(), password);
      if (u) router.replace(rutaSegura(next, inicioPorRol(u.rol)));
    } catch (err) {
      setError(mensajeError(err));
      setPassword("");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form suppressHydrationWarning onSubmit={enviar} className="space-y-4">
      {aviso && !error && <Aviso tipo="ok">{aviso}</Aviso>}
      {error && <Aviso>{error}</Aviso>}
      <Campo
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
      />
      <div className="relative">
        <Campo
          label="Contraseña"
          name="password"
          type={ver ? "text" : "password"}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
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

      <div className="flex justify-end -mt-1">
        <Link href={email ? `/recuperar?email=${encodeURIComponent(email.trim())}` : "/recuperar"} className="text-sm font-semibold text-indigo hover:text-naranja hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Boton type="submit" cargando={enviando} className="w-full py-3">
        <LogIn size={18} /> Iniciar sesión
      </Boton>

      <p className="text-center text-sm text-gray-500">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-bold text-naranja hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
