// src/components/panel/RequireAuth.tsx
// Comodidad, no seguridad: redirige al login si no hay sesión y oculta paneles de otros roles.
// La protección real está en la API (401/403 en cada endpoint), así que nada privado se filtra aunque alguien manipule el navegador.
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth, type Rol } from "@/components/AuthProvider";
import { Cargando } from "@/components/ui";
import { inicioPorRol } from "@/lib/rutas";

export default function RequireAuth({ roles, children }: { roles?: Rol[]; children: React.ReactNode }) {
  const { user, cargando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!cargando && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [cargando, user, pathname, router]);

  if (cargando || !user) return <Cargando texto="Verificando tu sesión..." />;

  if (roles && !roles.includes(user.rol)) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md">
          <ShieldAlert size={48} className="mx-auto text-naranja mb-4" />
          <h1 className="text-2xl font-bold text-indigo">No tienes acceso a esta sección</h1>
          <p className="text-gray-500 mt-2">Tu cuenta no tiene permisos para ver esta página.</p>
          <Link
            href={inicioPorRol(user.rol)}
            className="inline-block mt-6 bg-naranja hover:bg-naranja-oscuro text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            Ir a mi panel
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
