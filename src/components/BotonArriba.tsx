// src/components/BotonArriba.tsx — flecha flotante para volver al inicio de la página.
// Aparece al bajar un poco y queda encima de los botones de radio y WhatsApp.
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BotonArriba() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let pendiente = false;
    const revisar = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 600);
        pendiente = false;
      });
    };
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    return () => window.removeEventListener("scroll", revisar);
  }, []);

  const subir = () => {
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: suave ? "smooth" : "auto" });
  };

  return (
    <button
      type="button"
      onClick={subir}
      aria-label="Volver arriba"
      title="Volver arriba"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-[10.25rem] right-[1.875rem] z-40 w-11 h-11 rounded-full bg-white text-naranja ring-1 ring-black/10 shadow-lg flex items-center justify-center hover:bg-naranja hover:text-white transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}
