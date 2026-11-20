// src/components/aliado/MiNegocio.tsx — PUT /api/socios/me
"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { AreaTexto, Aviso, Boton, Campo, Tarjeta } from "@/components/ui";
import Imagen from "@/components/Imagen";
import CamposContacto, { contactoParaApi, type DatosContacto } from "@/components/aliados/CamposContacto";
import AccesosRapidos from "@/components/aliados/AccesosRapidos";
import { api, mensajeError } from "@/lib/api";
import SelectorCategoria from "@/components/SelectorCategoria";
import type { PerfilAliado } from "./tipos";

export default function MiNegocio({ perfil, vigente, onGuardado }: { perfil: PerfilAliado; vigente: boolean; onGuardado: () => void }) {
  const [f, setF] = useState({
    nombre_negocio: perfil.nombre_negocio,
    categoria: perfil.categoria ?? "",
    ciudad: perfil.ciudad,
    logo_url: perfil.logo_url ?? "",
    descripcion: perfil.descripcion ?? "",
  });
  const [contacto, setContacto] = useState<DatosContacto>({
    whatsapp: perfil.whatsapp ?? "",
    direccion: perfil.direccion ?? "",
    telefono: perfil.telefono ?? "",
    horario: perfil.horario ?? "",
    instagram: perfil.instagram ?? "",
    facebook: perfil.facebook ?? "",
  });
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cambiar = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [e.target.name]: e.target.value });
  const faltaContacto = !perfil.whatsapp || !perfil.direccion;

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setEnviando(true);
    try {
      await api("/api/socios/me", {
        method: "PUT",
        json: {
          nombre_negocio: f.nombre_negocio.trim(),
          categoria: f.categoria || null,
          ciudad: f.ciudad.trim(),
          logo_url: f.logo_url.trim(),
          descripcion: f.descripcion.trim() || null,
          ...contactoParaApi(contacto),
        },
      });
      setMsg({ tipo: "ok", texto: "Los datos de tu negocio se guardaron. La tienda pública se actualiza en menos de un minuto." });
      onGuardado();
    } catch (err) {
      setMsg({ tipo: "error", texto: mensajeError(err) });
    } finally {
      setEnviando(false);
    }
  };

  // Vista previa de los botones tal como los verá un cliente con sesión
  const vista = contactoParaApi(contacto);

  return (
    <Tarjeta titulo="Datos de mi negocio">
      <form suppressHydrationWarning onSubmit={guardar} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <fieldset disabled={!vigente} className="lg:col-span-2 space-y-4">
          {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
          {!vigente && <Aviso tipo="alerta">Podrás editar estos datos cuando tu membresía esté activa.</Aviso>}
          {vigente && faltaContacto && <Aviso tipo="alerta">Completa tu WhatsApp y dirección: son obligatorios para que los clientes te contacten.</Aviso>}
          <Campo label="Nombre del negocio" name="nombre_negocio" required minLength={2} maxLength={150} value={f.nombre_negocio} onChange={cambiar} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectorCategoria valor={f.categoria} onChange={cambiar} />
            <Campo label="Ciudad" name="ciudad" required minLength={2} maxLength={100} value={f.ciudad} onChange={cambiar} />
          </div>
          <AreaTexto label="Descripción" name="descripcion" rows={4} maxLength={2000} value={f.descripcion} onChange={cambiar} />
          <Campo label="URL del logo" name="logo_url" type="url" maxLength={500} placeholder="https://..." value={f.logo_url} onChange={cambiar} />

          <p className="font-bold text-indigo pt-4 border-t border-gray-100">Contacto para tus clientes</p>
          <CamposContacto valores={contacto} onChange={(e) => setContacto({ ...contacto, [e.target.name]: e.target.value })} />

          <Boton type="submit" cargando={enviando}>
            <Save size={16} /> Guardar cambios
          </Boton>
        </fieldset>

        <aside className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Así te ven los clientes</p>
          <div className="rounded-2xl ring-1 ring-black/5 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden img-ph shrink-0">
                <Imagen src={f.logo_url.trim()} alt="Logo" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-indigo truncate">{f.nombre_negocio || "Tu negocio"}</p>
                <p className="text-xs text-naranja font-bold">{f.categoria || "Categoría"}</p>
              </div>
            </div>
            <AccesosRapidos
              aliado={{ ...perfil, ...f, categoria: f.categoria || null, descripcion: null, logo_url: null, destacado: false, verificado: false, en_linea: true, horario: vista.horario, instagram: vista.instagram, facebook: vista.facebook }}
              contacto={vista.whatsapp || vista.direccion ? { whatsapp: vista.whatsapp || null, telefono: vista.telefono, direccion: vista.direccion || null } : null}
              volverA={`/puntos-aliados/${perfil.slug}`}
            />
          </div>
          <p className="text-xs text-gray-400">
            Tu tienda: <span className="font-mono break-all">/puntos-aliados/{perfil.slug}</span>
          </p>
        </aside>
      </form>
    </Tarjeta>
  );
}
