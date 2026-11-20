// src/components/aliados/TiendaProductos.tsx — catálogo + pedido al Punto Aliado
// Por ahora el pedido se hace por WhatsApp: el cliente elige productos y se abre WhatsApp con el mensaje
// ya escrito (productos, cantidades, total y nota). Hay que iniciar sesión: así crece la base de usuarios
// y el número del negocio no queda expuesto a robots.
// La compra directa por la web (FEATURES.comprasWeb) se muestra como "Próximamente" hasta que se active.
// Al público nunca se le muestra cuántas unidades hay: solo Disponible / ¡Últimas unidades! / Agotado.
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Minus, Package, Plus, ShoppingBag, Star } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Imagen from "@/components/Imagen";
import { useAuth } from "@/components/AuthProvider";
import { Aviso, Boton } from "@/components/ui";
import { api, mensajeError } from "@/lib/api";
import { formatCOP, waLink } from "@/lib/format";
import { contactoDe, type Producto, type TiendaAliado } from "@/lib/aliados";
import { FEATURES } from "@/lib/features";
import { SITIO } from "@/lib/sitio";

const MAX_POR_PRODUCTO = 20;

type Props = { productos: Producto[]; socioId: number; negocio: string; slug: string };

export default function TiendaProductos({ productos, socioId, negocio, slug }: Props) {
  const { user, socio } = useAuth();
  const pathname = usePathname();
  const [cant, setCant] = useState<Record<number, number>>({});
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState<number | null>(null);
  // WhatsApp del negocio: solo se pide a la API con sesión iniciada (no viene en el HTML público)
  const [whatsapp, setWhatsapp] = useState<string | null | undefined>(undefined);

  const esMiTienda = socio?.id === socioId;
  // El admin administra: no compra ni vende (la API también lo bloquea)
  const puedeComprar = !!user && user.rol !== "ADMIN" && !esMiTienda;
  const lineas = useMemo(() => productos.filter((p) => (cant[p.id] ?? 0) > 0), [productos, cant]);
  const unidades = lineas.reduce((a, p) => a + cant[p.id], 0);
  const total = lineas.reduce((acc, p) => acc + p.precio * cant[p.id], 0);

  useEffect(() => {
    if (!puedeComprar) return;
    let vivo = true;
    api<TiendaAliado>(`/api/socios/${encodeURIComponent(slug)}`)
      .then((d) => vivo && setWhatsapp(contactoDe(d.socio)?.whatsapp ?? null))
      .catch(() => vivo && setWhatsapp(null));
    return () => {
      vivo = false;
    };
  }, [puedeComprar, slug]);

  const mensaje = [
    `Hola ${negocio}, vi sus productos en ${SITIO.nombre} y quiero hacer este pedido:`,
    "",
    ...lineas.map((p) => `• ${cant[p.id]} × ${p.nombre} — ${formatCOP(p.precio * cant[p.id])}`),
    "",
    `Total aprox.: ${formatCOP(total)}`,
    ...(nota.trim() ? [`Nota: ${nota.trim()}`] : []),
    ...(user ? [`Mi nombre: ${user.nombre}`] : []),
    "",
    "¿Está disponible? Quedo atento(a) para acordar el pago y la entrega.",
  ].join("\n");

  const ajustar = (p: Producto, delta: number) =>
    setCant((c) => ({ ...c, [p.id]: Math.min(MAX_POR_PRODUCTO, Math.max(0, (c[p.id] ?? 0) + delta)) }));

  const pedirWeb = async () => {
    setError("");
    setEnviando(true);
    try {
      const r = await api<{ pedidoId: number }>("/api/pedidos", {
        method: "POST",
        json: { items: lineas.map((p) => ({ productoId: p.id, cantidad: cant[p.id] })), nota: nota.trim() || undefined },
      });
      setHecho(r.pedidoId);
      setCant({});
      setNota("");
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  if (!productos.length) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-md">
        <Package size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Este Punto Aliado aún no ha publicado productos.</p>
      </div>
    );
  }

  const volver = encodeURIComponent(pathname);

  return (
    <div className="space-y-6">
      {hecho && (
        <Aviso tipo="ok">
          <span className="flex items-center gap-2 font-bold">
            <CheckCircle2 size={18} /> ¡Pedido #{hecho} enviado!
          </span>
          El negocio lo verá en su panel. Puedes seguirlo en{" "}
          <Link href="/cuenta" className="font-bold underline">
            Mi cuenta
          </Link>
          .
        </Aviso>
      )}

      {!user && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-4">
          <span className="w-10 h-10 shrink-0 rounded-full bg-[#25D366]/15 text-[#128C4B] flex items-center justify-center">
            <FaWhatsapp size={20} />
          </span>
          <p className="flex-1 text-sm text-gray-600">
            <strong className="text-indigo">Pide por WhatsApp en segundos.</strong> Inicia sesión o regístrate gratis para elegir productos y
            enviarle tu pedido directo a {negocio}.
          </p>
          <div className="flex gap-2">
            <Link href={`/login?next=${volver}`} className="text-sm font-bold text-indigo hover:text-naranja px-3 py-2">
              Inicia sesión
            </Link>
            <Link href={`/registro?next=${volver}`} className="text-sm font-bold bg-naranja hover:bg-naranja-oscuro text-white px-4 py-2 rounded-full transition-colors">
              Regístrate gratis
            </Link>
          </div>
        </div>
      )}

      {user?.rol === "ADMIN" && <Aviso tipo="info">Modo administrador: estás viendo la tienda como consulta. Los pedidos los hacen los clientes.</Aviso>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {productos.map((p, i) => {
          const n = cant[p.id] ?? 0;
          const agotado = !p.disponible;
          // La primera fila se ve apenas abre la tienda: se carga de inmediato (mejor LCP)
          const primeraFila = i < 3;
          return (
            <div key={p.id} className={`bg-white rounded-2xl shadow-sm ring-1 overflow-hidden flex flex-col hover:shadow-lg transition-shadow ${p.destacado ? "ring-amarillo" : "ring-black/5"}`}>
              <div className="relative aspect-square img-ph">
                <Imagen
                  src={p.imagen_url}
                  alt={p.nombre}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                  loading={primeraFila ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                />
                {!!p.destacado && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 bg-amarillo text-indigo text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full shadow">
                    <Star size={10} fill="currentColor" /> Recomendado
                  </span>
                )}
                {agotado && (
                  <span className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="bg-gray-900 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded">Agotado</span>
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-indigo">{p.nombre}</h3>
                {p.descripcion && <p className="text-sm text-gray-500 mt-1 line-clamp-3">{p.descripcion}</p>}
                <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                  <span className="text-lg font-extrabold text-naranja">{formatCOP(p.precio)}</span>
                  {puedeComprar && !agotado && (
                    <div className="flex items-center gap-1" aria-label={`Cantidad de ${p.nombre}`}>
                      <button onClick={() => ajustar(p, -1)} disabled={n === 0} aria-label="Quitar uno" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-indigo disabled:opacity-30">
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center font-bold text-indigo" aria-live="polite">{n}</span>
                      <button onClick={() => ajustar(p, 1)} disabled={n >= MAX_POR_PRODUCTO} aria-label="Agregar uno" className="w-8 h-8 rounded-full bg-indigo text-white flex items-center justify-center disabled:opacity-30">
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2">
                  {agotado ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-gray-400" /> Agotado por ahora
                    </span>
                  ) : p.ultimas ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600">
                      <span className="w-2 h-2 rounded-full bg-orange-500" /> ¡Últimas unidades!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700">
                      <span className="w-2 h-2 rounded-full bg-green-500" /> Disponible
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra del pedido: aparece al elegir productos */}
      {lineas.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 p-4 space-y-3">
          {error && <Aviso>{error}</Aviso>}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <input
              suppressHydrationWarning
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              maxLength={300}
              placeholder="Nota para el negocio (opcional): talla, color, dirección, hora..."
              aria-label="Nota del pedido"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo"
            />
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
              <div className="text-left lg:text-right">
                <p className="text-xs text-gray-500">{unidades} producto(s)</p>
                <p className="font-extrabold text-indigo">{formatCOP(total)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {whatsapp ? (
                  <a
                    href={waLink(whatsapp, mensaje)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold px-5 py-3 rounded-full shadow-md transition-colors"
                  >
                    <FaWhatsapp size={20} /> Pedir por WhatsApp
                  </a>
                ) : whatsapp === null ? (
                  <span className="text-sm text-gray-500">Este negocio aún no tiene WhatsApp registrado.</span>
                ) : (
                  <span className="h-12 w-48 rounded-full bg-gray-100 animate-pulse" aria-hidden />
                )}
                {FEATURES.comprasWeb ? (
                  <Boton onClick={pedirWeb} cargando={enviando}>
                    <ShoppingBag size={18} /> Comprar en la web
                  </Boton>
                ) : (
                  <span
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 bg-gray-100 px-4 py-3 rounded-full cursor-not-allowed select-none"
                    title="Muy pronto podrás comprar y pagar directamente en la web"
                  >
                    <ShoppingBag size={16} /> Compra en la web
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amarillo text-indigo px-2 py-0.5 rounded-full">Próximamente</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">El pago y la entrega se acuerdan directamente con el negocio. {SITIO.nombre} no cobra comisiones al comprador.</p>
        </div>
      )}
    </div>
  );
}
