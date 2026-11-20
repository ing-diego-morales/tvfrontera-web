// src/components/AntiBot.tsx — protección anti-robots de los formularios públicos
// 1) Campo trampa "sitio_web" invisible para personas (los robots lo llenan)
// 2) Tiempo desde que se abrió el formulario (un robot lo envía en milisegundos)
// 3) Cloudflare Turnstile, solo si NEXT_PUBLIC_TURNSTILE_SITEKEY está en .env.local (gratis, casi siempre invisible)
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? "";

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

export function useAntiBot() {
  const inicio = useRef<number>(0);
  const trampa = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState("");
  const cajaTurnstile = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);

  useEffect(() => {
    inicio.current = Date.now();
    if (!SITEKEY) return;
    const render = () => {
      if (cajaTurnstile.current && window.turnstile && !widget.current) {
        widget.current = window.turnstile.render(cajaTurnstile.current, {
          sitekey: SITEKEY,
          language: "es",
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(""),
        });
      }
    };
    if (window.turnstile) return render();
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  }, []);

  /** Datos que se agregan al JSON del formulario */
  const datos = useCallback(
    () => ({
      sitio_web: trampa.current?.value ?? "",
      t_formulario: Date.now() - inicio.current,
      ...(SITEKEY ? { cf_turnstile: token } : {}),
    }),
    [token]
  );

  /** Después de un error, Turnstile pide un token nuevo */
  const reiniciar = useCallback(() => {
    if (SITEKEY && window.turnstile) {
      window.turnstile.reset(widget.current);
      setToken("");
    }
  }, []);

  const campos = (
    <>
      {/* Invisible para personas y lectores de pantalla; los robots suelen llenarlo */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          No llenes este campo
          <input suppressHydrationWarning ref={trampa} type="text" name="sitio_web" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {SITEKEY && <div ref={cajaTurnstile} className="min-h-[65px]" />}
    </>
  );

  return { campos, datos, reiniciar, listo: !SITEKEY || Boolean(token) };
}
