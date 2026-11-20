// src/components/FilaDeslizable.tsx — fila horizontal que se desliza (categorías, filtros)
// - Si no cabe todo: flechas a los lados (PC) y bordes difuminados que indican que hay más.
// - En celular se desliza con el dedo.
// - bucle: cinta infinita. Los elementos se repiten (copias ocultas para lectores de pantalla y teclado) y al
//   pasar del último sigue el primero, en ambos sentidos, sin "devolverse".
// - auto (con bucle): avanza sola de forma continua; se pausa al pasar el mouse, tocar o usar el
//   teclado, cuando no está en pantalla, y no se mueve si el sistema pide "reducir movimiento".
"use client";

import { Children, cloneElement, Fragment, isValidElement, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  children: React.ReactNode;
  etiqueta: string;
  className?: string; // clases de la lista (gap, padding...)
  bucle?: boolean;
  auto?: boolean;
  tono?: "claro" | "marca"; // marca = sobre fondo naranja
};

const BORDE = 28; // px del difuminado
const VELOCIDAD = 32; // px por segundo en modo automático

export default function FilaDeslizable({ children, etiqueta, className = "", bucle = false, auto = false, tono = "claro" }: Props) {
  const ref = useRef<HTMLUListElement>(null);
  const pausaHasta = useRef(0);
  const [lados, setLados] = useState({ izq: false, der: false });
  // Copias de la lista para el bucle. En el servidor siempre 1 (el HTML coincide al hidratar).
  const [copias, setCopias] = useState(1);
  const items = Children.toArray(children);

  /** Ancho de una vuelta completa (una copia de la lista, con su separación) */
  const anchoVuelta = useCallback(() => {
    const el = ref.current;
    if (!el || copias < 2) return 0;
    const primero = el.children[0] as HTMLElement | undefined;
    const inicioCopia2 = el.children[items.length] as HTMLElement | undefined;
    return primero && inicioCopia2 ? inicioCopia2.offsetLeft - primero.offsetLeft : 0;
  }, [copias, items.length]);

  /** Lleva la posición a la copia "de casa" (la 2.ª): se ve idéntico, pero siempre queda espacio a ambos lados */
  const recentrar = useCallback(() => {
    const el = ref.current;
    const w = anchoVuelta();
    if (!el || !w) return;
    const pos = el.scrollLeft;
    const casa = w + ((((pos - w) % w) + w) % w);
    if (Math.abs(casa - pos) > 1) el.scrollLeft = casa;
  }, [anchoVuelta]);

  const medir = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (copias > 1) {
      setLados({ izq: true, der: true });
      return;
    }
    setLados({ izq: el.scrollLeft > 4, der: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, [copias]);

  // ¿Hace falta el bucle? Solo si la lista no cabe. Se calcula cuántas copias se necesitan.
  useEffect(() => {
    const el = ref.current;
    if (!el || !bucle) return;
    const calcular = () => {
      const w = el.scrollWidth / copias;
      const cabe = w <= el.clientWidth + 4;
      const necesarias = cabe ? 1 : 2 + Math.ceil((el.clientWidth * 1.8) / w);
      setCopias((c) => (c === necesarias ? c : necesarias));
    };
    calcular();
    const ro = new ResizeObserver(calcular);
    ro.observe(el);
    return () => ro.disconnect();
  }, [bucle, copias]);

  // Al activar el bucle, empezar en la copia de casa. Las copias se pueden tocar (son las que se ven
  // casi siempre), pero el teclado y los lectores de pantalla solo recorren la lista original.
  useEffect(() => {
    if (copias < 2) return;
    ref.current?.querySelectorAll("[data-copia] a, [data-copia] button").forEach((el) => el.setAttribute("tabindex", "-1"));
    recentrar();
  }, [copias, recentrar]);

  // Flechas / bordes, y recentrar cuando el usuario termina de deslizar
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let quieto: number | undefined;
    const alDeslizar = () => {
      medir();
      if (copias > 1) {
        window.clearTimeout(quieto);
        quieto = window.setTimeout(recentrar, 140);
      }
    };
    medir();
    el.addEventListener("scroll", alDeslizar, { passive: true });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", alDeslizar);
      ro.disconnect();
      window.clearTimeout(quieto);
    };
  }, [medir, recentrar, copias]);

  // Movimiento automático continuo (solo con bucle activo)
  useEffect(() => {
    const el = ref.current;
    if (!el || !auto || copias < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    let pos = el.scrollLeft;
    let antes = performance.now();
    let frame = 0;
    const paso = (ahora: number) => {
      const dt = Math.min(ahora - antes, 64);
      antes = ahora;
      if (visible && !document.hidden && Date.now() > pausaHasta.current) {
        if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft; // el usuario la movió
        pos += (VELOCIDAD * dt) / 1000;
        const w = anchoVuelta();
        if (w && pos >= 2 * w) pos -= w; // salto invisible: misma imagen, una vuelta atrás
        el.scrollLeft = pos;
      } else {
        pos = el.scrollLeft;
      }
      frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [auto, copias, anchoVuelta]);

  const pausar = (ms = 6000) => {
    pausaHasta.current = Date.now() + ms;
  };

  const mover = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    pausar();
    recentrar(); // con bucle, siempre hay espacio hacia ambos lados
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
  };

  const mascara = `linear-gradient(to right, ${lados.izq ? "transparent" : "#000"} 0, #000 ${BORDE}px, #000 calc(100% - ${BORDE}px), ${lados.der ? "transparent" : "#000"} 100%)`;
  const flecha =
    tono === "marca"
      ? "bg-white text-naranja shadow-lg hover:bg-naranja-claro"
      : "bg-white text-indigo shadow-md ring-1 ring-gray-200 hover:ring-indigo";

  return (
    <div
      className="relative"
      onMouseEnter={() => pausar(60_000)}
      onMouseLeave={() => pausar(1500)}
      onTouchStart={() => pausar(60_000)}
      onTouchEnd={() => pausar(4000)}
      onFocusCapture={() => pausar(60_000)}
      onBlurCapture={() => pausar(3000)}
    >
      <ul ref={ref} aria-label={etiqueta} className={`flex overflow-x-auto sin-scrollbar ${className}`} style={{ maskImage: mascara, WebkitMaskImage: mascara }}>
        {items}
        {Array.from({ length: copias - 1 }, (_, n) => (
          <Fragment key={`copia-${n}`}>
            {items.map((item) =>
              isValidElement<{ "aria-hidden"?: boolean; "data-copia"?: string }>(item) ? cloneElement(item, { "aria-hidden": true, "data-copia": "" }) : item
            )}
          </Fragment>
        ))}
      </ul>
      {lados.izq && (
        <button type="button" onClick={() => mover(-1)} aria-label="Ver anteriores" className={`hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center transition-colors ${flecha}`}>
          <ChevronLeft size={20} />
        </button>
      )}
      {lados.der && (
        <button type="button" onClick={() => mover(1)} aria-label="Ver más" className={`hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center transition-colors ${flecha}`}>
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
