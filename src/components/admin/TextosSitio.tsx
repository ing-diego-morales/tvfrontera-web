// src/components/admin/TextosSitio.tsx — textos editables del sitio (historia de "Nosotros")
"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { AreaTexto, Aviso, Boton, Cargando, Tarjeta } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";

export default function TextosSitio() {
  const { data, cargando } = useApi<{ textos: Record<string, string> }>("/api/sitio");
  if (cargando) return <Cargando />;
  return <Formulario inicial={data?.textos.nosotros_historia ?? ""} />;
}

function Formulario({ inicial }: { inicial: string }) {
  const [historia, setHistoria] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setEnviando(true);
    try {
      await api("/api/sitio", { method: "PUT", json: { nosotros_historia: historia.trim() } });
      setMsg({ tipo: "ok", texto: "Guardado. Ya se ve en la página Nosotros." });
    } catch (err) {
      setMsg({ tipo: "error", texto: mensajeError(err) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tarjeta
      titulo="Textos del sitio"
      accion={
        <a href="/nosotros" target="_blank" className="text-sm font-bold text-naranja hover:underline">
          Ver Nosotros →
        </a>
      }
    >
      <form suppressHydrationWarning onSubmit={guardar} className="space-y-4">
        {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
        <AreaTexto
          label='Historia (página "Nosotros")'
          name="nosotros_historia"
          rows={8}
          minLength={20}
          maxLength={5000}
          value={historia}
          onChange={(e) => setHistoria(e.target.value)}
        />
        <p className="text-xs text-gray-500">Deja una línea en blanco entre párrafos. {historia.length}/5000</p>
        <Boton type="submit" cargando={enviando}>
          <Save size={16} /> Guardar textos
        </Boton>
      </form>
    </Tarjeta>
  );
}
