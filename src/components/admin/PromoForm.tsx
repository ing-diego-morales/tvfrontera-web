// src/components/admin/PromoForm.tsx — crear / editar un bloque promocional (sorteo, campaña, banner)
// con VISTA PREVIA en vivo de cómo se verá en la portada.
"use client";

import { useState } from "react";
import { ChevronLeft, Save } from "lucide-react";
import { AreaTexto, Aviso, Boton, Campo, Tarjeta } from "@/components/ui";
import BloquePromo from "@/components/inicio/BloquePromo";
import { api, mensajeError } from "@/lib/api";
import type { DatosPromo, EstiloPromo, Seccion } from "@/lib/secciones";

const ESTILOS: { v: EstiloPromo; label: string; muestra: string }[] = [
  { v: "naranja", label: "Naranja", muestra: "fondo-marca" },
  { v: "indigo", label: "Índigo", muestra: "bg-indigo" },
  { v: "amarillo", label: "Amarillo", muestra: "bg-amarillo" },
  { v: "claro", label: "Blanco", muestra: "bg-white ring-1 ring-gray-300" },
];

const aLocal = (v: string | null | undefined) => (v ? v.slice(0, 16).replace(" ", "T") : "");

export default function PromoForm({ seccion, onCerrar }: { seccion: Seccion | null; onCerrar: (guardado: boolean) => void }) {
  const d = seccion?.datos;
  const [titulo, setTitulo] = useState(seccion?.titulo ?? "");
  const [f, setF] = useState({
    etiqueta: d?.etiqueta ?? "",
    subtitulo: d?.subtitulo ?? "",
    texto: d?.texto ?? "",
    imagen_url: d?.imagen_url ?? "",
    boton_texto: d?.boton_texto ?? "",
    boton_enlace: d?.boton_enlace ?? "",
    fecha_evento: aLocal(d?.fecha_evento),
    desde: aLocal(seccion?.desde),
    hasta: aLocal(seccion?.hasta),
  });
  const [estilo, setEstilo] = useState<EstiloPromo>(d?.estilo ?? "naranja");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [e.target.name]: e.target.value });

  const datos: DatosPromo = {
    etiqueta: f.etiqueta.trim() || null,
    subtitulo: f.subtitulo.trim() || null,
    texto: f.texto.trim() || null,
    imagen_url: f.imagen_url.trim() || null,
    boton_texto: f.boton_texto.trim() || null,
    boton_enlace: f.boton_enlace.trim() || null,
    estilo,
    fecha_evento: f.fecha_evento || null,
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!!datos.boton_texto !== !!datos.boton_enlace) return setError("El botón necesita texto y enlace (o deja ambos vacíos).");
    if (f.desde && f.hasta && f.desde > f.hasta) return setError("La fecha de fin debe ser posterior a la de inicio.");
    setEnviando(true);
    try {
      const json = { titulo: titulo.trim(), datos, desde: f.desde, hasta: f.hasta };
      if (seccion) await api(`/api/secciones/${seccion.id}`, { method: "PUT", json });
      else await api("/api/secciones", { method: "POST", json });
      onCerrar(true);
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={() => onCerrar(false)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo">
        <ChevronLeft size={16} /> Volver a las secciones
      </button>
      <Tarjeta titulo={seccion ? "Editar bloque promocional" : "Nuevo bloque promocional"}>
        <form suppressHydrationWarning onSubmit={guardar} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {error && <Aviso>{error}</Aviso>}
            <Campo label="Título" name="titulo" required minLength={3} maxLength={150} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Gran Sorteo Anual Televentas Fest" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Etiqueta (opcional)" name="etiqueta" maxLength={40} value={f.etiqueta} onChange={cambiar} placeholder="Sorteo anual" />
              <Campo label="Subtítulo (opcional)" name="subtitulo" maxLength={200} value={f.subtitulo} onChange={cambiar} />
            </div>
            <AreaTexto label="Texto (premios, requisitos, etc.)" name="texto" rows={5} maxLength={2000} value={f.texto} onChange={cambiar} />
            <Campo label="Imagen (opcional)" name="imagen_url" maxLength={500} value={f.imagen_url} onChange={cambiar} placeholder="https://... o /promos/gran-tienda-virtual.webp" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Texto del botón" name="boton_texto" maxLength={40} value={f.boton_texto} onChange={cambiar} placeholder="Quiero participar" />
              <Campo label="Enlace del botón" name="boton_enlace" maxLength={300} value={f.boton_enlace} onChange={cambiar} placeholder="/registro  o  https://..." />
            </div>
            <Campo
              label="Fecha del evento (cuenta regresiva)"
              name="fecha_evento"
              type="datetime-local"
              value={f.fecha_evento}
              onChange={cambiar}
              ayuda="Ej. el día del sorteo: aparece un contador de días, horas y minutos."
            />
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">Color del bloque</legend>
              <div className="flex flex-wrap gap-3">
                {ESTILOS.map((e) => (
                  <button
                    key={e.v}
                    type="button"
                    onClick={() => setEstilo(e.v)}
                    aria-pressed={estilo === e.v}
                    className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border-2 ${estilo === e.v ? "border-naranja" : "border-gray-200"}`}
                  >
                    <span className={`w-5 h-5 rounded-full ${e.muestra}`} /> {e.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Mostrar desde (opcional)" name="desde" type="datetime-local" value={f.desde} onChange={cambiar} />
              <Campo label="Mostrar hasta (opcional)" name="hasta" type="datetime-local" value={f.hasta} onChange={cambiar} />
            </div>
            <div className="flex gap-2 pt-2">
              <Boton type="submit" cargando={enviando}>
                <Save size={16} /> Guardar
              </Boton>
              <Boton type="button" variante="texto" onClick={() => onCerrar(false)}>
                Cancelar
              </Boton>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Vista previa</p>
            <div className="bg-gray-50 rounded-2xl ring-1 ring-black/5 -mx-4 sm:mx-0 [&_section]:px-2 [&_section]:py-2">
              <BloquePromo titulo={titulo || "Título del bloque"} datos={datos} />
            </div>
          </div>
        </form>
      </Tarjeta>
    </div>
  );
}
