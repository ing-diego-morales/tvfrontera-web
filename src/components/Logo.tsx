// src/components/Logo.tsx — logo de Televentas Fest (TV Frontera)
import Image from "next/image";
import { SITIO } from "@/lib/sitio";

/** alto en px; el ancho se calcula con la proporción real del logo */
export default function Logo({ alto = 48, prioridad = false, className = "" }: { alto?: number; prioridad?: boolean; className?: string }) {
  const ancho = Math.round((SITIO.logo.ancho / SITIO.logo.alto) * alto);
  return (
    <Image
      src={SITIO.logo.src}
      alt={`${SITIO.nombre} · ${SITIO.empresa}`}
      width={ancho}
      height={alto}
      loading={prioridad ? "eager" : "lazy"}
      fetchPriority={prioridad ? "high" : undefined}
      className={`h-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] ${className}`}
      style={{ width: ancho, maxWidth: "100%" }}
    />
  );
}
