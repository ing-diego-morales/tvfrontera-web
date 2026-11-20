// src/components/cuenta/SolicitudAliado.tsx — un CLIENTE pide ser Punto Aliado (POST /api/socios/solicitud)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { AreaTexto, Aviso, Boton, Campo, Tarjeta } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";
import SelectorCategoria from "@/components/SelectorCategoria";
import CamposContacto, { CONTACTO_VACIO, contactoParaApi } from "@/components/aliados/CamposContacto";

export default function SolicitudAliado() {
  const { refrescar } = useAuth();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ nombre_negocio: "", ciudad: "Cúcuta", categoria: "", descripcion: "" });
  const [contacto, setContacto] = useState(CONTACTO_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [e.target.name]: e.target.value });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await api("/api/socios/solicitud", {
        method: "POST",
        json: {
          nombre_negocio: f.nombre_negocio.trim(),
          ciudad: f.ciudad.trim(),
          categoria: f.categoria || undefined,
          descripcion: f.descripcion.trim() || undefined,
          ...contactoParaApi(contacto),
        },
      });
      await refrescar(); // ahora el rol es SOCIO
      router.push("/panel");
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  if (!abierto) {
    return (
      <div className="bg-indigo text-white rounded-xl shadow-md p-6">
        <Store size={28} className="text-amarillo mb-3" />
        <h2 className="font-bold text-lg">¿Tienes un negocio?</h2>
        <p className="text-sm text-gray-300 mt-1 mb-4">Conviértete en Punto Aliado y vende tus productos a la comunidad de Televentas Fest.</p>
        <Boton onClick={() => setAbierto(true)} variante="amarillo">
          Quiero ser Punto Aliado
        </Boton>
      </div>
    );
  }

  return (
    <Tarjeta titulo="Solicitud de Punto Aliado">
      <form suppressHydrationWarning onSubmit={enviar} className="space-y-4">
        {error && <Aviso>{error}</Aviso>}
        <Campo label="Nombre del negocio" name="nombre_negocio" required minLength={2} maxLength={150} value={f.nombre_negocio} onChange={cambiar} />
        <Campo label="Ciudad" name="ciudad" required maxLength={100} value={f.ciudad} onChange={cambiar} />
        <SelectorCategoria valor={f.categoria} onChange={cambiar} />
        <CamposContacto valores={contacto} onChange={(e) => setContacto({ ...contacto, [e.target.name]: e.target.value })} />
        <AreaTexto label="Descripción" name="descripcion" rows={3} maxLength={2000} value={f.descripcion} onChange={cambiar} />
        <div className="flex gap-2">
          <Boton type="submit" cargando={enviando}>
            Enviar solicitud
          </Boton>
          <Boton type="button" variante="texto" onClick={() => setAbierto(false)}>
            Cancelar
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
