// src/components/MobileMenu.tsx — menú en celulares y tabletas (mismo contenido que el Header)
"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { useAuth } from "./AuthProvider";
import { enlacesUsuario } from "./UserMenu";
import { MENU, esActivo } from "@/lib/menu";
import { SITIO } from "@/lib/sitio";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [abierto, setAbierto] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const closeAll = () => {
    setOpen(false);
    setAbierto(null);
  };

  // Con el menú abierto la página de fondo no se desplaza; Escape lo cierra
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const salir = async () => {
    closeAll();
    await logout();
    router.push("/");
    router.refresh();
  };

  const redes = [
    { href: SITIO.redes.facebook, icon: FaFacebook, label: "Facebook" },
    { href: SITIO.redes.instagram, icon: FaInstagram, label: "Instagram" },
    { href: SITIO.redes.tiktok, icon: FaTiktok, label: "TikTok" },
    { href: `https://wa.me/${SITIO.whatsapp}`, icon: FaWhatsapp, label: "WhatsApp" },
  ];

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open} className="p-2 rounded-full hover:bg-white/10">
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-60 bg-indigo text-white flex flex-col overflow-y-auto" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="flex items-center justify-between px-4 h-18 border-b border-white/10 shrink-0">
            <Link href="/" onClick={closeAll} className="flex items-center gap-2">
              <Logo alto={34} />
            </Link>
            <button onClick={closeAll} aria-label="Cerrar menú" className="p-2 rounded-full hover:bg-white/10">
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col px-4 py-2 text-lg flex-1" aria-label="Principal">
            {MENU.map((item) =>
              item.hijos ? (
                <div key={item.href} className="border-b border-white/10">
                  <button
                    onClick={() => setAbierto(abierto === item.href ? null : item.href)}
                    aria-expanded={abierto === item.href}
                    className={`flex w-full items-center justify-between py-4 font-medium ${esActivo(item.href, pathname) ? "text-amarillo" : ""}`}
                  >
                    {item.label}
                    <ChevronDown className={`transition-transform ${abierto === item.href ? "rotate-180" : ""}`} size={18} />
                  </button>
                  {abierto === item.href && (
                    <div className="pb-3 pl-3 flex flex-col text-base text-gray-300 border-l-2 border-naranja ml-1">
                      {item.hijos.map((h) => (
                        <Link key={h.href} href={h.href} onClick={closeAll} className={`py-2 hover:text-white ${h.destacado ? "text-white font-bold" : ""}`}>
                          {h.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeAll}
                  className={`py-4 border-b border-white/10 font-medium ${esActivo(item.href, pathname) ? "text-amarillo" : ""}`}
                >
                  {item.label}
                </Link>
              )
            )}

            {user ? (
              <div className="flex flex-col gap-1 mt-6 bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-300 mb-2">
                  Hola, <span className="font-bold text-white">{user.nombre.split(" ")[0]}</span>
                </p>
                {enlacesUsuario(user).map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} onClick={closeAll} className="flex items-center gap-3 py-2.5 text-base">
                    <Icon size={18} className="text-amarillo" /> {label}
                  </Link>
                ))}
                <button onClick={salir} className="flex items-center gap-3 py-2.5 text-base text-amarillo font-bold">
                  <LogOut size={18} /> Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Link href="/login" onClick={closeAll} className="text-center py-3 border border-white/30 rounded-full text-base font-medium">
                  Iniciar sesión
                </Link>
                <Link href="/registro" onClick={closeAll} className="text-center py-3 bg-naranja rounded-full font-bold text-base">
                  Regístrate
                </Link>
              </div>
            )}
          </nav>

          <div className="px-4 py-6 border-t border-white/10 flex items-center justify-between shrink-0">
            <span className="text-xs text-gray-400">Síguenos</span>
            <div className="flex gap-2">
              {redes.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-naranja transition-colors">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
