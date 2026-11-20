// src/components/aliados/GrillaAliados.tsx
// El HTML público (en caché) llega SIN teléfonos. Si el visitante tiene sesión, se hace UNA sola
// petición con su cookie para traer el contacto de todos los aliados de la página.
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { contactoDe, type AliadoPublico, type ContactoAliado, type ListaAliados } from "@/lib/aliados";
import AliadoCard from "./AliadoCard";

export default function GrillaAliados({ socios, consulta }: { socios: AliadoPublico[]; consulta: string }) {
  const { user } = useAuth();
  const [contactos, setContactos] = useState<Record<number, ContactoAliado | null>>({});

  useEffect(() => {
    if (!user) return;
    let vivo = true;
    api<ListaAliados>(`/api/socios?${consulta}`)
      .then((d) => vivo && setContactos(Object.fromEntries(d.socios.map((s) => [s.id, contactoDe(s)]))))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [user, consulta]);

  return (
    <div data-revelar-hijos="" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-7">
      {socios.map((s) => (
        <AliadoCard key={s.id} aliado={s} contacto={user ? (contactos[s.id] ?? contactoDe(s)) : contactoDe(s)} />
      ))}
    </div>
  );
}
