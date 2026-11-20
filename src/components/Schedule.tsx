// src/components/Schedule.tsx — "Nuestra Programación" desde Admin > Programación (ya no está en el código)
import { Clock, Radio } from "lucide-react";
import { apiPublicaSegura } from "@/lib/api-server";
import { hora12, programaActual, textoDias, type Programa } from "@/lib/programacion";

export default async function Schedule() {
  const data = await apiPublicaSegura<{ programas: Programa[] }>("/api/programacion");
  const programas = data?.programas ?? [];
  if (!programas.length) return null;
  const alAire = programaActual(programas);

  return (
    <section className="bg-indigo h-full py-10 rounded-2xl">
      <div className="px-5 md:px-8">
        <h2 className="text-2xl font-extrabold text-white mb-6 text-center">
          Nuestra <span className="text-amarillo">Programación</span>
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {programas.map((p) => {
            const vivo = alAire?.id === p.id;
            return (
              <li
                key={p.id}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 ${vivo ? "bg-naranja text-white ring-2 ring-amarillo" : "bg-white/5 text-white"}`}
              >
                {vivo ? <Radio size={18} className="text-amarillo mt-0.5 shrink-0" /> : <Clock size={18} className="text-amarillo mt-0.5 shrink-0" />}
                <div className="min-w-0">
                  <p className="font-bold leading-tight">
                    {hora12(p.hora_inicio)} <span className="font-normal text-white/85">— {p.titulo}</span>
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">
                    {vivo ? <span className="font-extrabold text-amarillo uppercase tracking-wider">● Al aire ahora · </span> : null}
                    {textoDias(p.dias)}
                    {p.descripcion ? ` · ${p.descripcion}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
