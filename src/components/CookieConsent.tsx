// src/components/CookieConsent.tsx
"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

type ConsentChoice = "accepted" | "rejected" | "customized";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  // Se lee después de montar (localStorage no existe en el servidor)
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        if (!localStorage.getItem("cookie-consent")) setVisible(true);
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const saveConsent = (choice: ConsentChoice, allowAnalytics: boolean) => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ choice, analytics: allowAnalytics, date: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-100 bg-indigo text-white shadow-2xl border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <Cookie size={22} className="text-amarillo shrink-0 mt-1" />
            <p className="text-sm text-gray-200">
              Usamos cookies propias y de terceros para mejorar tu experiencia,
              analizar el tráfico del sitio y personalizar contenido. Puedes
              aceptar todas, rechazarlas, o personalizar tu elección.{" "}
              <a href="/privacy-policy" className="underline hover:text-amarillo">
                Más información
              </a>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm font-medium px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
            >
              Personalizar
            </button>
            <button
              onClick={() => saveConsent("rejected", false)}
              className="text-sm font-medium px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
            >
              Rechazar
            </button>
            <button
              onClick={() => saveConsent("accepted", true)}
              className="text-sm font-bold px-5 py-2 rounded-full bg-naranja hover:bg-naranja-oscuro transition-colors"
            >
              Aceptar todas
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span>Cookies esenciales (necesarias para el funcionamiento del sitio)</span>
              <span className="text-gray-400 font-bold">Siempre activas</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Cookies analíticas (para entender el uso del sitio)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input suppressHydrationWarning
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-white/20 rounded-full peer-checked:bg-amarillo transition-colors" />
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
              </label>
            </div>
            <button
              onClick={() => saveConsent("customized", analytics)}
              className="self-start text-sm font-bold px-5 py-2 rounded-full bg-amarillo text-indigo hover:bg-yellow-400 transition-colors mt-1"
            >
              Guardar preferencias
            </button>
          </div>
        )}
      </div>
    </div>
  );
}