// src/components/UserMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Shield, Store, User } from "lucide-react";
import { useAuth, type Usuario } from "./AuthProvider";

/** Enlaces según el rol. Solo es navegación: la API protege cada ruta. */
export function enlacesUsuario(user: Usuario) {
  const enlaces = [{ href: "/cuenta", label: "Mi cuenta", icon: User }];
  if (user.rol === "SOCIO") enlaces.push({ href: "/panel", label: "Mi Punto Aliado", icon: Store });
  if (user.rol === "ADMIN") enlaces.push({ href: "/admin", label: "Administración", icon: Shield });
  return enlaces;
}

export default function UserMenu() {
  const { user, cargando, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra al hacer clic fuera o con Escape
  useEffect(() => {
    if (!open) return;
    const fuera = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  // Mientras carga reserva el espacio: el header no "salta"
  if (cargando) return <div className="w-24 sm:w-44 h-9" aria-hidden />;

  if (!user) {
    return (
      <>
        <Link href="/login" className="flex items-center gap-1.5 text-sm font-semibold hover:text-amarillo transition-colors" aria-label="Inicia sesión">
          <User size={20} />
          <span className="hidden sm:inline">Inicia sesión</span>
        </Link>
        <Link
          href="/registro"
          className="hidden sm:inline-block bg-indigo hover:bg-indigo-oscuro text-white text-sm font-bold px-4 py-2 rounded-full shadow-sm transition-colors"
        >
          Regístrate
        </Link>
      </>
    );
  }

  const salir = async () => {
    setOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menú de usuario"
        className="flex items-center gap-2 hover:text-amarillo transition-colors"
      >
        <span className="w-9 h-9 rounded-full bg-white text-naranja font-extrabold flex items-center justify-center shadow-sm ring-2 ring-amarillo">
          {user.nombre.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-medium hidden sm:block max-w-28 truncate">{user.nombre.split(" ")[0]}</span>
        <ChevronDown size={14} className={`hidden sm:block transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 bg-white text-indigo rounded-md shadow-lg py-2 w-60 z-50">
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-sm font-bold truncate">{user.nombre}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          {enlacesUsuario(user).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          <button
            role="menuitem"
            onClick={salir}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-naranja hover:bg-gray-100"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
