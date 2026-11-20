// src/components/admin/NoticiaForm.tsx — crear / editar noticia
// Seguridad: el contenido es TEXTO PLANO (se muestra con saltos de línea); ningún HTML/script se ejecuta en el sitio.
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, Save } from "lucide-react";
import { AreaTexto, Aviso, Boton, Campo, Cargando, Selector, Tarjeta } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";
import { categories } from "@/lib/categories";
import { esOptimizable, imagenSegura } from "@/lib/images";
import { videoEmbed, type Noticia } from "@/lib/news";
import { useApi } from "@/lib/useApi";

type Datos = {
  titulo: string;
  resumen: string;
  contenido: string;
  categoria: string;
  imagen_url: string;
  video_url: string;
  destacada: boolean;
  estado: "BORRADOR" | "PUBLICADA";
};

const VACIA: Datos = { titulo: "", resumen: "", contenido: "", categoria: "local", imagen_url: "", video_url: "", destacada: false, estado: "BORRADOR" };

const aDatos = (n: Noticia): Datos => ({
  titulo: n.titulo,
  resumen: n.resumen ?? "",
  contenido: n.contenido ?? "",
  categoria: n.categoria,
  imagen_url: n.imagen_url ?? "",
  video_url: n.video_url ?? "",
  destacada: !!n.destacada,
  estado: n.estado,
});

export default function NoticiaForm({ id, onCerrar }: { id: number | null; onCerrar: (guardado: boolean) => void }) {
  const existente = useApi<{ noticia: Noticia }>(id ? `/api/noticias/admin/${id}` : null);
  if (id && existente.cargando) return <Cargando />;
  if (id && !existente.data) return <Aviso>{existente.error ?? "No se pudo cargar la noticia"}</Aviso>;
  return <Formulario id={id} inicial={existente.data ? aDatos(existente.data.noticia) : VACIA} onCerrar={onCerrar} />;
}

function Formulario({ id, inicial, onCerrar }: { id: number | null; inicial: Datos; onCerrar: (guardado: boolean) => void }) {
  const [f, setF] = useState<Datos>(inicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [e.target.name]: e.target.value });

  const guardar = async (estado: Datos["estado"]) => {
    setError("");
    if (f.titulo.trim().length < 5) return setError("El título debe tener al menos 5 caracteres.");
    if (f.video_url.trim() && !videoEmbed(f.video_url.trim())) return setError("El video debe ser un enlace de YouTube o Vimeo.");
    setEnviando(true);
    try {
      const json = {
        titulo: f.titulo.trim(),
        resumen: f.resumen.trim() || null,
        contenido: f.contenido.trim() || null,
        categoria: f.categoria,
        imagen_url: f.imagen_url.trim(),
        video_url: f.video_url.trim(),
        destacada: f.destacada,
        estado,
      };
      if (id) await api(`/api/noticias/${id}`, { method: "PUT", json });
      else await api("/api/noticias", { method: "POST", json });
      onCerrar(true);
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  };

  const img = f.imagen_url.trim() ? imagenSegura(f.imagen_url.trim(), "") : "";
  const video = videoEmbed(f.video_url.trim());

  return (
    <div className="space-y-4">
      <button onClick={() => onCerrar(false)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo">
        <ChevronLeft size={16} /> Volver a noticias
      </button>
      <Tarjeta titulo={id ? "Editar noticia" : "Nueva noticia"}>
        <form suppressHydrationWarning
          onSubmit={(e) => {
            e.preventDefault();
            guardar(f.estado);
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-4">
            {error && <Aviso>{error}</Aviso>}
            <Campo label="Título" name="titulo" required minLength={5} maxLength={200} value={f.titulo} onChange={cambiar} />
            <AreaTexto label="Resumen (aparece en las tarjetas y en Google)" name="resumen" rows={2} maxLength={400} value={f.resumen} onChange={cambiar} />
            <AreaTexto label="Contenido" name="contenido" rows={14} value={f.contenido} onChange={cambiar} placeholder="Escribe la noticia. Deja una línea en blanco entre párrafos." />
          </div>

          <div className="space-y-4">
            <Selector label="Categoría" name="categoria" value={f.categoria} onChange={cambiar}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </Selector>
            <Campo label="URL de la imagen" name="imagen_url" type="url" maxLength={500} placeholder="https://..." value={f.imagen_url} onChange={cambiar} />
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {img ? (
                <Image src={img} alt="Vista previa" fill sizes="400px" unoptimized={!esOptimizable(img)} className="object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Sin imagen</span>
              )}
            </div>
            <Campo
              label="Video (YouTube o Vimeo)"
              name="video_url"
              type="url"
              maxLength={500}
              placeholder="https://youtube.com/watch?v=..."
              value={f.video_url}
              onChange={cambiar}
              ayuda={f.video_url.trim() ? (video ? "✓ Video válido" : "Enlace no reconocido") : undefined}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input suppressHydrationWarning type="checkbox" checked={f.destacada} onChange={(e) => setF({ ...f, destacada: e.target.checked })} className="accent-naranja" />
              Noticia destacada
            </label>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <Boton type="button" className="w-full" cargando={enviando} onClick={() => guardar("PUBLICADA")}>
                <Save size={16} /> {inicial.estado === "PUBLICADA" ? "Guardar y mantener publicada" : "Publicar"}
              </Boton>
              <Boton type="button" variante="borde" className="w-full" disabled={enviando} onClick={() => guardar("BORRADOR")}>
                {inicial.estado === "PUBLICADA" ? "Pasar a borrador" : "Guardar borrador"}
              </Boton>
              <p className="text-xs text-gray-400">Los cambios se ven en el sitio en menos de un minuto.</p>
            </div>
          </div>
        </form>
      </Tarjeta>
    </div>
  );
}
