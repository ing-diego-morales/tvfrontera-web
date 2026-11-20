// src/components/PicoYPlaca.tsx
// Server Component: el día se calcula en hora de Colombia en el servidor (sin JavaScript en el navegador)
import { Car, AlertTriangle } from "lucide-react";
import { ahoraColombia } from "@/lib/programacion";

// Fuente: Decreto 0212 del 26 de abril de 2024, Secretaría de Movilidad de Cúcuta
// Vigente: 1 enero 2026 - 31 diciembre 2026
const SCHEDULE: Record<number, number[]> = {
  1: [1, 2], // Lunes
  2: [3, 4], // Martes
  3: [5, 6], // Miércoles
  4: [7, 8], // Jueves
  5: [9, 0], // Viernes
  6: [],     // Sábado — sin restricción
  0: [],     // Domingo — sin restricción
};

export default function PicoYPlaca() {
  const day = ahoraColombia().dia % 7; // 1=lunes ... 7=domingo -> 0=domingo (como getDay)

  const digits = SCHEDULE[day] || [];
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const isWeekday = day >= 1 && day <= 5;

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Car className="text-naranja" size={20} />
        <h3 className="font-bold text-indigo">Pico y Placa hoy — Cúcuta</h3>
      </div>
      <p className="text-sm text-gray-500 mb-3">{dayNames[day]} · Placa particulares</p>

      {digits.length > 0 && isWeekday ? (
        <>
          <div className="flex gap-2 flex-wrap mb-3">
            {digits.map((d) => (
              <span
                key={d}
                className="bg-naranja text-white font-bold w-10 h-10 flex items-center justify-center rounded-full"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p>🕐 Placa metropolitana: 7:00-8:30am · 11:30am-2:30pm · 5:30-7:30pm</p>
            <p>🕐 Placa nacional/extranjera: 7:00am-8:00pm</p>
          </div>
        </>
      ) : (
        <p className="text-sm font-medium text-green-600 mb-3">
          Sin restricción — fin de semana
        </p>
      )}

      <div className="flex items-start gap-2 mt-4 pt-3 border-t border-gray-100">
        <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-400">
          Basado en el Decreto 0212 de 2024, vigente para 2026. Los festivos no
          tienen restricción. Consulta siempre la fuente oficial de la{" "}
           <a
            href="https://cucuta.gov.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-naranja"
          >
            Secretaría de Movilidad de Cúcuta
          </a>{" "}
          antes de circular, ya que el esquema puede cambiar.
        </p>
      </div>
    </div>
  );
}