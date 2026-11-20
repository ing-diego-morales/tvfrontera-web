// src/components/auth/AuthCard.tsx — marco común de login, registro y recuperación
// Diseño dividido: panel de marca (izquierda) + formulario (derecha). En celular, solo el formulario.
import Logo from "@/components/Logo";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const BENEFICIOS = [
  "Contacta por WhatsApp a los Puntos Aliados",
  "Haz pedidos y sigue su estado",
  "Publica tu negocio y llega a toda la audiencia del canal",
];

export default function AuthCard({
  titulo,
  subtitulo,
  ancho = "normal",
  children,
}: {
  titulo: string;
  subtitulo?: string;
  ancho?: "normal" | "ancho";
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 bg-gray-50 px-4 py-10 md:py-16">
      <div className={`${ancho === "ancho" ? "max-w-6xl" : "max-w-5xl"} mx-auto grid lg:grid-cols-5 bg-white rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden`}>
        {/* Panel de marca */}
        <aside className="relative hidden lg:flex lg:col-span-2 flex-col justify-between fondo-marca text-white p-10 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-naranja/20 blur-3xl" aria-hidden />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-amarillo/10 blur-3xl" aria-hidden />
          <div className="relative">
            <Link href="/" className="flex items-center gap-3">
              <Logo alto={64} />
            </Link>
            <h2 className="text-3xl font-extrabold mt-12 leading-tight">
              Tu comunidad,
              <br />
              <span className="text-indigo">más cerca.</span>
            </h2>
            <ul className="mt-8 space-y-4 text-sm text-white">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-white shrink-0 mt-0.5" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative flex items-center gap-2 text-xs text-white/80 mt-10">
            <ShieldCheck size={14} /> Conexión segura. Tu contraseña se guarda cifrada.
          </p>
        </aside>

        {/* Formulario */}
        <div className="lg:col-span-3 p-6 sm:p-10 md:p-12">
          <div className="lg:hidden flex justify-center mb-6">
            <Logo alto={48} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo">{titulo}</h1>
          {subtitulo && <p className="text-gray-500 mt-1.5">{subtitulo}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
