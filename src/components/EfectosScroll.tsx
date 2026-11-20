// src/components/EfectosScroll.tsx — aparición suave al hacer scroll, sin librerías (~1 KB)
// Marca en el HTML:  data-revelar         -> el bloque aparece al entrar en pantalla
//                    data-revelar-hijos   -> sus hijos aparecen en cascada (tarjetas)
// Usa la Web Animations API (element.animate): NO cambia clases ni atributos del HTML, así React no
// detecta diferencias al hidratar. Lo que ya está en pantalla al cargar no se anima (nada "parpadea"),
// respeta "reducir movimiento" y, si el JavaScript no carga, todo se ve normal.
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = "[data-revelar], [data-revelar-hijos]";
const OCULTO: Keyframe = { opacity: 0, transform: "translate3d(0, 24px, 0)" };
const VISIBLE: Keyframe = { opacity: 1, transform: "none" };

export default function EfectosScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;

    const vistos = new WeakSet<Element>();
    const esperando = new Map<Element, Animation[]>(); // animaciones que mantienen oculto hasta llegar

    const piezas = (el: Element) => (el.hasAttribute("data-revelar-hijos") ? Array.from(el.children) : [el]);

    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          esperando.get(e.target)?.forEach((a) => a.cancel());
          esperando.delete(e.target);
          piezas(e.target).forEach((p, i) =>
            p.animate([OCULTO, VISIBLE], {
              duration: 600,
              delay: Math.min(i, 5) * 60, // tarjetas en cascada
              easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
              fill: "backwards", // al terminar no deja nada aplicado: no interfiere con el hover
            })
          );
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    const observar = () => {
      const alto = window.innerHeight;
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (vistos.has(el)) return;
        vistos.add(el);
        if (el.getBoundingClientRect().top < alto * 0.94) return; // ya visible al cargar: se deja quieto
        esperando.set(el, piezas(el).map((p) => p.animate([OCULTO, OCULTO], { duration: 1, fill: "forwards" })));
        io.observe(el);
      });
    };
    observar();
    // Secciones que llegan después (streaming del servidor o navegación) también se observan
    const mo = new MutationObserver(observar);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      esperando.forEach((lista) => lista.forEach((a) => a.cancel()));
    };
  }, [pathname]);

  return null;
}
