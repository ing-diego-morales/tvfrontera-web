// src/components/AuthProvider.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

// Seguridad: la sesión vive en una cookie httpOnly que pone la API.
// Este archivo NUNCA ve ni guarda el token: solo pregunta "¿quién soy?" a /api/auth/me.

export type Rol = "ADMIN" | "SOCIO" | "CLIENTE";
export type Verificacion = "NO_VERIFICADO" | "PENDIENTE" | "VERIFICADO" | "RECHAZADO";

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  email_verificado: string | null; // null = aún no confirma el correo
  codigo_ref: string | null; // código para invitar (programa de referidos)
  telefono: string | null;
  cedula: string | null;
  rol: Rol;
  verificacion: Verificacion;
  created_at: string;
};

export type SocioResumen = {
  id: number;
  slug: string;
  nombre_negocio: string;
  estado: "PENDIENTE" | "APROBADO" | "SUSPENDIDO";
  plan: "BASICO" | "PREMIUM";
  pagado_hasta: string | null;
  vigente: boolean;
};

type Sesion = { user: Usuario | null; socio: SocioResumen | null };

export type RegistroDatos = {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  cedula?: string;
  rol: "CLIENTE" | "SOCIO";
  ref?: string; // código de quien lo invitó
  // anti-robots (ver AntiBot.tsx)
  sitio_web?: string;
  t_formulario?: number;
  cf_turnstile?: string;
  negocio?: {
    nombre: string;
    ciudad: string;
    whatsapp: string;
    direccion: string;
    categoria?: string;
    descripcion?: string;
    telefono?: string | null;
    horario?: string | null;
    instagram?: string | null;
    facebook?: string | null;
  };
};

type AuthContextValue = Sesion & {
  cargando: boolean;
  login: (email: string, password: string) => Promise<Sesion>;
  registro: (datos: RegistroDatos) => Promise<Sesion>;
  logout: () => Promise<void>;
  refrescar: () => Promise<void>;
};

const SIN_SESION: Sesion = { user: null, socio: null };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>(SIN_SESION);
  const [cargando, setCargando] = useState(true);

  // /api/auth/me nunca responde 401: devuelve { user: null } si no hay sesión
  const refrescar = useCallback(async () => {
    try {
      setSesion(await api<Sesion>("/api/auth/me", { cache: "no-store" }));
    } catch {
      setSesion(SIN_SESION); // API apagada: el sitio sigue funcionando como anónimo
    } finally {
      setCargando(false);
    }
  }, []);

  // Primera carga: el estado se actualiza cuando llega la respuesta (no bloquea el render)
  useEffect(() => {
    let vivo = true;
    api<Sesion>("/api/auth/me", { cache: "no-store" })
      .then((s) => vivo && setSesion(s))
      .catch(() => vivo && setSesion(SIN_SESION))
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, []);

  // "En línea": latido cada 2 min solo mientras la pestaña está visible (no consume nada en segundo plano)
  const conSesion = Boolean(sesion.user);
  useEffect(() => {
    if (!conSesion) return;
    const latido = () => {
      if (document.visibilityState === "visible") api("/api/auth/ping", { method: "POST" }).catch(() => {});
    };
    const id = window.setInterval(latido, 120_000);
    document.addEventListener("visibilitychange", latido);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", latido);
    };
  }, [conSesion]);

  const login = useCallback(async (email: string, password: string) => {
    const s = await api<Sesion>("/api/auth/login", { method: "POST", json: { email, password } });
    setSesion(s);
    return s;
  }, []);

  const registro = useCallback(async (datos: RegistroDatos) => {
    const s = await api<Sesion>("/api/auth/registro", { method: "POST", json: datos });
    setSesion(s);
    return s;
  }, []);

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setSesion(SIN_SESION);
  }, []);

  // Rendimiento: el valor solo cambia cuando cambia la sesión, así no re-renderiza todo el sitio
  const value = useMemo(
    () => ({ ...sesion, cargando, login, registro, logout, refrescar }),
    [sesion, cargando, login, registro, logout, refrescar]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
