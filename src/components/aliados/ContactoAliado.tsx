// src/components/aliados/ContactoAliado.tsx — bloque de contacto de la tienda
// Seguridad: el WhatsApp, el teléfono y la dirección NO vienen en el HTML público (ni en la caché).
// Solo se piden a la API desde el navegador cuando hay sesión; la API los niega a anónimos.
"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { contactoDe, type AliadoPublico, type ContactoAliado as Contacto, type TiendaAliado } from "@/lib/aliados";
import AccesosRapidos from "./AccesosRapidos";

export default function ContactoAliado({ aliado }: { aliado: AliadoPublico }) {
  const { user, cargando } = useAuth();
  const [contacto, setContacto] = useState<Contacto | null | undefined>(contactoDe(aliado) ?? undefined);

  useEffect(() => {
    if (!user) return;
    let vivo = true;
    api<TiendaAliado>(`/api/socios/${encodeURIComponent(aliado.slug)}`)
      .then((d) => vivo && setContacto(contactoDe(d.socio)))
      .catch(() => vivo && setContacto(null));
    return () => {
      vivo = false;
    };
  }, [user, aliado.slug]);

  const esperando = cargando || (user && contacto === undefined);
  const datos = user ? (contacto ?? null) : contactoDe(aliado);

  return (
    <div className="space-y-4">
      {esperando ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <AccesosRapidos aliado={aliado} contacto={datos} volverA={`/puntos-aliados/${aliado.slug}`} variante="tienda" />
      )}

      <ul className="space-y-2 text-sm text-gray-600">
        {datos?.direccion && (
          <li className="flex items-start gap-2">
            <MapPin size={16} className="text-naranja mt-0.5 shrink-0" /> {datos.direccion}, {aliado.ciudad}
          </li>
        )}
        {aliado.horario && (
          <li className="flex items-start gap-2">
            <Clock size={16} className="text-naranja mt-0.5 shrink-0" /> {aliado.horario}
          </li>
        )}
      </ul>
    </div>
  );
}
