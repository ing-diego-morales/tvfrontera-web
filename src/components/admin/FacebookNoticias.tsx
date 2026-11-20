// src/components/admin/FacebookNoticias.tsx — estado de la importación automática desde Facebook
"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { Aviso, Boton, Selector } from "@/components/ui";
import { Interruptor } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { categories } from "@/lib/categories";
import { timeAgo } from "@/lib/date-utils";
import { useApi } from "@/lib/useApi";

type Estado = { configurado: boolean; ultima: string | null; error: string | null; total: number; ajustes: { facebook_publicar?: string; facebook_categoria?: string } };

export default function FacebookNoticias({ alImportar }: { alImportar: () => void }) {
  const { data, recargar } = useApi<Estado>("/api/noticias/admin/facebook");
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  if (!data) return null;

  const sincronizar = async () => {
    setMsg(null);
    setSincronizando(true);
    try {
      const r = await api<{ nuevas: number }>("/api/noticias/admin/facebook/sincronizar", { method: "POST" });
      setMsg({ tipo: "ok", texto: r.nuevas ? `Se importaron ${r.nuevas} publicaciones nuevas.` : "No hay publicaciones nuevas." });
      recargar();
      alImportar();
    } catch (e) {
      setMsg({ tipo: "error", texto: mensajeError(e) });
    } finally {
      setSincronizando(false);
    }
  };
  const ajustar = async (json: object) => {
    await api("/api/noticias/admin/facebook/ajustes", { method: "PUT", json });
    recargar();
  };
  const publicar = data.ajustes.facebook_publicar === "1";

  return (
    <div className="bg-white rounded-xl shadow-md p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-bold text-indigo">
          <FaFacebook className="text-[#1877F2]" size={20} /> Noticias desde Facebook
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${data.configurado ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
            {data.configurado ? "Conectado" : "Sin conectar"}
          </span>
        </p>
        {data.configurado && (
          <Boton variante="borde" className="text-sm" cargando={sincronizando} onClick={sincronizar}>
            <RefreshCw size={14} /> Importar ahora
          </Boton>
        )}
      </div>
      {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
      {data.configurado ? (
        <>
          <p className="text-sm text-gray-500">
            Revisa la página automáticamente. {data.total} publicaciones importadas en total
            {data.ultima && ` · última revisión ${timeAgo(data.ultima).toLowerCase()}`}.
          </p>
          {data.error && <Aviso>Último error de Facebook: {data.error}</Aviso>}
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-48">
              <Selector label="Categoría de las importadas" name="fb_cat" value={data.ajustes.facebook_categoria ?? "local"} onChange={(e) => ajustar({ categoria: e.target.value })}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </Selector>
            </div>
            <div className="pb-1">
              <Interruptor activo={publicar} etiqueta="Publicar automáticamente" onClick={() => ajustar({ publicar: !publicar })} />
              <p className="text-xs text-gray-500 mt-1">{publicar ? "Se publican solas al llegar." : "Llegan como borrador para que las revises."}</p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">
          Las publicaciones de la página ya se ven en vivo en la portada (sección &quot;Desde Facebook&quot;). Para que además se conviertan en noticias del sitio, agrega
          <code className="mx-1 bg-gray-100 px-1 rounded">FB_PAGE_ID</code>y<code className="mx-1 bg-gray-100 px-1 rounded">FB_PAGE_TOKEN</code>en el .env de la API (pasos en el README).
        </p>
      )}
    </div>
  );
}
