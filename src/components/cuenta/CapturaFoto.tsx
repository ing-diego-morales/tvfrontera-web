// src/components/cuenta/CapturaFoto.tsx — toma una foto con la cámara (cédula o rostro)
// - "documento": cámara trasera + marco rectangular · "rostro": cámara frontal + guía ovalada (en vivo)
// - La foto se re-dibuja en un canvas y se exporta a JPEG: se eliminan metadatos (ubicación GPS, modelo del celular)
//   y se reduce a máx. 1280 px para que suba rápido.
// - Si no hay cámara o se niega el permiso, ofrece la cámara del sistema (en celulares) como alternativa.
"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Upload } from "lucide-react";
import { Boton } from "@/components/ui";

const MAX_LADO = 1280;

/** Dibuja la imagen en un canvas reducido y devuelve un JPEG en base64 (sin metadatos) */
function aJpeg(fuente: CanvasImageSource, ancho: number, alto: number, espejo = false): string {
  const escala = Math.min(1, MAX_LADO / Math.max(ancho, alto));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(ancho * escala);
  canvas.height = Math.round(alto * escala);
  const ctx = canvas.getContext("2d")!;
  if (espejo) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(fuente, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function CapturaFoto({ modo, onListo }: { modo: "documento" | "rostro"; onListo: (dataUrl: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const flujo = useRef<MediaStream | null>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<"iniciando" | "camara" | "sin-camara">("iniciando");
  const [cuenta, setCuenta] = useState<number | null>(null);
  const rostro = modo === "rostro";

  useEffect(() => {
    let cancelado = false;
    const iniciar = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setEstado("sin-camara");
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: rostro ? "user" : { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelado) return s.getTracks().forEach((t) => t.stop());
        flujo.current = s;
        if (video.current) {
          video.current.srcObject = s;
          await video.current.play().catch(() => {});
        }
        setEstado("camara");
      } catch {
        if (!cancelado) setEstado("sin-camara");
      }
    };
    iniciar();
    // Al salir del paso se apaga la cámara (la luz del celular no queda encendida)
    return () => {
      cancelado = true;
      flujo.current?.getTracks().forEach((t) => t.stop());
    };
  }, [rostro]);

  const capturar = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    onListo(aJpeg(v, v.videoWidth, v.videoHeight, rostro));
  };

  // Selfie: cuenta regresiva de 3 s para que la persona se acomode (y no use una foto preparada al instante)
  const tomarSelfie = () => {
    setCuenta(3);
    let n = 3;
    const id = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(id);
        setCuenta(null);
        capturar();
      } else setCuenta(n);
    }, 1000);
  };

  const desdeArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const img = new Image();
    img.onload = () => {
      onListo(aJpeg(img, img.naturalWidth, img.naturalHeight));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  };

  return (
    <div className="space-y-4">
      <div className={`relative mx-auto overflow-hidden rounded-2xl bg-gray-900 ${rostro ? "aspect-[3/4] max-w-xs" : "aspect-[16/10] max-w-lg"}`}>
        <video ref={video} playsInline muted className={`w-full h-full object-cover ${rostro ? "-scale-x-100" : ""} ${estado === "camara" ? "" : "hidden"}`} />
        {estado === "camara" && (
          // Guía: oscurece todo menos el óvalo (rostro) o el rectángulo (cédula)
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <div
              className={`border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] ${rostro ? "w-[68%] h-[72%] rounded-[50%]" : "w-[86%] aspect-[1.586] rounded-xl"}`}
            />
          </div>
        )}
        {cuenta !== null && (
          <span className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold text-white drop-shadow-lg" aria-live="assertive">
            {cuenta}
          </span>
        )}
        {estado === "iniciando" && <p className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">Abriendo la cámara…</p>}
        {estado === "sin-camara" && (
          <p className="absolute inset-0 flex items-center justify-center text-center text-white/85 text-sm px-6">
            No pudimos abrir la cámara aquí (permiso denegado o el sitio no usa HTTPS). Usa el botón de abajo para tomar la foto con tu celular.
          </p>
        )}
      </div>

      <p className="text-center text-sm text-gray-600">
        {rostro
          ? "Ubica tu rostro dentro del óvalo, con buena luz, sin gafas oscuras ni gorra. Mira de frente a la cámara."
          : "Ubica la cédula dentro del marco, sobre una superficie oscura, que se lean bien los datos y sin reflejos."}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {estado === "camara" && (
          <Boton onClick={rostro ? tomarSelfie : capturar} disabled={cuenta !== null} className="px-6 py-3">
            <Camera size={18} /> {rostro ? "Tomar selfie" : "Tomar foto"}
          </Boton>
        )}
        {estado !== "iniciando" && (
          <Boton variante={estado === "camara" ? "texto" : "rojo"} onClick={() => archivo.current?.click()}>
            {estado === "camara" ? <RefreshCw size={16} /> : <Upload size={16} />} {estado === "camara" ? "Usar la cámara del celular" : "Abrir cámara"}
          </Boton>
        )}
        {/* capture abre directamente la cámara en celulares (frontal para el rostro, trasera para la cédula) */}
        <input suppressHydrationWarning ref={archivo} type="file" accept="image/*" capture={rostro ? "user" : "environment"} className="hidden" onChange={desdeArchivo} />
      </div>
    </div>
  );
}
