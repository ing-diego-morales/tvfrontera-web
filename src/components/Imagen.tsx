// src/components/Imagen.tsx — imagen remota segura y a prueba de fallos
// - Solo acepta http(s) (nunca javascript:) · optimiza los dominios permitidos (WebP/AVIF)
// - Si la imagen falla, se oculta y queda el fondo de marca (.img-ph) en lugar de un ícono roto
// Úsala dentro de un contenedor con `relative` + `img-ph` cuando uses `fill`.
"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { esOptimizable, imagenSegura } from "@/lib/images";

type Props = Omit<ImageProps, "src"> & { src: string | null | undefined };

export default function Imagen({ src, className = "", alt, ...props }: Props) {
  const url = imagenSegura(src, "");
  const [fallo, setFallo] = useState(false);
  if (!url || fallo) return null; // el contenedor muestra el fondo de marca
  return (
    <Image
      src={url}
      alt={alt}
      unoptimized={!esOptimizable(url)}
      onError={() => setFallo(true)}
      className={className}
      {...props}
    />
  );
}
