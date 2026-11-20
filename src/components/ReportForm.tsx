// src/components/ReportForm.tsx
"use client";

import { useState } from "react";
import { AlertCircle, Send } from "lucide-react";

const TYPES = [
  { value: "sugerencia", label: "Sugerencia" },
  { value: "queja", label: "Queja" },
  { value: "reclamo", label: "Reclamo" },
  { value: "denuncia", label: "Denuncia" },
];

export default function ReportForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("sugerencia");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulado por ahora — luego se conecta a un endpoint real (email o base de datos)
    setSent(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-indigo font-bold text-sm w-full"
      >
        <AlertCircle size={18} className="text-naranja" />
        ¿Tienes una sugerencia, queja, reclamo o denuncia? Cuéntanos aquí
      </button>

      {open && (
        <div className="mt-4">
          {sent ? (
            <p className="text-sm text-green-600 font-medium">
              Gracias, hemos recibido tu {type}. Te contactaremos si es necesario.
            </p>
          ) : (
            <form suppressHydrationWarning onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                      type === t.value
                        ? "bg-naranja text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <input suppressHydrationWarning
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo (para responderte)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo"
              />

              <textarea suppressHydrationWarning
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe tu sugerencia, queja, reclamo o denuncia..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo resize-none"
              />

              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-oscuro transition-colors"
              >
                <Send size={14} /> Enviar
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}