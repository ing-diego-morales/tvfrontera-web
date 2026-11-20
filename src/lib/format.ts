// src/lib/format.ts — formatos y etiquetas compartidas
const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export const formatCOP = (n: number) => cop.format(n);

/** 'YYYY-MM-DD' (columnas DATE) -> "13 dic 2026" sin corrimiento de zona horaria */
export function formatDia(fecha: string | null | undefined): string {
  if (!fecha) return "—";
  const [y, m, d] = fecha.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export const ESTADO_PEDIDO: Record<string, { label: string; clase: string }> = {
  PENDIENTE: { label: "Pendiente", clase: "bg-yellow-100 text-yellow-800" },
  PAGADO: { label: "Pagado", clase: "bg-blue-100 text-blue-800" },
  ENVIADO: { label: "Enviado", clase: "bg-indigo-100 text-indigo-800" },
  ENTREGADO: { label: "Entregado", clase: "bg-green-100 text-green-800" },
  CANCELADO: { label: "Cancelado", clase: "bg-gray-200 text-gray-600" },
};

export const ESTADO_SOCIO: Record<string, { label: string; clase: string }> = {
  PENDIENTE: { label: "En revisión", clase: "bg-yellow-100 text-yellow-800" },
  APROBADO: { label: "Aprobado", clase: "bg-green-100 text-green-800" },
  SUSPENDIDO: { label: "Suspendido", clase: "bg-red-100 text-red-700" },
  VENCIDO: { label: "Mensualidad vencida", clase: "bg-orange-100 text-orange-800" },
};

export const VERIFICACION: Record<string, { label: string; clase: string }> = {
  NO_VERIFICADO: { label: "Sin verificar", clase: "bg-gray-200 text-gray-600" },
  PENDIENTE: { label: "En revisión", clase: "bg-yellow-100 text-yellow-800" },
  VERIFICADO: { label: "Verificada", clase: "bg-green-100 text-green-800" },
  RECHAZADO: { label: "Rechazada", clase: "bg-red-100 text-red-700" },
};

/** Número de WhatsApp listo para wa.me (Colombia por defecto si viene sin indicativo). */
export function waLink(numero: string, texto?: string) {
  let n = numero.replace(/\D/g, "");
  if (n.length === 10 && n.startsWith("3")) n = `57${n}`;
  return `https://wa.me/${n}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
}

/** Solo rutas internas: evita "open redirect" con ?next=https://sitio-malo.com o //sitio-malo.com */
export function rutaSegura(next: string | null | undefined, porDefecto = "/") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : porDefecto;
}
