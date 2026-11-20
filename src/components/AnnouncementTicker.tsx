// src/components/AnnouncementTicker.tsx — cinta de avisos bajo el menú
// Server Component + animación 100% CSS: 0 KB de JavaScript en el navegador.
// Se muestran SOLO los avisos que el admin deja visibles (1, 3, 5...). Los cambios se ven al instante.
//   - Pocos avisos que caben en pantalla -> texto fijo (sin repetir el mismo aviso varias veces)
//   - Muchos o largos -> se desplazan en bucle continuo
import Link from "next/link";
import { apiPublicaSegura } from "@/lib/api-server";

type Aviso = { id: number; texto: string; enlace: string | null };
type Respuesta = { activo: boolean; titulo: string; anuncios: Aviso[] };

// ~ caracteres que caben fijos en la cinta en escritorio (contenedor de 1152 px a 13 px)
const CABEN_FIJOS = 95;

function Item({ a, oculto }: { a: Aviso; oculto?: boolean }) {
  const contenido = (
    <>
      <span className="mx-5 inline-block w-1.5 h-1.5 rotate-45 bg-rojo shrink-0" aria-hidden />
      {a.texto}
    </>
  );
  const clase = "inline-flex items-center whitespace-nowrap text-[13px] font-medium";
  if (!a.enlace) return <span className={clase}>{contenido}</span>;
  const externo = a.enlace.startsWith("https://");
  return (
    <Link
      href={a.enlace}
      tabIndex={oculto ? -1 : undefined}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${clase} hover:underline underline-offset-4 decoration-rojo`}
    >
      {contenido}
    </Link>
  );
}

export default async function AnnouncementTicker() {
  const data = await apiPublicaSegura<Respuesta>("/api/anuncios");
  if (!data?.activo || !data.anuncios.length) return null; // oculta = no ocupa espacio

  const avisos = data.anuncios;
  const caracteres = avisos.reduce((n, a) => n + a.texto.length + 6, 0);
  const fijo = caracteres <= CABEN_FIJOS;

  // En movimiento: cada mitad de la pista debe ser más ancha que la pantalla para que el bucle no deje huecos
  const repeticiones = fijo ? 1 : Math.max(1, Math.ceil(160 / caracteres));
  const mitad = Array.from({ length: repeticiones }, () => avisos).flat();
  const duracion = Math.max(25, Math.round(mitad.reduce((n, a) => n + a.texto.length, 0) * 0.22)); // lectura cómoda

  return (
    <div className="cinta bg-amarillo text-indigo border-b border-amarillo-oscuro" role="region" aria-label={data.titulo}>
      <div className="max-w-6xl mx-auto flex items-stretch h-10">
        {/* Etiqueta fija */}
        <div className="relative z-10 flex items-center gap-2 bg-rojo text-white pl-4 pr-5 shrink-0 [clip-path:polygon(0_0,100%_0,calc(100%-10px)_100%,0_100%)]">
          <span className="relative flex w-2 h-2" aria-hidden>
            <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-75 animate-ping motion-reduce:animate-none" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-white" />
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]">{data.titulo}</span>
        </div>

        {fijo ? (
          // Texto fijo: en pantallas angostas se puede deslizar con el dedo
          <div className="flex-1 overflow-x-auto sin-scrollbar flex items-center">
            <div className="flex">
              {avisos.map((a) => (
                <Item key={a.id} a={a} />
              ))}
            </div>
          </div>
        ) : (
          // Pista animada: [avisos][copia] se desplaza -50% y vuelve a empezar sin salto
          <div className="cinta-mascara flex-1 overflow-hidden flex items-center">
            <div className="cinta-track flex w-max" style={{ "--cinta-duracion": `${duracion}s` } as React.CSSProperties}>
              <div className="flex shrink-0">
                {mitad.map((a, i) => (
                  <Item key={`a-${i}`} a={a} />
                ))}
              </div>
              <div className="flex shrink-0" aria-hidden>
                {mitad.map((a, i) => (
                  <Item key={`b-${i}`} a={a} oculto />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
