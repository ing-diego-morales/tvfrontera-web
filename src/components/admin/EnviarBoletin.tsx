// src/components/admin/EnviarBoletin.tsx — armar y enviar el boletín (nada se envía solo: así no es spam)
"use client";

import { useState } from "react";
import { FlaskConical, Send } from "lucide-react";
import { AreaTexto, Aviso, Boton, Campo, Etiqueta, Tarjeta } from "@/components/ui";
import { BotonConfirmar } from "@/components/panel/PanelUI";
import { api, mensajeError } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import { useApi } from "@/lib/useApi";
import type { ListaNoticias } from "@/lib/news";

type Envio = { id: number; asunto: string; destinatarios: number; enviados: number; fallidos: number; estado: "ENVIANDO" | "TERMINADO"; created_at: string };

export default function EnviarBoletin({ activos }: { activos: number }) {
  const noticias = useApi<ListaNoticias>("/api/noticias/admin/todas?estado=PUBLICADA&limit=12");
  const envios = useApi<{ envios: Envio[] }>("/api/suscriptores/envios");
  const [asunto, setAsunto] = useState("Lo más importante de la semana en Televentas Fest");
  const [intro, setIntro] = useState("");
  const [elegidas, setElegidas] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [probando, setProbando] = useState(false);

  const alternar = (id: number) => setElegidas((x) => (x.includes(id) ? x.filter((i) => i !== id) : x.length >= 10 ? x : [...x, id]));
  const cuerpo = (prueba: boolean) => ({ asunto: asunto.trim(), intro: intro.trim() || undefined, noticia_ids: elegidas, prueba });

  const probar = async () => {
    setMsg(null);
    setProbando(true);
    try {
      const r = await api<{ mensaje: string }>("/api/suscriptores/enviar", { method: "POST", json: cuerpo(true) });
      setMsg({ tipo: "ok", texto: `${r.mensaje}. Revísalo antes de enviarlo a todos.` });
    } catch (e) {
      setMsg({ tipo: "error", texto: mensajeError(e) });
    } finally {
      setProbando(false);
    }
  };

  const enviar = async () => {
    setMsg(null);
    try {
      const r = await api<{ destinatarios: number }>("/api/suscriptores/enviar", { method: "POST", json: cuerpo(false) });
      setMsg({ tipo: "ok", texto: `Enviando a ${r.destinatarios} suscriptores. Puedes seguir trabajando; el progreso aparece abajo.` });
      envios.recargar();
    } catch (e) {
      setMsg({ tipo: "error", texto: mensajeError(e) });
    }
  };

  const listas = noticias.data?.noticias ?? [];
  const valido = asunto.trim().length >= 3 && (elegidas.length > 0 || intro.trim().length > 0);

  return (
    <Tarjeta titulo="Enviar boletín">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Los suscriptores reciben solo lo que tú envíes desde aquí (nunca correos automáticos). Cada correo lleva su enlace para darse de baja.
          {activos > 450 && <b className="text-naranja"> Gmail personal permite unos 500 correos al día: con más suscriptores conviene un servicio como Brevo o Mailchimp (exporta el CSV).</b>}
        </p>
        {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
        <Campo label="Asunto" name="asunto" required maxLength={200} value={asunto} onChange={(e) => setAsunto(e.target.value)} />
        <AreaTexto label="Mensaje (opcional): anuncia el sorteo, una promoción..." name="intro" rows={3} maxLength={2000} value={intro} onChange={(e) => setIntro(e.target.value)} />
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">Noticias a incluir ({elegidas.length}/10, en el orden en que las marques)</legend>
          <div className="max-h-64 overflow-y-auto rounded-xl ring-1 ring-black/5 divide-y divide-gray-100">
            {listas.map((n) => (
              <label key={n.id} className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50">
                <input suppressHydrationWarning type="checkbox" checked={elegidas.includes(n.id)} onChange={() => alternar(n.id)} className="accent-naranja" />
                {elegidas.includes(n.id) && <span className="w-5 h-5 rounded-full bg-naranja text-white text-[10px] font-bold flex items-center justify-center">{elegidas.indexOf(n.id) + 1}</span>}
                <span className="flex-1 text-indigo">{n.titulo}</span>
                <span className="text-xs text-gray-400">{n.publicada_en ? formatDate(n.publicada_en) : ""}</span>
              </label>
            ))}
            {!listas.length && <p className="p-4 text-sm text-gray-500">No hay noticias publicadas.</p>}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <Boton variante="borde" onClick={probar} cargando={probando} disabled={!valido}>
            <FlaskConical size={16} /> Enviarme una prueba
          </Boton>
          <BotonConfirmar variante="rojo" className="text-sm! px-4! py-2!" pregunta={`¿Enviar a ${activos} suscriptores?`} onConfirm={enviar}>
            <Send size={16} className="inline -mt-0.5" /> Enviar a todos ({activos})
          </BotonConfirmar>
        </div>

        {!!envios.data?.envios.length && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm font-bold text-indigo mb-2">Historial</p>
            <ul className="space-y-2 text-sm">
              {envios.data.envios.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-400 text-xs">{formatDate(e.created_at)}</span>
                  <span className="font-medium text-indigo">{e.asunto}</span>
                  <Etiqueta clase={e.estado === "TERMINADO" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {e.estado === "TERMINADO" ? `${e.enviados}/${e.destinatarios} enviados` : `Enviando… ${e.enviados}/${e.destinatarios}`}
                  </Etiqueta>
                  {e.fallidos > 0 && <span className="text-xs text-rojo">{e.fallidos} fallidos</span>}
                </li>
              ))}
            </ul>
            <button onClick={envios.recargar} className="text-xs font-bold text-naranja mt-2 hover:underline">
              Actualizar progreso
            </button>
          </div>
        )}
      </div>
    </Tarjeta>
  );
}
