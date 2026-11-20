// src/components/cuenta/Verificacion.tsx — verificación de identidad tipo "Face ID"
// 4 pasos: cédula (frente) → cédula (reverso) → selfie en vivo → revisar y autorizar.
// La comparación rostro vs. cédula la hace un administrador (Admin > Verificaciones).
"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, ChevronLeft, Clock, IdCard, ScanFace, ShieldCheck, XCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Aviso, Boton, Campo, Etiqueta, Tarjeta } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";
import { VERIFICACION } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import CapturaFoto from "./CapturaFoto";

type Paso = "frente" | "reverso" | "selfie" | "revisar";
const PASOS: { id: Paso; titulo: string }[] = [
  { id: "frente", titulo: "Cédula (frente)" },
  { id: "reverso", titulo: "Cédula (reverso)" },
  { id: "selfie", titulo: "Tu rostro" },
  { id: "revisar", titulo: "Enviar" },
];

export default function Verificacion() {
  const { user, refrescar } = useAuth();
  const mia = useApi<{ ultima: { estado: string; motivo: string | null } | null }>(user ? "/api/verificacion/mia" : null);
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState<Paso>("frente");
  const [fotos, setFotos] = useState<{ frente?: string; reverso?: string; selfie?: string }>({});
  const [cedula, setCedula] = useState(user?.cedula ?? "");
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  if (!user || user.rol === "ADMIN") return null;
  const est = VERIFICACION[user.verificacion];

  const guardarFoto = (k: "frente" | "reverso" | "selfie", siguiente: Paso) => (dataUrl: string) => {
    setFotos((f) => ({ ...f, [k]: dataUrl }));
    setPaso(siguiente);
  };

  const enviar = async () => {
    setMsg(null);
    if (!/^\d{5,15}$/.test(cedula)) return setMsg({ tipo: "error", texto: "Escribe tu número de cédula (solo números)." });
    if (!acepta) return setMsg({ tipo: "error", texto: "Debes autorizar el tratamiento de tus datos biométricos." });
    setEnviando(true);
    try {
      const r = await api<{ mensaje?: string }>("/api/verificacion/fotos", {
        method: "POST",
        json: { cedula, selfie: fotos.selfie, frente: fotos.frente, reverso: fotos.reverso, consentimiento: true },
      });
      await refrescar();
      setAbierto(false);
      setFotos({});
      setMsg({ tipo: "ok", texto: r.mensaje ?? "Recibimos tus fotos." });
      mia.recargar();
    } catch (e) {
      setMsg({ tipo: "error", texto: mensajeError(e) });
    } finally {
      setEnviando(false);
    }
  };

  const indice = PASOS.findIndex((p) => p.id === paso);

  return (
    <Tarjeta titulo="Verificación de identidad" accion={<Etiqueta clase={est.clase}>{est.label}</Etiqueta>}>
      <div className="space-y-4 text-sm text-gray-600">
        {msg && !abierto && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}

        {user.verificacion === "VERIFICADO" ? (
          <p className="flex items-center gap-2 text-green-700 font-semibold">
            <BadgeCheck size={20} /> Tu identidad está verificada. Tu perfil muestra la insignia de verificado.
          </p>
        ) : user.verificacion === "PENDIENTE" && !abierto ? (
          <p className="flex items-center gap-2 text-indigo">
            <Clock size={18} className="text-naranja" /> Estamos revisando tus fotos. Te avisaremos por correo.
          </p>
        ) : !abierto ? (
          <>
            {user.verificacion === "RECHAZADO" && (
              <Aviso>
                <span className="flex items-start gap-2">
                  <XCircle size={16} className="shrink-0 mt-0.5" /> No pudimos verificarte{mia.data?.ultima?.motivo ? `: ${mia.data.ultima.motivo}` : ""}. Inténtalo de nuevo.
                </span>
              </Aviso>
            )}
            <p>Como lo hacen los bancos: tomas una foto de tu cédula por ambos lados y una selfie en vivo. Un administrador confirma que el rostro coincide con la cédula.</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <IdCard size={16} className="text-naranja" /> Ten tu cédula a la mano
              </li>
              <li className="flex items-center gap-2">
                <ScanFace size={16} className="text-naranja" /> Busca un lugar con buena luz
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-naranja" /> Tus fotos son privadas: solo las ve el equipo de verificación
              </li>
            </ul>
            <Boton onClick={() => (setAbierto(true), setPaso("frente"), setMsg(null))} variante="azul" className="py-3">
              <ScanFace size={18} /> Verificar mi identidad
            </Boton>
          </>
        ) : (
          <div className="space-y-5">
            {/* Progreso */}
            <ol className="flex items-center gap-1">
              {PASOS.map((p, i) => (
                <li key={p.id} className="flex-1">
                  <div className={`h-1.5 rounded-full ${i <= indice ? "bg-naranja" : "bg-gray-200"}`} />
                  <p className={`text-[10px] sm:text-xs mt-1 font-semibold ${i === indice ? "text-naranja" : "text-gray-400"}`}>{p.titulo}</p>
                </li>
              ))}
            </ol>

            {paso === "frente" && <CapturaFoto key="frente" modo="documento" onListo={guardarFoto("frente", "reverso")} />}
            {paso === "reverso" && <CapturaFoto key="reverso" modo="documento" onListo={guardarFoto("reverso", "selfie")} />}
            {paso === "selfie" && <CapturaFoto key="selfie" modo="rostro" onListo={guardarFoto("selfie", "revisar")} />}

            {paso === "revisar" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["frente", "Cédula frente"],
                      ["reverso", "Cédula reverso"],
                      ["selfie", "Selfie"],
                    ] as const
                  ).map(([k, t]) => (
                    <button key={k} type="button" onClick={() => setPaso(k)} className="group text-center" title="Tomar de nuevo">
                      {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (data URL), no pasa por el optimizador */}
                      <img src={fotos[k]} alt={t} className="w-full aspect-square object-cover rounded-xl ring-1 ring-black/10 group-hover:ring-naranja" />
                      <span className="text-[11px] text-gray-500 group-hover:text-naranja">{t} · repetir</span>
                    </button>
                  ))}
                </div>
                <Campo label="Número de cédula" name="cedula_verif" inputMode="numeric" maxLength={15} required value={cedula} disabled={!!user.cedula} onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))} />
                <label className="flex items-start gap-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                  <input suppressHydrationWarning type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 accent-naranja" />
                  <span>
                    Autorizo de forma <b>expresa</b> a TV Frontera a tratar mis datos biométricos (foto de mi rostro) y la imagen de mi cédula, que son datos sensibles, con
                    la única finalidad de verificar mi identidad, según la{" "}
                    <Link href="/privacidad" target="_blank" className="font-bold underline">
                      política de datos
                    </Link>
                    . Sé que no estoy obligado a entregarlos.
                  </span>
                </label>
                {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
                <Boton onClick={enviar} cargando={enviando} className="w-full py-3">
                  <ShieldCheck size={18} /> Enviar para verificación
                </Boton>
              </div>
            )}

            <button
              onClick={() => (indice > 0 ? setPaso(PASOS[indice - 1].id) : setAbierto(false))}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo"
            >
              <ChevronLeft size={16} /> {indice > 0 ? "Paso anterior" : "Cancelar"}
            </button>
          </div>
        )}
      </div>
    </Tarjeta>
  );
}
